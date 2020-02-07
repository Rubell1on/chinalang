const express = require('express');
const app = express();
const mysql = require('mysql2');
const utils = require('./public/JS/BEUtils');
const envVars = new utils.EnvVars();

const dbSettings = envVars.getDBSettings();

const db = mysql.createConnection(dbSettings).promise();

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.listen(3000, '192.168.1.133', async () => {
    const result = await db.connect().catch(err => console.error(`При подключении к серверу MySQL произошла ошибка : ${err.message}`));
    console.log('Подключение к серверу MySQL успешно установлено')
    console.log('Сервер запущен');
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', async (req, res) => {
    const q = req.query;

    const rows = await db.query(`SELECT username, password FROM users WHERE username='${q.username}'`).catch(e => {
        console.error(e);
        res.send(400);
    });

    const users = rows[0];
    if (users.length) {
        if (users[0].password === q.password) {
            res.send(200);
        } else {
            res.send(403, 'Неверный логин или пароль!');
        }
    } else {
        res.send(404, 'Пользователь не найден!');
    }
})

app.get('/freeLesson', async (req, res) => {
    const q = req.query;
    
    const rows = await db.query(`SELECT COUNT(*) as count FROM users WHERE username='${q.username}'`).catch(e => {
        console.error(e);
        res.send(400);
    });
    const count = rows[0][0].count;

    if (count === 0) {
        const arr = [q.username, q.phone, q.email, q.skype, rndSequence(), 1];
        const result = await db.query('INSERT INTO users(username, phone, email, skype, password, lessonsCount) VALUES(?, ?, ?, ?, ?, ?)', arr).catch(e => {
            console.error(e);
            res.send(500, 'Ошибка сервера!');
        });
        res.send(201, 'Пользователь зарегистрирован!');
    } else {
        res.send(400, 'Данный пользователь уже существует!');
    }

    function rndSequence(length = 6) {
        return Math.random().toString(36).substring(length)
    }
})

app.get('/test', async (req, res) => {
    const rows = await db.query('SELECT * FROM users');
})