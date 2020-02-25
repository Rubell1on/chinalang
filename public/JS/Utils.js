String.prototype.isEmpty = function() {
    return !this.trim();
}

String.prototype.toNumber = function() {
    return Number(this.match(/-?\d*/)[0]);
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