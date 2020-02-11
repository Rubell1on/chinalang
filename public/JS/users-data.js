DataTable.prototype.updateCoursesData = async function(userCourses) {
    this.removeChildren();
    const searchingValue = this.controls[1].input.val();
    const data = await request.get('/api/db/courses', { searchingValue });
    this.children = data.map(row => new DataStrip(row.name.split(' ').join(''), row, [new CheckboxButton('subscribe')]), []);
    this.renderChildren(tableChild => {
        tableChild.text.text(tableChild.data.name);
        if (userCourses == false) {
            tableChild.renderChildren(s => {
                s.object.text('Подписать');
                s.object.click(() => s.click(tableChild.data, userCourses));
            });
        } else {
            const id = tableChild.data.id;

            let flag = true;

            for (let i in userCourses) {
                if (userCourses[i].id === id) {
                    tableChild.renderChildren(s => {
                        s.enabled = true;
                        s.object.text('Отписать');
                        s.object.click(() => s.click(tableChild.data, userCourses));
                    });
                    flag = false;
                    break;
                }
            }

            if (flag) tableChild.renderChildren(s => {
                s.object.text('Подписать');
                s.object.click(() => s.click(tableChild.data, userCourses));
            });
        }
    });
}

CheckboxButton.prototype.click = function(course, userCourses) {
    let flag = true;

    if (this.enabled) {
        for (let i = 0; i < userCourses.length; i++) {
            if (userCourses[i].id === course.id) {
                userCourses.splice(i, 1);
                this.enabled = false;
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
            this.object.text('Отписать');
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

DataWindow.prototype.submit = async function() {
    const diffs = this.checkDifferences();
    const keys = Object.keys(diffs);
    if (keys.length !== 0) {
        const res = await request.get('/api/db/updateUsers', {sources: this.data, diffs})
            .catch(e => {
                new NotificationError('err-window', e.responseText).render();
                console.log(e);
            });

        new NotificationSuccess('user-registered', res).render();
        this.onSubmit.raise();
        console.log(res);
        this.destroy();
    }
}

DataTable.prototype.updateData = async function() {
    this.removeChildren();
    const searchingValue = this.controls[2].input.val();
    const data = await request.get('/api/db/users', { searchingValue });
    this.children = data.map(row => new DataStrip(row.username, row), []);
    this.renderChildren(strip => {
        strip.text.text(strip.data.username);
        const coursesStr = strip.data.courses;
        const userCourses = strip.data && coursesStr ? JSON.parse(coursesStr) : [];
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
                            if (windowChild.isTypeOf('dataTable')) {
                                windowChild.renderControls();
                                windowChild.controls.find(control => control.isTypeOf('search-line')).input.change(async () => await windowChild.updateCoursesData(userCourses));
                                await windowChild.updateCoursesData(userCourses);
                                // windowChild.removeChildren();
                                // const searchingValue = windowChild.controls[1].input.val();
                                // const data = await request.get('/api/db/courses', { searchingValue });
                                // windowChild.children = data.map(row => new DataStrip(row.name.split(' ').join(''), row, [new CheckboxButton('subscribe')]), []);
                                // windowChild.renderChildren(tableChild => {
                                //     tableChild.text.text(tableChild.data.name);
                                //     if (userCourses == false) {
                                //         tableChild.renderChildren(s => {
                                //             s.object.text('Подписать');
                                //             s.object.click(() => s.click(tableChild.data, userCourses));
                                //         });
                                //     } else {
                                //         const id = tableChild.data.id;

                                //         let flag = true;

                                //         for (let i in userCourses) {
                                //             if (userCourses[i].id === id) {
                                //                 tableChild.renderChildren(s => {
                                //                     s.enabled = true;
                                //                     s.object.text('Отписать');
                                //                     s.object.click(() => s.click(tableChild.data, userCourses));
                                //                 });
                                //                 flag = false;
                                //                 break;
                                //             }
                                //         }

                                //         if (flag) tableChild.renderChildren(s => {
                                //             s.object.text('Подписать');
                                //             s.object.click(() => s.click(tableChild.data, userCourses));
                                //         });
                                //     }
                                // });
                            } else if (windowChild.isTypeOf('button')) {
                                windowChild.object.text('Подтвердить выбор');
                                windowChild.object.click(() => {
                                    dataWindow.children.find(c => c.isTypeOf('dataStrip')).compareData = JSON.stringify(userCourses);
                                    coursesWindow.destroy();
                                });
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
                await dataWindow.submit();
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
    userWindow.controls[1].object.text('+');
    userWindow.controls[1].object.attr('title', 'Добавить нового пользователя');
    userWindow.controls[2].input.change(async () => {
        await userWindow.updateData();
    });

    userWindow.renderChildren(strip => {
        strip.text = strip.data.username;
        strip.onDataChange.addListener(async () => await userWindow.updateData());
    });
}

renderPage();