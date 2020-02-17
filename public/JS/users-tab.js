async function createNewUser() {
    const data = {
        username: '',
        role: '',
        phone: '',
        email: '',
        skype: '',
        classesLeft: 0,
        courses: []
    };

    const dataWindow = new DataWindow('user-data-window', data);
    dataWindow.render('');
    const parent = dataWindow.inputs.attr('class');

    const children = Object.entries(data).map(e => {
        let input = undefined;
        if (e[0] !== 'courses') {
            input = new InputField(e[0]);
            input.render(parent);
            input.setIds(e[0]);
            input.label.text(e[0]);
            input.input.val(e[1]);
        } else {
            input = new DataStrip('courses', e[1]);
            input.render(parent);
            // input.icon.attr('src', '');
            input.text.text(e[0]);
            input.object.click(() => {
                const controls = [
                    new Label('courses-label', 'Список курсов'),
                    new SearchLine('courses-search')
                ];

                const coursesTable = new DataTable('courses-table', controls);
                coursesTable.wrapperClass = 'courses-wrapper'

                const coursesWindow = new DataWindow('courses-data-window', {}, [coursesTable, new Button('submit-courses')]);
                coursesWindow.render('');
                coursesWindow.renderChildren(async windowChild => {
                    switch (windowChild.getType()) {
                        case '[object dataTable]':
                            windowChild.renderControls();
                            windowChild.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await windowChild.updateCoursesData(userCourses));
                            await windowChild.updateCoursesData(data.courses);

                            break;
                        
                        case '[object button]':
                            windowChild.object.text('Подтвердить выбор');
                            windowChild.object.click(() => {
                                dataWindow.children.find(c => c.isTypeOf('dataStrip')).compareData = JSON.stringify(data.courses);
                                coursesWindow.destroy();
                            });

                            break;
                    }
                });
            });
        }
        
        return input;
    }, []);

    const submit = new Button('submit');
    submit.render(parent);
    submit.object.text('Создать пользователя');
    submit.object.click(async () => {
        dataWindow.onSubmit.addListener(() => strip.onDataChange.raise());
        const inputsData = getInputData();
        await dataWindow.submit('/api/db/createUser', inputsData);
    });

    children.push(submit);           

    dataWindow.children = children;

    function getInputData() {
        return dataWindow.children.reduce((acc, curr) => {
            let key = '';
            switch(curr.getType()) {
                case '[object inputField]': 
                    key = curr.className;
                    acc[key] = curr.input.val();
                    // if (value != data[key]) acc[key] = value;
    
                    break;
                
                case '[object dataStrip]':
                    // if (curr && curr.compareData) {
                    key = curr.className;
                    //     const value = curr.compareData;
                    //     if (value !== curr.data) acc[key] = value;
                    // }
                    acc[key] = JSON.stringify(data.courses);
    
                    break;
            }
    
            return acc;
        }, {});
    }
}

DataTable.prototype.updateCoursesData = async function(userCourses) {
    this.removeChildren();
    const searchingValue = this.controls[1].input.val();
    const res = await request.get('/api/db/courses', { searchingValue });
    const data = res.response;
    // this.children = data.map(row => new DataStrip(row.name.split(' ').join(''), row, [new CheckboxButton('subscribe')]), []);
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
            // userCourses.find(c => c.id === lesson.courseId).classes.push(lesson);
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
            
            case '[object dataStrip]':
                if (curr && curr.compareData) {
                    const key = curr.className;
                    const value = curr.compareData;
                    if (value !== curr.data) acc[key] = value;
                }

                break;
        }

        return acc;
    }, {});
}

DataWindow.prototype.submit = async function(url, data) {
    const res = await request.get(url, data)
        .catch(e => {
            new NotificationError('err-window', e.responseText).render();
            console.log(e);
        });

    new NotificationSuccess('user-registered', res).render();
    this.onSubmit.raise();
    console.log(res);
    this.destroy();
}

DataTable.prototype.updateData = async function() {
    this.removeChildren();
    const searchingValue = this.controls[2].input.val();
    const res = await request.get('/api/db/users', { searchingValue });
    const data = res.response;
    this.children = data.map(row => new DataStrip(row.username, row), []);
    this.renderChildren(strip => {
        strip.text.text(strip.data.username);
        const coursesStr = strip.data.courses;
        const userCourses = strip.data && coursesStr ? coursesStr : [];
        // strip.img.val(strip.data && strip.data.img ? )
        strip.object.click(() => {
            const dataWindow = new DataWindow('user-data-window', strip.data);
            dataWindow.render('');
            const parent = dataWindow.inputs.attr('class');

            const children = Object.entries(strip.data).map(e => {
                let input = undefined;
                if (e[0] !== 'courses') {
                    input = new InputField(e[0]);
                    input.render(parent);
                    input.setIds(e[0]);
                    input.label.text(e[0]);
                    input.input.val(e[1]);
                } else {
                    input = new DataStrip('courses', e[1]);
                    input.render(parent);
                    // input.icon.attr('src', '');
                    input.text.text(e[0]);
                    input.object.click(() => {
                        const controls = [
                            new Label('courses-label', 'Список курсов'),
                            new SearchLine('courses-search')
                        ];

                        const coursesTable = new DataTable('courses-table', controls);
                        coursesTable.wrapperClass = 'courses-wrapper'

                        const coursesWindow = new DataWindow('courses-data-window', {}, [coursesTable, new Button('submit-courses')]);
                        coursesWindow.render('');
                        coursesWindow.renderChildren(async windowChild => {
                            switch (windowChild.getType()) {
                                case '[object dataTable]':
                                    windowChild.renderControls();
                                    windowChild.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await windowChild.updateCoursesData(userCourses));
                                    await windowChild.updateCoursesData(userCourses);

                                    break;
                                
                                case '[object button]':
                                    windowChild.object.text('Подтвердить выбор');
                                    windowChild.object.click(() => {
                                        dataWindow.children.find(c => c.isTypeOf('dataStrip')).compareData = JSON.stringify(userCourses);
                                        coursesWindow.destroy();
                                    });

                                    break;
                            }
                        });
                    });
                }
                
                return input;
            }, []);

            const submit = new Button('submit');
            submit.render(parent);
            submit.object.text('Применить');
            submit.object.click(async () => {
                dataWindow.onSubmit.addListener(() => strip.onDataChange.raise());

                const diffs = dataWindow.checkDifferences();
                const keys = Object.keys(diffs);

                if (keys.length !== 0) {
                    await dataWindow.submit('/api/db/updateUsers', {sources: dataWindow.data, diffs});
                }
            });

            children.push(submit);           

            dataWindow.children = children;
        });
        strip.onDataChange.addListener(() => this.updateData());
    });
}

async function renderPage() {
    const controls = [
        new Label('users-label', 'Список пользователей'),
        new Button('add-new-user'),
        new SearchLine('users-search')
    ];

    const userWindow = new DataTable('users', controls);
    userWindow.render('content-window');
    userWindow.renderControls();
    userWindow.updateData();
    const addNewUser = userWindow.controls.find(c => c.isTypeOf('button'));
    addNewUser.object.text('+');
    addNewUser.object.attr('title', 'Добавить нового пользователя');
    addNewUser.object.click(async () => createNewUser());
    userWindow.controls[2].input.change(async () => {
        await userWindow.updateData();
    });

    userWindow.renderChildren(strip => {
        strip.text = strip.data.username;
        strip.onDataChange.addListener(async () => await userWindow.updateData());
    });
}

renderPage();