const express = require('express');
const app = express();
const mysql = require('mysql2');
const utils = require('./public/JS/BEUtils');
const Enum = require('./public/JS/enum');
const envVars = new utils.EnvVars();
const gAPI = require('./public/JS/GoogleAPI');

const dbSettings = envVars.getDBSettings();
const db = mysql.createConnection(dbSettings).promise();

const credentials = envVars.getGoogleAPICredentials();
const token = envVars.getGoogleAPIToken();
const gmailClient = new gAPI.GmailAPI(credentials, token);

const roles = new Enum('admin', 'teacher', 'native_teacher', 'student');

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/public/JS', express.static('JS'));
app.use('/public/IMG', express.static('IMG'));

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

    const rows = await db.query(`SELECT username, password, role FROM users WHERE username='${q.username}'`).catch(e => {
        console.error(e);
        res.send(400);
    });

    const users = rows[0];
    const password = users[0].password;
    const role = users[0].role;

    if (users.length) {
        if (password === q.password) {
            if (role === roles.student) {
                //TO DO
            } else {
                res.render('dashboard');
                // res.redirect('/dashboard',)
                // res.send('<p>Some html</p>');
            }
        } else {
            res.send(403, 'Неверный логин или пароль!');
        }
    } else {
        res.send(404, 'Пользователь не найден!');
    }
})

app.get('/free', async (req, res) => {
    const q = req.query;
    
    const rows = await db.query(`SELECT COUNT(*) as count FROM users WHERE username='${q.username}' OR email='${q.email}'`).catch(e => {
        console.error(e);
        res.send(400);
    });
    const count = rows[0][0].count;

    if (count === 0) {
        const password = utils.rndSequence();
        const arr = [q.username, roles.student, q.phone, q.email, q.skype, password, 1];
        const result = await db.query('INSERT INTO users(username, role, phone, email, skype, password, classesLeft) VALUES(?, ?, ?, ?, ?, ?, ?)', arr).catch(e => {
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

app.get('/dashboard/:section', (req, res) => {
    console.log();
    const section = req.params.section;

    switch(section) {
        case 'users':
            res.render('dashboard/admin/users');
            break;
        default:
            res.send(404);
            break;
    }
})

app.get('/api/db/users', async (req, res) => {
    const q = req.query;
    const value = q.searchingValue;

    let rows = [];
    if (value === '') {
        rows = await db.query('SELECT username, role, phone, email, skype, classesLeft, courses FROM users');
    } else {
        rows = await db.query(`SELECT username, role, phone, email, skype, classesLeft, courses FROM users WHERE username='${value}' OR role='${value}' OR phone='${value}' OR email='${value}' OR skype='${value}' OR classesLeft='${value}'`);
    }

    res.json(rows[0]);    
})

app.get('/api/db/updateUsers', async (req, res) => {
    const { diffs, sources } = req.query;
    const template = Object.entries(diffs).reduce((acc, curr) => {
        acc.push(`${curr[0]} = '${curr[1]}'`);
        return acc;
    }, [])
    .join(', ');
    const rows = await db.query(`UPDATE users SET ${template} WHERE username = '${sources.username}' AND email = '${sources.email}'`)
        .catch(e => {
            console.error(e);
            res.send(500, 'При обновлении данных проихзошла ошибка!');
        });
    res.send(200, `Данные пользователя ${sources.username} успешно обновлены!`);
});

app.get('/test', async (req, res) => {
    console.log();
})