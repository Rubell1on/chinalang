const request = require('request');

class InstagramAPI {
    constructor(client_id, redirect_uri) {
        this.client_id = client_id;
        this.redirect_uri = redirect_uri;
    }

    createAuthorizeLink() {
        return `https://api.instagram.com/oauth/authorize
        ?client_id=${this.client_id}
        &redirect_uri=${this.redirect_uri}
        &scope=user_profile,user_media
        &response_type=code`
    }

    async authorize() {
        return new Promise((resolve, reject) => {
            request.get({
                url: `https://api.instagram.com/oauth/authorize
                ?client_id=${this.client_id}
                &redirect_uri=${this.redirect_uri}
                &scope=user_profile,user_media
                &response_type=code`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            })
        })
    }

    async getMarker(secret, code) {
        return new Promise((resolve, reject) => {
            request.post({
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": "412"
                },
                url: `https://api.instagram.com/oauth/access_token
                `,
                body: {
                    client_id: this.client_id,
                    client_secret: secret,
                    grant_type: 'authorization_code',
                    redirect_uri: this.redirect_uri,
                    code: code
                }
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            })
        })
    }

    async getMedia(acess_token, fields = ['id', 'caption', 'media_type', 'media_url', 'permalink', 'thumbnail_url', 'timestamp']) {
        return new Promise((resolve, reject) => {
            request.get({
                url: `https://graph.instagram.com/me/media?fields=${fields.join(',')}&access_token=${acess_token}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            })
        })
    }
}

const data = {
    client_id: '253216075835650',
    redirect_uri: 'https://socialsizzle.herokuapp.com/auth/',
    secret: '799be0226b2e85a03cf249941d7dcfac',
    code: 'AQDNjiMZoA7ilnkc5iEyo2DDepXEPMW7HtkupevyXAHa3h13p0OkDRzlcqJojSAVMvRaCxHDklC1b7mooiKo6hlmqutaGg8R2J_0VSL13zkl2tAhsyKW-SQPXNwN4OREkSQsH6tMM58AzE1UJ49SSlSQRKX15lhfU9mYm_FNaTDX1VbbEG2trUZ3CaPcnl_-BCMJlaWDtJ0FxqKugDn2YfcqCzxC2E-TMgiZcmagG77SGQ',
    access_token: 'IGQVJXb2p4TzMxcXpaTlBVT2dmUWZADVHlYR0tLcDR5YnR2QnJkdDQxdFZAKRDFmQ3FNa3REem9aTGo1OFZATNHBYa2JyRmhwUUVhSkdoLU1LOGZAsSUJCdW9JaS1BYkY4Mm9aOFd4RWdxbEpWWjBVUXZABRmFycnNWYmtFV0ZAN',
    user_id: '17841424957882109' 
};