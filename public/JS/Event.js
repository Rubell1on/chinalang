class CustomEvent {
    constructor() {
        this.events = [];
    }

    addListener(callback) {
        this.events.push(callback);
    }

    raise() {
        if (this.events.length !== 0) {
            this.events.forEach(f => f(arguments[0]));
        }
    }

    removeListener(ind) {
        if (ind >= 0  && ind < this.events.length) {
            return this.events.splice(ind, 1);
        }  
    }

    removeAllListeners() {
        this.events = [];
    }
}