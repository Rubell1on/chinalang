class request {
    static get(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                data,
                success: (data) => resolve(data),
                error: (error) => reject(error)
            });
        });
    }
}