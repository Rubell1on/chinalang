async function renderCoursePage() {
    // renderPageLoader();

    const query = location.getQuery();
    const apiKey = auth.get('apiKey');

    const res = await request.get(`/api/db/courses?id=${query.id}&apiKey=${apiKey}`)
        .catch(e => {
            console.log(e);
            notificationController.error(e.error.responseText);
        });
    
    if (res.status === 'success') {
        const courseData = res.response[0];    
        const children = [
            new Label('course-name', courseData.name),
            new ObjectWrapper('description-wrapper', [
                new Label('description-label', 'Описание курса'),
                new Text('course-description', courseData.description)
            ]),
            new ObjectWrapper('classes-wrapper',[
                new Label('classes-label', 'Список уроков'),
                new DataTable('classes-table')
            ])
        ];
    
        const coursesTable = new DataTable('courses-table', [], children);
        coursesTable.wrapperClass = 'courses-wrapper';
        coursesTable.render('content-window');
        coursesTable.renderChildren(object => {
            if (object.isTypeOf('objectWrapper')) {
                object.renderChildren(child => {
                    if (object.className === 'classes-wrapper') {
                        if (child.className === 'classes-table') {
                            const strips = courseData.classes.map(c => {
                                const strip = new DataStrip(c.name.decrease(), c);
                                strip.parent = object;
                                strip.render(object.object);
                                strip.text.text(c.name);
                                strip.object.click(() => {
                                    const classesWindow = new DataWindow('class-window', [], [
                                        new DataTable('class-table', [], [
                                            new Label('class-label', c.name),
                                            new ObjectWrapper('class-description-wrapper', [
                                                new Label('class-description-label', 'Описание урока'),
                                                new Text('class-description-text', c.description)
                                            ])
                                        ])
                                    ]);
                                    classesWindow.render('');
                                    classesWindow.renderChildren(table => {
                                        table.renderChildren(child => {
                                            if (child.isTypeOf('objectWrapper')) {
                                                child.renderChildren(() => {});
                                            }
                                        });
                                    })
                                });
                            });

                            child.children = strips;
                        }
                    }
                });
            }      
        });
    }
    // coursesTable.updateCoursesData([]);
    // coursesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await coursesTable.updateCoursesData([]));
}

 renderPage();

async function renderPage() {
    renderPageLoader();
    renderCoursePage();

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