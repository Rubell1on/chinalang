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
const keysManager = require('./public/JS/apiKeyManager').ApiKey;
const apiKeyManager = new keysManager(db);
const moment = require('moment-timezone');

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

    const rows = await db.query(`SELECT id, username, password, role, photoLink FROM users WHERE username='${q.username}'`)
        .catch(e => {
            console.error(e);
            res.status(400).send('Неверное имя пользователя!');
        });

    const users = rows[0];
    const id = users[0].id
    const password = users[0].password;
    const role = users[0].role;
    const photoLink = users[0].photoLink;

    if (users.length) {
        if (password === q.password) {
            const apiKey = utils.rndSequence(10);
            const data = [id, apiKey, req.ip];

            const rows = await db.query(`SELECT * FROM usersapi WHERE userId = '${id}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Ошибка сервера!');
                });

            const response = await yandexDisk.getPublished();
            const files = response.body.items;
            const file = files.find(f => f.path.slice(6) === photoLink);

            let buffer = '';

            if (file) {
                const image = await yandexDisk.getData(file.file);
                buffer = file && image && image.body ? Base64.encode(image.body) : '';
            }

            if (rows[0].length) {
                await db.query(`UPDATE usersapi SET apiKey = '${apiKey}', userIp = '${req.ip}' WHERE userId = '${id}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Произошла ошибка при обновлении данных!');
                });
                res.status(200).json({id, username: users[0].username, role, apiKey, photo: buffer});
            } else {
                await db.query('INSERT INTO usersapi(userId, apiKey, userIp) VALUES(?, ?, ?)', data)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Произошла ошибка при добавлении данных!');
                });
                res.status(201).json({id, username: users[0].username, role, apiKey, photo: buffer});
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
        const result = await db.query('INSERT INTO users(username, role, phone, email, skype, password, classesWRussian) VALUES(?, ?, ?, ?, ?, ?, ?)', arr)
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

app.route('/purchase')
    .get((req, res) => {
        res.render('purchasePage')
    })

app.route('/api/db/prices')
    .get(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);
        if (data.length) {
            const q = req.query;
            const russianTeachers = await db.query(`SELECT 
                    id, 
                    count, 
                    teacherType, 
                    oldClassPrice, 
                    count * oldClassPrice as oldTotalPrice, 
                    discount, 
                    ROUNDTOHIGH(PERCENT(oldClassPrice, discount), 10) as newClassPrice,
                    ROUNDTOHIGH(PERCENT(oldClassPrice, discount), 10) * count as newTotalPrice
                FROM prices WHERE teacherType = 'russian'`)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });
            const nativeTeachers = await db.query(`SELECT 
                    id,
                    count,
                    teacherType,
                    oldClassPrice,
                    count * oldClassPrice as oldTotalPrice,
                    discount,
                    ROUNDTOLOW(PERCENT(oldClassPrice, discount), 10) as newClassPrice,
                    ROUNDTOLOW(PERCENT(oldClassPrice, discount), 10) * count as newTotalPrice
                FROM prices WHERE teacherType = 'native'`)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });

                res.status(200).json({russianTeachers: russianTeachers[0], nativeTeachers: nativeTeachers[0]});
        } else {
            res.status(401).end();
        }
    })

app.get('/profile', (req, res) => {
    res.render('./dashboard/profile');
})

app.get('/history', (req, res) => {
    res.render('./dashboard/history');
});

app.get('/dashboard/:section', async (req, res) => {
    const path = './dashboard/admin';
    const section = req.params.section;

    switch(section) {
        case 'users':
            res.render(`${path}/users`);
            break;
        case 'courses':
            res.render(`${path}/courses`);
            break;

        case 'files':
            res.render(`${path}/files`);
            break;

        default:
            res.status(404).send('Запрашиваемая страница не найдена!');
            break;
    }
})

app.get('/lk/:section', (req, res) => {
    const path = './dashboard/student';
    const q = req.query;
    const section = req.params.section;
    
    switch(section) {
        case 'main':
            res.render(`${path}/main`);
            break;

        case 'courses':
            if (q && q.id) {
                res.render(`${path}/course-page`);
            } else {
                res.render(`${path}/courses`);
            }
            break;

        case 'history':
            res.render(`${path}/history`);
            break;

        default:
            res.status(404).send('Запрашиваемая страница не найдена!');
            break;
    }
})

app.route('/api/db/users')
    .get(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);
        if (data.length) {
            const q = req.query;

            if (data[0].role !== roles.student) {
                let rows = [];
                const value = q.searchingValue;
                const roleTemplate = q && q.role ? `role='${q.role}'` : '' ;

                if (value === '') {
                    rows = await db.query(`SELECT username, role, phone, email, skype, classesWRussian, classesWNative, courses, photoLink FROM users ${q && q.role ? `WHERE ${roleTemplate}` : ''}`)
                        .catch(e => {
                            console.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                } else {
                    rows = await db.query(`SELECT username, role, phone, email, skype, classesWRussian, classesWNative, courses, photoLink FROM users WHERE username REGEXP '${value}' ${q && q.role ? `AND ${roleTemplate}` : `OR role REGEXP '${value}'`} OR phone REGEXP '${value}' OR email REGEXP '${value}' OR skype REGEXP '${value}' OR classesWRussian REGEXP '${value}'`)
                        .catch(e => {
                            console.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                }

                const response = await yandexDisk.getPublished();

                const files = response.body.items;

                const links = await Promise.all(files.map(file => yandexDisk.getData(file.file)));

                const users = rows[0].map((user) => {
                    const i = files.findIndex(f => f.path.slice(6) === user.photoLink);
                    const link = i !== -1 ? links[i] : null;
                    user.photo = links && link && link.body ? Base64.encode(link.body) : null ;

                    return user;
                }, []);

                res.status(200).json(users);
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })
    .put(async (req, res) => {
        const { diffs, sources } = req.body;

        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const template = utils.obj2strArr(diffs).join(', ');
                const rows = await db.query(`UPDATE users SET ${template} WHERE username = '${sources.username}' AND email = '${sources.email}'`)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('При обновлении данных произошла ошибка!');
                    });
                res.status(200).send(`Данные пользователя ${sources.username} успешно обновлены!`);
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
        
    })
    .post(async (req, res) => {
        const q = req.body;

        const data = await apiKeyManager.getUser(req.query.apiKey);
        if (data.length) {
            if (data[0].role === roles.admin) {
                const password = utils.rndSequence();
                const data = [q.username, q.role, q.phone, q.email, q.skype, password, q.classesWRussian, q.classesWNative, q.courses];
                const rows = await db.query('INSERT INTO users(username, role, phone, email, skype, password, classesWRussian, classesWNative, courses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', data)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('При создании пользователя произошла ошибка!');
                    });

                res.status(201).send(`Пользователь ${q.username} успешно добавлен!`);
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })

app.route('/api/db/userData')
    .get(async (req, res) => {
        const q = req.query;

        if (q && q.apiKey) {
            const rows = await db.query(`SELECT users.id, users.username, users.phone, users.email, users.skype, users.classesWRussian, users.classesWNative, users.photoLink, users.courses FROM users JOIN usersapi ON users.id = usersapi.userId WHERE usersapi.apiKey = '${q.apiKey}'`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Ошибка сервера!');
                });

            const users = rows[0];

            let buffer = '';
            
            if (users && users[0]) {
                const response = await yandexDisk.getPublished();
                const files = response.body.items;
                const file = files.find(f => f.path.slice(6) === users[0].photoLink);

                if (file) {
                    const image = await yandexDisk.getData(file.file);
                    buffer = file && image && image.body ? Base64.encode(image.body) : '';
                    users[0].photo = buffer;
                }
            }

            res.status(200).json(rows[0]);
        } else {
            res.status(400).send('Неверный apiKey!');
        }
    })
    .put(async (req, res) => {
        const apiKey = req.query.apiKey;

        const rows = await db.query(`SELECT users.id, users.username, users.phone, users.email, users.skype, users.password FROM users JOIN usersapi ON users.id = usersapi.userId WHERE usersapi.apiKey = '${apiKey}'`)
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
        
        const data = await apiKeyManager.getUser(q.apiKey);

        if (data.length) {
            const value = q && q.searchingValue ? q.searchingValue : '';

            const template = q && q.id ? `WHERE courses.id = ${q.id}` : '';

            let rows = [];
            if (value === '') {
                rows = await db.query(`SELECT courses.id, courses.name, courses.description, classes.id as class_id, classes.name as class_name, classes.description as class_description, classes.files FROM courses LEFT JOIN classes ON courses.id = classes.course_id ${template}`)
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
        } else {
            res.status(401).end();
        }
        
    })
    .post(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const q = req.body;
                const data = [q.name, q.description];

                await db.query(`INSERT INTO courses(name, description) VALUES(?, ?)`, data)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('При создании курса произошла ошибка!');
                    });
                
                res.status(201).send('Курс успешно создан!');
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })
    .put(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const {data, source} = req.body;

                const template = utils.obj2strArr(data).join(', ');
                const rows = await db.query(`UPDATE courses SET ${template} WHERE id = '${source.id}' AND name = '${source.name}'`)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('При обновлении курса произошла ошибка!');
                    });

                res.status(201).send('Курс успешно обновлен!');
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })
    .delete(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const q = req.body;

                await db.query(`DELETE FROM courses WHERE id = ${q.id}`)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('При удалении курса произошла ошибка!');
                    });

                res.status(201).send('Курс успешно удален!');
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })

app.route('/api/db/class')
    .post(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const q = req.body;
                const data = [q.courseId, q.name, q.description]
                await db.query('INSERT INTO classes(course_id, name, description) VALUES(?, ?, ?)', data)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('При создании урока произошла ошибка!');
                    });

                res.status(201).send('Урок успешно создан!');
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })
    .put(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const { data, source } = req.body;

                const template = utils.obj2strArr(data).join(', ');
                await db.query(`UPDATE classes SET ${template} WHERE id = '${source.id}' AND name = '${source.name}'`)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('При удалении урока произошла ошибка!');
                    });

                res.status(200).send('Урок успешно обновлен!');
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })

    .delete(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
            const q = req.body;

            await db.query(`DELETE FROM classes WHERE course_id = ${q.courseId} AND id = ${q.id}`)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('При удалении урока произошла ошибка!');
                });

            res.status(200).send('Урок успешно удален!');
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })

app.route('/api/db/files')
    .get(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
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
        } else {
            res.status(401).end();
        }
    })
    .post(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const q = req.body;

                if (q.type === 'document') {
                    const data = await db.query(`INSERT INTO files(name, link) VALUE('${q.name}', '${q.path}')`)
                        .catch(e => {
                            console.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                    res.status(201).send('Файл создан!');
                } else if (q.type === 'photo') {
                    const response = await yandexDisk.publishFile(q.path);
                    const data = await db.query(`UPDATE users SET photoLink = '${q.path}' WHERE id = ${q.data.id};`)
                        .catch(e => {
                            console.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                    res.status(201).send('Файл создан!');
                }
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })
    .delete(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const q = req.body;

                const response = await yandexDisk.deleteData(q.link);
                const statusCode = response.res.statusCode;
                if (statusCode === 204) {
                    if (q.type === 'document') {
                        await db.query(`DELETE FROM files WHERE id = '${q.id}' AND name = '${q.name}'`)
                            .catch(e => {
                                console.error(e);
                                res.status(500).send('Ошибка сервера!');
                            });
                    } else if (q.type === 'photo') {
                        await db.query(`UPDATE users SET photoLink = '' WHERE id = ${q.id} AND username = '${q.name}'`)
                            .catch(e => {
                                console.error(e);
                                res.status(500).send('Ошибка сервера!');
                            });
                    }
                    res.status(204).send('Файл удален!');
                } else {
                    res.status(statusCode).send(response.res);
                }
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })
    .put(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role === roles.admin) {
                const q = req.body;
                const root = 'chinalang';
                const docs = 'documents';
                const photos = 'photos';

                const filesList = await yandexDisk.getList();
                const tree = utils.getDirTree(filesList.body.items);

                if (tree.find(root) === null) {
                    await yandexDisk.createFolder(root);
                    const response = await yandexDisk.getUploadLink(`${root}/temp.tmp`);
                    await yandexDisk.putData(response.body.href, Buffer.from('temp'));
                }

                if (q.type === 'document') {
                    if (tree.find(docs) === null) {
                        const path = `${root}/${docs}`;
                        await yandexDisk.createFolder(path);
                        const response = await yandexDisk.getUploadLink(`${path}/temp.tmp`);
                        await yandexDisk.putData(response.body.href, Buffer.from('temp'));
                    }
                }

                if (q.type === 'photo') {
                    if (tree.find(photos) === null) {
                        const path = `${root}/${photos}`;
                        await yandexDisk.createFolder(path);
                        const response = await yandexDisk.getUploadLink(`${path}/temp.tmp`, true);
                        await yandexDisk.putData(response.body.href, Buffer.from('temp'));
                    }
                }

                const name = utils.translate(q.name);
                const filePath = `${root}/${q.type === 'document' ? docs : photos}/${name}`;

                const link = await yandexDisk.getUploadLink(filePath);
                
                res.status(200).json({data: link.body, path: filePath});
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })

app.get('/api/verify', async (req, res) => {
    const q = req.query;
    const list = await apiKeyManager.getUser(q.apiKey);

    if (list.length) res.status(200).send(list);
    else res.status(404).send('Не валидный apiKey');
})

app.route('/api/db/history')
    .get(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            let tail = `WHERE ${data[0].role === roles.student ? 'studentId' : 'teacherId'} = '${data[0].id}'`;

            const rows = await db.query('SELECT `student`.username as studentName, `teacher`.username as teacherName, history.status, history.date, history.change, balance FROM history RIGHT JOIN users as `student` ON studentId = `student`.id RIGHT JOIN users as `teacher` ON teacherId = `teacher`.id ' + tail)
                .catch(e => {
                    console.error(e);
                    res.status(500).send('Ошибка сервера!');
                });

            res.status(200).json(rows[0]);
        } 
    })
    .post(async (req, res) => {
        const q = req.body;
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            if (data[0].role !== roles.student) {
                const rows = await db.query(`SELECT * FROM users WHERE username='${q.data.username}' AND email='${q.data.email}'`)
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });
                
                let userData = undefined;
                if (rows[0] && rows[0][0]) {
                    userData = rows[0][0];
                } else res.status(400).send();

                const teacherType = {
                    teacher: 'classesWRussian',
                    nativeTeacher: 'classesWNative'
                };

                const key = teacherType[data[0].role];
                const currDate = moment().format();
                const classesLeft = userData[key] - 1;        

                if (userData[key] > 0) {
                    await db.query(`INSERT INTO history(studentId, teacherId, history.status, history.date, history.change, balance) VALUES('${userData.id}', '${data[0].id}', '${q.status}', '${currDate}', -1, ${classesLeft})`) 
                    .catch(e => {
                        console.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });

                    await db.query(`UPDATE users SET ${key}='${classesLeft}' WHERE id=${userData.id}`)
                        .catch(e => {
                            console.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });

                    res.status(201).send('Добавлена запись в историю занятий!');
                } else res.status(400).send('Недостаточное колличество занятий');
            }
        }
    })
    .put(async (req, res) => {

    })
    // .delete(async (req, res) => {

    // })

app.get('/test', (req, res) => {
    console.log();
})

app.post('/test', async (req, res) => {
    console.log();
})