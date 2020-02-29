DataTable.prototype.updateCoursesData = async function(source) {
    const userCourses = source.courses;
    // console.log(user);
    this.removeChildren();
    const searchingValue = this.controls[1].input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/courses?apiKey=${apiKey}`, { searchingValue });
    const data = res.response;
    this.children = data.map(row => {
        const rowName = row.name.replace(/[ .,&?*$;@\(\)]/g, '');
        const courseStrip = new DataStrip(rowName, row, [new CheckboxButton('subscribe')]);
        return new DataStrip(rowName, row, [new CheckboxButton('subscribe')]);
    }, []);

    this.renderChildren(wChildren => {
        switch(wChildren.getType()) {
            case '[object dataStrip]':
                wChildren.text.text(wChildren.data.name);
                wChildren.object.click(async () => {
                    const apiKey = auth.get('apiKey');
                    const id = wChildren.data.id;
                    const l = location;
                    l.href = `${l.origin}/lk/courses?id=${id}`;
                });

                if (userCourses == false) {
                    wChildren.renderChildren(s => {
                        s.object.css('background', '#3cb371');
                        s.object.text('Подписаться');
                        s.object.click(async e => {
                            const result = s.click(wChildren.data, userCourses);
                            await submitCoursesData(source, {courses: userCourses}, () => {
                                if (s.enabled) {
                                    s.object.css('background', '#FB2267');
                                    s.object.text('Отписаться');
                                } else {
                                    s.object.css('background', '#3cb371');
                                    s.object.text('Подписаться');
                                }
                            });

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
                                s.object.text('Отписаться');
                                s.object.click(async e => {
                                    e.stopPropagation();
                                    const result = s.click(wChildren.data, userCourses);
                                    await submitCoursesData(source, {courses: userCourses}, () => {
                                        if (s.enabled) {
                                            s.object.css('background', '#FB2267');
                                            s.object.text('Отписаться');
                                        } else {
                                            s.object.css('background', '#3cb371');
                                            s.object.text('Подписаться');
                                        }
                                    });
                                });
                            });
                            flag = false;
                            break;
                        }
                    }
        
                    if (flag) wChildren.renderChildren(s => {
                        s.object.css('background', '#3cb371');
                        s.object.text('Подписаться');
                        s.object.click(async e => {
                            e.stopPropagation();
                            const result = s.click(wChildren.data, userCourses);
                            await submitCoursesData(source, {courses: userCourses}, () => {
                                if (s.enabled) {
                                    s.object.css('background', '#FB2267');
                                    s.object.text('Отписаться');
                                } else {
                                    s.object.css('background', '#3cb371');
                                    s.object.text('Подписаться');
                                }
                            });

                        });
                    });
                }

                break;
            }
    });
}

async function submitCoursesData(sources, difference, callback) {
    const apiKey = auth.get('apiKey');
    notificationController.process('Данные отправлены на сервер!');
     const res = await request.put(`/api/db/userData?apiKey=${apiKey}`, JSON.stringify({sources, difference}))
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        })
    
    if (res.status === 'success') {
        notificationController.success(res.response);
        callback();
    }
}

CheckboxButton.prototype.click = function(course, userCourses) {
    let flag = true;

    if (this.enabled) {
        for (let i = 0; i < userCourses.length; i++) {
            if (userCourses[i].id === course.id) {
                userCourses.splice(i, 1);
                this.enabled = false;
                // this.object.css('background', '#3cb371');
                // this.object.text('Подписаться');
                return -1;
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
            // this.object.css('background', '#FB2267');
            // this.object.text('Отписаться');
            this.enabled = true;
            return 1;
        }
    }
}

async function renderCoursesTable(user) {
    const controls = [
        new Label('courses-label', 'Список курсов'),
        new SearchLine('courses-search')
    ];

    const coursesTable = new DataTable('courses-table', controls);
    coursesTable.wrapperClass = 'courses-wrapper';
    coursesTable.render('content-window');
    coursesTable.renderControls();
    coursesTable.updateCoursesData(user);
    coursesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await coursesTable.updateCoursesData([]));
}

renderPage();

async function renderPage() {
    renderPageLoader();
    const response = await auth.getUserData();

    if (response) {
        const user = response;
        renderHeader(user);
        renderControls(user);

        renderCoursesTable(user);
    } else {
        location.reload();
    }
}

