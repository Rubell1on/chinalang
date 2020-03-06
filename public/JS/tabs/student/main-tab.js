async function renderMain(user) {
    const page = new DataTable('main-table');
    const courses = user.courses;

    let userCourse;
    let userClass;

    if (courses.length) {
        const currCourse = peekBack(courses);

        const apiKey = auth.get('apiKey');
        const res = await request.get(`/api/db/courses?apiKey=${apiKey}&id=${currCourse.id}`)
            .catch(e => {
                console.error(e);
                notificationController.error(e.error.responseText);
            });
        
        if (res.status === 'success') {
            userCourse = res.response[0];
            userClass = peekBack(userCourse.classes);
        }
    }

    const temp = Object.keys(userCourse === undefined ? {} : userCourse);

    const infoBlock = createInfoBlock();
    page.children.push(infoBlock);

    const balanceBlock = createBalanceBlock();
    const weeklyWordBlock = createWeeklyWordBlock();

    const content = new ObjectWrapper('content-block-wrapper', [
        balanceBlock,
        weeklyWordBlock
    ])

    page.children.push(content);
    
    page.render('content-window');
    page.renderChildren(block => {
        block.renderChildren(blockChild => {
            switch (blockChild.getType()) {
                case '[object objectWrapper]':
                    blockChild.renderChildren(child => {
                        if (child.isTypeOf('objectWrapper')) child.renderChildren(() => {});
                    });

                    break;
                
                case '[object stripMenu]':
                    blockChild.renderChildren(child => {
                        if (child.isTypeOf('button')) child.object.click(() => location.href = `${location.origin}/purchase`);
                        });
                    break;
            }
        });
    });
    
    function createInfoBlock() {
        return new ObjectWrapper('info-block', [
            new Label('greetings-label', `你好, ${user.username}`),
            new Label('current-course-label', temp.length ? `Текущий курс: ${userCourse.name}` : 'Вы пока не подписаны на курсы'),
            new Label('next-meeting-label', temp.length ? 'Следующее занятие<br><b>01.03.2020</b>' : ''),
            new Label('current-class-label', userClass && userClass.name ? userClass.name : 'По поводу уроков напишите вашему преподавателю'),
        ]);
    }

    function createBalanceBlock() {
        return new StripMenu('classes-data', [
            new StripSeparator('classes-left', 'Баланс занятий'),
            new StripButton('w-russian', `С русским учителем: ${user.classesWRussian}`),
            new StripButton('w-native', `С носителем языка: ${user.classesWNative}`),
            new Button('buy-classes', 'Пополнить')
        ]);
    }

    function createWeeklyWordBlock() {
        return new ObjectWrapper('weekly-word-block', [
            new ObjectWrapper('weekly-label-wrapper', [
                new Label('weekly-label', 'Слово недели')
            ]),
            new Text('weekly-text', '你好<br>Привет')
        ]);
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