class DataTable extends SingleCustomWindow {
    [Symbol.toStringTag] = 'dataTable'
    
    constructor(className, label, children = []) {
        super(className);
        this.wrapperClass = 'users-wrapper';
        this.html = 
            `<div class="data-window users-window ${className}">` +
                `<div class="data-list users-list">${label}</div>` +
                '<div class="search-line">' +
                    '<input type="text" name="" id="" placeholder="Поиск">' +
                '</div>' +
                `<div class="data-wrapper ${this.wrapperClass}">` + 
                '</div>';
        this.children = children;
    }

    removeChildren() {
        if (this.children.length > 0) {
            this.children.forEach(strip => strip.destroy());
            this.children = [];
        }
    }

    renderChildren(callback) {
        if (this.children.length > 0) {
            this.children.forEach(strip => {
                strip.render(this.wrapperClass);
                callback(strip);
            });
        }
    }

    render(parentName) {
        super.render(parentName);
        this.searchField = $('.search-line > input');
    }
}

class DataStrip extends CustomWindow {
    [Symbol.toStringTag] = 'dataStrip'

    constructor(className, data) {
        super(className);
        this.data = data;
        this.defaultImg = "../../../public/IMG/dashboard/default_user.png";
        this.html = 
            `<div class="data user ${className}">` +
                '<div class="icon-wrapper">' +
                    '<div class="icon">' +
                        `<img src="${this.defaultImg}" alt="" srcset="">` +
                    '</div>' +
                '</div>' +
                `<div class="text"></div> ` +
            '</div>';

        this.onDataChange = new CustomEvent();
    }

    render(parentName) {
        super.render(parentName);
        this.icon = this.object.find('.icon > img');
        this.text = this.object.find('div[class="text"]');
    }
}

class DataWindow extends SingleCustomWindow {
    [Symbol.toStringTag] = 'dataWindow'

    constructor(data, children = []) {
        super('user-data-window');

        this.data = data;
        this.children = children;
        this.onSubmit = new CustomEvent();
    }

    html = 
        `<div class="overlay-window-background ${this.className}-background">` +
        `<div class="overlay-window ${this.className}">` +
            '<div class="inputs">' +
            '</div>' +
        '</div>' +
        '</div>';

    renderChildren(callback) {
        if (this.children.length > 0) {
            this.children.forEach(strip => {
                strip.render(this.inputs.attr('class'));
                callback(strip);
            });
        }
    }

    render(parentName) {
        super.render(parentName);

        this.inputs = this.object.find('.inputs');

        // this.fields = {
        //     username: this.object.find('input[id="username"]'),
        //     role:  this.object.find('input[id="role"]'),
        //     phone:  this.object.find('input[id="phone"]'),
        //     email:  this.object.find('input[id="email"]'),
        //     classesLeft:  this.object.find('input[id="classesLeft"]'),
        //     skype:  this.object.find('input[id="skype"]')
        // };

        // this.setData();

        $(`.${this.className}-background`)
            .click(() => this.destroy())
            .find(`.${this.className}`)
            .click((e) => e.stopPropagation());
        
        // $('.submit').click(() => this.submit());
    }

    // async submit() {
    //     const diffs = this.checkDifferences();
    //     const keys = Object.keys(diffs);
    //     if (keys.length !== 0) {
    //         const res = await request.get('/api/db/updateUsers', {sources: this.data, diffs})
    //             .catch(e => {
    //                 new NotificationError('err-window', error.responseText).render();
    //                 console.log({error, status});
    //             });

    //         new NotificationSuccess('user-registered', data).render();
    //         this.onSubmit.raise();
    //         console.log({data, status})
    //         this.destroy();
    //     }
    // }

    destroy() {
        const object = $(`.${this.className}-background`);
        if (!$.isEmptyObject(object)) {
            $(`.${this.className}-background`).remove();
        }
    }

    // checkDifferences() {
    //     // return Object.entries(this.fields).reduce((acc, curr) => {
    //     //     const key = curr[0];
    //     //     const value = curr[1].val();
    //     //     if (value != this.data[key]) acc[key] = value;
    //     //     return acc;
    //     // }, {});

    //     return this.children.reduce((acc, curr) => {
    //         if (typeof curr !== 'Button') {
    //             const key = curr.className;
    //             const value = curr.input.val();
    //             if (value != this.data[key]) acc[key] = value;
    //         }

    //         return acc;
    //     }, {});
    // }

    // setData() {
    //     Object.entries(this.fields).forEach(link => {
    //         if (link[0] !== 'classes') {
    //             const value = this.data[link[0]];
    //             link[1].val(value);
    //         }
    //     });
    // }
}

class InputField extends CustomWindow {
    [Symbol.toStringTag] = 'inputField'

    constructor(className) {
        super(className);

        this.html = 
            `<div class="text-field ${this.className}">` +
                '<label for="username">Имя</label>' +
                '<input type="text" id="username" required>' +
            '</div>';
    }

    render(parentName) {
        if (parentName.isEmpty()) {
            this.object = $('body').append(this.html).find(`.${this.className}`); 
        } else {
            this.object = $(`.${parentName}`).append(this.html).find(`.${this.className}`);
        }

        this.label = this.object.find('label');
        this.input = this.object.find('input');
    }

    setIds(id) {
        this.label.attr('for', id);
        this.input.attr('id', id);
    }
}

class Button extends CustomWindow {
    [Symbol.toStringTag] = 'button'

    constructor(className) {
        super(className);

        this.html = `<div class="button-big ${className}"></div>`;
    }

    render(parentName) {
        if (parentName.isEmpty()) {
            this.object = $('body').append(this.html).find(`.${this.className}`); 
        } else {
            this.object = $(`.${parentName}`).append(this.html).find(`.${this.className}`);
        }
    }
}