class AuthController {
    constructor(keys = ['id', 'username', 'apiKey', 'role', 'photo']) {
        this.keys = keys;
    }

    async getUserData() {
        const apiKey = this.get('apiKey');
        const res = await request.get('/api/db/userData', { apiKey })
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });

        if (res.status === 'success') return res.response[0];
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

    async checkData() {
        const apiKey = this.get('apiKey');

        if (location.pathname !== '/') {
            if (!apiKey) this.logOut();
            else {
                const res = await request.get('/api/verify', { apiKey })
                    .catch(e => {
                        console.error(e);
                        this.logOut();
                    });
                
                if (res.status === 'success') {
                    const user = res.response[0];
                    if (user.role === 'student') {
                        if (location.pathname.includes('/dashboard/')) {
                            const l = location;
                            location.href = `${l.origin}/lk/courses`;
                        }
                    }
                }
            }
        }
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