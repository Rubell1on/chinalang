DataTable.prototype.updateCoursesData = async function(userCourses) {
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
                        s.object.click(e => {
                            // s.click(wChildren.data, userCourses);
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
                                s.object.click(e => {
                                    // s.click(wChildren.data, userCourses);
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
            }
    });
}

async function renderCoursesTable() {
    const controls = [
        new Label('courses-label', 'Список курсов'),
        new SearchLine('courses-search')
    ];

    const coursesTable = new DataTable('courses-table', controls);
    coursesTable.wrapperClass = 'courses-wrapper';
    coursesTable.render('content-window');
    coursesTable.renderControls();
    coursesTable.updateCoursesData([]);
    coursesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await coursesTable.updateCoursesData([]));
}

renderPage();

async function renderPage() {
    renderPageLoader();
    renderCoursesTable();

    const apiKey = auth.get('apiKey');
    const response = await request.get('/api/db/userData', { apiKey })
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });

    const user = response.response[0];

    renderHeader(user);
    renderControls(user);
}

