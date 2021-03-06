const request = require('request');

module.exports = class yandexApi {
    constructor(TOKEN) {
        this.TOKEN = TOKEN;
    }

    getUploadLink(path, overwrite = false) {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}` 
                },
                url: `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${path}&overwrite=${overwrite}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    putData(url, data) {
        return new Promise((resolve, reject) => {
            request.put({
                headers: { 'Content-Type': 'application/json' },
                url,
                body: data
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body});
            });
        });
    }

    createFolder(folderName) {
        return new Promise((resolve, reject) => {
            request.put({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: `https://cloud-api.yandex.net/v1/disk/resources?path=${folderName}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    getList() {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: 'https://cloud-api.yandex.net/v1/disk/resources/files?limit=100000'
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    getDowndloadLink(filePath, fields = []) {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: `https://cloud-api.yandex.net/v1/disk/resources/download?path=${filePath}${fields.length ? `&fields=${fields.join(',')}` : ''}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    getData(url) {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json'  
                },
                encoding: null,
                url
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body});
            });
        });
    }

    deleteData(path, permanently = false) {
        return new Promise((resolve, reject) => {
            request.delete({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`  
                },
                encoding: null,
                url: `https://cloud-api.yandex.net/v1/disk/resources?path=${path}&permanently=${permanently}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body});
            });
        });
    }

    getDirList() {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: 'https://cloud-api.yandex.net/v1/disk/resources/public?limit=100000&type=dir'
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    publishFile(path) {
        return new Promise((resolve, reject) => {
            request.put({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: `https://cloud-api.yandex.net/v1/disk/resources/publish?path=${path}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    getPublished() {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth ${this.TOKEN}`   
                },
                url: 'https://cloud-api.yandex.net/v1/disk/resources/public?limit=100000'
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            });
        });
    }

    async initFolder(path) {
        await this.createFolder(path);
        const response = await this.getUploadLink(`${path}/temp.tmp`, true);
        await this.putData(response.body.href, Buffer.from('temp'));
    }
}