DataTable.prototype.updateCoursesData = async function() {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const data = await request.get('/api/db/courses', { searchingValue });
    // this.children = data.map(row => new DataStrip(row.name.split(' ').join(''), row, [new CheckboxButton('subscribe')]), []);
    this.children = data.map(row => {
        const rowName = row.name.replace(/ /g, '');
        const courseStrip = new DataStrip(rowName, row, [new CheckboxButton('subscribe')]);
        const classes = row.classes.map(r => new DataStrip(r.name.replace(/ /g, ''), r, [new CheckboxButton('subscribe')]));
        const classesTable = new DataTable('classes-table', [], classes);

        return new ObjectWrapper(`${rowName}-strip-wrapper`, [courseStrip, classesTable]);
    }, []);

    this.renderChildren(wrapper => {
        wrapper.renderChildren(wChildren => {
            switch(wChildren.getType()) {
                case '[object dataStrip]':
                    wChildren.text.text(wChildren.data.name);
                    // if (userCourses == false) {
                        wChildren.renderChildren(s => {
                            s.object.css('background', '#3cb371');
                            s.object.text('-');
                            s.object.click(async () => {
                                const res = await request.get('/api/db/removeCourse', wChildren.data).catch(e => {
                                    new NotificationError('err-window', e).render();
                                    console.log(e);
                                });
                                new NotificationSuccess('success-window', res).render();
                                this.updateCoursesData();
                            });
                        });

                    break;

                case '[object dataTable]':
                    wChildren.renderChildren(tChildren => {
                        tChildren.text.text(tChildren.data.name);
                        tChildren.renderChildren(child => {
                            child.object.css('background', '#3cb371');
                            child.object.text('Открыть');
                            child.object.click(() => child.changeClassesSubscription(tChildren.data, userCourses));
                        });
                    });

                    // wrapper.children.find(c => c.isTypeOf('dataStrip')).object.click(() => {
                    //     const strip = wChildren.object;
                    //     if (strip.css('display') == 'none') {
                    //         strip.css('display', 'block');
                    //     } else {
                    //         strip.css('display', 'none');
                    //     }
                    // });

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

DataTable.prototype.createNewCourse = async function() {
    const children = [
        new Label('course-window-label', 'Создать новый курс'),
        new InputField('course-name'),
        new TextArea('course-description'),
        new Button('submit-course')
    ];

    const courseWindow = new DataWindow('course-window', [], children);
    courseWindow.render('');
    courseWindow.renderChildren(() => {});
    const nameField = courseWindow.children[1];
    nameField.label.text('Название курса');
    const descriptionField = courseWindow.children[2];
    descriptionField.label.text('Описание курса');
    const submit = courseWindow.children[3].object;
    submit.text('Создать');
    
    submit.click(async () => {
        const name = nameField.input.val();
        if (!name.isEmpty()) {
            const res = await request.get('/api/db/createCourse', {name, description: descriptionField.input.val()})
                .catch(e => {
                    new NotificationError('err-window', e.responseText).render();
                    console.log(e);
                });
            this.updateCoursesData();
            new NotificationSuccess('success-window', res).render();
            courseWindow.destroy();
        } else {
            new NotificationError('err-window', 'Небходимо заполнить поле с названием курса').render();
            nameField.input.focus();
        }   
    });
    
    
}


async function renderPage() {
    const controls = [
        new Label('courses-label', 'Список курсов'),
        new Button('add-new-course'),
        new SearchLine('courses-search')
    ];

    const coursesTable = new DataTable('courses-table', controls);
    coursesTable.wrapperClass = 'courses-wrapper';

    // const coursesWindow = new DataWindow('courses-data-window', {}, [coursesTable, new Button('submit-courses')]);
    // coursesWindow.render('content-window');
    coursesTable.render('content-window');
    coursesTable.renderControls();

    const addCourse = coursesTable.controls.find(c => c.isTypeOf('button'));
    addCourse.object.text('+');
    addCourse.object.attr('title', 'Добавить новый курс');
    addCourse.object.click(async () => coursesTable.createNewCourse());
    coursesTable.updateCoursesData([]);
    coursesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await coursesTable.updateCoursesData([]));
                // await windowChild.updateCoursesData(userCourses);

                // break;
            
        //     case '[object button]':
        //         windowChild.object.text('Подтвердить выбор');
        //         windowChild.object.click(() => {
        //             dataWindow.children.find(c => c.isTypeOf('dataStrip')).compareData = JSON.stringify(userCourses);
        //             coursesWindow.destroy();
        //         });

        //         break;
        // }
    // });
}

renderPage();