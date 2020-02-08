const readline = require('readline');
const { google } = require('googleapis');
const Base64 = require('js-base64').Base64;

module.exports = {
    GmailAPI: class GmailAPI {
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
            this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
            this.oAuth2Client.setCredentials(this.token);
            this.gmail = google.gmail({version: 'v1', auth: this.oAuth2Client});
        }
    
        async sendMessage(message) {
            // const messageParts = [
            //     'From: CatchyClick <catchyclickstudio@gmail.com>',
            //     'To: <dablaev@yandex.ru>',
            //     'Content-Type: text/html; charset=utf-8',
            //     'MIME-Version: 1.0',
            //     'Subject: Hello world!',
            //     '',
            //     'This is a message just to say hello.',
            //     'So... <b>Hello!</b>  🤘❤️😎'
            // ];
    
            // const message = messageParts.join('\n');
    
            const encodedMessage = Base64.encodeURI(message);
    
            const res = await this.gmail.users.messages.send({
                userId: 'me',
                resource: {
                    raw: encodedMessage,
                }
            }).catch(e => console.log(e));
        }
    },

    messageBuilder: class MessageBuilder {
        constructor(from, to, subject, text) {
            const messageParts = [
                `From: ${from.name} <${from.email}>`,
                `To: <${to}>`,
                'Content-Type: text/html; charset=utf-8',
                'MIME-Version: 1.0',
                `Subject: =?utf-8?B?${Base64.encodeURI(subject)}?=`,
                '',
                `${text}`
            ];

            this.message = messageParts.join('\n');
        } 
        
        build() {
            return this.message;
        }
    }
}