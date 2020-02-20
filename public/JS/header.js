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
                    const width = Number(controls.css('width').match(/\d*/)[0]);
                    const left = Number(controls.css('left').match(/-?\d*/)[0]);   
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
                                const res = await request.get('/api/db/userData', { apiKey });

                                if (res.status === 'success') {
                                    const data = res.response[0];
                                    // const newData

                                    const leftTableChildren = [
                                        new InputField('username-field', 'username', 'Имя пользователя',data.username),
                                        new InputField('phone-field', 'phone', 'Телефон', data.phone),
                                        new InputField('email-field', 'email', 'Эл.почта', data.email),
                                        new InputField('skype-field', 'skype', 'Skype', data.skype),
                                        new InputField('old-password-field', 'password', 'Старый пароль'),
                                        new InputField('new-password-field', 'password', 'Новый пароль'),
                                        new InputField('confirm-new-password-field', 'password', 'Подтвердите новый пароль')
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