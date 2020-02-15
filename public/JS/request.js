class request {
    static async get(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'GET',
                dataType: 'json',
                data,
                success: response => resolve(response),
                error: (error) => reject(error)
            });
        });
    }

    static async post(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'POST',
                dataType: 'json',
                data,
                success: response => resolve(response),
                error: (error) => reject(error)
            });
        });
    }
}