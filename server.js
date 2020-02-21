const express = require('express');
const app = express();
const mysql = require('mysql2');
const utils = require('./public/JS/BEUtils');
const Enum = require('./public/JS/enum');
const envVars = new utils.EnvVars();
const gAPI = require('./public/JS/GoogleAPI');
const yAPI = require('./public/JS/yandexApi');
const Node = require('./public/JS/Node').Node;
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
app.use(express.json());

app.listen(3000, '192.168.0.106', () => {
    db.connect()
        .then(res => {
            console.log('Подключение к серверу MySQL успешно установлено')
            console.log('Сервер запущен');
        })
        .catch(err => console.error(`При подключении к серверу MySQL произошла ошибка : ${err.message}`));
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', async (req, res) => {
    const q = req.query;

    const rows = await db.query(`SELECT id, username, password, role FROM users WHERE username='${q.username}'`)
        .catch(e => {
            console.error(e);
            res.status(400).send('Неверное имя пользователя!');
        });

    const users = rows[0];
    const id = users[0].id
    const password = users[0].password;
    const role = users[0].role;

    if (users.length) {
        if (password === q.password) {
            const apiKey = utils.rndSequence(10);
            const data = [id, apiKey, req.ip];

            const rows = await db.query(`SELECT * FROM usersapi WHERE userId = '${id}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Ошибка сервера!');
                });
            if (rows[0].length) {
                await db.query(`UPDATE usersapi SET apiKey = '${apiKey}', userIp = '${req.ip}' WHERE userId = '${id}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Произошла ошибка при обновлении данных!');
                });
                res.status(200).json({id, username: users[0].username, apiKey});
            } else {
                await db.query('INSERT INTO usersapi(userId, apiKey, userIp) VALUES(?, ?, ?)', data)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Произошла ошибка при добавлении данных!');
                });
                res.status(201).json({id, username: users[0].username, apiKey});
            }
        } else {
            res.status(403).send('Неверный логин или пароль!');
        }
    } else {
        res.status(404).send('Пользователь не найден!');
    }
})

app.post('/free', async (req, res) => {
    const q = req.body;
    
    const rows = await db.query(`SELECT COUNT(*) as count FROM users WHERE username='${q.username}' OR email='${q.email}'`)
        .catch(e => {
            console.error(e);
            res.status(400).send('При регистрации пользователя произошла ошибка!');
        });
    const count = rows[0][0].count;

    if (count === 0) {
        const password = utils.rndSequence();
        const arr = [q.username, roles.student, q.phone, q.email, q.skype, password, 1];
        const result = await db.query('INSERT INTO users(username, role, phone, email, skype, password, classesLeft) VALUES(?, ?, ?, ?, ?, ?, ?)', arr)
            .catch(e => {
                console.error(e);
                res.status(500).send('Ошибка сервера!');
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
        res.status(201).send('Пользователь зарегистрирован! Проверьте вашу электронную почту!');
    } else {
        res.status(400).send('Данный пользователь уже существует!');
    }
})

app.get('/dashboard/:section', async (req, res) => {
    console.log();
    const q = req.query;
    if (q && q.apiKey) {
        const rows = await db.query(`SELECT users.id, users.role, usersapi.userIp FROM usersapi JOIN users ON usersapi.userId = users.id WHERE usersapi.apikey = '${q.apiKey}'`)
            .catch(e => {
                console.error(e);
                res.status(500).send('Ошибка сервера!');
            });
        const users = rows[0];

        if (users.length) {
            if (users && users[0].userIp === req.ip) {
                const section = req.params.section;
    
                if (users[0].role === 'student') {
    
                } else {
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
                            res.status(404).send('Запрашиваемая страница не найдена!');
                            break;
                    }
                }
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
})

app.route('/api/db/users')
    .get(async (req, res) => {
        const q = req.query;

        let rows = [];

        const value = q.searchingValue;

        if (value === '') {
            rows = await db.query('SELECT username, role, phone, email, skype, classesLeft, courses FROM users')
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Ошибка сервера!');
                });
        } else {
            rows = await db.query(`SELECT username, role, phone, email, skype, classesLeft, courses FROM users WHERE username REGEXP '${value}' OR role REGEXP '${value}' OR phone REGEXP '${value}' OR email REGEXP '${value}' OR skype REGEXP '${value}' OR classesLeft REGEXP '${value}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Ошибка сервера!');
                });
        }

        res.status(200).json(rows[0]);    
    })
    .put(async (req, res) => {
        const { diffs, sources } = req.body;
        const template = utils.obj2strArr(diffs).join(', ');
        const rows = await db.query(`UPDATE users SET ${template} WHERE username = '${sources.username}' AND email = '${sources.email}'`)
            .catch(e => {
                console.error(e);
                res.status(500).send('При обновлении данных произошла ошибка!');
            });
        res.status(200).send(`Данные пользователя ${sources.username} успешно обновлены!`);
    })
    .post(async (req, res) => {
        const q = req.body;
        const password = utils.rndSequence();
        const data = [q.username, q.role, q.phone, q.email, q.skype, password, q.classesLeft, q.courses];
        const rows = await db.query('INSERT INTO users(username, role, phone, email, skype, password, classesLeft, courses) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', data)
            .catch(e => {
                console.error(e);
                res.status(500).send('При создании пользователя произошла ошибка!');
            });

        res.status(201).send(`Пользователь ${q.username} успешно добавлен!`);
    })

app.route('/api/db/userData')
    .get(async (req, res) => {
        const q = req.query;

        if (q && q.apiKey) {
            const rows = await db.query(`SELECT users.username, users.phone, users.email, users.skype FROM users JOIN usersapi ON users.id = usersapi.userId WHERE usersapi.apiKey = '${q.apiKey}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Ошибка сервера!');
                });

            res.status(200).json(rows[0]);
        } else {
            res.status(400).send('Неверный apiKey!');
        }
    })
    .put(async (req, res) => {
        const apiKey = req.query.apiKey;

        const rows = await db.query(`SELECT users.username, users.phone, users.email, users.skype, users.password FROM users JOIN usersapi ON users.id = usersapi.userId WHERE usersapi.apiKey = '${apiKey}'`)
            .catch(e => {
                console.error(e);
                res.status(500).send('Ошибка сервера!');
            });

        if (rows[0].length) {
            const users = rows[0];
            const q = req.body;
            const diffs = q.difference;

            if (diffs && diffs['old-password']) {
                if (users[0].password !== diffs['old-password']) {
                    res.status(400).send('Старый пароль введен неверно!');
                } else {
                    delete diffs['old-password'];
                }
            }

            const template = utils.obj2strArr(diffs).join(', ');

            const result = await db.query(`UPDATE users JOIN usersapi ON users.id = usersapi.userId SET ${template} WHERE usersapi.apiKey = '${apiKey}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('При обновлении данных произошла ошибка!');
                });
            res.status(200).send('Данные пользователя успешно обновлены!');
            
        } else {
            res.status(400).send('Отправлен неправильный apiKey!');
        }
    })

app.route('/api/db/courses')
    .get(async (req, res) => {
        const q = req.query;
        const value = q.searchingValue;

        let rows = [];
        if (value === '') {
            rows = await db.query('SELECT courses.id, courses.name, courses.description, classes.id as class_id, classes.name as class_name, classes.description as class_description, classes.files FROM courses LEFT JOIN classes ON courses.id = classes.course_id')
                .catch(e => {
                    console.error(e);
                    res.status(500).send('При отправке данных произошла ошибка!');
                });
        } else {
            rows = await db.query(`SELECT courses.id, courses.name, courses.description, classes.id as class_id, classes.name as class_name, classes.description as class_description, classes.files FROM courses LEFT JOIN classes ON courses.id = classes.course_id WHERE courses.name REGEXP '${value}' OR courses.description REGEXP '${value}' OR classes.name REGEXP '${value}' OR classes.description REGEXP '${value}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('При отправке данных произошла ошибка!');
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

        res.status(200).json(combinedObject);
    })
    .post(async (req, res) => {
        const q = req.body;
        const data = [q.name, q.description];

        await db.query(`INSERT INTO courses(name, description) VALUES(?, ?)`, data)
            .catch(e => {
                console.error(e);
                res.status(500).send('При создании курса произошла ошибка!');
            });
        
        res.status(201).send('Курс успешно создан!');
    })
    .put(async (req, res) => {
        const {data, source} = req.body;

        const template = utils.obj2strArr(data).join(', ');
        const rows = await db.query(`UPDATE courses SET ${template} WHERE id = '${source.id}' AND name = '${source.name}'`)
            .catch(e => {
                console.error(e);
                res.status(500).send('При обновлении курса произошла ошибка!');
            });

        res.status(201).send('Курс успешно обновлен!');
    })
    .delete(async (req, res) => {
        const q = req.body;

        await db.query(`DELETE FROM courses WHERE id = ${q.id}`)
            .catch(e => {
                console.error(e);
                res.status(500).send('При удалении курса произошла ошибка!');
            });

        res.status(201).send('Курс успешно удален!');
    })

app.route('/api/db/class')
    .post(async (req, res) => {
        const q = req.body;
        const data = [q.courseId, q.name, q.description]
        await db.query('INSERT INTO classes(course_id, name, description) VALUES(?, ?, ?)', data)
            .catch(e => {
                console.error(e);
                res.status(500).send('При создании урока произошла ошибка!');
            });

        res.status(201).send('Урок успешно создан!');
    })
    .put(async (req, res) => {
        const { data, source } = req.body;

        const template = utils.obj2strArr(data).join(', ');
        await db.query(`UPDATE classes SET ${template} WHERE id = '${source.id}' AND name = '${source.name}'`)
            .catch(e => {
                console.error(e);
                res.status(500).send('При удалении урока произошла ошибка!');
            });

        res.status(200).send('Урок успешно обновлен!');
    })

    .delete(async (req, res) => {
        const q = req.body;

        await db.query(`DELETE FROM classes WHERE course_id = ${q.courseId} AND id = ${q.id}`)
            .catch(e => {
                console.error(e);
                res.status(500).send('При удалении урока произошла ошибка!');
            });

        res.status(200).send('Урок успешно удален!');
    })

app.route('/api/db/files')
    .get(async (req, res) => {
        const value = req.query.searchingValue;

        let rows;
        if (!value) rows = await db.query('SELECT * FROM files')
            .catch(e => {
                console.error(e);
                res.status(500).send('Ошибка сервера!');
            });
        else rows = await db.query(`SELECT * FROM files WHERE name REGEXP '${value}'`)
            .catch(e => {
                console.error(e);
                res.status(500).send('Ошибка сервера!');
            });

        res.status(200).send(rows[0]);
    })
    .post(async (req, res) => {
        const q = req.body;

        const data = await db.query(`INSERT INTO files(name, link) VALUE('${q.name}', '${q.path}')`)
            .catch(e => {
                console.error(e);
                res.status(500).send('Ошибка сервера!');
            });
        res.status(201).send('Файл создан!');
    })
    .delete(async (req, res) => {
        const q = req.body;

        const response = await yandexDisk.deleteData(q.link);
        const statusCode = response.res.statusCode;
        if (statusCode === 204) {
            await db.query(`DELETE FROM files WHERE id = '${q.id}' AND name = '${q.name}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Ошибка сервера!');
                });
            res.status(204).send('Файл удален!');
        } else {
            res.status(statusCode).send(response.res);
        }
    })
    .put(async (req, res) => {
        const q = req.body;
        const root = 'chinalang';
        const docs = 'documents';
        // const photos = 'photos';

        const filesList = await yandexDisk.getList();
        const tree = utils.getDirTree(filesList.body.items);

        if (tree.find(root) === null) {
            await yandexDisk.createFolder(root);
            const response = await yandexDisk.getUploadLink(`${root}/temp.tmp`);
            await yandexDisk.putData(response.body.href, Buffer.from('temp'));
        }
        if (tree.find(docs) === null) {
            const path = `${root}/${docs}`;
            await yandexDisk.createFolder(path);
            const response = await yandexDisk.getUploadLink(`${path}/temp.tmp`);
            await yandexDisk.putData(response.body.href, Buffer.from('temp'));
        }
        // if (tree.find(photos) === null) {
        //     const path = `${root}/${photos}`;
        //     await yandexDisk.createFolder(path);
        //     const response = await yandexDisk.getUploadLink(`${path}/temp.tmp`);
        //     await yandexDisk.putData(response.body.href, Buffer.from('temp'));
        // }

        const name = utils.translate(q.name);
        
        const filePath = `${root}/${docs}/${name}`;
        const link = await yandexDisk.getUploadLink(filePath);
        res.status(200).json({data: link.body, path: filePath});
    })

app.get('/test', (req, res) => {
    console.log();
})

app.post('/test', async (req, res) => {
    console.log();
})