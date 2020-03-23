const fs = require('fs');
const moment = require('moment');

const Logger = class Logger {
    constructor(targets = []) {
        this._targets = targets;
    }

    log(message) {
        this._targets.forEach(t => t.log(message));
    }

    error(message) {
        this._targets.forEach(t => t.error(message))
    }

    addTarget(target) {
        this._targets.push(target);

        return this;
    }
}

const LogTarget = class LogTarget {
    constructor(target) {
        this._target = target;
    }

    log(message) {
        if (this._target && this._target.log)
            this._target.log(message);
    }

    error(message) {
        if (this._target && this._target.error)
            this._target.error(message);
    }
}

const LogFile = class FileLog extends LogTarget {
    constructor(path) {
        fs.mkdirSync(`${path}/log`, { recursive: true });
        fs.mkdirSync(`${path}/error`, { recursive: true });

        super({
            log: async (message) => {
                const date = moment().format('YYYY-MM-DD');
                await this._appendToFile(`${path}/log/${date}_log.txt`, message)
                    .catch(e => console.error(e));
            },
            error: async (message) => {
                const date = moment().format('YYYY-MM-DD');
                await this._appendToFile(`${path}/error/${date}_error.txt`, message)
                    .catch(e => console.error(e));
            }
        });
        
        this.path = path;
    }

    async _appendToFile(path, message) {
        return new Promise((resolve, reject) => {
            const dateTime = moment().format('YYYY-MM-DD HH:mm:SS');
            fs.appendFile(path, `\n${dateTime} - ${message}`, 'utf8', err => {
                if (err) reject(err);
                else resolve('Файл дополнен!')
            });
        })
    }
}

module.exports = {
    Logger,
    LogTarget,
    LogFile
}