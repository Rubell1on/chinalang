async function renderHeader(user) {
    const apiKey = auth.get('apiKey');

    const children = [
        new Button('menu-button', '≡'),
        new Link('chinalang-link', location.origin, [
            new ObjectWrapper('chinalang-logo-wrapper', [
                new StripImage('chinalang-logo').setImage('../../public/IMG/header/chinalang_label.png'),
                new StripImage('chinalang-icon').setImage('../../public/IMG/header/triangle_logo.png'),
            ])
        ]),
        new ObjectWrapper('header-controls', [
            new DropDownList('user-menu', user && user.realname ? user.realname : user.username),
            new Button('contacts', 'Контакты')
        ])
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
            case 'chinalang-link':
                child.renderChildren(c => c.renderChildren(() => {}));
                break;
            case 'chinalang-logo-wrapper':
                child.renderChildren(() => {});
                break;

            case 'header-controls':
                child.renderChildren(child => {
                    if (child.className === 'user-menu') {
                        child.image.attr('src', user && user.photo ? `data:image/*;base64,${user.photo}` : child.defaultImg);
                        child.object.click(() => {
                            const window = new DataWindow('user-menu', [], [new Button('exit-button', 'Выход')]);
                            window.render('');
                            window.renderChildren(button => {
                                if (button.className === 'exit-button') {
                                    button.object.click(() => auth.logOut());
                                }
                            }); 
                        });
                    } else if (child.className === 'contacts') {
                        child.object.click(async () => {
                            const data = auth.getData();
                            await createFeedbackWindow(data);
                        })
                    }
                })
                break;
        }
    });
}

async function createFeedbackWindow(data = {}) {
    let required = ['username', 'email'];
    let phoneField = undefined;

    const window = new DataWindow('contacts-window', [], [
        new Label('window-label', 'Связаться с нами'),
        new ObjectWrapper('contact-fields', [
            new InputField('username', 'username', 'Имя', data && data.username ? data.username : '', true, data && data.username ? true : false),
            new InputField('email', 'email', 'Эл. почта', data && data.email ? data.email : '', true, data && data.email ? true : false),
            new Label('message-type-label', 'Тема сообщения'),
            new Select('message-type', [
                { value: 'feedback', text: 'Обратная связь' },
                { value: 'callback', text: 'Заказать звонок' },
                { value: 'collab', text: 'Вопросы сотрудничеста' },
                { value: 'another', text: 'Другое' }
            ]),
            new TextArea('message-text'),
            new Button('submit', 'Отправить')
        ])
    ])

    window.render('');
    window.renderChildren(child => {
        if (child.isTypeOf('objectWrapper')) child.renderChildren(wrapperChild => {
            switch (wrapperChild.getType()) {
                case '[object select]':
                    wrapperChild.object.change(() => {
                        const phone = 'phone';
                        const selected = wrapperChild.getSelected();

                        if (selected === 'callback') {
                            if (phoneField) {
                                destroy(phoneField);
                            }
                            
                            required.push(phone);
                            child.children.push(new InputField(phone, phone, 'Телефон'));
                            phoneField = child.children.find(c => c.isClassOf('phone'));
                            phoneField.render(child.object);
                            const email = child.children.find(c => c.isClassOf('email'));
                            phoneField.object.insertAfter(email.input);
                        } else {
                            destroy(phoneField);
                        }

                        function destroy(phoneField) {
                            phoneField.destroy();
                            required = required.reduce((acc, curr) => {
                                if (curr !== 'phone') acc.push(curr);
                                return acc;
                            }, []);
                        }
                    })
                    break;

                case '[object textArea]':
                    wrapperChild.label.text('Текст сообщения');

                    break;

                case '[object button]':
                    wrapperChild.object.click(async e => {
                        e.stopPropagation();
                        const wrapper = window.children.find(c => c.isTypeOf('objectWrapper')).children;
                        const selected = wrapper.find(c => c.isClassOf('message-type')).getSelected();
                        let flag = true;
                        const data = {};

                        for (child in wrapper) {
                            const c = wrapper[child];
                            if (required.includes(c.className)) {
                                const value = c.input.val();
                                    if (c.input.attr('required')) {
                                        if (value.isEmpty()) {
                                            flag = false;
                                            c.input.focus();
                                            notificationController.error('Необходимо заполнить выделенные поля!')
                                            break;
                                        }
                                    }

                                    data[c.className] = value;
                            } else if (c.isClassOf('message-type')) data['type'] = c.getSelected();
                            else if (c.isClassOf('message-text')) data['text'] = c.input.val();
                        }

                        if (flag) {
                            const res = await request.post(`${location.origin}/contact`, JSON.stringify(data))
                                .catch(e => {
                                    console.error(e);
                                    notificationController.error(e.error.responseText);
                                })
                            
                            if (res.status === 'success') {
                                notificationController.success(res.response);
                                window.destroy();
                            }
                        }
                    });

                    break;
            }                
        });
    })
}