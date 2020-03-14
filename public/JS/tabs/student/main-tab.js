async function renderMain(user) {
    const apiKey = auth.get('apiKey');
    const page = new DataTable('main-table');
    const courses = user.courses;

    let userCourse;
    let userClass;

    if (courses.length) {
        const currCourse = peekBack(courses);
        const res = await request.get(`/api/db/courses?apiKey=${apiKey}&id=${currCourse.id}`)
            .catch(e => {
                console.error(e);
                notificationController.error(e.error.responseText);
            });
        
        if (res.status === 'success') {
            userCourse = res.response[0];
            const currClass = currCourse.classes.length ? peekBack(currCourse.classes) : undefined;
            userClass = currClass && userCourse ? userCourse.classes.find(c => c.id === currClass.id) : undefined;
        }
    }

    const temp = Object.keys(userCourse === undefined ? {} : userCourse);

    const infoBlock = createInfoBlock();
    page.children.push(infoBlock);

    const balanceBlock = createBalanceBlock();
    const weeklyWordBlock = createWeeklyWordBlock();
    const instaBlock = await createInstaBlock();
    const bottomBlock = createBottomInfoBlock();

    const weeklyResponse = await request.get(`/api/db/blog?apiKey=${apiKey}`)
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });

    const content = new ObjectWrapper('content-block-wrapper', [
        balanceBlock,
        weeklyWordBlock
    ])

    page.children.push(...[
        content,
        instaBlock,
        bottomBlock
    ]);
    
    page.render('content-window');
    page.renderChildren(block => {
        block.renderChildren(blockChild => {
            switch (blockChild.getType()) {
                case '[object objectWrapper]':
                    if (blockChild.isClassOf('insta-scroll')) {
                        blockChild.renderChildren(child => {
                            if (child.isTypeOf('objectWrapper')) {
                                child.renderChildren(() => {});
                                child.object.click(() => {
                                    window.open(child.data.permalink, '_blank');
                                })
                            }
                        })
                    } else {
                        blockChild.renderChildren(child => {
                            if (child.isTypeOf('text')) {
                                if (weeklyResponse.status === 'success') {
                                    const data = weeklyResponse.response.length ? weeklyResponse.response[0].description : ''
                                    child.object.html(data);
                                    blockChild.object.append('<script src="../../../public/JS/image-loader.js"></script>');
                                }
                            }
                            else child.renderChildren(() => {});
                        });
                    }

                    break;
                
                case '[object stripMenu]':
                    blockChild.renderChildren(child => {
                        if (child.isTypeOf('button')) child.object.click(() => location.href = `${location.origin}/purchase`);
                        });
                    break;
            }
        });
    });

    function createBottomInfoBlock() {
        const text = 'Возникли вопросы по поводу расписания? Появилось желание поменять преподавателя? Не можешь найти материалы урока или просто хочешь поболтать?<br><b>Скорее напиши нам, мы всегда на связи!</b>';

        return new ObjectWrapper('bottom-info', [new Text('bottom-text', text)])
    }

    async function createInstaBlock() {
        const res = await request.get('/api/instaMedia')
            .catch(e => {
                console.error(e);
                notificationController.error(e.error.responseText);
            });

        if (res.status === 'success') {
            const data = res.response;
            const template = '<b>chinalang_ru</b>';
            const images = data.body.data.map((el, i) => {
                const maxLen = 67;
                const caption = el && el.caption && el.caption.length > maxLen ? el.caption.substr(0, maxLen) + '...' : el.caption + '...';
                const post = new ObjectWrapper(['insta-post', `insta-post-${i}`], [
                    new Image('insta-picture', el.media_url),
                    // new Text('insta-picture', el.caption)
                    new Text('insta-caption', caption ? `${template} ${caption}` : `${template} Тут должно быть описание картинки. Но по какой-то причине его нет:D`)
                ]);

                post.data = el;

                return post;
                
            });

            return new ObjectWrapper('insta-block', [
                new Label(['insta-block__label', 'header', 'gray'], 'Читайте наш InstaBlog'),
                new ObjectWrapper('insta-scroll', images)
            ])
        }        
    }
    
    function createInfoBlock() {
        const courseLink = userCourse && userCourse.id ? `<a href=${`/lk/courses?id=${userCourse.id}`}>${userCourse.name}</a>` : '';
        const classLink = userClass && userClass.id ? `<a href=${`/lk/courses?id=${userCourse.id}`}&classId=${userClass.id}>${userClass.name}</a>` : '';
        return new ObjectWrapper('info-block', [
            new Label('greetings-label', `你好, ${user && user.realname ? user.realname : user.username}`),
            new Label('current-course-label', courseLink ? `Текущий курс: ${courseLink}` : 'Вы пока не подписаны на курсы'),
            new Label('next-meeting-label', temp.length ? 'Следующее занятие<br><b>01.03.2020</b>' : ''),
            new Label('current-class-label', classLink ? classLink : 'По поводу уроков напишите вашему преподавателю'),
        ]);
    }

    function createBalanceBlock() {
        return new StripMenu('classes-data', [
            new StripSeparator(['classes-left', 'header'], 'Баланс занятий'),
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

        $('.main-tab').addClass('strip-button-selected');
    } else {
        location.reload();
    }
}

renderPage();