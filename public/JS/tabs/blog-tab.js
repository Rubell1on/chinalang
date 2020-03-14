function diff(first, second) {
    return Object.entries(second).reduce((acc, curr) => {
        const key = curr[0];
        const value = curr[1];

        if (first[key] !== value) acc[key] = value;

        return acc;
    }, {})
}

DataTable.prototype.updateBlogData = async function() {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/blog?apiKey=${apiKey}`, { searchingValue });
    const data = res.response;
    this.children = data.map(row => {
        const rowName = row.name.decrease();
        const courseStrip = new DataStrip(rowName, row, [new CheckboxButton(['subscribe', 'button-very-big', 'button-allign-vertical-middle'])]);

        return new ObjectWrapper(`${rowName}-strip-wrapper`, [courseStrip]);
    }, []);

    this.renderChildren(wrapper => {
        wrapper.renderChildren(wChildren => {
            if (wChildren.isTypeOf('[object dataStrip]')) {
                wChildren.text.text(wChildren.data.name);
                wChildren.object.click(() => {
                    this.createNewBlog(wChildren.data);
                    this.updateBlogData();
                });
                wChildren.renderChildren(s => {
                    s.object.text('-');
                    s.object.click(() => {
                        const window = new YesNoWindow('yes-no-window', 'Вы уверены?', `Удалить запись "${wChildren.data.name}"?`);
                        window.render('');
                        window.yes.click(async () => {
                            const apiKey = auth.get('apiKey');
                            const res = await request.delete(`/api/db/blog?apiKey=${apiKey}`, JSON.stringify(wChildren.data)).catch(e => {
                                notificationController.error(e.error.responseText);
                                console.log(e);
                            });

                            if (res.status === 'nocontent') {
                                notificationController.success(res.response);
                                this.updateBlogData();
                                window.destroy();
                            }
                        });

                        window.no.click(() => {
                                window.destroy();
                        });
                    });
                });
            }
            wChildren.object.children().filter(':not(.text-wrapper)').click(e => e.stopPropagation());
        });
    });
}


DataTable.prototype.createNewBlog = async function(data = {}) {
    const keys = Object.keys(data);

    const controls = [
        new Button('add-file-link', 'Файл'),
        new Button('add-image-link', 'Картинка')
    ];

    const children = [
        new Label('window-label', keys.length ? 'Редактировать запись' : 'Добавить запись'),
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
    nameField.label.text('Название записи');
    const descriptionField = lessonWindow.children[2];
    descriptionField.label.text('Описание');
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
                const res = await request.post(`/api/db/blog?apiKey=${apiKey}`, JSON.stringify({name, description: descriptionField.input.val()}))
                    .catch(e => {
                        notificationController.error(e.error.responseText);
                        console.log(e);
                    });

                if (res.status === 'success') {
                    this.updateBlogData();
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
                    res = await request.put(`/api/db/blog?apiKey=${apiKey}`, JSON.stringify({source: data ,data: diffData}))
                        .catch(e => {
                            notificationController.error(e.error.responseText);
                            console.log(e);
                        });

                    if (res.status === 'success') {
                        this.updateBlogData();
                        notificationController.success(res.response);
                        lessonWindow.destroy();
                    }
                } else {
                    notificationController.success('Данные остались без изменений!')
                }
            } 
        } else {
            notificationController.error('Небходимо заполнить поле с названием');
            nameField.input.focus();
        }   
    });
}

async function renderBlogTable() {
    const controls = [
        new Label('window-label', 'Блог'),
        new Button('add-new-course'),
        new SearchLine('courses-search')
    ];

    const coursesTable = new DataTable('courses-table', controls);
    coursesTable.wrapperClass = 'courses-wrapper';
    coursesTable.render('content-window');
    coursesTable.renderControls(() => {});

    const addCourse = coursesTable.controls.find(c => c.isTypeOf('button'));
    addCourse.object.text('+');
    addCourse.object.attr('title', 'Добавить новую запись в блог');
    addCourse.object.click(async () => coursesTable.createNewBlog());
    coursesTable.updateBlogData([]);
    coursesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await coursesTable.updateBlogData([]));
}

async function renderPage() {
    renderPageLoader();
    
    const response = await auth.getUserData();

    if (response) {
        const user = response;
        renderBlogTable(user);
        renderHeader(user);
        renderControls(user);

        $('.blog-tab').addClass('strip-button-selected');
    } else {
        location.reload();
    }
}

renderPage();

DataTable.prototype.updateFilesData = async function(type = 'document') {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/files?apiKey=${apiKey}&type=${type}`, { searchingValue });

    if (res.status === 'success') {
        const data = res.response;
        this.children = data.map(row => new DataStrip(row.name.replace(/[ .,&?*$;@\(\)]/g, ''), row, [new CheckboxButton('add-file')]), []);

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