const className = 'menu-strip';
const k = 'apiKey';
const data = ['apiKey', 'role'].reduce((acc, key) => {
    const value = auth.get(key);

    if (value) acc[key] = auth.get(key);

    return acc;
}, {});

// renderControls();

async function renderControls(user) {
    const parent = 'controls';
    const logo = new StripImage('chinalang-logo')
        .setImage('../../public/IMG/header/chinalang.png')
        .render(parent);

    const userData = new StripMenu('userdata', [
        new StripSeparator('userdata-separator', 'Пользователь'),
        // new StripSeparator('classes-left-separator', 'Баланс '),
        // new StripButton('classes-w-russian', 'Осталось занятий с русским преподавателем')
    ]);

    if (auth.get('role') === 'student') {
        // const apiKey = auth.get('apiKey');
        // const res = await request.get(`/api/db/userData?apiKey=${apiKey}`)
        //     .catch(e => {
        //         console.log(e);
        //         notificationController.error(e.error.responseText);
        //     });
        // if (res.status === 'success') {
            // const user = res.response[0];

            const classesData = new StripMenu('classes-data', [
                new StripSeparator('classes-left', 'Баланс занятий'),
                new StripButton('w-russian', `С русским учителем: ${user.classesWRussian}`),
                new StripButton('w-native', `С носителем языка: ${user.classesWNative}`),
                new Button('buy-classes', 'Пополнить')
            ])
            .render(parent)
            .renderChildren(child => {
                if (child.isTypeOf('button')) child.object.click(() => location.href = `${location.origin}/purchase`);
            });
        // }
    }

    let children = {
        student: [
            new StripSeparator('tabs-separator', 'Вкладки'),
            new StripButton('courses-tab', 'Курсы', '../../public/IMG/dashboard/course.png'),
            new StripButton('history-tab', 'История занятий', '../../public/IMG/dashboard/history.png')
        ],
        admin: [
            new StripSeparator('tabs-separator', 'Вкладки'),
            new StripButton('users-tab', 'Пользователи', '../../public/IMG/dashboard/users.png'),
            new StripButton('courses-tab', 'Курсы', '../../public/IMG/dashboard/course.png'),
            new StripButton('files-tab', 'Файлы', '../../public/IMG/dashboard/files.png'),
            new StripButton('blog-tab', 'Блог', '../../public/IMG/dashboard/blog.png'),
            new StripButton('history-tab', 'История занятий', '../../public/IMG/dashboard/history.png')
        ]
    };

    const stripMenu = new StripMenu('page-tabs', children[data.role])
        .render(parent)
        .renderChildren(() => {});

        if (data.role === 'student') {
            $(`.${className} .main-tab`).click(() => location.href = `${location.origin}/lk/main`);
            $(`.${className} .courses-tab`).click(() => location.href = `${location.origin}/lk/courses`);
            $(`.${className} .history-tab`).css('opacity', '0.5');
        } else {
            $(`.${className} .users-tab`).click(() => location.href = `${location.origin}/dashboard/users`);
            $(`.${className} .courses-tab`).click(() => location.href = `${location.origin}/dashboard/courses`);
            $(`.${className} .files-tab`).click(() => location.href = `${location.origin}/dashboard/files`);
            $(`.${className} .blog-tab`).css('opacity', '0.5');
            // .click(() => location.href = `${location.origin}/dashboard/blog`);
            $(`.${className} .history-tab`).css('opacity', '0.5');
            // .click(() => location.href = `${location.origin}/dashboard/hystory`);
        }
}
