async function renderMain(user) {
    const courses = user.courses;
    const currCourse = courses[courses.length-1];

    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/courses?apiKey=${apiKey}&id=${currCourse.id}`)
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });
    
    if (res.status === 'success') {
        const userCourse = res.response[0];
        const classesCount = currCourse.classes.length-1;
        const userClass = userCourse.classes[classesCount];
        const infoBlock = new ObjectWrapper('info-block', [
            new Label('greetings-label', `你好, ${user.username}`),
            new Label('current-course-label', `Текущий курс: ${userCourse.name}`),
            new Label('next-meeting-label', 'Следующее занятие<br><b>01.03.2020</b>'),
            new Label('current-class-label', userClass.name),
        ]);

        // const calendar = new ObjectWrapper('calendar-block', [
        //     new ObjectWrapper('daysWrapper')
        // ])

        const weeklyWord = new ObjectWrapper('weekly-word-block', [
            new ObjectWrapper('weekly-label-wrapper', [
                new Label('weekly-label', 'Слово недели')
            ]),
            new Text('weekly-text', '你好<br>Привет')
        ]);

        const page = new DataTable('main-table', [], [
            infoBlock,
            weeklyWord
        ])
        page.render('content-window');
        page.renderChildren(child => {
            child.renderChildren(child => {
                if (child.isTypeOf('objectWrapper'))
                    child.renderChildren(() => {});
            });
        });
    }
}

async function renderPage() {
    renderPageLoader();
    const response = await auth.getUserData();

    if (response) {
        const user = response;
        renderHeader(user);
        renderControls(user);

        renderMain(user);
    } else {
        location.reload();
    }
}

renderPage();