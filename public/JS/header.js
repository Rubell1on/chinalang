async function render() {
    const username = localStorage.getItem('username');
    const children = [
        new Button('menu-button', '≡'),
        new DropDownList('user-menu', username)
    ];

    const header = new ObjectWrapper('header-wrapper', children);
    header.prepandRender('');
    header.renderChildren(child => {
        switch (child.className) {
            case 'menu-button':
                child.object.click(() => {
                    const controls = $('.controls');
                    const temp = controls.css('left');
                    const currValue = Number(temp.substr(0, temp.length-2));
    
                    const newValue = currValue < 0 ? 0 : -250;
    
                    $('.controls').animate({'left': `${newValue}px`}, 200);                 
                });
                break;

            case 'user-menu':
                child.object.click(() => {
                    const children = [
                        new Button('user-settings', 'Настройки'),
                        new Button('exit-button', 'Выход')
                    ]
                    const window = new DataWindow('user-menu', [], children);
                    window.render('');
                    window.renderChildren(button => {
                        if (button.className === 'exit-button') {
                            button.object.click(() => {
                                localStorage.removeItem('apiKey');
                                localStorage.removeItem('username');
                                location.href = `${location.origin}/`;
                            })
                        }
                    });
                    console.log(''); 
                });
                break;
        }
    });
}

render();