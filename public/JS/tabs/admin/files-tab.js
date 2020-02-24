DataTable.prototype.updateFilesData = async function() {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/files?apiKey=${apiKey}`, { searchingValue });

    const data = res.response;
    this.children = data.map(row => new DataStrip(row.name.replace(/[ .,&?*$;@\(\)]/g, ''), row, [new CheckboxButton('remove')]), []);

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
        new Label('file-window-label', 'Создать новый файл'),
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
    fileInput.input.attr('accept', '.pdf, .doc, .rar, .zip, .txt');
    fileInput.input.change(function() {
        const fileName = this.files[0].name;
        nameField.input.val(fileName);
        submit.css('opacity', '1');
        submit.click(async function() {
            const name = nameField.input.val();
            const file = fileInput.input[0].files[0];
            const fileInfo = {
                name: name.isEmpty() ? file.name : name,
                type: 'document'
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

async function renderPage() {
    renderPageLoader();

    const controls = [
        new Label('files-label', 'Список файлов'),
        new Button('add-new-file'),
        new SearchLine('files-search')
    ];

    const filesTable = new DataTable('files-table', controls);
    filesTable.wrapperClass = 'files-wrapper';
    filesTable.render('content-window');
    filesTable.renderControls();

    const addCourse = filesTable.controls.find(c => c.isTypeOf('button'));
    addCourse.object.text('+');
    addCourse.object.attr('title', 'Добавить новый файл');
    addCourse.object.click(async () => filesTable.createNewFile());
    filesTable.updateFilesData([]);
    filesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await filesTable.updateFilesData([]));
}

renderPage();

function renderPageLoader() {
    const pageLoader = new PageLoader('user-tab-loader', [
        new Label('loader-label', 'Идет загрузка страницы!'),
        new Image('loader-image', '../../public/IMG/dashboard/spiner.gif')
    ]);
    pageLoader.render('');
    pageLoader.renderChildren(() => {});   
    
    $(window).on('load', () => setTimeout(() => pageLoader.hide(self => self.destroy()), 500));
}