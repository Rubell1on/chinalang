class StripButton extends SingleCustomWindow {
    constructor(className, text, imgPath = '') {
        super(className);
        this.html = 
        `<div class="strip-button ${this.spacedClassName}">` +
            '<div class="icon">' +
                `<img src=${imgPath} alt="" srcset="">` +
            '</div>' +
            `<div class="text">${text}</div>` +
        '</div>';
    }

    render(parentName) {
        if (parentName.isEmpty()) {
            this.object = $('body').append(this.html).find(`.${this.className}`); 
        } else {
            this.object = $(`.${parentName}`).append(this.html).find(`.${this.className}`);
        }
    }
}

// const button = new StripButton('exit', 'выход').render('menu-strip');