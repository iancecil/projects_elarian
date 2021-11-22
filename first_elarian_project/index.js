// Let’s import Elarian into our code
const { Elarian } = require('elarian');

// To initialize a client and connect with Elarian, you need an orgId, appId, and apiKey
const client = new Elarian({
    orgId: 'el_org_eu_cTF0k0',
    appId: 'el_app_FWezqd',
    apiKey: 'el_k_test_17fea30a19293a5dda4d15d6ed10dcbbfe928190bd12dd4e745c7849e2520319'
});

client
    .on('error', (err) => console.error(err))
    .on('connected', onConnected)
    .connect();

async function onConnected() {
    console.log('App is running!');
}

// const { Elarian } = require('elarian');

// const client = new Elarian({
//     orgId: 'el_org_eu_cTF0k0',
//     appId: 'el_app_FWezqd',
//     apiKey: 'el_k_test_17fea30a19293a5dda4d15d6ed10dcbbfe928190bd12dd4e745c7849e2520319'
// });

// const whatsappChannel = {
//     number: '+254711462988',
//     channel: 'whatsapp',
// };

// const paymentChannel = {
//     number: '16660',
//     channel: 'cellular',
// };

// const purseId = 'el_prs_6zwk0n';


// async function onReceivedWhatsapp(notification, customer, appData, callback) {
//     const input = notification.text;
//     let status = (appData || {}).status || 'can-borrow';
//     const amount = (appData || {}).amount || 100;
//     let remindersSent = (appData || {}).remindersSent || 0;

//     let response = 'Welcome to Loaner. Send request-loan to begin loan disbursement';

//     if (status === 'can-not-borrow') {
//         response = `You still owe USD ${amount}. Please pay through payment number ${paymentChannel.number}`;
//     } else if (input.trim().toLowerCase() === 'request-loan') {
//         response = 'We are processing your request. We\'ll be in touch shortly.';
//         status = 'can-not-borrow';
//         remindersSent = 0;
//         setTimeout(async () => {
//             await client.initiatePayment(
//                 { purseId },
//                 {
//                     channelNumber: paymentChannel,
//                     customerNumber: customer.customerNumber,
//                 },
//                 { amount, currencyCode: 'USD' }
//             );
//             await customer.cancelReminder('loaner');
//             await customer.addReminder({
//                 key: 'loaner',
//                 payload: `USD ${amount}`,
//                 remindAt: (Date.now() + 60000) / 1000, // 1m from now
//             });
//             await customer.sendMessage(
//                 whatsappChannel,
//                 { body: { text: `Hi! Your loan of USD ${amount} has been approved.` } },
//             );
//         }, 5000);
//     }

//     await customer.replyToMessage(
//         notification.messageId,
//         { body: { text: response } },
//     );

//     const newAppData = {
//         status,
//         amount,
//         remindersSent,
//     };
//     callback(null, newAppData);
// }


// async function onReminder(notification, customer, appData, callback) {
//     const loan = notification.reminder.payload;
//     const { remindersSent = 0 } = appData;
//     const newReminderCount = remindersSent + 1;

//     await customer.sendMessage(
//         whatsappChannel,
//         { body: { text: `Hi, your loan repayment of ${loan} is due! (reminder ${newReminderCount})` } },
//     );

//     if (newReminderCount <= 5) {
//         await customer.addReminder({
//             key: 'loaner',
//             payload: loan,
//             remindAt: (Date.now() + 60000) / 1000, // 1m from now
//         });
//     }

//     const newAppData = {
//         ...appData,
//         remindersSent: newReminderCount,
//     };
//     callback(null, newAppData);
// }

// async function onReceivedPayment(notification, customer, appData, callback) {
//     const { amount, currencyCode } = notification.value;

//     await customer.sendMessage(
//         whatsappChannel,
//         { body: { text: `Hi, your payment of ${currencyCode} ${amount} has been received!` } },
//     );
//     await customer.cancelReminder('loaner');

//     const newAppData = {
//         status: 'can-borrow',
//     };
//     callback(null, newAppData);
// }


// client
//     .on('error', (err) => console.error(err))
//     .on('reminder', onReminder)
//     .on('receivedWhatsapp', onReceivedWhatsapp)
//     .on('receivedPayment', onReceivedPayment)
//     .on('connected', () => {
//         console.log('App is running!');
//     })
//     .connect();
