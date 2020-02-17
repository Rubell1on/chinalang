const express = require('express');
const app = express();
const mysql = require('mysql2');
const utils = require('./public/JS/BEUtils');
const Enum = require('./public/JS/enum');
const bodyParser = require('body-parser');
const envVars = new utils.EnvVars();
const gAPI = require('./public/JS/GoogleAPI');
const yAPI = require('./public/JS/yandexApi');
const dbSettings = envVars.getDBSettings();
const db = mysql.createConnection(dbSettings).promise();

const credentials = envVars.getGoogleAPICredentials();
const token = envVars.getGoogleAPIToken();
const gmailClient = new gAPI.GmailAPI(credentials, token);

const yandexToken = envVars.getYandexAPIToken().token;
const yandexDisk = new yAPI(yandexToken);

const roles = new Enum('admin', 'teacher', 'native_teacher', 'student');

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/public/JS', express.static('JS'));
app.use('/public/IMG', express.static('IMG'));
app.use(bodyParser.urlencoded({extended: false}));

app.listen(3000, '192.168.0.106', async () => {
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
        case 'courses':
            res.render('dashboard/admin/courses');
            break;

        case 'files':
            res.render('dashboard/admin/files');
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
        rows = await db.query(`SELECT username, role, phone, email, skype, classesLeft, courses FROM users WHERE username REGEXP '${value}' OR role REGEXP '${value}' OR phone REGEXP '${value}' OR email REGEXP '${value}' OR skype REGEXP '${value}' OR classesLeft REGEXP '${value}'`);
    }

    res.json(rows[0]);    
})

app.get('/api/db/updateUsers', async (req, res) => {
    const { diffs, sources } = req.query;
    const template = utils.obj2strArr(diffs).join(', ');
    const rows = await db.query(`UPDATE users SET ${template} WHERE username = '${sources.username}' AND email = '${sources.email}'`)
        .catch(e => {
            console.error(e);
            res.send(500, 'При обновлении данных произошла ошибка!');
        });
    res.send(200, `Данные пользователя ${sources.username} успешно обновлены!`);
})

app.get('/api/db/createUser', async (req, res) => {
    const q = req.query;
    const password = utils.rndSequence();
    const data = [q.username, q.role, q.phone, q.email, q.skype, password, q.classesLeft, q.courses];
    const rows = await db.query('INSERT INTO users(username, role, phone, email, skype, password, classesLeft, courses) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', data)
        .catch(e => {
            console.error(e);
            res.send(500, 'При создании пользователя произошла ошибка!');
        });

    res.send(201, `Пользователь ${q.username} успешно добавлен!`);
})

app.get('/api/db/courses', async (req, res) => {
    const q = req.query;
    const value = q.searchingValue;

    let rows = [];
    if (value === '') {
        // rows = await db.query('SELECT * FROM courses');
        rows = await db.query('SELECT courses.id, courses.name, courses.description, classes.id as class_id, classes.name as class_name, classes.description as class_description, classes.files FROM courses LEFT JOIN classes ON courses.id = classes.course_id')
            .catch(e => {
                console.error(e);
                res.send(500, 'При отправке данных произошла ошибка!');
            });
    } else {
        rows = await db.query(`SELECT courses.id, courses.name, courses.description, classes.id as class_id, classes.name as class_name, classes.description as class_description, classes.files FROM courses LEFT JOIN classes ON courses.id = classes.course_id WHERE courses.name REGEXP '${value}' OR courses.description REGEXP '${value}' OR classes.name REGEXP '${value}' OR classes.description REGEXP '${value}'`)
            .catch(e => {
                console.error(e);
                res.send(500, 'При отправке данных произошла ошибка!');
            });
    }

    const tempObject = rows[0].reduce((acc, row) => {
        const id = row.id;

        if (acc && !acc[id]) {
            acc[id] = {
                id,
                name: row.name,
                description: row.description,
                classes: []
            }
        }
        
        if (row && row.class_name) {
            const classInstance = {
                id: row.class_id,
                courseId: id,
                name: row.class_name,
                description: row.class_description,
                files: row.files
            }
    
            acc[id].classes.push(classInstance);
        }

        return acc;
    }, {});

    const combinedObject = Object.entries(tempObject).map(row => row[1], []);

    res.json(combinedObject);
})

app.get('/api/db/createCourse', async (req, res) => {
    const q = req.query;
    const data = [q.name, q.description];

    await db.query(`INSERT INTO courses(name, description) VALUES(?, ?)`, data)
        .catch(e => {
            console.error(e);
            res.send(500, 'При создании курса произошла ошибка!');
        });
    
    res.send(201, 'Курс успешно создан!');
})

app.get('/api/db/updateCourse', async (req, res) => {
    const {data, source} = req.query;

    const template = utils.obj2strArr(data).join(', ');
    const rows = await db.query(`UPDATE courses SET ${template} WHERE id = '${source.id}' AND name = '${source.name}'`)
        .catch(e => {
            console.error(e);
            res.send(500, 'При обновлении курса произошла ошибка!');
        });

    res.send(201, 'Курс успешно обновлен!');
})

app.get('/api/db/removeCourse', async (req, res) => {
    const q = req.query;

    await db.query(`DELETE FROM courses WHERE id = ${q.id}`)
        .catch(e => {
            console.error(e);
            res.send(500, 'При удалении курса произошла ошибка!');
        });

    res.send(201, 'Курс успешно удален!');
})

app.get('/api/db/createClass', async (req, res) => {
    const q = req.query;
    const data = [q.courseId, q.name, q.description]
    await db.query('INSERT INTO classes(course_id, name, description) VALUES(?, ?, ?)', data)
        .catch(e => {
            console.error(e);
            res.send(500, 'При создании урока произошла ошибка!');
        });

    res.send(201, 'Урок успешно создан!');
})

app.get('/api/db/updateClass', async (req, res) => {
    const {data, source} = req.query;

    const template = utils.obj2strArr(data).join(', ');
    await db.query(`UPDATE classes SET ${template} WHERE id = '${source.id}' AND name = '${source.name}'`)
        .catch(e => {
            console.error(e);
            res.send(500, 'При удалении урока произошла ошибка!');
        });

    res.send(200, 'Урок успешно обновлен!');
})

app.get('/api/db/removeClass', async (req, res) => {
    const q = req.query;

    await db.query(`DELETE FROM classes WHERE course_id = ${q.courseId} AND id = ${q.id}`)
        .catch(e => {
            console.error(e);
            res.send(500, 'При удалении урока произошла ошибка!');
        });

    res.send(200, 'Урок успешно удален!');
})

app.route('/api/db/files')
    .get(async (req, res) => {
        const value = req.query.searchingValue;

        let rows;
        if (!value) rows = await db.query('SELECT * FROM files');
        else rows = await db.query(`SELECT * FROM files WHERE name REGEXP '${value}'`);

        res.send(200, rows[0]);
    })
    .post(async (req, res) => {
        const q = req.body;

        const data = await db.query(`INSERT INTO files(name, link) VALUE('${q.name}', '${q.path}')`);
        res.send(201);
    })
    .delete(async (req, res) => {
        const q = req.body;

        const response = await yandexDisk.deleteData(q.link);
        const statusCode = response.res.statusCode;
        if (statusCode === 204) {
            await db.query(`DELETE FROM files WHERE id = '${q.id}' AND name = '${q.name}'`);
            res.send(204);
        } else {
            res.send(statusCode);
        }
    })
    .put(async (req, res) => {
        const q = req.body;
        const root = 'chinalang';
        const filesList = await yandexDisk.getList();
        const dirList = yandexDisk.getDirList(filesList);
    
        if (!dirList.includes(root)) {
            await yandexDisk.createFolder(root);
        }

        const name = utils.translate(q.name);
        
        const filePath = `${root}/${name}`;
        const link = await yandexDisk.getUploadLink(filePath);
        res.status(200).json({data: link.body, path: filePath});
    })

app.get('/test', (req, res) => {
    res.render('inputTest/index');
})

app.post('/test', async (req, res) => {
    const q = req.body;
    const root = 'chinalang';
    const filesList = await yandexDisk.getList();
    const dirList = yandexDisk.getDirList(filesList);

    if (!dirList.includes(root)) {
        await yandexDisk.createFolder(root);
    }

    const link = await yandexDisk.getUploadLink(`${root}/${q.name}`);
    res.status(200).json(link.body);
    console.log();
})