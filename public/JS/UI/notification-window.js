class NotificationWindow extends CustomWindow {
    constructor(className, text, targetPos = 50) {
        super(className);
        this.html = `<div class="notification ${this.className}">${text}</div>`;
        this.targetPos = targetPos;
    }

    animationTime = 500;

    render() {
        super.render('');
        this.object.animate({top: `${this.targetPos}px`}, this.animationTime, 'swing', () => {
            setTimeout(() => {
                this.object.animate({top: '-100px'}, this.animationTime, 'swing', () => this.destroy());
            }, 5000);
        });
    }
}

class NotificationSuccess extends NotificationWindow {
    constructor(className, text, targetPos = 120) {
        super(className);
        this.html = `<div class="notification success ${this.className}">${text}</div>`;
        this.targetPos = targetPos;
    }
}

class NotificationError extends NotificationWindow {
    constructor(className, text, targetPos = 120) {
        super(className);
        this.html = `<div class="notification error ${this.className}">${text}</div>`;
        this.targetPos = targetPos;
    }
}