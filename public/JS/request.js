class request {
    static async get(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'GET',
                // dataType: 'json',
                data,
                success: (response, status, jqXHR) => resolve({ response, status }),
                error: (error, status, jqXHR) => reject({ error, status })
            });
        });
    }

    static async post(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'POST',
                // dataType: 'json',
                data,
                success: (response, status, jqXHR) => resolve({ response, status }),
                error: (error, status, jqXHR) => reject({ error, status })
            });
        });
    }

    static async put(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'PUT',
                // dataType: 'json',
                data,
                success: (response, status, jqXHR) => resolve({ response, status }),
                error: (error, status, jqXHR) => reject({ error, status })
            });
        });
    }

    static async delete(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'DELETE',
                // dataType: 'json',
                data,
                success: (response, status, jqXHR) => resolve({ response, status }),
                error: (error, status, jqXHR) => reject({ error, status })
            });
        });
    }
}