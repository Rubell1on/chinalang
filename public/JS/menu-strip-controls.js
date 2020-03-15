const className = 'menu-strip';
const k = 'apiKey';
const data = ['apiKey', 'role'].reduce((acc, key) => {
    const value = auth.get(key);

    if (value) acc[key] = auth.get(key);

    return acc;
}, {});

async function renderControls(user) {
    const parent = 'controls';

    const headerTemplate = [
        new Link('chinalang-link', location.origin, [
            new ObjectWrapper('logo-wrapper', [
                new StripImage('chinalang-logo').setImage('../../public/IMG/header/chinalang_label.png'),
                new StripImage('chinalang-logo').setImage('../../public/IMG/header/triangle_logo.png')
            ])
        ]),
        new StripSeparator('tabs-separator', 'Личный кабинет'),
    ];

    const bodyTemplate = [
        new StripButton('profile-tab', 'Мой профиль', '../../public/IMG/dashboard/course.png'),
        new StripButton('users-tab', 'Пользователи', '../../public/IMG/dashboard/users.png'),
        new StripButton('courses-tab', 'Курсы', '../../public/IMG/dashboard/course.png'),
        new StripButton('files-tab', 'Файлы', '../../public/IMG/dashboard/files.png'),
        new StripButton('history-tab', 'История занятий', '../../public/IMG/dashboard/history.png'),
        new StripButton('blog-tab', 'Блог', '../../public/IMG/dashboard/blog.png')
    ]

    let children = {
        student: [
            ...headerTemplate,
            new StripButton('main-tab', 'Главная', '../../public/IMG/dashboard/course.png'),
            new StripButton('profile-tab', 'Мой профиль', '../../public/IMG/dashboard/course.png'),
            new StripButton('courses-tab', 'Курсы', '../../public/IMG/dashboard/course.png'),
            new StripButton('history-tab', 'История занятий', '../../public/IMG/dashboard/history.png'),
        ],
        admin: [
            ...headerTemplate,
            ...bodyTemplate
        ],
        teacher: [
            ...headerTemplate,
            ...bodyTemplate
        ],
        nativeTeacher: [
            ...headerTemplate,
            ...bodyTemplate
        ]
    };

    const stripMenu = new StripMenu('page-tabs', children[data.role])
        .render(parent)
        .renderChildren(c => {
            if (c.isTypeOf('link')) {
                c.renderChildren(child => child.renderChildren(() => {}));
            } else {
                switch(c.className) {
                    case 'main-tab':
                        c.object.click(() => location.href = `${location.origin}/${ data.role === 'student' ? 'lk' : 'dashboard' }/main`);
                        break;
    
                    case 'profile-tab':
                        c.object.click(() => location.href = `${location.origin}/profile`);
                        break;
    
                    case 'users-tab':
                        c.object.click(() => location.href = `${location.origin}/dashboard/users`);
                        break;
    
                    case 'courses-tab':
                        c.object.click(() => location.href = `${location.origin}/${ data.role === 'student' ? 'lk' : 'dashboard' }/courses`);
                        break;
                        
                    case 'files-tab':
                        c.object.click(() => location.href = `${location.origin}/dashboard/files`);
                        break;
    
                    case 'blog-tab':
                        c.object.click(() => location.href = `${location.origin}/blog`);
                        break;
    
                    case 'history-tab':
                        c.object.click(() => location.href = `${location.origin}/history`);
                        break;
                }
            }
        });
}
