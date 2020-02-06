class CustomWindow {
    constructor(className) {
        this.className = className;
    }

    html = ''

    render(parentName) {
        if (!this.isExisting()) {
            parentName.isEmpty() 
            ? $('body').prepend(this.html) 
            : $(`.${parentName}`).prepend(this.html);
        } else {
            console.log(`${this.className} already created!`)
        }
    }

    isExisting() {
        const object = $(`.${this.className}`);

        return $.isEmptyObject(object) ? true : false;
    }
}