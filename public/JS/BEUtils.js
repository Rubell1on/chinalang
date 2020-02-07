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
    }
}