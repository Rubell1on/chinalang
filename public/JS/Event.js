class CustomEvent {
    constructor() {
        this.events = [];
    }

    addListener(callback) {
        this.events.push(callback);
    }

    raise() {
        if (this.events.length !== 0) {
            this.events.forEach(f => f());
        }
    }

    removeListener(func) {

    }

    removeAllListeners() {
        this.events = [];
    }
}