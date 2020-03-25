class request {
    static async get(url, data, processData = true) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'GET',
                contentType: 'Application/json',
                processData,
                data,
                success: (response, status, jqXHR) => resolve({ response, status }),
                error: (error, status, jqXHR) => reject({ error, status })
            });
        });
    }

    static async post(url, data, processData = true) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'POST',
                contentType: 'Application/json',
                processData,
                data,
                success: (response, status, jqXHR) => resolve({ response, status, jqXHR }),
                error: (error, status, jqXHR) => reject({ error, status, jqXHR })
            });
        });
    }

    static async put(url, data, processData = true) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'PUT',
                contentType: 'Application/json',
                processData,
                data,
                success: (response, status, jqXHR) => resolve({ response, status }),
                error: (error, status, jqXHR) => reject({ error, status })
            });
        });
    }

    static async delete(url, data, processData = true) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                type: 'DELETE',
                contentType: 'Application/json',
                processData,
                data,
                success: (response, status, jqXHR) => resolve({ response, status }),
                error: (error, status, jqXHR) => reject({ error, status })
            });
        });
    }
}