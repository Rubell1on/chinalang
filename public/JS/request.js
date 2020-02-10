class request {
    static async get(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'GET',
                data,
                success: (data) => resolve(data),
                error: (error) => reject(error)
            });
        });
    }

    static async post(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'POST',
                data,
                success: (data) => resolve(data),
                error: (error) => reject(error)
            });
        });
    }
}