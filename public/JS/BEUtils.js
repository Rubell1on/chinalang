module.exports = {
    EnvVars: class EnvVars {
        constructor() {
            this.e = process.env;
        }
        
        getDBSettings() {
            return {
                host: this.e.host,
                user: this.e.user,
                database: this.e.database,
                password: this.e.password
            }
        }

        getGoogleAPICredentials() {
            return {
                installed: {
                    client_id: this.e.client_id,
                    project_id: this.e.project_id,
                    auth_uri: this.e.auth_uri,
                    token_uri: this.e.token_uri,
                    auth_provider_x509_cert_url: this.e.auth_provider_x509_cert_url,
                    client_secret: this.e.client_secret,
                    redirect_uris: this.e.redirect_uris
                }
            }
        }

        getGoogleAPIToken() {
            return {
                access_token: this.e.access_token,
                refresh_token: this.e.refresh_token,
                scope: this.e.scope,
                token_type: this.e.token_type,
                expiry_date: Number(this.e.expiry_date)
            }
        }
    },
    rndSequence: function rndSequence(length = 6) {
        return Math.random().toString(36).substring(length)
    },

    obj2strArr: function (object) {
        return Object.entries(object).reduce((acc, curr) => {
            acc.push(`${curr[0]} = '${curr[1]}'`);
            return acc;
        }, []);
    }
}