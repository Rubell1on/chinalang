String.prototype.isEmpty = function() {
    return !this.trim();
}

String.prototype.toNumber = function() {
    return Number(this.match(/-?\d*/)[0]);
}

String.prototype.decrease = function() {
    return this.replace(/[ .,&?*$;#@\(\)]/g, '');
}

function peekBack (array) {
    const len = array.length;
    return len ? array[len - 1] : undefined;
}

location.getQuery = function() {
    return this.search.substr(1).split('&').reduce((acc, curr) => {
        const temp = curr.split('=');
        const key = temp[0];
        const num = Number(temp[1]);
        const value = isNaN(num) ? temp[1] : num ;
        acc[key] = value;

        return acc;
    }, {});
};

function randomInt(maxValue) {
    return Math.floor(Math.random() * Math.floor(maxValue));
}

function diff(first, second) {
    return Object.entries(second).reduce((acc, curr) => {
        const key = curr[0];
        const value = curr[1];

        if (first[key] !== value) acc[key] = value;

        return acc;
    }, {})
}

//
function renderPageLoader() {
    const pageLoader = new PageLoader('user-tab-loader', [
        new Label('loader-label', 'Идет загрузка страницы!'),
        new Image('loader-image', '../../public/IMG/dashboard/spiner.gif')
    ]);
    pageLoader.render('');
    pageLoader.renderChildren(() => {});   
    
    $(window).on('load', () => setTimeout(() => pageLoader.hide(self => self.destroy()), 500));
}

class Enum {
    constructor() {
        this.object = {};
        this.startFrom = 1;
        let startValue = 0;

        if (arguments.length > startValue) {
            for (let i = startValue, value = this.startFrom; i < arguments.length; i++, value++) {
                this.object[arguments[i]] = arguments[i];
            }
        }

        return this.object;
    }
}

const roles = new Enum('admin', 'teacher', 'native_teacher', 'student');

location.on = function(event, callback) {
    const query = this.getQuery();
    const fullQuery = Object.entries(query);
    const targetQuery = fullQuery.find(q => q[0] === event);
    if (targetQuery) {
        const target = {};
        target[targetQuery[0]] = targetQuery[1];
        callback(target, query);
    }
}

function typeOf(object) {
    return {}.toString.call(object);
}

function isTypeOf(object, value) {
    return {}.toString.call(object).includes(value);
}