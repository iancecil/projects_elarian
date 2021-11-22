const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const config = require("config");
const log = require("signale");

const { Elarian } = require("elarian");

let client;

const mpesaChannel = {
  number: process.env.MPESA_PAYBILL,
  channel: "cellular",
};

let smsChannel = {
  channel: "sms",
  number: process.env.SMS_SHORT_CODE,
};

const purseId = process.env.PURSE_ID;

const processUssd = async (notification, customer, appData, callback) => {
  let patientNumber = notification.customerNumber.number;
  console.log(notification.customerNumber.number);
  try {
    log.info(`Processing USSD from ${customer.customerNumber.number}`);
    const input = notification.input.text;

    const number = customer.customerNumber.number;

    let screen = "home";
    if (appData) {
      screen = appData.screen;
    }

    const customerData = await customer.getMetadata();
    let { name, day, location, hospital, nhif_no } = customerData;
    const menu = {
      text: null,
      isTerminal: false,
    };
    let nextScreen = screen;
    if (screen === "home" && input !== "") {
      if (input === "1") {
        nextScreen = "request-alienId";
      } else if (input === "2") {
        nextScreen = "request-nationalId";
      } else if (input === "3") {
        nextScreen = "quit";
      }
    }
    if (screen != "home" && input === "") {
      nextScreen = "home";
    }

    if (screen === "home" && input === "") {
      if (name) {
        nextScreen = "schedule-day";
      }
    }
    switch (nextScreen) {
      case "request-alienId":
        menu.text = "Alright, what is your Alien ID?";
        nextScreen = "request-name";
        callback(menu, {
          screen: nextScreen,
        });
        break;
      case "request-nationalId":
        menu.text = "Alright, what is your National ID?";
        nextScreen = "request-name";
        callback(menu, {
          screen: nextScreen,
        });
        break;
      case "request-name":
        menu.text = "Enter your Full Name";
        nextScreen = "request-address";
        callback(menu, {
          screen: nextScreen,
        });
        await customer.updateMetadata({
          id: input,
        });
        break;
      case "request-address":
        menu.text = `${name}, where do you stay?\n${config
          .get("locations")
          .map((i, idx) => `${idx + 1}. ${i}`)
          .join("\n")} \n98. Other`;
        nextScreen = "request-nhif";
        callback(menu, {
          screen: nextScreen,
        });
        await customer.updateMetadata({
          name: input,
        });
        break;
      case "request-nhif":
        menu.text =
          "Which medical insurance cover do you have?\n1. NHIF \n2. AON Minet\n3. Other";
        nextScreen = "request-nhifNo";
        callback(menu, {
          screen: nextScreen,
        });
        const address = config.get("locations")[parseInt(input, 10) - 1];
        await customer.updateMetadata({
          location: address,
        });
        break;
      case "request-nhifNo":
        menu.text = "Enter your NHIF Number";
        nextScreen = "request-hospitals";
        callback(menu, {
          screen: nextScreen,
        });
        break;
      case "request-hospitals":
        menu.text = `Select a hospital to link your NHIf\n${config
          .get(`hospitals.${location}`)
          .map((i, idx) => `${idx + 1}. ${i}`)
          .join("\n")}`;
        nextScreen = "success";
        callback(menu, {
          screen: nextScreen,
        });
        await customer.updateMetadata({
          nhif_no: input,
        });
        break;
      case "success":
        menu.text = "your details have been suceessfully captured";
        menu.isTerminal = true;
        nextScreen = "home";
        callback(menu, {
          screen: nextScreen,
        });
        const hospital = config.get(`hospitals.${location}`)[
          parseInt(input, 10) - 1
        ];
        await customer.updateMetadata({
          hospital: hospital,
        });

        await customer.sendMessage(
          {
            number: process.env.SENDER_ID,
            channel: "sms",
          },
          {
            body: {
              text: `this is some of your account details\nname=${name}\naddress=${location}\nhospital=${hospital}\nNHIF Number=${nhif_no}`,
            },
          }
        );
        break;
      case "quit":
        menu.text = "Happy Coding!";
        menu.isTerminal = true;
        nextScreen = "home";
        callback(menu, {
          screen: nextScreen,
        });
        break;

      default:
        menu.text =
          "Welcome to E-Health! Are you a?\n1. Foreigner \n2. Citizen\n3. Quit";
        menu.isTerminal = false;
        callback(menu, {
          screen: nextScreen,
        });
        break;
    }
    await customer.updateMetadata({
      name,
      day,
    });
  } catch (error) {
    log.error("USSD Error: ", error);
  }
};

const sendSMS = async (notification, customer, appData, callback) => {
  const customerData = await cusomer.getMetadata();
  let { name, hospital, nhif_no } = customerData;

  await customer.sendMessage(
    {
      number: process.env.SMS_SHORT_CODE,
      channel: "sms",
    },
    {
      body: {
        text: `Hello ${name}`,
      },
    }
  );
};

const start = () => {
  client = new Elarian({
    appId: process.env.APP_ID,
    orgId: process.env.ORG_ID,
    apiKey: process.env.API_KEY,
  });
  client.on("ussdSession", processUssd);
  client.on("receivedSms", sendSMS);
  client
    .on("error", (error) => {
      log.warn(error.message || error);
    })
    .on("connected", () => {
      log.success(
        `App is connected, waiting for customers on ${process.env.USSD_CODE}`
      );
    })
    .connect();
};
start();

/*
Hospital code
*/
