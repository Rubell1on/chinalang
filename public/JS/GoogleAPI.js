const readline = require('readline');
const { google } = require('googleapis');
const Base64 = require('js-base64').Base64;

const messageBuilder = class MessageBuilder {
    constructor(from, to, subject, text) {
        const messageParts = [
            `From: ${from.name} <${from.email}>`,
            `To: <${to}>`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: =?utf-8?B?${Base64.encode(subject)}?=`,
            '',
            `${text}`
        ];

        this.message = messageParts.join('\n');
    } 
    
    build() {
        return this.message;
    }
}

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
            const encodedMessage = Base64.encodeURI(message);
    
            return this.gmail.users.messages.send({
                userId: 'me',
                resource: {
                    raw: encodedMessage,
                }
            });
        }
    },

    messageBuilder 
}