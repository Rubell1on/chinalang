class SingleCustomWindow {
    constructor(className) {
        this.className = className;
    }

    html = ''

    render(parentName) {
        if (!this.isExisting()) {
            if (parentName.isEmpty()) {
                this.object = $('body').prepend(this.html).find(`.${this.className}`); 
            } else {
                this.object = $(`.${parentName}`).prepend(this.html).find(`.${this.className}`);
            }
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
}

class CustomWindow {
    constructor(className) {
        this.className = className;
    }

    html = ''

    render(parentName) {
        if (parentName.isEmpty()) {
            this.object = $('body').prepend(this.html).find(`.${this.className}`); 
        } else {
            this.object = $(`.${parentName}`).prepend(this.html).find(`.${this.className}`);
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
}