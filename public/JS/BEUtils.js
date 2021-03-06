const Node = require('./Node').Node;

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

        getYandexAPIToken() {
            return {
                token: this.e.yandex_token
            }
        }

        getInstaToken() {
            return {
                token: this.e.instagram_access_token
            }
        }
    },
    rndSequence: function rndSequence(length = 6) {
        return Math.random().toString(36).substring(2, 2 + length)
    },

    obj2strArr: function (object) {
        return Object.entries(object).reduce((acc, curr) => {
            acc.push(`${curr[0]} = ${typeof curr[1] === 'object' ? `'${JSON.stringify(curr[1])}'` : `'${curr[1]}'`}`);
            return acc;
        }, []);
    },

    translate: function(text, engToRus = false) {
        var x;
        var
        rus = "щ   ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g),
        eng = "shh sh ch cz yu ya yo zh `` y' e` a b v g d e z i j k l m n o p r s t u f x `".split(/ +/g);
        for(x = 0; x < rus.length; x++) {
            text = text.split(engToRus ? eng[x] : rus[x]).join(engToRus ? rus[x] : eng[x]);
            text = text.split(engToRus ? eng[x].toUpperCase() : rus[x].toUpperCase()).join(engToRus ? rus[x].toUpperCase() : eng[x].toUpperCase());	
        }
        return text;
    },

    getDirTree: function (list) {
        const root = new Node('root');

        list.forEach(el => {
            const dirNames = el.path
                .split('/')
                .filter(val => val.indexOf('disk:') === -1 && val.indexOf('.') === -1);

            let node = root;

            for (let i = 0; i < dirNames.length; i++) {
                const name = dirNames[i];
                const temp = node.find(name);
                if (temp === null) {
                    node.addChild(new Node(name));
                    node = node.find(name);
                } else node = temp;
            }
        });

        return root;
    },

    messageBottomHTML: function() {
        return `<br><br><table>
                    <tbody>
                        <tr>С уважением, команда</tr>
                        <tr>
                            <a style="display: block;" href="https://www.china-lang.com">
                                <img style="height: 35px; width: 191.41px; display: block;" src="https://i.ibb.co/vk038yN/chinalang.png" title="Logo" alt="https://www.china-lang.com">
                            </a>
                        </tr>
                    </tbody>
                </table>`;
    }
}