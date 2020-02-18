module.exports = {
    Node: class Node {
        [Symbol.toStringTag] = 'node'

        constructor(value) {
            this.value = value;
            this.children = [];
            this.parent = null;
        }

        addChild(child) {
            const type = this.getType();
            if (child.isTypeOf(type)) {
                child.parent = this;
                this.children.push(child);
            }

            return this;
        }

        isTypeOf(type) {
            return this.toString().includes(type);
        }

        getType() {
            return this.toString();
        }

        find(value) {
            if (this.value === value) return this;
            else {
                if (this.children.length) {
                    for (let i = 0; i < this.children.length; i++) {
                        const child = this.children[i];
                        if (child.value === value) return child;
                    }
    
                    for (let i = 0; i < this.children.length; i++) {
                        const child = this.children[i];
                        const node = child.find(value)
                        if (node) return node;
                    }
                    
                    return null;                    
                } else {
                    return null
                }
            }
        }
    }
}

module.exports.Node.prototype.getFullPath = function(separator) {
    let path = '';

    let node = this;

    while (node !== null) {
        path = path == '' ? `${node.value}${path}` : `${node.value}${separator}${path}`;
        node = node.parent;
    }

    return path;
}