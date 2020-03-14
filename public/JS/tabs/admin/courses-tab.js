function diff(first, second) {
    return Object.entries(second).reduce((acc, curr) => {
        const key = curr[0];
        const value = curr[1];

        if (first[key] !== value) acc[key] = value;

        return acc;
    }, {})
}

DataTable.prototype.updateCoursesData = async function() {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/courses?apiKey=${apiKey}`, { searchingValue });
    const data = res.response;
    this.children = data.map(row => {
        const rowName = row.name.replace(/[ .,&?*$;@\(\)]/g, '');
        const courseStrip = new DataStrip(rowName, row, [new CheckboxButton(['subscribe', 'button-very-big', 'button-allign-vertical-middle'])]);
        const classes = row.classes.map(r => new DataStrip(r.name.replace(/[ .,&?*$;@\(\)]/g, ''), r, [new CheckboxButton(['subscribe', 'button-very-big', 'button-allign-vertical-middle'])]));
        const classesTable = new DataTable('classes-table', [], classes);

        return new ObjectWrapper(`${rowName}-strip-wrapper`, [courseStrip, classesTable]);
    }, []);

    this.renderChildren(wrapper => {
        wrapper.renderChildren(wChildren => {
            switch(wChildren.getType()) {
                case '[object dataStrip]':
                    wChildren.text.text(wChildren.data.name);
                    wChildren.addLesson = new Button(['add-new-class', 'button-very-big', 'button-green', 'button-allign-vertical-middle'], '+');
                    wChildren.addLesson.prepandRender(wChildren.object);
                    wChildren.object.click(async () => {
                        await this.createNewCourse(wChildren.data);
                        this.updateCoursesData();
                    });
                    wChildren.addLesson.object.click(() => {
                        wChildren.createNewClass();
                        wChildren.onDataChange.addListener(() => this.updateCoursesData());
                    });
                    wChildren.renderChildren(s => {
                        s.object.text('-');
                        s.object.click(() => {
                            const window = new YesNoWindow('yes-no-window', 'Вы уверены?', `Удалить курс "${wChildren.data.name}"?`);
                            window.render('');
                            window.yes.click(async () => {
                                const apiKey = auth.get('apiKey');
                                const res = await request.delete(`/api/db/courses?apiKey=${apiKey}`, JSON.stringify(wChildren.data)).catch(e => {
                                    notificationController.error(e.error.responseText);
                                    console.log(e);
                                });

                                if (res.status === 'success') {
                                    notificationController.success(res.response);
                                    this.updateCoursesData();
                                    window.destroy();
                                }
                            });

                            window.no.click(() => {
                                 window.destroy();
                            });
                        });
                    });

                    break;

                case '[object dataTable]':
                    wChildren.renderChildren(tChildren => {
                        tChildren.text.text(tChildren.data.name);
                        tChildren.object.click(() => tChildren.createNewClass(tChildren.data));
                        tChildren.onDataChange.addListener(() => this.updateCoursesData());
                        tChildren.renderChildren(child => {
                            child.object.text('-');
                            child.object.click(() => {
                                const window = new YesNoWindow('yes-no-window', 'Вы уверены?', `Удалить урок "${tChildren.data.name}"?`);
                                window.render('');
                                window.yes.click(async () => {
                                    const apiKey = auth.get('apiKey');
                                    const res = await request.delete(`/api/db/class?apiKey=${apiKey}`, JSON.stringify(tChildren.data))
                                        .catch(e => {
                                            notificationController.error(e.error.responseText)
                                            console.log(e);
                                        });
                                    
                                    if (res.status === 'success') {
                                        notificationController.success(res.response);
                                        this.updateCoursesData();
                                        window.destroy();
                                    }
                                });

                                window.no.click(() => {
                                    window.destroy();
                                });
                            })
                        });
                        tChildren.object.children().filter(':not(.text-wrapper)').click(e => e.stopPropagation());
                    });

                    break;
                }
            wChildren.object.children().filter(':not(.text-wrapper)').click(e => e.stopPropagation());
        });
    });
}

DataTable.prototype.createNewCourse = async function(data = {}) {
    const self = this;
    const keys = Object.keys(data);
    const children = [
        new Label('window-label', keys.length ? 'Редактировать курс' : 'Создать новый курс'),
        new InputField('course-name'),
        new TextArea('course-description'),
        new Button('submit-course')
    ];

    const courseWindow = new DataWindow('course-window', [], children);
    courseWindow.render('');
    courseWindow.renderChildren(() => {});
    const nameField = courseWindow.children[1];
    const descriptionField = courseWindow.children[2];
    const submit = courseWindow.children[3].object;
    nameField.label.text('Название курса');
    descriptionField.label.text('Описание курса');
    submit.text(keys.length ? 'Редактировать' : 'Создать');

    if (keys.length) {
        nameField.input.val(data.name);
        descriptionField.input.val(data.description);
    }
    
    submit.click(async () => {
        const name = nameField.input.val();
        if (!name.isEmpty()) {
            let res; 
            const apiKey = auth.get('apiKey');
            if (!keys.length) {
                res = await request.post(`/api/db/courses?apiKey=${apiKey}`, JSON.stringify({name, description: descriptionField.input.val()}))
                    .catch(e => {
                        notificationController.error(e.error.responseText);
                        console.log(e);
                    });

                if (res.status === 'success') {
                    self.updateCoursesData();
                    notificationController.success(res.response);
                    courseWindow.destroy();
                }
            } else {
                const newData = {
                    name: nameField.input.val(),
                    description: descriptionField.input.val()
                };

                const diffData = diff(data, newData);
                if (Object.keys(diffData).length) {
                    res = await request.put(`/api/db/courses?apiKey=${apiKey}`, JSON.stringify({source: data ,data: diffData}))
                        .catch(e => {
                            notificationController.error(e.error.responseText)
                            console.log(e);
                        });

                    if (res.status === 'success') {
                        self.updateCoursesData();
                        notificationController.success(res.response);
                        courseWindow.destroy();
                    }
                } else {
                    notificationController.success('Данные остались без изменений!');
                }
            }
            
        } else {
            notificationController.error('Небходимо заполнить поле с названием курса');
            nameField.input.focus();
        }   
    });
}

DataStrip.prototype.createNewClass = async function(data = {}) {
    const keys = Object.keys(data);

    const controls = [
        new Button('add-file-link', 'Файл'),
        new Button('add-image-link', 'Картинка')
    ];

    const children = [
        new Label('window-label', keys.length ? 'Редактировать урок' : 'Создать новый урок'),
        new InputField('lesson-name'),
        new TextArea('lesson-description', controls),
        new Button('submit-class')
    ];

    const lessonWindow = new DataWindow('lesson-window', [], children);
    lessonWindow.render('');
    lessonWindow.renderChildren(c => {
        if (c.isTypeOf('textArea')) {
            c.renderControls(() => {});
            const addFile = c.controls.find(c => c.className === 'add-file-link')
            addFile.object.click(() => {
                createFileSelect('document');
            });

            const addImage = c.controls.find(c => c.className === 'add-image-link')
            addImage.object.click(() => {
                createFileSelect('image');
            });

            function createFileSelect(docType) {
                const controls = [
                    new Label('window-label', 'Список файлов'),
                    new SearchLine('files-search')
                ];
            
                const filesTable = new DataTable('files-table', controls);
                filesTable.wrapperClass = 'files-wrapper';

                DataTable.prototype.setTextArea = function(callback) {
                    const textArea = lessonWindow.children.find(c => c.isTypeOf('textArea'));
                    callback(textArea);
                }

                const filesWindow = new DataWindow('files-window', [], [filesTable]);
                filesWindow.render('');
                filesWindow.renderChildren(child => {
                    if (child.isTypeOf('dataTable')) child.renderControls(() => {});
                });
            
                const addCourse = filesTable.controls.find(c => c.isTypeOf('button'));
                filesTable.updateFilesData(docType);
                filesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await filesTable.updateFilesData(docType));
            }
        }
    });
    const nameField = lessonWindow.children[1];
    nameField.label.text('Название урока');
    const descriptionField = lessonWindow.children[2];
    descriptionField.label.text('Описание урока');
    const submit = lessonWindow.children[3].object;
    submit.text(keys.length ? 'Редактировать' : 'Создать');

    if (keys.length) {
        nameField.input.val(data.name);
        descriptionField.input.val(data.description);
    }
    
    submit.click(async () => {
        const name = nameField.input.val();
        if (!name.isEmpty()) {
            if (!keys.length) {
                const apiKey = auth.get('apiKey');
                const res = await request.post(`/api/db/class?apiKey=${apiKey}`, JSON.stringify({courseId: this.data.id, name, description: descriptionField.input.val()}))
                    .catch(e => {
                        notificationController.error(e.error.responseText);
                        console.log(e);
                    });

                if (res.status === 'success') {
                    this.onDataChange.raise();
                    notificationController.success(res.response);
                    lessonWindow.destroy();
                }
            } else {
                const newData = {
                    name: nameField.input.val(),
                    description: descriptionField.input.val()
                };

                const diffData = diff(data, newData);
                if (Object.keys(diffData).length) {
                    const apiKey = auth.get('apiKey');
                    res = await request.put(`/api/db/class?apiKey=${apiKey}`, JSON.stringify({source: data ,data: diffData}))
                        .catch(e => {
                            notificationController.error(e.error.responseText);
                            console.log(e);
                        });

                    if (res.status === 'success') {
                        this.onDataChange.raise();
                        notificationController.success(res.response);
                        lessonWindow.destroy();
                    }
                } else {
                    notificationController.success('Данные остались без изменений!')
                }
            } 
        } else {
            notificationController.error('Небходимо заполнить поле с названием курса');
            nameField.input.focus();
        }   
    });
}

async function renderCoursesTable() {
    const controls = [
        new Label('window-label', 'Список курсов'),
        new Button('add-new-course'),
        new SearchLine('courses-search')
    ];

    const coursesTable = new DataTable('courses-table', controls);
    coursesTable.wrapperClass = 'courses-wrapper';
    coursesTable.render('content-window');
    coursesTable.renderControls(() => {});

    const addCourse = coursesTable.controls.find(c => c.isTypeOf('button'));
    addCourse.object.text('+');
    addCourse.object.attr('title', 'Добавить новый курс');
    addCourse.object.click(async () => coursesTable.createNewCourse());
    coursesTable.updateCoursesData([]);
    coursesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await coursesTable.updateCoursesData([]));
}

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

    $('.courses-tab').addClass('strip-button-selected');
}

renderPage();

DataTable.prototype.updateFilesData = async function(type = 'document') {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/files?apiKey=${apiKey}&type=${type}`, { searchingValue });

    if (res.status === 'success') {
        const data = res.response;
        this.children = data.map(row => new DataStrip(row.name.decrease(), row, [new CheckboxButton('add-file')]), []);

        this.renderChildren(wChildren => {
            switch(wChildren.getType()) {
                case '[object dataStrip]':
                    wChildren.text.text(wChildren.data.name);
                    wChildren.renderChildren(s => {
                        s.object.text('Добавить');
                        s.object.click(() => {
                            this.setTextArea(e => {
                                const area = e.input;
                                const temp = area.val();
                                const fileType = {
                                    document: `<a href="/api/download?path=${wChildren.data.link}&type=document" target="_blank">${wChildren.data.name}</a>`,
                                    image: `<img class="disk-image" path="${wChildren.data.link}">`
                                }
                                area.val(temp.concat(fileType[type]));
                            });
                            this.parent.destroy();
                        });
                    });

                    break;
            }
            wChildren.object.children().filter(':not(.text-wrapper)').click(e => e.stopPropagation());
        });
    }
}