function createUserTemplate(data, role) {
    const template = {
        base: [
            new Label('window-label', data && data.realname ?'Редактирование данных пользователя' : 'Создание нового пользователя'),
            new InputField('realname', 'realname', 'Имя пользователя', data.realname),
            new InputField('username', 'username', 'Никнейм', data.username),
            new ObjectWrapper('role-wrapper', [
                new Label('role-label', 'Роль'),
                new Select('role', roleObject)
            ]),
            new InputField('skype', 'skype', 'Skype', data.skype, false),
        ],
        foot: [
            new ObjectWrapper('courses-wrapper', [
                new Label('courses-label', 'Перечень курсов'),
                new DataStrip('courses', data.courses)
            ]),
            new Button('submit', 'Применить')
        ]
    }
    
    const templates = {
        admin: [
            ...template.base,
            new InputField('phone', 'phone', 'Номер телефона', data.phone),
            new InputField('email', 'email', 'Эл.почта', data.email),
            new InputField('classesWRussian', 'classes', 'Занятия с рускоговорящим учителем', data.classesWRussian),
            new InputField('classesWNative', 'classes', 'Занятия с носителем языка', data.classesWNative),
            ...template.foot
        ],
        teacher: [
            ...template.base,
            ...template.foot
        ],
        nativeTeacher: [
            ...template.base,
            ...template.foot
        ]
    }

    return templates[role];
}

DataTable.prototype.createNewUser = async function() {
    const data = {
        username: '',
        role: '',
        phone: '',
        email: '',
        skype: '',
        classesWRussian: 0,
        classesWNative: 0,
        courses: []
    };

    const role = auth.get('role');

    const template = createUserTemplate(data, role);

    const dataWindow = new DataWindow('user-data-window', data ,template);

    dataWindow.render('');
    const parent = dataWindow.inputs.attr('class');
    dataWindow.renderChildren(child => {
        if (child.isTypeOf('objectWrapper')) {
            if (child.isClassOf('courses-wrapper')) {
                child.renderChildren(e => {
                    if (e.isTypeOf('dataStrip')) {
                        e.text.text('Открыть перечень');
                        e.object.click(() => {
                        const controls = [
                            new Label('window-label', 'Список курсов'),
                            new SearchLine('courses-search')
                        ];
        
                        const coursesTable = new DataTable('courses-table', controls);
                        coursesTable.wrapperClass = 'courses-wrapper'
        
                        const coursesWindow = new DataWindow('courses-data-window', {}, [coursesTable, new Button('submit-courses')]);
                        coursesWindow.render('');
                        coursesWindow.renderChildren(async windowChild => {
                            switch (windowChild.getType()) {
                                case '[object dataTable]':
                                    windowChild.renderControls(() => {});
                                    windowChild.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await windowChild.updateCoursesData(userCourses));
                                    await windowChild.updateCoursesData(data.courses);
        
                                    break;
                                
                                case '[object button]':
                                    windowChild.object.text('Подтвердить выбор');
                                    windowChild.object.click(() => {
                                        dataWindow.children
                                        .find(c => c.isTypeOf('objectWrapper') && c.isClassOf('courses-wrapper')).children
                                        .find(c => c.isTypeOf('dataStrip')).compareData = JSON.stringify(data.courses);
                                        coursesWindow.destroy();
                                    });
        
                                    break;
                            }
                        });
                    })
                }
                })
            } else child.renderChildren(() => {});
        } else if (child.isTypeOf('button')) child.object.click(async () => {
            const inputsData = getInputData();
            if (inputsData.username.isEmpty() && inputsData.realname.isEmpty()) {
                notificationController.error('Имя пользователя или никнейм должны быть заполнены!');
            } else {
                const apiKey = auth.get('apiKey');
                const res = await request.post(`/api/db/users?apiKey=${apiKey}`, JSON.stringify(inputsData))
                    .catch(e => {
                        notificationController.error(e.error.responseText)
                        console.log(e);
                    });
        
                if (res.status === 'success') {
                    notificationController.success(res.response);
                    this.updateData();
                    dataWindow.destroy();
                }
            }
        });
    })

    function getInputData() {
        return dataWindow.children.reduce((acc, curr) => {
            const key = curr.className;;
            switch(curr.getType()) {
                case '[object inputField]': 
                    acc[key] = curr.input.val();
    
                    break;
                
                case '[object dataStrip]':
                    acc[key] = JSON.stringify(data.courses);
    
                    break;

                case '[object objectWrapper]':
                    if (curr.isClassOf('courses-wrapper')) {
                        acc.courses = curr.children.find(c => c.isTypeOf('dataStrip')).compareData;
                    } else if (curr.isClassOf('role-wrapper')) {
                        acc.role = curr.children.find(c => c.isTypeOf('select')).getSelected();
                    }

                    break;
            }
    
            return acc;
        }, {});
    }
}

DataTable.prototype.updateCoursesData = async function(userCourses) {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/courses?apiKey=${apiKey}`, { searchingValue });
    const data = res.response;
    this.children = data.map(row => {
        const rowName = row.name.replace(/[ .,&?*$;@\(\)]/g, '');
        const courseStrip = new DataStrip(rowName, row, [new CheckboxButton('subscribe')]);
        const classes = row.classes.map(r => new DataStrip(r.name.replace(/[ .,&?*$;@\(\)]/g, ''), r, [new CheckboxButton('subscribe')]));
        const classesTable = new DataTable('classes-table', [], classes);

        return new ObjectWrapper(`${rowName}-strip-wrapper`, [courseStrip, classesTable]);
    }, []);

    this.renderChildren(wrapper => {
        wrapper.renderChildren(wChildren => {
            switch(wChildren.getType()) {
                case '[object dataStrip]':
                    wChildren.text.text(wChildren.data.name);
                    if (userCourses == false) {
                        wChildren.renderChildren(s => {
                            s.object.css('background', '#3cb371');
                            s.object.text('Подписать');
                            s.object.click(e => {
                                s.click(wChildren.data, userCourses);
                                e.stopPropagation();
                            });
                        });
                    } else {
                        const id = wChildren.data.id;
            
                        let flag = true;
            
                        for (let i in userCourses) {
                            if (userCourses[i].id === id) {
                                wChildren.renderChildren(s => {
                                    s.enabled = true;
                                    s.object.css('background', '#FB2267');
                                    s.object.text('Отписать');
                                    s.object.click(e => {
                                        s.click(wChildren.data, userCourses);
                                        e.stopPropagation();
                                    });
                                });
                                flag = false;
                                break;
                            }
                        }
            
                        if (flag) wChildren.renderChildren(s => {
                            s.object.css('background', '#3cb371');
                            s.object.text('Подписать');
                            s.object.click(e => {
                                s.click(wChildren.data, userCourses);
                                e.stopPropagation();
                            });
                        });
                    }

                    break;

                case '[object dataTable]':
                    wChildren.renderChildren(tChildren => {
                        tChildren.text.text(tChildren.data.name);
                        const course = userCourses.find(c => c.id === tChildren.data.courseId);
                        if (course && course.classes == false) {
                            tChildren.renderChildren(child => {
                                child.object.css('background', '#3cb371');
                                child.object.text('Открыть');
                                child.object.click(() => child.changeClassesSubscription(tChildren.data, userCourses));
                            });
                        } else {
                            const id = tChildren.data.id;
                
                            let flag = true;
                
                            if (course) {
                                for (let i in course.classes) {
                                    if (course.classes[i].id === id) {
                                        tChildren.renderChildren(child => {
                                            child.enabled = true;
                                            child.object.css('background', '#FB2267');
                                            child.object.text('Закрыть');
                                            child.object.click(() => child.changeClassesSubscription(tChildren.data, userCourses));
                                        });
                                        flag = false;
                                        break;
                                    }
                                }
                            }
                
                            if (flag) tChildren.renderChildren(child => {
                                child.object.css('background', '#3cb371');
                                child.object.text('Открыть');
                                child.object.click(() => child.changeClassesSubscription(tChildren.data, userCourses));
                            });
                        }
                    });

                    wrapper.children.find(c => c.isTypeOf('dataStrip')).object.click(() => {
                        const strip = wChildren.object;
                        if (strip.css('display') == 'none') {
                            strip.css('display', 'block');
                        } else {
                            strip.css('display', 'none');
                        }
                    });
                    break;
                }
        });
    });
}

CheckboxButton.prototype.click = function(course, userCourses) {
    let flag = true;

    if (this.enabled) {
        for (let i = 0; i < userCourses.length; i++) {
            if (userCourses[i].id === course.id) {
                userCourses.splice(i, 1);
                this.enabled = false;
                this.object.css('background', '#3cb371');
                this.object.text('Подписать');
                break;
            }
        }
    } else {
        for (let i = 0; i < userCourses.length; i++) {
            if (userCourses[i].id === course.id) {
                flag = false;
                break;
            }
        }

        if (flag) {
            userCourses.push({id: course.id, classes: []});
            this.object.css('background', '#FB2267');
            this.object.text('Отписать');
            this.enabled = true;
        }
    }
}

CheckboxButton.prototype.changeClassesSubscription = function(lesson, userCourses) {
    let courseDoesNotExitst = true;
    let flag = true;

    if (this.enabled) {
        for (let i = 0; i < userCourses.length; i++) {
            if (userCourses[i].id === lesson.courseId) {
                courseDoesNotExitst = false;
                for (let j = 0; j < userCourses[i].classes.length; j++){
                    if (userCourses[i].classes[j].id === lesson.id) {
                        userCourses[i].classes.splice(j, 1);
                        this.enabled = false;
                        this.object.css('background', '#3cb371');
                        this.object.text('Открыть');

                        break;
                    }
                }
            }
        }

    } else {
        for (let i = 0; i < userCourses.length; i++) {
            if (userCourses[i].id === lesson.courseId) {
                courseDoesNotExitst = false;
                for (let j = 0; j < userCourses[i].classes.length; j++) {
                    if (userCourses[i].classes[j] === lesson.id) {
                        flag = false;
                        break;
                    }
                }                
            }
        }

        if (courseDoesNotExitst) {
            const temp = {
                id: lesson.courseId,
                classes: []
            };

            userCourses.push(temp);
        }

        if (flag) {
            userCourses.find(c => c.id === lesson.courseId).classes.push({id: lesson.id, courseId: lesson.courseId});
            this.object.css('background', '#FB2267');
            this.object.text('Закрыть');
            this.enabled = true;
        }
    }
}

DataWindow.prototype.checkDifferences = function checkDifferences() {
    return this.children.reduce((acc, curr) => {

        switch(curr.getType()) {
            case '[object inputField]': 
                const key = curr.className;
                const value = curr.input.val();
                if (value != this.data[key]) acc[key] = value;

                break;
            
            case '[object objectWrapper]':
                if (curr.className === 'role-wrapper') {
                    const select = curr.children.find(c => c.isTypeOf('select'));
                    const key = select.className;
                    const value = select.getSelected();
                    acc[key] = value;
                } else {
                    const strip = curr.children.find(c => c.isTypeOf('dataStrip'));
                    if (strip && strip.compareData) {
                        const key = strip.className;
                        const value = strip.compareData;
                        if (value !== strip.data) acc[key] = value;
                    }
                }

                break;
        }

        return acc;
    }, {});
}

DataTable.prototype.updateData = async function() {
    this.removeChildren();
    const role = auth.get('role');
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/users?apiKey=${apiKey}`, { searchingValue });
    const data = res.response;
    this.children = data.map((row, i) => {
        const name = row && row.realname ? translate(row.realname.decrease()) : row.username;
        const deleteButton = role === roles.admin ? [new Button(['delete-user', 'button-very-big', 'button-allign-vertical-middle', `delete-${name}-${i}`], '-')] : [];
        return new DataStrip(row && row.realname ? `${translate(row.realname.decrease())}-${i}` : `${row.username.decrease()}-${i}`, row, deleteButton);
    }, []);
    this.renderChildren(strip => {
        const data = strip.data;
        strip.text.text(data && data.realname ? data.realname : data.username);
        const coursesStr = data.courses;
        const userCourses = data && coursesStr ? coursesStr : [];
        strip.object.click(() => {
            const data = strip.data;

            const template = createUserTemplate(data, role);
            const dataWindow = new DataWindow('user-data-window', data, template);
            dataWindow.render('');
            dataWindow.renderChildren(child => {
                switch(child.getType()) {
                    case '[object objectWrapper]':
                        child.renderChildren(c => {
                            if (c.isTypeOf('dataStrip')) {
                                c.text.text('Открыть перечень');
                                c.object.click(() => {
                                    const controls = [
                                        new Label('window-label', 'Список курсов'),
                                        new SearchLine('courses-search')
                                    ];
            
                                    const coursesTable = new DataTable('courses-table', controls);
                                    coursesTable.wrapperClass = 'courses-wrapper'
            
                                    const coursesWindow = new DataWindow('courses-data-window', {}, [coursesTable, new Button('submit-courses')]);
                                    coursesWindow.render('');
                                    coursesWindow.renderChildren(async windowChild => {
                                        switch (windowChild.getType()) {
                                            case '[object dataTable]':
                                                windowChild.renderControls(() => {});
                                                windowChild.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await windowChild.updateCoursesData(userCourses));
                                                await windowChild.updateCoursesData(userCourses);
            
                                                break;
                                            
                                            case '[object button]':
                                                windowChild.object.text('Подтвердить выбор');
                                                windowChild.object.click(() => {

                                                    dataWindow.children
                                                        .find(c => c.isTypeOf('objectWrapper') && c.className === 'courses-wrapper').children
                                                        .find(c => c.isTypeOf('dataStrip')).compareData = JSON.stringify(userCourses);
                                                    coursesWindow.destroy();
                                                });
            
                                                break;
                                        }
                                    })
                                })
                            } else if (c.isTypeOf('select')) {
                                c.object.val(c.parent.parent.data.role);
                                if (role !== roles.admin) c.object.attr('disabled', true);
                            }
                        })
                        break;
                    
                    case '[object button]':
                        child.object.click(async () => {
                            const diffs = dataWindow.checkDifferences();
                            const keys = Object.keys(diffs);
            
                            if (keys.length !== 0) {
                                const inputs = dataWindow.children.filter(el => el.isClassOf('realname') || el.isClassOf('username')).map(el => el.input.val());
                                if (inputs[0].isEmpty() && inputs[1].isEmpty()) {
                                    notificationController.error('Имя пользователя или никнейм должны быть заполнены!');
                                } else {
                                    const apiKey = auth.get('apiKey');
                                    const res = await request.put(`/api/db/users?apiKey=${apiKey}`, JSON.stringify({sources: dataWindow.data, diffs}))
                                        .catch(e => {
                                            notificationController.error(e.error.responseText)
                                            console.log(e);
                                        });
                
                                    if (res.status === 'success') {
                                        notificationController.success(res.response);
                                        strip.onDataChange.raise()
                                        console.log(res);
                                        dataWindow.destroy();
                                    }
                                }
                            }
                        });
                        break;
                }
            });
        });
        strip.renderChildren(child => {
            if (child.isTypeOf('button')) {
                child.object.click(e => {
                    e.stopPropagation();
                    const data = child.parent.data;
                    const confirm = new YesNoWindow('confirm-delete', 'Подтвердите удаление', `Вы действительно хотите удалить пользователя ${data && data.realname ? data.realname : data.username}?`);
                    confirm.render('');
                    confirm.yes.click(async () => {
                        const apiKey = auth.get('apiKey');
                        const res = await request.delete(`/api/db/users?apiKey=${apiKey}`, JSON.stringify(child.parent.data))
                            .catch(e => {
                                console.error(e);
                                notificationController.error(e.error.responseText);
                            });
                        
                        if (res.status === 'success') {
                            console.log(res);
                            notificationController.success(res.response);
                            this.updateData();
                            confirm.destroy();
                        }
                    });
                    confirm.no.click(() => confirm.destroy());
                })
            }
        })

        strip.onDataChange.addListener(() => this.updateData());
    });

    const tempData = data.reduce((acc, el) => {
        acc.push({
            email: el && el.email ? el.email : '',
            photoLink: el && el.photoLink ? el.photoLink : ''
        });

        return acc;
    }, []);

    const photosRes = await request.get(`/api/download?apiKey=${apiKey}`, {data: tempData, type: 'photo'})
        .catch(e => console.log(e));

    if (photosRes.status === 'success') {
        photosRes.response.forEach(el => {
            for (let i in this.children) {
                const strip = this.children[i];

                if (strip.data.email === el.email) {
                    if (el && el.photo) strip.image = `data:image/*;base64,${el.photo}`;

                    break;
                }
            }
        })
    }
}

async function renderUsersTable() {
    const role = auth.get('role');
    const controls = [
        new Label('window-label', 'Список пользователей'),
        new SearchLine(['users-search', role === roles.admin ? 'search-line-short' : 'search-line'])
    ];

    if (role === roles.admin) controls.splice(1, 0, new Button('add-new-user'))

    const userWindow = new DataTable('users', controls);
    userWindow.render('content-window');
    userWindow.renderControls(child => {
        if (child.isTypeOf('button')) {
            child.object.text('+');
            child.object.attr('title', 'Добавить нового пользователя');
            child.object.click(async () => userWindow.createNewUser());
        } else if (child.isTypeOf('searchLine')) {
            child.input.change(async () => {
                await userWindow.updateData();
            });
        }
    });
    userWindow.updateData();

    userWindow.renderChildren(strip => {
        strip.text = strip.data.username;
        strip.onDataChange.addListener(async () => await userWindow.updateData());
    });
}

async function renderPage() {
    renderPageLoader();
    renderUsersTable();

    const apiKey = auth.get('apiKey');
    const response = await request.get('/api/db/userData', { apiKey })
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });

    const user = response.response[0];

    renderHeader(user);
    renderControls(user);

    $('.users-tab').addClass('strip-button-selected');
}

renderPage();