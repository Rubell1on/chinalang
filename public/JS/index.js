const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const Base64 = require('js-base64').Base64;

class GmailAPI {
    constructor(credentials, token) {
        this.SCOPES = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send'
        ];

        this.credentials = credentials;
        this.token = token;
        this.authorize();
    }

    authorize() {
        const {client_secret, client_id, redirect_uris} = this.credentials.installed;
        this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        this.oAuth2Client.setCredentials(token);
        this.gmail = google.gmail({version: 'v1', auth: this.oAuth2Client});
    }

    async sendMessage() {
        const messageParts = [
            'From: CatchyClick <catchyclickstudio@gmail.com>',
            'To: <dablaev@yandex.ru>',
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            'Subject: Hello world!',
            '',
            'This is a message just to say hello.',
            'So... <b>Hello!</b>  🤘❤️😎'
        ];

        const message = messageParts.join('\n');

        const encodedMessage = Base64.encodeURI(message);

        const res = await this.gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: encodedMessage,
            }
        }).catch(e => console.log(e));
    }
}

const credentials = {
    installed: {
        client_id: "412577247346-9tanor31f656ru20c7fjfillq6u2hfv3.apps.googleusercontent.com",
        project_id: "quickstart-1581138031700",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "POAKO4DkDmYNZQwfWU1phXQk",
        redirect_uris: [
            "urn:ietf:wg:oauth:2.0:oob",
            "http://localhost"
        ]
    }
}

const token = {
    access_token: "ya29.Il-9B2X8Z7wt8VV5L9T95RoqqTn3HevaRsRpcyJaf9TVlFSWk29C-8bddeAo37HS-yklrsx_b9HhWcicXUWySNUkvLUsODQv31k4hfwpiraUWJHGgrEp-j6yGmuOGVa5qQ",
    refresh_token: "1//0chW7y3Bt3iQgCgYIARAAGAwSNwF-L9IrsKxmHxPBncsEWMoyUES7AYiBqHfl0nIltnkxFalZgBitXKLmgIoFfy3xkm_9zu8iIlI",
    scope: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
    token_type: "Bearer",
    expiry_date: 1581145197994
}

const gmail = new GmailAPI(credentials, token);
gmail.sendMessage();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
//   authorize(JSON.parse(content), listLabels);
    authorize(JSON.parse(content), auth => {
        sendMessage(auth, 'dablaev@yandex.ru');
    });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
// function listLabels(auth) {
//   const gmail = google.gmail({version: 'v1', auth});
//   gmail.users.labels.list({
//     userId: 'me',
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     const labels = res.data.labels;
//     if (labels.length) {
//       console.log('Labels:');
//       labels.forEach((label) => {
//         console.log(`- ${label.name}`);
//       });
//     } else {
//       console.log('No labels found.');
//     }
//   });
// }

// function getMessages(auth) {
//     const gmail = google.gmail({version: 'v1', auth});
//     // gmail.users.messages.get()
//     gmail.users.messages.list({
//         userId: 'me'
//     }, (err, res) => {
//         if (err) return console.log('An error accured');
//         console.log();
//     })
// }

// function getMessage(auth, id) {
//     const gmail = google.gmail({version: 'v1', auth});
//     gmail.users.messages.get({
//         userId: 'me',
//         id
//     }, (err, res) => {
//         if (err) return console.log(`An error accured: ${err}`);
//         console.log(res);
//     })
// }

async function sendMessage(auth, email) {
    const gmail = google.gmail({version: 'v1', auth});
    const messageParts = [
        'From: CatchyClick <catchyclickstudio@gmail.com>',
        'To: <dablaev@yandex.ru>',
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        'Subject: Hello world!',
        '',
        'This is a message just to say hello.',
        'So... <b>Hello!</b>  🤘❤️😎'
    ];

    const message = messageParts.join('\n');

    const encodedMessage = Base64.encodeURI(message);

    const res = await gmail.users.messages.send({
        userId: 'me',
        resource: {
            raw: encodedMessage,
        }
    });

    console.log(res.data);
    // .then(res => {
    //     console.log(res);
    // })
    // .catch(rej => {
    //     console.error(rej);
    // })
}