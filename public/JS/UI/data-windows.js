class DataTable extends SingleCustomWindow {
    [Symbol.toStringTag] = 'dataTable'
    
    constructor(className, controls = [], children = []) {
        super(className);
        this.wrapperClass = 'users-wrapper';
        this.controlsWrapper = 'controls-wrapper';
        this.html = 
            `<div class="data-window users-window ${className}">` +
                `<div class="${this.controlsWrapper}"></div>` +
                `<div class="data-wrapper ${this.wrapperClass}"></div>` + 
            '</div>';
        this.children = children;
        this.controls = controls;
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

    renderControls() {
        if (this.controls.length > 0) {
            this.controls.forEach(c => {
                c.render(this.controlsWrapper);
                // callback(strip);
            });
        }
    }

    render(parentName) {
        super.render(parentName);
        // this.searchField = $('.search-line > input');
    }
}

class DataStrip extends CustomWindow {
    [Symbol.toStringTag] = 'dataStrip'

    constructor(className, data) {
        super(className);
        this.data = data;
        this.defaultImg = "../../../public/IMG/dashboard/default_user.png";
        this.html = 
            `<div class="data user data-strip ${className}">` +
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
        if (parentName.isEmpty()) {
            this.object = $('body').append(this.html).find(`.${this.className}`); 
        } else {
            this.object = $(`.${parentName}`).append(this.html).find(`.${this.className}`);
        }

        this.icon = this.object.find('.icon > img');
        this.text = this.object.find('div[class="text"]');
    }
}

class DataWindow extends SingleCustomWindow {
    [Symbol.toStringTag] = 'dataWindow'

    constructor(className, data, children = []) {
        super(className);

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
        if (parentName.isEmpty()) {
            this.object = $('body').append(this.html).find(`.${this.className}`); 
        } else {
            this.object = $(`.${parentName}`).append(this.html).find(`.${this.className}`);
        }

        this.inputs = this.object.find('.inputs');

        $(`.${this.className}-background`)
            .click(() => this.destroy())
            .find(`.${this.className}`)
            .click((e) => e.stopPropagation());
    }

    destroy() {
        const object = $(`.${this.className}-background`);
        if (!$.isEmptyObject(object)) {
            $(`.${this.className}-background`).remove();
        }
    }
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

class SearchLine extends CustomWindow {
    [Symbol.toStringTag] = 'search-line'
    constructor(className) {
        super(className);

        this.html = 
            `<div class="search-line ${className}">` +
                '<input type="text" name="" id="" placeholder="Поиск">' +
            '</div>';
    }

    render(parentName) {
        if (parentName.isEmpty()) {
            this.object = $('body').append(this.html).find(`.${this.className}`); 
        } else {
            this.object = $(`.${parentName}`).append(this.html).find(`.${this.className}`);
        }

        this.input = this.object.find('input');
    }
}

class Label extends CustomWindow {
    [Symbol.toStringTag] = 'label'
    constructor(className, text = '') {
        super(className);

        this.html = `<div class="label ${className}">${text}</div>`;
    }

    render(parentName) {
        if (parentName.isEmpty()) {
            this.object = $('body').append(this.html).find(`.${this.className}`); 
        } else {
            this.object = $(`.${parentName}`).append(this.html).find(`.${this.className}`);
        }
    }
}