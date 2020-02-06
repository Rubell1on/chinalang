String.prototype.isEmpty = function() {
    return !this.trim();
}

function randomInt(maxValue) {
    return Math.floor(Math.random() * Math.floor(maxValue));
}