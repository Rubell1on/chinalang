class AuthController {
    constructor(keys = ['id', 'username', 'apiKey']) {
        this.keys = keys;
    }

    setData(object) {
        for (let i in object) {
            localStorage.setItem(i, object[i]);
        }
    }

    get(key) {
        return localStorage.getItem(key);
    }

    getData() {
        return this.keys.reduce((acc, key) => {
            acc[key] = localStorage.getItem(key);

            return acc;
        }, {});
    }

    checkData() {
        const data = this.getData();

        if (!data['apiKey'] && location.pathname !== '/') logOut();
    }

    logOut() {
        this.removeData();
        location.href = `${location.origin}/`;
    }

    removeData() {
        this.keys.forEach(key => localStorage.removeItem(key))
    }
}

const auth = new AuthController();
auth.checkData();