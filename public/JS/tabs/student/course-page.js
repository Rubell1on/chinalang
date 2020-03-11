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
                new ObjectWrapper('description-top', [
                    new Label('description-label', 'Описание курса'),
                    new CheckboxButton('show-hide-description', true),
                ]),
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
                    if (object.isClassOf('classes-wrapper')) {
                        if (child.isClassOf('classes-table')) {
                            const strips = courseData.classes.map(c => {
                                const strip = new DataStrip(c.name.decrease(), c);
                                strip.parent = object;
                                strip.render(object.object);
                                const classData = userCourseData && userCourseData.classes ? userCourseData.classes.find(c => c.id === strip.data.id) : undefined;
                                if (classData) {
                                    strip.text.text(c.name);
                                    strip.object.css('background', '#84BC57')
                                    strip.object.click(() => {
                                        createClassWindow(c.name, c.description);
                                    });
                                } else {
                                    // strip.object.css('opacity', 0.7);
                                    strip.text.text('Закрыто');
                                }
                            });

                            child.children = strips;
                        }
                    } else if (child.isClassOf('courses-name-wrapper')) {
                        child.renderChildren(() => {});
                    } else if (child.isClassOf('description-top')) {
                        child.renderChildren(c => {
                            if (c.isClassOf('show-hide-description')) {
                                if (c.isTypeOf('checkboxButton')) {
                                    const state = { true: 'свернуть', false: 'развернуть' }
                                    c.object.text(state[c.enabled]);
                                    child.object.click(() => {
                                        const description = coursesTable.children.find(c => c.isClassOf('description-wrapper')).children.find(c => c.isTypeOf('text'));
                                        if (c.enabled) {
                                            description.object.css('display', 'none');
                                            c.enabled = false;
                                        } else {
                                            description.object.css('display', 'block');
                                            c.enabled = true;
                                        }
        
                                        c.object.text(state[c.enabled]);
                                    })
                                }
                            }
                        })
                    }
                });
            }      
        });

        location.on('classId', query => {
            const classesData = userCourseData && userCourseData.classes ? userCourseData.classes.sort((a, b) => a.id - b.id) : undefined;
            const rawCurrClass = classesData.find(c => c.id === query.classId);
            if (rawCurrClass) {
                const currClass = courseData.classes
                .sort((a, b) => a.id - b.id)
                .find(c => c.id === rawCurrClass.id);

                if (currClass) createClassWindow(currClass.name, currClass.description);
            }
        })
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

function createClassWindow(name, description) {
    const classesWindow = new DataWindow('class-window', [], [
        new DataTable('class-table', [], [
            new Label('class-label', name),
            new ObjectWrapper('class-description-wrapper', [
                new Label('class-description-label', 'Описание урока'),
                new Text('class-description-text', description)
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
    });
    classesWindow.object.append('<script src="../../../public/JS/image-loader.js"></script>');
}