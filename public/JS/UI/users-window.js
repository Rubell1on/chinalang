class UsersWindow extends SingleCustomWindow {
    constructor(className, children = []) {
        super(className);
        this.wrapperClass = 'users-wrapper';
        this.html = 
            `<div class="users-window ${className}">` +
                '<div class="users-list">Список пользователей</div>' +
                '<div class="search-line">' +
                    '<input type="text" name="" id="" placeholder="Поиск">' +
                '</div>' +
                `<div class="${this.wrapperClass}">` + 
                '</div>';
        this.children = children;
    }

    removeChildren() {
        if (this.children.length > 0) {
            this.children.forEach(user => user.destroy());
            // this.children = [];
        }
    }

    renderChildren() {
        if (this.children.length > 0) {
            this.children.forEach(user => user.render(this.wrapperClass));
        }
    }

    async getData(data = {searchingValue: ''}) {
        return $.ajax({
            url: '/api/db/users',
            data: typeof data === 'object' ? data : { searchingValue: data },
            success: (data) => {
                this.children = data.map(row => {
                    return new UserStrip(row.username, row);
                }, []);
            },
            error: (error) => {
                const e = error.responseText;
                new NotificationError('error', e)
                console.error(e);
            }
        });
    }

    render(parentName) {
        super.render(parentName);
        this.searchField = $('.search-line > input');
        this.searchField.change(async () => {
            this.removeChildren();
            await this.getData(this.searchField.val());
            this.renderChildren();
        })
    }
}

class UserStrip extends CustomWindow {
    constructor(className, data) {
        super(className);
        this.data = data;
        this.html = 
            `<div class="user ${className}">` +
                '<div class="icon-wrapper">' +
                    '<div class="icon">' +
                        `<img src="${data && data.image ? data.image : "../../../public/IMG/dashboard/default_user.png"}" alt="" srcset="">` +
                    '</div>' +
                '</div>' +
                `<div class="text">${this.data.username}</div> ` +
            '</div>';
    }
}