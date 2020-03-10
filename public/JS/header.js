async function renderHeader(user) {
    const apiKey = auth.get('apiKey');

    const children = [
        new Button('menu-button', '≡'),
        new ObjectWrapper('chinalang-logo-wrapper', [
            new StripImage('chinalang-logo').setImage('../../public/IMG/header/chinalang_label.png'),
            new StripImage('chinalang-icon').setImage('../../public/IMG/header/triangle_logo.png'),
        ]),
        new ObjectWrapper('header-controls', [
            new DropDownList('user-menu', user.username),
            new Button('contacts', 'Контакты')
        ])
    ];

    const header = new ObjectWrapper('header-wrapper', children);
    header.prepandRender('');
    header.renderChildren(child => {
        switch (child.className) {
            case 'menu-button':
                child.object.click(() => {
                    const controls = $('.controls');
                    const width = controls.css('width').toNumber();
                    const left = controls.css('left').toNumber();   
                    const value = left < 0 ? 0 : -width;
                    $('.controls').animate({'left': `${value}px`}, 200);                 
                });
                break;

            case 'chinalang-logo-wrapper':
                child.renderChildren(() => {});
                break;

            case 'header-controls':
                child.renderChildren(child => {
                    if (child.className === 'user-menu') {
                        // const photo = auth.get('photo');
                        child.image.attr('src', user && user.photo ? `data:image/*;base64,${user.photo}` : child.defaultImg);
                        child.object.click(() => {
                            const children = [
                                new Button('exit-button', 'Выход')
                            ];

                            const window = new DataWindow('user-menu', [], children);
                            window.render('');
                            window.renderChildren(button => {
                                if (button.className === 'exit-button') {
                                    button.object.click(() => auth.logOut());
                                }
                            }); 
                        });
                    }
                })
                break;
        }
    });
}