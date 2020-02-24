$('.get-free-lesson').click(() => {
    const window = new QuickStartWindow();
    window.render('');
});

$('.login').click(() => {
    const children = [
        new Label('login-window-label', 'Авторизация'),
        new InputField('username-field', 'username', 'Имя пользователя'),
        new InputField('password-field', 'password', 'Пароль'),
        new Button('login-submit', 'Войти')
    ];

    const loginWindow = new DataWindow('login-window', [], children);
    loginWindow.render('');
    loginWindow.renderChildren(c => {
        if (c.isTypeOf('button')) {
            c.object.click(async () => {
                const inputs = loginWindow.children.filter(child => child.isTypeOf('inputField'));

                const userData = {};
                let flag = true;

                for (let i in inputs) {
                    const child = inputs[i];

                    const val = child.value;
                    if (child.input.attr('required')) {
                        
                        if (!val.isEmpty()) {
                            const key = child.className.match(/^\w*/g)[0];
                            userData[key] = val;
                        }
                        else {
                            flag = false;
                            child.input.focus();
                            break;
                        }
                    } else {
                        userData[child.className] = val;
                    }
                }

                if (flag) {
                    const res = await request.get('/login', userData)
                        .catch(e => {
                            console.log(e);
                            notificationController.error(e.error.responseText);
                        });
                    if (res.status === 'success') {
                        const role = res.response.role;
                        // delete res.response.role;
                        auth.setData(res.response);

                        const pageRoute = role === 'student' ? 'lk' : 'dashboard';
                        const courseRoute = role === 'student' ? 'courses' : 'users';

                        // location.href = `${location.origin}/${pageRoute}/${courseRoute}?apiKey=${auth.getData()['apiKey']}`;
                        location.href = `${location.origin}/${pageRoute}/${courseRoute}`;
                    }
                } else {
                    notificationController.error('Необходимо заполнить выделенные поля!');
                }
            })
        }
    });
});


class QuickStartWindow extends SingleCustomWindow {
    constructor() {
        super('quick-start-window');
        this[Symbol.toStringTag] = 'quickStartWindow';
        
        this.textTemplates = [
            'Запишитесь на бесплатный урок',
            'Оставьте заявку на бесплатный урок',
            'Договоритесь с менеджером о времени'
        ];

        this.html = 
        `<div class="overlay-window-background ${this.className}-background">` +
        `<div class="overlay-window ${this.className}">` +
            '<div class="info"></div>' +
            '<div class="inputs">' +
                '<div class="text-field">' +
                    '<label for="username">Имя</label>' +
                    '<input type="text" id="username" required>' +
                '</div>' +
                '<div class="text-field">' +
                    '<label for="phone">Номер телефона</label>' +
                    '<input type="tel" id="phone" required>' +
                '</div>' +
                '<div class="text-field">' +
                    '<label for="email">Эл. почта</label>' +
                    '<input type="email" id="email" required>' +
                '</div>' +
                '<div class="text-field">' +
                        '<label for="skype">Skype</label>' +
                        '<input type="text" id="skype">' +
                '</div>' +
                '<div class="button-big submit">Попробовать</div>' +
            '</div>' +
        '</div>' +
        '</div>';
    }

    render(parentName) {
        super.render(parentName);
        this.setRandomText();

        $(`.${this.className}-background`)
            .click(() => this.destroy())
            .find(`.${this.className}`)
            .click((e) => e.stopPropagation());
        
        $('.submit').click(async () => await this.submit());
    }

    setRandomText() {
        const rndValue = randomInt(this.textTemplates.length);

        const template = 
            '<div class="text">' +
                this.textTemplates[rndValue] +
            '</div>';

        $(`.${this.className} .info`).append(template)
    }

    async register(data) {
        const res = await request.post('/free', JSON.stringify(data))
            .catch(e => {
                console.error(e)
                notificationController.error(e.error.responseText)
            });

        if (res.status === 'success') {
            notificationController.success(res.response);
            this.destroy();
        }
        // $.ajax({
        //     url:'/free',
        //     data,
        //     success: (data, status) => {
        //         new NotificationSuccess('user-registered', data).render();
        //         console.log({data, status})
        //         this.destroy();
        //     },
        //     error: (error, status) => {
        //         new NotificationError('err-window', error.responseText).render();
        //         console.log({error, status})
        //     }
        // })
    }

    destroy() {
        const object = $(`.${this.className}-background`);
        if (!$.isEmptyObject(object)) {
            $(`.${this.className}-background`).remove();
        }
    }

    async submit() {
        const data = {
            "username": undefined,
            "phone": undefined,
            "email": undefined,
            "skype": undefined
        };

        let flag = true;

        const keys = Object.keys(data);

        for (let i in keys) {
            const value = keys[i];
            const field = $(`#${value}`);
            const temp = field.val();

            if (field.prop('required')) {
                if (!temp.isEmpty()) {
                    data[value] = temp;
                } else {
                    field.focus();
                    flag = false;
                    break;
                } 
            } else {
                data[value] = temp.isEmpty() ? '' : temp;
            }
        }

        if (flag) {
            console.log(JSON.stringify(data));
            await this.register(data);
            notificationController.process('Данные отправлены! Ожидаю ответ.')
            // new NotificationWindow('window', 'Данные отправлены! Ожидаю ответ.').render();
        } else {
            notificationController.error('Некорректно заполнены поля')
            // new NotificationError('err-window', "Некорректно заполнены поля").render();
            // console.error("Некорректно заполнены поля");
        }
    }
}