async function render() {
    const username = localStorage.getItem('username');
    const children = [
        new Button('menu-button', '≡'),
        new DropDownList('user-menu', username)
    ];

    const header = new ObjectWrapper('header-wrapper', children);
    header.prepandRender('');
    header.renderChildren(child => {
        switch (child.className) {
            case 'menu-button':
                child.object.click(() => {
                    const controls = $('.controls');
                    const width = controls.css('width').toNumber();
                    const left = controls.css('left').toNumber();   
                    const value = left < 0 ? 0 : -width;
                    $('.controls').animate({'left': `${value}px`}, 200);                 
                });
                break;

            case 'user-menu':
                child.object.click(() => {
                    const children = [
                        new Button('user-settings', 'Настройки'),
                        new Button('exit-button', 'Выход')
                    ];

                    const window = new DataWindow('user-menu', [], children);
                    window.render('');
                    window.renderChildren(button => {
                        if (button.className === 'exit-button') {
                            button.object.click(() => auth.logOut());
                        } else {
                            button.object.click(async () => {
                                const apiKey = auth.get('apiKey');
                                const res = await request.get('/api/db/userData', { apiKey })
                                    .catch(e => {
                                        console.log(e);
                                        notificationController.error(e.error.responseText);
                                    });

                                if (res.status === 'success') {
                                    const data = res.response[0];
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
                                        new Button('change-photo', 'Изменить фото'),
                                        new Button('delete-photo', 'Удалить фото')
                                    ];
    
                                    const children = [
                                        new Label('user-profile-label', 'Изменить данные пользователя'),
                                        new ObjectWrapper('user-profile-tables',[
                                            new DataTable('user-data-fields', [], leftTableChildren),
                                            new DataTable('user-photo-field', [], rightTableChildren),
                                        ]),
                                        new Button('submit-user-data', 'Сохранить изменения')
                                    ];
    
                                    const userProfile = new DataWindow('user-profile', [], children);
                                    userProfile.render('');
                                    userProfile.renderChildren(child => {
                                        switch(child.getType()) {
                                            case '[object objectWrapper]':
                                                child.renderChildren(table =>{
                                                    if (table.className === 'user-data-field') {
                                                        table.renderChildren(() => {
        
                                                        });
                                                    } else {
                                                        table.renderChildren(() => {
        
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
                                                                        const res = await request.post(`/api/db/userData?apiKey=${apiKey}`, string)
                                                                            .catch(e => {
                                                                                console.error(e);
                                                                                notificationController.error(e.error.responseText);
                                                                            });
                                                                        if (res.status === 'success') notificationController.success(res.response);
                                                                        userProfile.destroy();
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
                                }
                            });
                        }
                    }); 
                });
                break;
        }
    });
}

render();