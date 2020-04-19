const express = require('express');
const app = express();
// var httpsRedirect = require('express-https-redirect');
const mysql = require('mysql2');
const utils = require('./public/JS/BEUtils');
const Enum = require('./public/JS/enum');
const envVars = new utils.EnvVars();
const gAPI = require('./public/JS/GoogleAPI');
const yAPI = require('./public/JS/yandexApi');
const Node = require('./public/JS/Node').Node;
const dbSettings = envVars.getDBSettings();
dbSettings.connectionLimit = 10;
const db = mysql.createPool(dbSettings).promise();
const keysManager = require('./public/JS/apiKeyManager').ApiKey;
const apiKeyManager = new keysManager(db);
const moment = require('moment-timezone');
const request = require('request');
const { Logger, LogTarget, LogFile } = require('./public/JS/logger');
const logger = new Logger()
    .addTarget(new LogFile(`${__dirname}/logs`))
    .addTarget(new LogTarget({
        log: (message) => console.log(message),
        error: (message) => console.error(message)
    }));

const credentials = envVars.getGoogleAPICredentials();
const token = envVars.getGoogleAPIToken();
const gmailClient = new gAPI.GmailAPI(credentials, token);

const yandexToken = envVars.getYandexAPIToken().token;
const yandexDisk = new yAPI(yandexToken);
const instaToken = envVars.getInstaToken();

const chinalangMail = {
    name: 'Chinalang', 
    email: 'chinalangofficial@gmail.com'
}

const roles = new Enum('admin', 'teacher', 'native_teacher', 'student');

app.set('view engine', 'ejs');
//app.enable('trust proxy');
// app.use('/', httpsRedirect())
app.use('/public', express.static('public'));
app.use('/public/JS', express.static('JS'));
app.use('/public/IMG', express.static('IMG'));
app.use('/node_modules', express.static('node_modules'));
app.use(express.json());
// app.use((req, res, next) => {
//     const redirectURLs =['/'];

//     if (redirectURLs.includes(req.url)) {
//         if (req.secure) {
//             next();
//         } else {
//             res.redirect(`https://${req.host}${req.url}`);
//         }
//     }
// })

const PORT = process.env.PORT || 80;

app.listen(PORT, () => logger.log('Сервер запущен'));

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', async (req, res) => {
    const q = req.query;

    const rows = await db.query(`SELECT id, realname, username, password, role, photoLink FROM users WHERE email='${q.email}'`)
        .catch(e => {
            logger.error(e);
            res.status(400).send('Неверное имя пользователя!');
        });

    const users = rows[0];
    const id = users[0] && users[0].id ? users[0].id : '';
    const realname = users[0] && users[0].realname ? users[0].realname : '';
    const username = users[0] && users[0].username ? users[0].username : '';
    const password = users[0] && users[0].password ? users[0].password : '';
    const role = users[0] && users[0].role ? users[0].role : '';
    const photoLink = users[0] && users[0].photoLink ? users[0].photoLink : '';

    if (users.length) {
        if (password === q.password) {
            const apiKey = utils.rndSequence(10);
            const data = [id, apiKey, req.ip];

            const apiRows = await db.query(`SELECT * FROM usersapi WHERE userIp ='${req.ip}'`)
                .catch(e => {
                    logger.error(e);
                    res.status(500).send('Ошибка сервера!');
                });

            if (apiRows) {
                const data = apiRows[0];
                if (apiRows && data && data.length) {
                    const promises = data.map(a => db.query(`DELETE FROM usersapi WHERE userId = '${a.userId}'`));
                    await Promise.all(promises)
                        .catch(e => {
                            logger.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                }
            }

            const rows = await db.query(`SELECT * FROM usersapi WHERE userId = '${id}'`)
                .catch(e => {
                    logger.error(e);
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

            const dataObject = { id, realname, email: q.email, username, role, apiKey, photo: buffer }

            if (rows[0].length) {
                await db.query(`UPDATE usersapi SET apiKey = '${apiKey}', userIp = '${req.ip}' WHERE userId = '${id}'`)
                .catch(e => {
                    logger.error(e);
                    res.status(500).send('Произошла ошибка при обновлении данных!');
                });
                res.status(200).json(dataObject);
            } else {
                await db.query('INSERT INTO usersapi(userId, apiKey, userIp) VALUES(?, ?, ?)', data)
                .catch(e => {
                    logger.error(e);
                    res.status(500).send('Произошла ошибка при добавлении данных!');
                });
                res.status(201).json(dataObject);
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
    
    const rows = await db.query(`SELECT COUNT(*) as count FROM users WHERE phone='${q.phone}' OR email='${q.email}'`)
        .catch(e => {
            logger.error(e);
            res.status(400).send('При регистрации пользователя произошла ошибка!');
        });
    const count = rows[0][0].count;

    if (count === 0) {
        const password = utils.rndSequence();
        const arr = [q.realname, '', roles.student, q.phone, q.email, q.skype, password, 1, JSON.stringify([])];
        const result = await db.query('INSERT INTO users(realname, username, role, phone, email, skype, password, classesWRussian, courses) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', arr)
            .catch(e => {
                logger.error(e);
                res.status(500).send('Ошибка сервера!');
            });

        if (result) {
            const message = new gAPI.messageBuilder(
                chinalangMail, 
                q.email, 
                'Регистрация в Chinalang', 
                `Здравствуйте, ${q.realname}! Вы только что записались на бесплатный вводный урок по изучению китайского языка. 🇨🇳
                <br><br>В ближайшее время с вами свяжется наш менеджер, чтобы договориться об удобном для вас времени проведения урока.
                <br><br>А пока вы можете зайти в свой личный кабинет на нашем <a href="https://www.china-lang.com">сайте<a/> и ознакомиться со всеми материалами. 🤗
                <br><br>Логин:${q.email}
                <br>Пароль:${password}${utils.messageBottomHTML()}`
            ).build();

            const sendingResult = await gmailClient.sendMessage(message)
                .catch(e => {
                    logger.error(e);
                    res.status(500).send('Во время отправки сообщения произошла ошибка!');
                });

            const toChinalang = new gAPI.messageBuilder(
                chinalangMail, 
                chinalangMail.email, 
                'Регистрация ученика', 
                `Заявка на бесплатный урок:<br>
                Имя: ${q.realname};<br>
                Телефон: ${q.phone};<br>
                E-mail: ${q.email};<br>
                ${q.skype ? `Skype: ${q.skype}`: ''}<br>
                ${utils.messageBottomHTML()}
                `
            ).build();
        
            await gmailClient.sendMessage(toChinalang);
            res.status(201).send('Пользователь зарегистрирован! Проверьте вашу электронную почту!');
        }
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
                        logger.error(e);
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
                        logger.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });

                res.status(200).json({russianTeachers: russianTeachers[0], nativeTeachers: nativeTeachers[0]});
        } else {
            res.status(401).end();
        }
    })

app.get('/dashboard/:section', async (req, res) => {
    const q = req.query;
    const rows = await db.query(`select * from usersapi join users on userId = id where userIp = '${req.ip}'`)
        .catch(e => {
            logger.error(e);
            res.status(500).send('Ошибка сервера!');
        });

    if (rows && rows[0]) {
        const users = rows[0];

        if (users && users[0]) {
            const user = users[0];
            const root = './dashboard';
            const adminPath = `${root}/admin`;
            const studentPath = `${root}/student`;

            const baseTemplate = {
                profile: `${root}/profile`,
                history: `${root}/history`
            }

            const extTemplate = {
                users: `${adminPath}/users`,
                courses: `${adminPath}/courses`,
            }

            const templates = {
                student: Object.assign({
                    main: `${studentPath}/main`,
                    courses: q && q.id ? `${studentPath}/course-page` : `${studentPath}/courses`,
                }, baseTemplate),
                admin: Object.assign({
                    'files': `${adminPath}/files`,
                    'blog': `${root}/blog`
                }, baseTemplate, extTemplate),
                teacher: Object.assign(baseTemplate, extTemplate),
                native_teacher: Object.assign(baseTemplate, extTemplate),
            };

            const roleTemplate = templates[user.role];

            if (templates && roleTemplate) {
                const path = roleTemplate[req.params.section];
                if (roleTemplate && path)
                    res.render(path);
                else
                    res.status(404).send('Запрашиваемая страница не найдена!');                    
            } else
                res.status(403).send('Недостаточно прав!');            
        } else 
            res.status(404).send('Пользователь не найден!');
    } else
        res.status(500).send('Произошла ошибка сервера!');
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
                    rows = await db.query(`SELECT realname, username, role, phone, email, skype, classesWRussian, classesWNative, courses, photoLink FROM users ${q && q.role ? `WHERE ${roleTemplate}` : ''}`)
                        .catch(e => {
                            logger.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                } else {
                    rows = await db.query(`SELECT realname, username, role, phone, email, skype, classesWRussian, classesWNative, courses, photoLink FROM users WHERE realname REGEXP '${value}' OR username REGEXP '${value}' ${q && q.role ? `AND ${roleTemplate}` : `OR role REGEXP '${value}'`} OR phone REGEXP '${value}' OR email REGEXP '${value}' OR skype REGEXP '${value}' OR classesWRussian REGEXP '${value}'`)
                        .catch(e => {
                            logger.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                }

                res.status(200).json(rows[0]);
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
            if (data[0].role !== roles.student) {
                const template = utils.obj2strArr(diffs).join(', ');
                const rows = await db.query(`UPDATE users SET ${template} WHERE username = '${sources.username}' AND email = '${sources.email}'`)
                    .catch(e => {
                        logger.error(e);
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
                const data = [q.realname, q.username, q.role, q.phone, q.email, q.skype, password, q.classesWRussian, q.classesWNative, q && q.courses ? q.courses : JSON.stringify([])];
                const rows = await db.query('INSERT INTO users(realname, username, role, phone, email, skype, password, classesWRussian, classesWNative, courses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', data)
                    .catch(e => {
                        logger.error(e);
                        res.status(500).send('При создании пользователя произошла ошибка!');
                    });

                if (rows) {
                    const message = new gAPI.messageBuilder(
                        chinalangMail, 
                        q.email, 
                        'Регистрация в Chinalang', 
                        `Здравствуйте, ${q.realname}! Добро пожаловать в команду Chinalang 🤗
                        <br><br>Можете зайти на наш <a href="https://www.china-lang.com">сайт</a>  и ознакомиться с личным кабинетом.
                        <br><br>Логин:${q.email}
                        <br>Пароль:${password}${utils.messageBottomHTML()}`
                    ).build();
        
                    const sendingResult = await gmailClient.sendMessage(message)
                        .catch(e => {
                            logger.error(e);
                            res.status(500).send('Во время отправки сообщения произошла ошибка!');
                        });

                        res.status(201).send(`Пользователь ${q.username} успешно добавлен!`);
                }
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })
    .delete(async (req, res) => {
        const q = req.body;

        const data = await apiKeyManager.getUser(req.query.apiKey);
        if (data.length) {
            if (data[0].role === roles.admin) {
                const rows = await db.query(`DELETE FROM users WHERE username='${q.username}' AND email='${q.email}'`)
                    .catch(e => {
                        logger.error(e);
                        res.status(500).send('При удалении пользователя произошла ошибка!');
                    });

                res.status(200).send(`Пользователь ${q.username} успешно удален!`);
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
            const rows = await db.query(`SELECT users.id, users.realname, users.username, users.phone, users.email, users.skype, users.classesWRussian, users.classesWNative, users.photoLink, users.courses FROM users JOIN usersapi ON users.id = usersapi.userId WHERE usersapi.apiKey = '${q.apiKey}'`)
                .catch(e => {
                    logger.error(e);
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

                res.status(200).json(rows[0]);
            } else {
                res.status(404).send('Не найден apiKey!');
            }
        } else {
            res.status(400).send('Не передан apiKey!');
        }
    })
    .put(async (req, res) => {
        const apiKey = req.query.apiKey;

        const rows = await db.query(`SELECT users.id, users.realname, users.username, users.phone, users.email, users.skype, users.password FROM users JOIN usersapi ON users.id = usersapi.userId WHERE usersapi.apiKey = '${apiKey}'`)
            .catch(e => {
                logger.error(e);
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
                    logger.error(e);
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
                        logger.error(e);
                        res.status(500).send('При отправке данных произошла ошибка!');
                    });
            } else {
                rows = await db.query(`SELECT courses.id, courses.name, courses.description, classes.id as class_id, classes.name as class_name, classes.description as class_description, classes.files FROM courses LEFT JOIN classes ON courses.id = classes.course_id WHERE courses.name REGEXP '${value}' OR courses.description REGEXP '${value}' OR classes.name REGEXP '${value}' OR classes.description REGEXP '${value}'`)
                    .catch(e => {
                        logger.error(e);
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
                        logger.error(e);
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
                        logger.error(e);
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
                        logger.error(e);
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
                        logger.error(e);
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
                        logger.error(e);
                        res.status(500).send('При обновлении урока произошла ошибка!');
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
                    logger.error(e);
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
        const q = req.query;
        const data = await apiKeyManager.getUser(q.apiKey);

        if (data.length) {
            const value = q.searchingValue;
            const type = q && q.type ? `type='${q.type}'` : '';

            let rows;
            if (!value) {
                rows = await db.query(`SELECT * FROM files ${type ? `WHERE ${type}` : ''}`)
                .catch(e => {
                    logger.error(e);
                    res.status(500).send('Ошибка сервера!');
                });
            }
            else {
                const typeTemplate = q && q.type ? `AND ${type}` : `or type REGEXP '${value}'` ;
                rows = await db.query(`SELECT * FROM files WHERE name REGEXP '${value}' ${typeTemplate}`)
                .catch(e => {
                    logger.error(e);
                    res.status(500).send('Ошибка сервера!');
                });
            }

            res.status(200).send(rows[0]);
        } else {
            res.status(401).end();
        }
    })
    .post(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            const q = req.body;
            const types = ['document', 'image'];

            if (types.includes(q.type)) {
                const data = await db.query(`INSERT INTO files(name, link, type) VALUE('${q.name}', '${q.path}', '${q.type}')`)
                    .catch(e => {
                        logger.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });
                res.status(201).send('Файл создан!');
            } else if (q.type === 'photo') {
                const response = await yandexDisk.publishFile(q.path);
                const data = await db.query(`UPDATE users SET photoLink = '${q.path}' WHERE id = ${q.data.id};`)
                    .catch(e => {
                        logger.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });
                res.status(201).send('Файл создан!');
            }
        } else {
            res.status(401).end();
        }
    })
    .delete(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            const q = req.body;

            const response = await yandexDisk.deleteData(q.link);
            const statusCode = response.res.statusCode;
            if (statusCode === 204) {
                if (q.type === 'document') {
                    await db.query(`DELETE FROM files WHERE id = '${q.id}' AND name = '${q.name}'`)
                        .catch(e => {
                            logger.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                } else if (q.type === 'photo') {
                    await db.query(`UPDATE users SET photoLink = '' WHERE id = ${q.id} AND username = '${q.name}'`)
                        .catch(e => {
                            logger.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });
                }
                res.status(204).send('Файл удален!');
            } else {
                res.status(statusCode).send(response.res);
            }
        } else {
            res.status(401).end();
        }
    })
    .put(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);

        if (data.length) {
            const q = req.body;

            const routes = {
                root: 'chinalang',
                document: 'documents',
                photo: 'photos',
                image: 'images'
            };

            const type = routes[q.type];

            const filesList = await yandexDisk.getList();
            const tree = utils.getDirTree(filesList.body.items);

            if (tree.find(routes.root) === null) {
                yandexDisk.initFolder(routes.root);
            }

            if (tree.find(type) === null) {
                const path = `${routes.root}/${type}`;
                await yandexDisk.initFolder(path);
            }

            const name = utils.translate(q.name);
            const filePath = `${routes.root}/${type}/${name}`;
            const link = await yandexDisk.getUploadLink(filePath, type === routes.photo ? true : false);
            
            res.status(200).json({data: link.body, path: filePath});
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
                    logger.error(e);
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
                        logger.error(e);
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

                const subtractionValues = {
                    occured: -1,
                    canceled: 0,
                    missed: -1
                }

                const key = data[0].role === roles.admin ? teacherType[q.teacherType] : teacherType[data[0].role];
                const currDate = moment().format();
                const subtrahend = subtractionValues[q.status];
                const classesLeft = userData[key] + subtrahend;        

                if (userData[key] > 0) {
                    await db.query(`INSERT INTO history(studentId, teacherId, history.status, history.date, history.change, balance) VALUES('${userData.id}', '${data[0].id}', '${q.status}', '${currDate}', ${subtractionValues[q.status]}, ${classesLeft})`) 
                    .catch(e => {
                        logger.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });

                    await db.query(`UPDATE users SET ${key}='${classesLeft}' WHERE id=${userData.id}`)
                        .catch(e => {
                            logger.error(e);
                            res.status(500).send('Ошибка сервера!');
                        });

                    res.status(201).send('Добавлена запись в историю занятий!');
                } else res.status(400).send('Недостаточное колличество занятий');
            }
        }
    })
    .put(async (req, res) => {

    })

app.route('/api/db/blog')
    .get(async (req, res) => {
        const data = await apiKeyManager.getUser(req.query.apiKey);
        let rows = undefined;

        if (data.length) {
            rows = await db.query('SELECT * FROM blog')
                .catch(e => {
                    logger.error(e);
                    res.status(500).send('Ошибка сервера!');
                });

            res.status(200).json(rows[0]);
        } else {
            res.status(401).end();
        }
    })
    .post(async (req, res) => {
        const q = req.body;
        const data = await apiKeyManager.getUser(req.query.apiKey);
        let rows = undefined;

        if (data.length) {
            if (data[0].role !== roles.student) {
                rows = await db.query(`INSERT INTO blog(name, description) VALUE('${q.name}', '${q.description}')`)
                    .catch(e => {
                        logger.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });

                res.status(201).send('В блог добавлена новая запись!');
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
                await db.query(`UPDATE blog SET ${template} WHERE id = '${source.id}' AND name = '${source.name}'`)
                    .catch(e => {
                        logger.error(e);
                        res.status(500).send('При удалении записи произошла ошибка!');
                    });

                res.status(200).send('Запись успешно обновлен!');
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
            if (data[0].role !== roles.student) {
                await db.query(`DELETE FROM blog WHERE id='${req.body.id}'`)
                    .catch(e => {
                        logger.error(e);
                        res.status(500).send('Ошибка сервера!');
                    });
                res.status(204).send('Файл удален!');
            } else {
                res.status(403).end();
            }
        } else {
            res.status(401).end();
        }
    })

app.get('/api/download', async (req, res) => {
    const q = req.query;

    let path = undefined;
    let data = undefined;
    let file = undefined;

    if (q.type !== 'photo') {
        path = q.path;
        data = await yandexDisk.getDowndloadLink(path);
        file = await yandexDisk.getData(data.body.href);
    }
    
    switch(q.type) {
        case 'document':
            const fileName = q.path.split('/').find(e => /\.\w*/.test(e));
            res.set({
                'Content-Disposition': `attachment; filename="${fileName}"`,
            }).status(200).send(file.body);
            break;

        case 'image':
            const encodedData = Base64.encode(file.body);
            res.status(200).send(encodedData);
            break;

        case 'photo':
            const response = await yandexDisk.getPublished();

            const files = response.body.items.filter(file => {
                let flag = false;

                for (let i in q.data) {
                    const rec = q.data[i];
                    if (rec && rec.photoLink) {
                        if (rec.photoLink.includes(file.name)) {
                            flag = true;
                            break;
                        }
                    }
                }

                return flag;
            });

            const links = await Promise.all(files.map(file => yandexDisk.getData(file.file)));

            const users = q.data.map((user) => {
                const i = files.findIndex(f => f.path.slice(6) === user.photoLink);
                const link = i !== -1 ? links[i] : null;
                user.photo = links && link && link.body ? Base64.encode(link.body) : null ;

                return user;
            }, []);

            res.status(200).json(users);
            break;
    }
})

app.post('/contact', async (req, res) => {
    const q = req.body;

    const messageType = {
        feedback: 'Обратная связь',
        callback: 'Заказать звонок',
        collab: 'Вопросы сотрудничества',
        another: 'Обратная связь (другое)'
    }

    const toChinalang = new gAPI.messageBuilder(
        chinalangMail, 
        chinalangMail.email, 
        messageType[q.type], 
        `Пользователь ${q.username} с эл. почтой ${q.email} хочет связаться с вами по теме "${messageType[q.type]}".
        ${q && q.phone ? `<br>Телефон: ${q.phone}` : ''}
        ${q.text ? `<br><br>Текст сообщения: ${q.text}` : ''}
        ${utils.messageBottomHTML()}
        `
    ).build();

    await gmailClient.sendMessage(toChinalang);

    const toUser = new gAPI.messageBuilder(
        chinalangMail, 
        q.email, 
        'Ваша заявка принята', 
        `<div>
            <div>Здравствуйте, ${q.username}!</div>
            <div>Ваше обращение поступило в обработку.
            В ближайшее время мы с вами свяжемся.</div>
            ${utils.messageBottomHTML()}
        </div>`
    ).build();

    await gmailClient.sendMessage(toUser);
    res.status(201).send('Ваше сообщение отправлено!');
})

app.get('/api/instaMedia', async (req, res) => {
    const response = await getMedia(instaToken.token);

    res.status(200).json(response);

    async function getMedia(acess_token, fields = ['id', 'caption', 'media_type', 'media_url', 'permalink', 'thumbnail_url', 'timestamp']) {
        return new Promise((resolve, reject) => {
            request.get({
                url: `https://graph.instagram.com/me/media?fields=${fields.join(',')}&access_token=${acess_token}`
            }, (err, res, body) => {
                if (err) reject(err);
                else resolve({res, body: JSON.parse(body)});
            })
        })
    }
})

app.get('/auth', (req, res) => {
    console.log();
})