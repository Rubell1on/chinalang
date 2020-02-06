$('.get-free-lesson').click(() => {
    const window = new QuickStartWindow();
    window.render('');
});

class QuickStartWindow extends CustomWindow {
    constructor() {
        super('quick-start-window');
    }

    textTemplates = [
        'Запишитесь на бесплатный урок',
        'Оставьте заявку на бесплатный урок',
        'Договоритесь с менеджером о времени'
    ];

    html = 
        `<div class="${this.className}-background">` +
        `<div class="${this.className}">` +
            ' <div class="info"></div>' +
            '<div class="inputs">' +
                '<div class="text-field">' +
                    '<label for="username">Имя</label>' +
                    '<input type="text" id="username" >' +
                '</div>' +
                '<div class="text-field">' +
                    '<label for="phone-number">Номер телефона</label>' +
                    '<input type="tel" id="phone-number" placeholder="">' +
                '</div>' +
                '<div class="text-field">' +
                    '<label for="email">Эл. почта</label>' +
                    '<input type="email" id="email">' +
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
            
            $('.submit').click(() => {
                const data = {};

                data.username = $('#username').val();
                data.phone = $('#phone-number').val();
                data.email = $('#email').val();
                data.skype = $('#skype').val();

                $.get({
                    url:'/register',
                    data,
                    success: () => {
                        
                    }
                })
            });
        }

        setRandomText() {
            const rndValue = randomInt(this.textTemplates.length);

            const template = 
                '<div class="text">' +
                    this.textTemplates[rndValue] +
                '</div>';

            $(`.${this.className} .info`).append(template)
        }
    
        destroy() {
            const object = $(`.${this.className}-background`);
            if (!$.isEmptyObject(object)) {
                $(`.${this.className}-background`).remove();
            }
        }
}