module.exports.ApiKey = class ApiKey {
    constructor(db) {
        this.db = db;
    }

    async verify(apiKey) {
        const rows = await this.db.query(`SELECT * FROM usersapi WHERE apiKey = '${apiKey}'`)
            .catch(e => {
                console.error(e);
            });

        return rows[0];            
    }

    async getUser(apiKey) {
        const rows = await this.db.query(`SELECT id, role FROM users JOIN usersapi ON users.id = usersapi.userId WHERE usersapi.apikey = '${apiKey}'`)
            .catch(e => {
                console.error(e);
            });

        return rows[0];
    }
}