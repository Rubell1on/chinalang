const express = require('express');
const app = express();
const mysql = require('mysql2');
const utils = require('./public/JS/BEUtils');
const envVars = new utils.EnvVars();
const gAPI = require('./public/JS/GoogleAPI')

const dbSettings = envVars.getDBSettings();
const db = mysql.createConnection(dbSettings).promise();

const credentials = envVars.getGoogleAPICredentials();
const token = envVars.getGoogleAPIToken();
const gmailClient = new gAPI.GmailAPI(credentials, token);

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/public/JS', express.static('JS'));

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
    
    const rows = await db.query(`SELECT COUNT(*) as count FROM users WHERE username='${q.username}' OR email='${q.email}'`).catch(e => {
        console.error(e);
        res.send(400);
    });
    const count = rows[0][0].count;

    if (count === 0) {
        const password = utils.rndSequence();
        const arr = [q.username, q.phone, q.email, q.skype, password, 1];
        const result = await db.query('INSERT INTO users(username, phone, email, skype, password, lessonsCount) VALUES(?, ?, ?, ?, ?, ?)', arr).catch(e => {
            console.error(e);
            res.send(500, 'Ошибка сервера!');
        });
        const message = new gAPI.messageBuilder(
            {
                name: 'chinaLang', 
                email: 'catchyclickstudio@gmail.com'
            }, 
            'dablaev@yandex.ru', 
            'Регистрация завершена!', 
            `Теперь вы можете войти в свой личный кабинет!<br>Логин: ${q.username}<br>Пароль: ${password}`
        ).build();

        await gmailClient.sendMessage(message);
        res.send(201, 'Пользователь зарегистрирован! Проверьте вашу электронную почту!');
    } else {
        res.send(400, 'Данный пользователь уже существует!');
    }
})

app.get('/test', async (req, res) => {
    const rows = await db.query('SELECT * FROM users');
})