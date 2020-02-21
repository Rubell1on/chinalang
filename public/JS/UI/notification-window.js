class NotificationController {
    constructor(start = 20, distance = 10, duration = 500) {
        this._children = [];
        this._startPos = start;
        this._distanceBetween = distance;
        this._duration = duration;
    }

    process(text) {
        const notification = new NotificationWindow(`notification-window-${this._children.length}`)
            .render()
            .setValue(text);

        this._initChildern(notification);

        return this;
    }

    success(text) {
        const notification = new NotificationSuccess(`notification-success-${this._children.length}`)
            .render()
            .setValue(text);

        this._initChildern(notification);

        return this;
    }

    error(text) {
        const notification = new NotificationError(`notification-error-${this._children.length}`)
            .render()
            .setValue(text);

        this._initChildern(notification);

        return this;
    }

    _initChildern(notification) {
        notification.onFinish.addListener(() => this._removeChild(notification.className));

        notification.onHiding.addListener(child => this._update(child));

        this._children.push(notification);
        const pos = this._children.reduce((acc, curr, i, arr) => {
            if (i !== 0) acc += curr.height;
            if (i < arr.length) acc += this._distanceBetween; 

            return acc;
        }, this._startPos);

        notification.animate(pos, this._duration);

    }

    _update(removedChild) {
        const height = removedChild.height;
        const children = this._children;

        for (let i = 1; i < children.length; i++) {
            const c = children[i];

            const currPos = c.object.css('top').toNumber();
            const newPos = children.length > 2 ? currPos - height - this._distanceBetween : currPos - height;
            c.object.animate({'top': `${newPos}px`}, this._duration, 'swing');
        }
    }

    _removeChild(className) {
        const index = this._children.findIndex(c => c.className === className);

        if (index !== -1) {
            return this._children.splice(index, 1);
        }
    }
}

class NotificationWindow extends CustomWindow {
    constructor(className, text = '') {
        super(className);
        this.text = text;
        this.html = `<div class="notification ${this.className}">${this.text}</div>`;
        this.onFinish = new CustomEvent();
        this.onHiding = new CustomEvent();
    }

    render() {
        super.render('');
        this.height = this.object.css('height').toNumber();

        return this;
    }

    setValue(value) {
        if(this && this.object) {
            this.object.text(value);
        } else {
            this.text = value;
        }

        this.height = this.object.css('height').toNumber();

        return this;
    }

    animate(targetPos, duration = 500) {
        this.object.animate({top: `${targetPos}px`}, duration, 'swing', () => {
            setTimeout(() => {
                this.onHiding.raise(this);
                this.object.animate({top: `-${this.height}px`}, duration, 'swing', () => {
                    this.onFinish.raise();
                    this.destroy();
                });
            }, 5000);
        });
    }
}

class NotificationSuccess extends NotificationWindow {
    constructor(className, text = '') {
        super(className, text);
        this.html = `<div class="notification success ${this.className}">${this.text}</div>`;
    }
}

class NotificationError extends NotificationWindow {
    constructor(className, text = '') {
        super(className, text);
        this.html = `<div class="notification error ${this.className}">${text}</div>`;
    }
}

const notificationController = new NotificationController();