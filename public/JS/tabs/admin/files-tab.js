DataTable.prototype.updateFilesData = async function() {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/files?apiKey=${apiKey}`, { searchingValue });

    const data = res.response;
    this.children = data.map((row, i) => new DataStrip(`${row.name.replace(/[ .,&?*$;@\(\)]/g, '')}-${i}`, row, [new CheckboxButton(['remove', 'button-very-big', 'button-allign-vertical-middle'])]), []);

    this.renderChildren(
            wChildren => {
            switch(wChildren.getType()) {
                case '[object dataStrip]':
                    wChildren.text.text(wChildren.data.name);
                    wChildren.renderChildren(s => {
                        s.object.text('-');
                        s.object.click(() => {
                            const window = new YesNoWindow('yes-no-window', 'Вы уверены?', `Удалить файл "${wChildren.data.name}"?`);
                            window.render('');
                            window.yes.click(async () => {
                                const childData = wChildren.data;
                                const apiKey = auth.get('apiKey');
                                const res = await request.delete(`/api/db/files?apiKey=${apiKey}`, JSON.stringify({id: childData.id, name: childData.name, type: 'document', link: childData.link}))
                                    .catch(e => {
                                        notificationController.error(e.error.responseText);
                                        console.log(e);
                                    });

                                if (res.status === 'nocontent') {
                                    notificationController.success(res.response);
                                    this.updateFilesData();
                                    window.destroy();
                                }
                            });

                            window.no.click(() => {
                                 window.destroy();
                            });
                        });
                    });

                    break;
                }
            wChildren.object.children().filter(':not(.text-wrapper)').click(e => e.stopPropagation());
        }
    );
}

DataTable.prototype.createNewFile = async function(data = {}) {
    const self = this;
    const children = [
        new Label('window-label', 'Создать новый файл'),
        new InputField('file-name'),
        new FileInput('file-input'),
        new Button('submit-file')
    ];

    const fileWindow = new DataWindow('course-window', [], children);
    fileWindow.render('');
    fileWindow.renderChildren(() => {});
    const nameField = fileWindow.children[1];
    const submit = fileWindow.children[3].object;
    nameField.label.text('Название файла');
    submit.text('Создать');
    submit.css('opacity', '0.5');
    const fileInput = fileWindow.children[2];
    const types = {
        document: ['.pdf', '.doc', '.rar', '.zip', '.txt'],
        image: ['.jpg', '.png', '.tiff', '.bmp', '.gif']
    }

    const accept = Object.entries(types).map(e => e[1].join(', ')).join(', ');

    fileInput.input.attr('accept', accept);
    fileInput.input.change(function() {
        const fileName = this.files[0].name;
        nameField.input.val(fileName);
        submit.css('opacity', '1');
        submit.click(async function() {
            const name = nameField.input.val();
            const file = fileInput.input[0].files[0];
            const type = file.type.split('/')[1];
            const fileType = Object.entries(types).filter(e => e[1].join(', ').includes(type))[0][0];
            const fileInfo = {
                name: name.isEmpty() ? file.name : translate(name).decrease(),
                type: fileType
            }
            const apiKey = auth.get('apiKey');
            const res = await request.put(`/api/db/files?apiKey=${apiKey}`, JSON.stringify(fileInfo))
                .catch(e => {
                    notificationController.error(e.error.responseText);
                    console.error(e);
                });
            
            if (res.status === 'success') {
                const data = res.response;
                const response = await request.put(data.data.href, file, false)
                    .catch(e => {
                        console.error(e);
                        notificationController.error(e.error.responseText);
                    });
                    
                if (response.status === 'success') {
                    fileInfo.path = data.path;
                    const apiKey = auth.get('apiKey');
                    const postResponse = await request.post(`/api/db/files?apiKey=${apiKey}`, JSON.stringify(fileInfo))
                        .catch((e, status) => {
                            console.error({e, status});
                        });
                    
                    if (postResponse.status === 'success') {
                        notificationController.success(postResponse.response);
                        fileWindow.destroy();
                        await self.updateFilesData();
                    }
                }
            }
        });
    });
}

async function renderFilesTable() {
    const controls = [
        new Label('window-label', 'Список файлов'),
        new Button('add-new-file'),
        new SearchLine('files-search')
    ];

    const filesTable = new DataTable('files-table', controls);
    filesTable.wrapperClass = 'files-wrapper';
    filesTable.render('content-window');
    filesTable.renderControls(() => {});

    const addCourse = filesTable.controls.find(c => c.isTypeOf('button'));
    addCourse.object.text('+');
    addCourse.object.attr('title', 'Добавить новый файл');
    addCourse.object.click(async () => filesTable.createNewFile());
    filesTable.updateFilesData([]);
    filesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await filesTable.updateFilesData([]));
}

async function renderPage() {
    renderPageLoader();
    renderFilesTable();

    const apiKey = auth.get('apiKey');
    const response = await request.get('/api/db/userData', { apiKey })
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });

    const user = response.response[0];

    renderHeader(user);
    renderControls(user);

    $('.files-tab').addClass('strip-button-selected');
}

renderPage();