$('.get-free-lesson').click(() => {
    const window = new QuickStartWindow();
    window.render('');
});

class QuickStartWindow extends SingleCustomWindow {
    constructor() {
        super('quick-start-window');
    }

    textTemplates = [
        'Запишитесь на бесплатный урок',
        'Оставьте заявку на бесплатный урок',
        'Договоритесь с менеджером о времени'
    ];

    html = 
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

    render(parentName) {
        super.render(parentName);
        this.setRandomText();

        $(`.${this.className}-background`)
            .click(() => this.destroy())
            .find(`.${this.className}`)
            .click((e) => e.stopPropagation());
        
        $('.submit').click(() => this.submit());
    }

    setRandomText() {
        const rndValue = randomInt(this.textTemplates.length);

        const template = 
            '<div class="text">' +
                this.textTemplates[rndValue] +
            '</div>';

        $(`.${this.className} .info`).append(template)
    }

    register(data) {
        $.ajax({
            url:'/free',
            data,
            success: (data, status) => {
                new NotificationSuccess('user-registered', data).render();
                console.log({data, status})
                this.destroy();
            },
            error: (error, status) => {
                new NotificationError('err-window', error.responseText).render();
                console.log({error, status})
            }
        })
    }

    destroy() {
        const object = $(`.${this.className}-background`);
        if (!$.isEmptyObject(object)) {
            $(`.${this.className}-background`).remove();
        }
    }

    submit() {
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
            this.register(data);
            new NotificationWindow('window', 'Данные отправлены! Ожидаю ответ.').render();
        } else {
            new NotificationError('err-window', "Некорректно заполнены поля").render();
            console.error("Некорректно заполнены поля");
        }
    }
}