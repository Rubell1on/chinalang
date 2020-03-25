DataTable.prototype.updateCoursesData = async function(source) {
    const colors = {
        subscribe: 'rgb(132, 188, 87)',
        unsubscribe: '#FB2267'
    }
    const userCourses = source.courses;
    this.removeChildren();
    const searchingValue = this.controls[1].input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/courses?apiKey=${apiKey}`, { searchingValue });
    const data = res.response;
    this.children = data.map(row => {
        const rowName = row.name.replace(/[ .,&?*$;@\(\)]/g, '');
        return new DataStrip(rowName, row);
    }, []);

    this.renderChildren(wChildren => {
        switch(wChildren.getType()) {
            case '[object dataStrip]':
                wChildren.text.text(wChildren.data.name);
                wChildren.object.click(async () => {
                    const apiKey = auth.get('apiKey');
                    const id = wChildren.data.id;
                    const l = location;
                    l.href = `${l.origin}/lk/courses?id=${id}`;
                });

                break;
            }
    });
}

async function submitCoursesData(sources, difference, callback) {
    const apiKey = auth.get('apiKey');
    notificationController.process('Данные отправлены на сервер!');
     const res = await request.put(`/api/db/userData?apiKey=${apiKey}`, JSON.stringify({sources, difference}))
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        })
    
    if (res.status === 'success') {
        notificationController.success(res.response);
        callback();
    }
}

CheckboxButton.prototype.click = function(course, userCourses) {
    let flag = true;

    if (this.enabled) {
        for (let i = 0; i < userCourses.length; i++) {
            if (userCourses[i].id === course.id) {
                userCourses.splice(i, 1);
                this.enabled = false;
                return -1;
            }
        }
    } else {
        for (let i = 0; i < userCourses.length; i++) {
            if (userCourses[i].id === course.id) {
                flag = false;
                break;
            }
        }

        if (flag) {
            userCourses.push({id: course.id, classes: []});
            this.enabled = true;
            return 1;
        }
    }
}

async function renderCoursesTable(user) {
    const controls = [
        new Label('window-label', 'Список курсов'),
        new SearchLine('courses-search')
    ];

    const coursesTable = new DataTable('courses-table', controls);
    coursesTable.wrapperClass = 'courses-wrapper';
    coursesTable.render('content-window');
    coursesTable.renderControls(() => {});
    coursesTable.updateCoursesData(user);
    coursesTable.controls.find(control => control.isTypeOf('searchLine')).input.change(async () => await coursesTable.updateCoursesData([]));
}

renderPage();

async function renderPage() {
    renderPageLoader();
    const response = await auth.getUserData();

    if (response) {
        const user = response;
        renderHeader(user);
        renderControls(user);

        renderCoursesTable(user);

        $('.courses-tab').addClass('strip-button-selected');
    } else {
        location.reload();
    }
}

