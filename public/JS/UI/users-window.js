class UsersWindow extends SingleCustomWindow {
    constructor(className, children = []) {
        super(className);
        this.wrapperClass = 'users-wrapper';
        this.html = 
            `<div class="data-window users-window ${className}">` +
                '<div class="data-list users-list">Список пользователей</div>' +
                '<div class="search-line">' +
                    '<input type="text" name="" id="" placeholder="Поиск">' +
                '</div>' +
                `<div class="data-wrapper ${this.wrapperClass}">` + 
                '</div>';
        this.children = children;
    }

    removeChildren() {
        if (this.children.length > 0) {
            this.children.forEach(user => user.destroy());
            this.children = [];
        }
    }

    renderChildren() {
        if (this.children.length > 0) {
            this.children.forEach(user => {
                user.render(this.wrapperClass);
                user.onDataChange.addListener(() => this.updateData());
            });
        }
    }

    async updateData() {
        this.removeChildren();
        await this.getData(this.searchField.val());
        this.renderChildren();
    }

    async getData(data = {searchingValue: ''}) {
        return $.ajax({
            url: '/api/db/users',
            data: typeof data === 'object' ? data : { searchingValue: data },
            success: (data) => {
                this.children = data.map(row => {
                    return new UserStrip(row.username, row);
                }, []);
            },
            error: (error) => {
                const e = error.responseText;
                new NotificationError('error', e)
                console.error(e);
            }
        });
    }

    render(parentName) {
        super.render(parentName);
        this.searchField = $('.search-line > input');
        this.searchField.change(() => {
            this.updateData();
        })
    }
}

class UserStrip extends CustomWindow {
    constructor(className, data) {
        super(className);
        this.data = data;
        this.html = 
            `<div class="data user ${className}">` +
                '<div class="icon-wrapper">' +
                    '<div class="icon">' +
                        `<img src="${data && data.image ? data.image : "../../../public/IMG/dashboard/default_user.png"}" alt="" srcset="">` +
                    '</div>' +
                '</div>' +
                `<div class="text">${this.data.username}</div> ` +
            '</div>';

        this.onDataChange = new CustomEvent();
    }

    render(parentName) {
        super.render(parentName);

        this.object.click(() => {
            const dataWindow = new UserDataWindow(this.data);
            dataWindow.render();
            dataWindow.onSubmit.addListener(() => {
                this.onDataChange.raise();
            });
        });
    }
}

class UserDataWindow extends SingleCustomWindow {
    constructor(data) {
        super('user-data-window');

        this.data = data;
        this.onSubmit = new CustomEvent();
    }

    html = 
        `<div class="overlay-window-background ${this.className}-background">` +
        `<div class="overlay-window ${this.className}">` +
            '<div class="inputs">' +
                '<div class="text-field">' +
                    '<label for="username">Имя</label>' +
                    '<input type="text" id="username" required>' +
                '</div>' +
                '<div class="text-field">' +
                    '<label for="role">Роль</label>' +
                    '<input type="text" id="role" required>' +
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
                    '<label for="classesLeft">Баланс занятий</label>' +
                    '<input type="text" id="classesLeft" required>' +
                '</div>' +
                '<div class="text-field">' +
                        '<label for="skype">Skype</label>' +
                        '<input type="text" id="skype">' +
                '</div>' +
                '<div class="button-big submit">Применить</div>' +
            '</div>' +
        '</div>' +
        '</div>';

    render(parentName) {
        super.render(parentName);

        this.fields = {
            username: $('input[id="username"]'),
            role: $('input[id="role"]'),
            phone: $('input[id="phone"]'),
            email: $('input[id="email"]'),
            classesLeft: $('input[id="classesLeft"]'),
            skype: $('input[id="skype"]')
        };

        this.setData();

        $(`.${this.className}-background`)
            .click(() => this.destroy())
            .find(`.${this.className}`)
            .click((e) => e.stopPropagation());
        
        $('.submit').click(() => this.submit());
    }

    submit() {
        const diffs = this.checkDifferences();
        const keys = Object.keys(diffs);
        if (keys.length !== 0) {
            $.ajax({
                url:'/api/db/updateUsers',
                data: {sources: this.data, diffs},
                success: (data, status) => {
                    new NotificationSuccess('user-registered', data).render();
                    this.onSubmit.raise();
                    console.log({data, status})
                    this.destroy();
                },
                error: (error, status) => {
                    new NotificationError('err-window', error.responseText).render();
                    console.log({error, status})
                }
            });
        }
    }

    destroy() {
        const object = $(`.${this.className}-background`);
        if (!$.isEmptyObject(object)) {
            $(`.${this.className}-background`).remove();
        }
    }

    checkDifferences() {
        return Object.entries(this.fields).reduce((acc, curr) => {
            const key = curr[0];
            const value = curr[1].val();
            if (value != this.data[key]) acc[key] = value;
            return acc;
        }, {});
    }

    setData() {
        Object.entries(this.fields).forEach(link => {
            if (link[0] !== 'classes') {
                const value = this.data[link[0]];
                link[1].val(value);
            }
        });
    }
}