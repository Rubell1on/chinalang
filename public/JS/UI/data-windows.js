class DataTable extends SingleCustomWindow {
    constructor(className, controls = [], children = []) {
        super(className);
        this[Symbol.toStringTag] = 'dataTable';
        
        this.controlsWrapper = `${this.className}-controls-wrapper`;
        this.html = 
            `<div class="data-window ${className}">` +
                `<div class="${this.controlsWrapper}"></div>` +
                `<div class="data-wrapper ${this.className}-data-wrapper"></div>` + 
            '</div>';
        this.children = children;
        this.controls = controls;
    }

    removeChildren() {
        if (this.children.length > 0) {
            this.children.forEach(child => child.destroy());
            this.children = [];
        }
    }

    renderChildren(callback) {
        if (this.children.length > 0) {
            this.children.forEach(child => {
                child.parent = this;
                child.render(this.wrapper);
                callback(child);
            });
        }
    }

    renderControls() {
        if (this.controls.length > 0) {
            this.controls.forEach(c => {
                c.parent = this;
                c.render(this.controlsWrapper);
            });
        }
    }

    render(parent) {
        super.render(parent);
        this.wrapper = this.object.find('.data-wrapper');
    }
}

class DataStrip extends CustomWindow {
    constructor(className, data, children = []) {
        super(className);
        this[Symbol.toStringTag] = 'dataStrip';

        this.data = data;
        this.defaultImg = "../../../public/IMG/dashboard/default_user.png";
        this.html = 
            `<div class="data user data-strip ${className}">` +
                '<div class="icon-wrapper">' +
                    '<div class="icon">' +
                        `<img src="${this.defaultImg}" alt="" srcset="">` +
                    '</div>' +
                '</div>' +
                `<div class="text-wrapper">
                    <div class="text"></div>
                </div> ` +
            '</div>';

        this.onDataChange = new CustomEvent();
        this.children = children;
    }



    render(parent) {
        super.render(parent);

        this.icon = this.object.find('.icon > img');
        this.text = this.object.find('div[class="text"]');
    }

    renderChildren(callback) {
        if (this.children.length > 0) {
            this.children.forEach(child => {
                child.parent = this;
                child.render(this.object);
                callback(child);
            });
        }
    }
}

class DataWindow extends SingleCustomWindow {
    constructor(className, data = [], children = []) {
        super(className);
        this[Symbol.toStringTag] = 'dataWindow';

        this.data = data;
        this.children = children;
        this.onSubmit = new CustomEvent();
        this.html = 
            `<div class="overlay-window-background ${this.className}-background">` +
            `<div class="overlay-window ${this.className}">` +
                `<div class="inputs">` +
                '</div>' +
            '</div>' +
            '</div>';
    }
    
    renderChildren(callback) {
        if (this.children.length > 0) {
            this.children.forEach(child => {
                child.parent = this;
                child.render(this.inputs);
                callback(child);
            });
        }
    }

    render(parent) {
        super.render(parent);

        this.inputs = this.object.find(`.inputs`);

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
    constructor(className, id = 'username', label = 'Имя', value = '', required = true) {
        super(className);
        this[Symbol.toStringTag] = 'inputField';

        this.html = 
            `<div class="text-field ${this.className}">` +
                `<label for="${id}">${label}</label>` +
                `<input type="text" id="${id}" ${required ? 'required' : ''} value="${value}">` +
            '</div>';
    }

    render(parent) {
        super.render(parent)

        this.label = this.object.find('label');
        this.input = this.object.find('input');
    }

    setIds(id) {
        this.label.attr('for', id);
        this.input.attr('id', id);
    }

    setLabelText(value) {
        this.label.text(value);
    }

    setInputValue(value) {
        this.input.val(value);
    }

    get value() {
        return this.input.val();
    }
}

class TextArea extends InputField {
    constructor(className, controls = []) {
        super(className);
        this[Symbol.toStringTag] = 'textArea';

        this.controls = controls;

        this.html = 
            `<div class="text-field ${this.className}">` +
                '<label for="username">Имя</label>' +
                '<div class="text-field-controls"></div>' +
                '<textarea type="text" id="username" required></textarea>' +
            '</div>';
    }

    renderControls() {
        this.controls.forEach(c => {
            c.parent = this;
            c.render(this.controlsObject);
        });
    }

    render(parent) {
        super.render(parent);

        this.input = this.object.find('textarea');
        this.controlsObject = this.object.find('.text-field-controls');
    }
}

class Button extends CustomWindow {
    constructor(className, value = '') {
        super(className);
        this[Symbol.toStringTag] = 'button';

        this.html = `<div class="button-big ${className}">${value}</div>`;
    }
}

class CheckboxButton extends SingleCustomWindow {
    constructor(className, enabled = false) {
        super(className);
        this[Symbol.toStringTag] = 'checkboxButton';

        this.html = `<div class="button-big checkbox-button ${className}"></div>`;
        this.enabled = enabled;
    }
}

class SearchLine extends CustomWindow {
    constructor(className) {
        super(className);
        this[Symbol.toStringTag] = 'searchLine';

        this.html = 
            `<div class="search-line ${className}">` +
                '<input type="text" name="" id="" placeholder="Поиск">' +
            '</div>';
    }

    render(parent) {
        super.render(parent);

        this.input = this.object.find('input');
    }
}

class Label extends CustomWindow {
    constructor(className, text = '') {
        super(className);
        this[Symbol.toStringTag] = 'label';

        this.html = `<div class="label ${className}">${text}</div>`;
    }

    render(parent) {
        super.render(parent);
    }
}

class ObjectWrapper extends CustomWindow {
    constructor(className, children = []) {
        super(className);
        this[Symbol.toStringTag] = 'objectWrapper';

        this.html = `<div class="objects-wrapper ${className}"></div>`;
        this.children = children;
    }

    renderChildren(callback) {
        if (this.children.length > 0) {
            this.children.forEach(child => {
                child.parent = this;
                child.render(this.object);
                callback(child);
            });
        }
    }
}

class YesNoWindow extends CustomWindow {
    constructor(className, title = '', info = '', ) {
        super(className);
        this[Symbol.toStringTag] = 'YesNoWindow';
        const name = 'yes-no-window';

        this.children = [
            new Label(`${name}-title`, title),
            new Label(`${className}-info`, info),
            new ObjectWrapper(`${name}-controls`, [new Button(`${name}-yes`, 'Да'), new Button(`${name}-no`, 'Нет')])
        ];
    }

    render(parent) {
        this.object = new DataWindow(this.className, [], this.children);
        this.object.render(parent);
        this.object.renderChildren(child => {
            child.parent = this;
            switch(child.getType()) {
                case '[object objectWrapper]':
                    child.renderChildren(c => {});
                    break;
            }
        });

        this.yes = this.object.children[2].children[0].object;
        this.no = this.object.children[2].children[1].object;
    }

    destroy() {
        if (!$.isEmptyObject(this.object)) {
            this.object.destroy();
        }
    }
}

class FileInput extends CustomWindow {
    constructor(className) {
        super(className);
        this[Symbol.toStringTag] = 'fileInput';

        this.html = `<div class="fileInput-wrapper ${this.className}">
                        <input type="file" name="fileData" class="fileInput">
                    </div>`;
    }

    render(parent) {
        super.render(parent);

        this.input = this.object.find('input[type="file"]');
    }
}

class DropDownList extends CustomWindow {
    constructor(className, text = '') {
        super(className);
        this.defaultImg = "../../../public/IMG/dashboard/default_user.png";

        this.html = 
            `<div class="dropdown ${className}">
                <div class="dropdown-text">${text}</div>
                <div class="dropdown-img-wrapper">
                    <div class="dropdown-img">
                        <img src="../../../public/IMG/dashboard/default_user.png" alt="" srcset="">
                    </div>
                    <div class="arrow-img">
                        <img src="../public/IMG/header/arrow_down.png" alt="" srcset="">
                    </div>
                </div>
            </div>`;
    }

    render(parent) {
        super.render(parent);

        this.textField = this.object.find('.dropdown-text');
        this.image = this.object.find('.dropdown-img > img');
    }

    set text(value) {
        this.textField.text(value);
    }
}

class PageLoader extends CustomWindow {
    constructor(className, children = []) {
        super(className);
        
        this.children = children;
        this.html = 
            `<div class="page-loader ${this.className}">`+
                `<div class="page-loader-overlay ${this.className}-overlay">`+

                '</div>' +
            '</div>';
    }

    render(parent) {
        super.render(parent);

        this.wrapper = this.object.find('.page-loader-overlay');
    }

    renderChildren(callback) {
        if (this.children.length > 0) {
            this.children.forEach(child => {
                child.parent = this;
                child.render(this.wrapper);
                callback(child);
            });
        }
    }

    hide(callback) {
        this.object.animate({'opacity': 0}, 300, () => callback(this))
    }
}

class Image extends CustomWindow {
    constructor(className, src = '') {
        super(className);

        this.html = `<img class="image-widget ${this.className}" src=${src}>`
    }

    render(parent) {
        super.render(parent);
    }

    setSrc(value) {
        this.object.attr('src', value);
    }
}

class Text extends CustomWindow {
    constructor(className, text = '') {
        super(className);

        this.html = `<div class="text-widget ${this.className}">${text}</div>`;
    }
}