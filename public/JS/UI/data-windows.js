class DataTable extends SingleCustomWindow {
    constructor(className, controls = [], children = []) {
        super(className);
        this[Symbol.toStringTag] = 'dataTable';
        
        this.controlsWrapper = `${this.spacedClassName}-controls-wrapper`;
        this.html = 
            `<div class="data-window ${this.spacedClassName}">` +
                `<div class="${this.controlsWrapper}"></div>` +
                `<div class="data-wrapper ${this.spacedClassName}-data-wrapper"></div>` + 
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

    renderControls(callback) {
        if (this.controls.length > 0) {
            this.controls.forEach(c => {
                c.parent = this;
                c.render(this.controlsWrapper);
                callback(c);
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
            `<div class="data user data-strip ${this.spacedClassName}">` +
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

    set image(value) {
        this.icon.attr('src', value);
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
            `<div class="overlay-window-background ${this.spacedClassName}-background">` +
            `<div class="overlay-window ${this.spacedClassName}">` +
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

        $(`.${this.spacedClassName}-background`)
            .click(() => this.destroy())
            .find(`.${this.spacedClassName}`)
            .click((e) => e.stopPropagation());
    }

    destroy() {
        const object = $(`.${this.spacedClassName}-background`);
        if (!$.isEmptyObject(object)) {
            $(`.${this.spacedClassName}-background`).remove();
        }
    }
}

class InputField extends CustomWindow {
    constructor(className, id = 'username', label = 'Имя', value = '', required = true, readonly = false) {
        super(className);
        this[Symbol.toStringTag] = 'inputField';

        this.html = 
            `<div class="text-field ${this.spacedClassName}">` +
                `<label for="${id}">${label}</label>` +
                `<input type="text" id="${id}" ${required ? 'required' : ''} ${readonly ? 'readonly' : ''} value="${value}">` +
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
            `<div class="text-field ${this.spacedClassName}">` +
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
        this.label = this.object.find('label');
    }
}

class Button extends CustomWindow {
    constructor(className, value = '') {
        super(className);
        this[Symbol.toStringTag] = 'button';

        this.html = `<div class="button-big ${this.spacedClassName}">${value}</div>`;
    }
}

class CheckboxButton extends SingleCustomWindow {
    constructor(className, enabled = false) {
        super(className);
        this[Symbol.toStringTag] = 'checkboxButton';

        this.html = `<div class="button-big checkbox-button ${this.spacedClassName}"></div>`;
        this.enabled = enabled;
    }
}

class SearchLine extends CustomWindow {
    constructor(className) {
        super(className);
        this[Symbol.toStringTag] = 'searchLine';

        this.html = 
            `<div class="search-line ${this.spacedClassName}">` +
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

        this.html = `<div class="label ${this.spacedClassName}">${text}</div>`;
    }

    render(parent) {
        super.render(parent);
    }
}

class ObjectWrapper extends CustomWindow {
    constructor(className, children = []) {
        super(className);
        this[Symbol.toStringTag] = 'objectWrapper';

        this.html = `<div class="objects-wrapper ${this.spacedClassName}"></div>`;
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
    constructor(className, title = '', info = '') {
        super(className);
        this[Symbol.toStringTag] = 'YesNoWindow';
        const name = 'yes-no-window';

        this.children = [
            new Label(`${name}-title`, title),
            new Label(`${this.spacedClassName}-info`, info),
            new ObjectWrapper(`${name}-controls`, [new Button(`${name}-yes`, 'Да'), new Button(`${name}-no`, 'Нет')])
        ];
    }

    render(parent) {
        this.object = new DataWindow(this.spacedClassName, [], this.children);
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

        this.html = `<div class="fileInput-wrapper ${this.spacedClassName}">
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
        this[Symbol.toStringTag] = 'dropDownList';
        this.defaultImg = "../../../public/IMG/dashboard/default_user.png";

        this.html = 
            `<div class="dropdown ${this.spacedClassName}">
                <div class="dropdown-text-wrapper">
                    <div class="dropdown-text">${text}</div>
                </div>
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
        this[Symbol.toStringTag] = 'pageLoader';
        
        this.children = children;
        this.html = 
            `<div class="page-loader ${this.spacedClassName}">`+
                `<div class="page-loader-overlay ${this.spacedClassName}-overlay">`+

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
        this[Symbol.toStringTag] = 'image';

        this.html = `<img class="image-widget ${this.spacedClassName}" src=${src}>`
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
        this[Symbol.toStringTag] = 'text';

        this.html = `<div class="text-widget ${this.spacedClassName}">${text}</div>`;
    }
}

class PriceBlock extends CustomWindow {
    constructor(className) {
        super(className);

        this._classesCount = 0;
        this._newPrice = 0;
        this._oldPrice = 0;
        this._oldTotal = 0;
        this._newTotal = 0;
        this._benefit = 0;
        this._discount = 0;
    }

    setClasses(count) {
        this._classesCount = count;

        return this;
    }

    getClasses() {
        return this._classesCount;
    }

    setNewPrice(value) {
        this._newPrice = value;

        return this;
    }

    getNewPrice() {
        return this._newPrice;
    }

    setOldPrice(value) {
        this._oldPrice = value;

        return this;
    }

    getOldPrice() {
        return this._oldPrice;
    }

    setOldTotal(value) {
        this._oldTotal = value;

        return this;
    }

    getOldTotal() {
        return this._oldTotal;
    }

    setNewTotal(value) {
        this._newTotal = value;

        return this;
    }

    getNewTotal() {
        return this._newTotal;
    }

    setDiscount(value) {
        this._discount = value;

        return this;
    }

    getDiscount() {
        return this._discount;
    }

    setBenefit(value) {
        this._benefit = value;

        return this;
    }

    render(parent) {
        this.html = `
            <div class="objects-wrapper info-blocks ${this.spacedClassName}">
                <div class="label classes-label">${this._classesCount} занятий</div>
                <div class="label new-price">${this._newPrice} руб/урок</div>
                <div class="label old-price">${this._oldPrice} руб/урок</div>
                <div class="objects-wrapper buy-classes">
                    <div class="label new-total-price">${this._newTotal} руб</div>
                    <div class="label old-total-price">${this._oldTotal} руб</div>
                </div>
                <div class="label benefit">Выгода ${this._benefit} руб</div>
                <div class="label discount">${this._discount}% скидка</div>
            </div>
        `;

        super.render(parent);
    }
}

class StripMenu extends CustomWindow {
    constructor(className, children = []) {
        super(className);
        this[Symbol.toStringTag] = 'stripMenu';

        this.children = children;
    }

    render(parent) {
        this.html = `<div class="menu-strip ${this.spacedClassName}"></div>`;

        super.render(parent);

        return this;
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

class StripSeparator extends CustomWindow {
    constructor(className, text = '') {
        super(className);
        this[Symbol.toStringTag] = 'stripSeparator';

        this._textValue = text;
    }

    setText(value) {
        if (this.object) {
            this._textObject.text(value);
        } else {
            this._textValue = value;
        }

        return this;
    }

    render(parent) {
        this.html = 
            `<div class="strip-separator ${this.spacedClassName}">
                <!-- <div class="icon">
                    <img src="../../public/IMG/dashboard/users.png" alt="" srcset="">
                </div> -->
                <div class="text">${this._textValue}</div>
            </div>`;

        super.render(parent);

        this._textObject = this.object.find('.text');

        return this;
    }
}

class StripButton extends CustomWindow {
    constructor(className, text = '', image = '') {
        super(className, text);
        this[Symbol.toStringTag] = 'stripButton';
        
        this._textValue = text;
        this._imageValue = image;
    }

    setText(value) {
        if (this.object) {
            this._textObject.text(value);
        } else {
            this._textValue = value;
        }

        return this;
    }

    setImage(value) {
        if (this.object) {
            this._imageObject.attr('src', value);
        } else {
            this._imageValue = value;
        }

        return this;
    }

    render(parent) {
        const imgTemp = 
            `<div class="icon">
                <img src="${this._imageValue}" alt="" srcset="">
            </div>`;

        this.html = 
            `<div class="strip-button ${this.spacedClassName}">
                ${this._imageValue ? imgTemp : ''}
                <div class="text">${this._textValue}</div>
            </div>`;

        super.render(parent);

        this._textObject = this.object.find('.text');
        this._imageObject = this.object.find('.icon > img');

        return this;
    }
}

class StripImage extends CustomWindow {
    constructor(className) {
        super(className);
        this[Symbol.toStringTag] = 'stripImage';
    }

    setImage(value) {
        if (this.object) {
            this._imageObject.attr('src', value);
        } else {
            this._imageValue = value;
        }

        return this;
    }

    render(parent) {
        this.html = 
            `<div class="strip-image strip-logo ${this.spacedClassName}">
                <img src="${this._imageValue}" alt="" srcset="">
            </div>`;

        super.render(parent);

        this._imageObject = this.object.find('img');
    }
}

class Table extends CustomWindow {
    constructor(className, children = []) {
        super(className);
        this[Symbol.toStringTag] = 'table';

        this.children = children;
        this.html = `<table class="table-wrapper ${this.spacedClassName}"><tbody></tbody></table>`;
    }

    render(parent) {
        super.render(parent);

        this.body = this.object.find('tbody');
    }

    renderChildren(callback) {
        if (this.children.length > 0) {
            this.children.forEach(child => {
                child.parent = this;
                child.render(this.body);
                callback(child);
            });
        }
    }
}

class TableRow extends CustomWindow {
    constructor(className, children = []) {
        super(className);
        this[Symbol.toStringTag] = 'tableRow';

        this.children = children;
        this.html = `<tr class="table-row ${this.spacedClassName}"></tr>`;
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


class TableCell extends CustomWindow {
    constructor(className, text = '') {
        super(className);
        this[Symbol.toStringTag] = 'tableCell';

        this.html = `<td class="table-cell ${this.spacedClassName}">${text}</td>`;
    }
}

class Select extends CustomWindow {
    constructor(className, children = []) {
        super(className);
        this[Symbol.toStringTag] = 'select';

        this.html = `<select class="select ${this.spacedClassName}"></select>`;
        this.children = children;
    }

    render(parent) {
        super.render(parent);

        this.children.forEach((c, i) => {
            if (c && c.getType ? true : false) {
                c.render(this.object);
                c.parent = this;  
            } else {
                const option = new SelectOption(`${c.value}-${i}`, c);
                option.render(this.object);
            }
        })
    }

    getSelected() {
        return this.object.val();
    }
}

class SelectOption extends CustomWindow {
    constructor(className, data = {}) {
        super(className);
        this[Symbol.toStringTag] = 'selectOption';
        
        this.data = data;
        this.html = `<option class="option ${this.spacedClassName}" value="${this.data && this.data.value ? this.data.value : ''}">${this.data && this.data.text ? this.data.text : ''}</option>`;
    }
}

class Link extends CustomWindow {
    constructor(className, href = '', children = []) {
        super(className);
        this[Symbol.toStringTag] = 'link';
        this._href = href;

        this.children = children;
    }

    render(parent) {
        this.html = `<a class=${this.spacedClassName} href=${this.href}></a>`;
        super.render(parent);
    }

    set href(value) {
        this._href = value;
    }

    get href() {
        return this._href;
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