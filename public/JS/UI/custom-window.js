class SingleCustomWindow {
    constructor(className) {
        this[Symbol.toStringTag] = 'singleCustomWindow';
        this._className = className;
        this.html = '';
    }

    get className() {
        return isTypeOf(this._className, 'String') ? this._className : this._className.join('.');
    }

    get spacedClassName() {
        return isTypeOf(this._className, 'String') ? this._className : this._className.join(' ');
    }

    set className(value) {
        this._className = value;
    }

    prepandRender(parent = '') {
        
        if (!this.isExisting()) {
            if (typeof parent === 'string') {
                if (parent.isEmpty()) {
                    this.object = $('body').prepand(this.html).find(`.${this.className}`); 
                } else {
                    this.object = $(`.${parent}`).prepand(this.html).find(`.${this.className}`);
                }
            } else this.object = $(parent).prepand(this.html).find(`.${this.className}`);
        } else {
            console.log(`${this.className} already created!`)
        }
    }

    render(parent = '') {
        
        if (!this.isExisting()) {
            if (typeof parent === 'string') {
                if (parent.isEmpty()) {
                    this.object = $('body').append(this.html).find(`.${this.className}`); 
                } else {
                    this.object = $(`.${parent}`).append(this.html).find(`.${this.className}`);
                }
            } else this.object = $(parent).append(this.html).find(`.${this.className}`);
        } else {
            console.log(`${this.className} already created!`)
        }
    }

    isExisting() {
        const object = $(`.${this.className}`);

        return $.isEmptyObject(object) ? true : false;
    }

    destroy() {
        if (!$.isEmptyObject(this.object)) {
            this.object.remove();
        }
    }

    isTypeOf(type) {
        return this.toString().includes(type);
    }

    getType() {
        return this.toString();
    }

    isClassOf(className) {
        return this.className === className ? true : false;
    }
}

class CustomWindow {
    constructor(className) {
        this[Symbol.toStringTag] = 'customWindow';
        this._className = className;
        this.html = '';
    }

    get className() {
        return isTypeOf(this._className, 'String') ? this._className : this._className.join('.');
    }

    get spacedClassName() {
        return isTypeOf(this._className, 'String') ? this._className : this._className.join(' ');
    }

    set className(value) {
        this._className = value;
    }

    prepandRender(parent) {
        if (typeof parent === 'string') {
            if (parent.isEmpty()) {
                this.object = $('body').prepend(this.html).find(`.${this.className}`); 
            } else {
                this.object = $(`.${parent}`).prepend(this.html).find(`.${this.className}`);
            }
        } else this.object = $(parent).prepend(this.html).find(`.${this.className}`);
    }

    render(parent) {
        if (typeof parent === 'string') {
            if (parent.isEmpty()) {
                this.object = $('body').append(this.html).find(`.${this.className}`); 
            } else {
                this.object = $(`.${parent}`).append(this.html).find(`.${this.className}`);
            }
        } else this.object = $(parent).append(this.html).find(`.${this.className}`);
    }

    isExisting() {
        const object = $(`.${this.className}`);

        return $.isEmptyObject(object) ? true : false;
    }

    destroy() {
        if (!$.isEmptyObject(this.object)) {
            this.object.remove();
        }
    }

    isTypeOf(type) {
        return this.toString().includes(type);
    }

    getType() {
        return this.toString();
    }

    isClassOf(className) {
        return this.className === className ? true : false;
    }
}