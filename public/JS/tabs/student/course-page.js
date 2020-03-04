async function renderCoursePage(userData) {
    // renderPageLoader();

    const query = location.getQuery();
    const apiKey = auth.get('apiKey');

    const userCourseData = userData.courses.find(c => c.id === query.id);

    const res = await request.get(`/api/db/courses?id=${query.id}&apiKey=${apiKey}`)
        .catch(e => {
            console.log(e);
            notificationController.error(e.error.responseText);
        });
    
    if (res.status === 'success') {
        const courseData = res.response[0];    
        const children = [
            new ObjectWrapper('course-name-wrapper', [
                new Label('course-name', courseData.name)
            ]),
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
                                const classData = userCourseData && userCourseData.classes ? userCourseData.classes.find(c => c.id === strip.data.id) : undefined;
                                if (classData) {
                                    strip.text.text(c.name);
                                    strip.object.css('background', '#84BC57')
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
                                } else {
                                    // strip.object.css('opacity', 0.7);
                                    strip.text.text('Закрыто');
                                }
                            });

                            child.children = strips;
                        }
                    } else if (child.className === 'courses-name-wrapper') {
                        child.renderChildren(() => {});
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
    const response = await auth.getUserData();

    if (response) {
        const user = response;
        renderHeader(user);
        renderControls(user);

        renderCoursePage(user);
    } else {
        location.reload();
    }
}