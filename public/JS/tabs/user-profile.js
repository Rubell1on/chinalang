async function renderUserProfile(data) {
    const newData = {};

    const leftTableChildren = [
        new InputField('username-field', 'username', 'Имя пользователя',data.username),
        new InputField('phone-field', 'phone', 'Телефон', data.phone),
        new InputField('email-field', 'email', 'Эл.почта', data.email),
        new InputField('skype-field', 'skype', 'Skype', data.skype, false),
        new InputField('old-password-field', 'old-password', 'Старый пароль'),
        new InputField('new-password-field', 'new-password', 'Новый пароль'),
        new InputField('confirm-new-password-field', 'confirm-password', 'Подтвердите новый пароль')
    ];

    const rightTableChildren = [
        new Label('photo-label', 'Фото'),
        new FileInput('photo-field'),
        new Button('change-photo', 'Загрузить фото'),
        new Button('delete-photo', 'Удалить фото')
    ];

    const children = [
        new Label('window-label', 'Изменить данные пользователя'),
        new ObjectWrapper('user-profile-tables',[
            new DataTable('user-data-fields', [], leftTableChildren),
            new DataTable('user-photo-field', [], rightTableChildren),
        ]),
        new Button('submit-user-data', 'Сохранить изменения')
    ];

    const userProfile = new DataTable('user-profile', [], children);
    userProfile.render('content-window');
    userProfile.renderChildren(child => {
        switch(child.getType()) {
            case '[object objectWrapper]':
                child.renderChildren(table =>{
                    if (table.className === 'user-data-field') {
                        table.renderChildren(() => {

                        });
                    } else {
                        table.renderChildren(child => {
                            switch(child.className) {
                                case 'change-photo':
                                    child.object.click(async () => {
                                        const fileInput = table.children.find(c => c.isTypeOf('fileInput'));
                                        const file = fileInput.input[0].files[0];
                                        const fileType = file.name.match(/\.\w*/)[0];

                                        const fileInfo = {
                                            name: `${data.username}_photo${fileType}`,
                                            type: 'photo'
                                        }

                                        notificationController.process('Данные отправлены на сервер! Ожидаю ответ');
                                        const apiKey = auth.get('apiKey');
                                        const res = await request.put(`/api/db/files?apiKey=${apiKey}`, JSON.stringify(fileInfo))
                                            .catch(e => {
                                                notificationController.error(e.error.responseText);
                                                console.error(e);
                                            });

                                            if (res.status === 'success') {
                                                const responseData = res.response;
                                                const response = await request.put(responseData.data.href, file, false)
                                                    .catch(e => {
                                                        console.error(e);
                                                        notificationController.error(e.error.responseText);
                                                    });
                                                    
                                                if (response.status === 'success') {
                                                    fileInfo.path = responseData.path;
                                                    fileInfo.data = data;
                                                    const apiKey = auth.get('apiKey');
                                                    const res = await request.post(`/api/db/files?apiKey=${apiKey}`, JSON.stringify(fileInfo))
                                                        .catch(async (e, status) => {
                                                            console.error({e, status});
                                                            notificationController.error(e.error.responseText);
                                                            const res = await request.delete(`/api/db/files?apiKey=${apiKey}`, JSON.stringify({ type: 'photo', id: data.id, name: data.username, link: data.photoLink }))
                                                                .catch(e => {
                                                                    console.error(e);
                                                                });
                                                            
                                                            if (res.status === 'nocontent') {
                                                                console.log('Фото удалено');
                                                            }
                                                        });

                                                    if (res.status) {
                                                        notificationController.success(res.response);
                                                        location.reload();
                                                    }
                                                }
                                            }
                                    });

                                    break;

                                case 'delete-photo':
                                    child.object.click(async () => {
                                        notificationController.process('Отправлен запрос на удаление фото!');
                                        const apiKey = auth.get('apiKey');
                                        const res = await request.delete(`/api/db/files?apiKey=${apiKey}`, JSON.stringify({ type: 'photo', id: data.id, name: data.username, link: data.photoLink }))
                                            .catch(e => {
                                                console.error(e);
                                                notificationController.error(e.error.responseText);
                                            });
                                        
                                        if (res.status === 'nocontent') {
                                            notificationController.success('Фото успешно удалено!')
                                        }
                                    });

                                    break;

                                case 'photo-field':
                                    child.input.attr('accept', 'image/jpeg, image/png, image/jpg');
                                    break;
                            }
                        });
                    }
                });

                break;
            case '[object button]':
                child.object.click(() => {
                    const wrapper = userProfile.children.find(c => c.isTypeOf('objectWrapper'));
                    const tables = wrapper.children.filter(c => c.isTypeOf('dataTable'));

                    if (tables) {
                        tables.forEach(async t => {
                            if (t.className === 'user-data-fields') {
                                const passwordClasses = [
                                    'old-password-field',
                                    'new-password-field',
                                    'confirm-new-password-field'
                                ]

                                const fields = t.children.filter(c => c.isTypeOf('inputField') && !passwordClasses.includes(c.className));
                                const passwordFields = t.children.filter(c => c.isTypeOf('inputField') && passwordClasses.includes(c.className));

                                for (let i in fields) {
                                    const field = fields[i];
                                    const key = field.className.match(/^\w*/);
                                    const value = field.input.val();

                                    if (field.input.attr('required')) 
                                    {
                                        if (!value.isEmpty()) {
                                            newData[key] = value;
                                        } else {
                                            field.input.focus();
                                            break;
                                        }
                                    } else {
                                        newData[key] = value;
                                    }
                                }

                                const pData = passwordFields.reduce((acc, curr) => {
                                    acc.push({class: curr, value: curr.input.val()});

                                    return acc;
                                },[]);

                                const old = pData[0].value;
                                const newP = pData[1].value;
                                const confirm = pData[2].value;

                                let flag = true;

                                if (!old.isEmpty() && !newP.isEmpty() && !confirm.isEmpty()) {
                                    if (newP === confirm) {
                                        flag = true;
                                        newData['old-password'] = old;
                                        newData['password'] = newP;
                                    } else {
                                        flag = false;
                                    }
                                } else if (old.isEmpty() && newP.isEmpty() && confirm.isEmpty()) {
                                    flag = true;
                                } else if (old.isEmpty() || newP.isEmpty() || confirm.isEmpty()) {
                                    flag = false;
                                    pData.forEach(p => p.class.input.focus());
                                }

                                if (flag) { 
                                    const difference =  diff(data, newData);
                                    if (Object.keys(difference).length) {
                                        const string = JSON.stringify({difference, source: data});
                                        const apiKey = auth.get('apiKey');
                                        notificationController.process('Данные отправляются на сервер!');
                                        const res = await request.put(`/api/db/userData?apiKey=${apiKey}`, string)
                                            .catch(e => {
                                                console.error(e);
                                                notificationController.error(e.error.responseText);
                                            });
                                        if (res.status === 'success') {
                                            notificationController.success(res.response);
                                            location.reload();
                                        }
                                    }
                                }

                            } else {

                            }
                        });
                    }
                });

                break;
        }
    });
    // }
}

async function renderPage() {
    renderPageLoader();
    
    const response = await auth.getUserData();

    if (response) {
        const user = response;
        renderUserProfile(user);
        renderHeader(user);
        renderControls(user);

        $('.profile-tab').addClass('strip-button-selected');
    } else {
        location.reload();
    }
}

renderPage();