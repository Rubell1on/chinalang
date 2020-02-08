module.exports = class Enum {
    constructor() {
        this.object = {};
        this.startFrom = 1;
        let startValue = 0;

        if (arguments.length > startValue) {
            for (let i = startValue, value = this.startFrom; i < arguments.length; i++, value++) {
                this.object[arguments[i]] = arguments[i];
            }
        }
    }
}