String.prototype.isEmpty = function() {
    return !this.trim();
}

String.prototype.toNumber = function() {
    return Number(this.match(/-?\d*/)[0]);
}

function randomInt(maxValue) {
    return Math.floor(Math.random() * Math.floor(maxValue));
}