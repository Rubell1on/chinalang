const status = {
    occured: 'состоялось',
    canceled: 'отменено',
    missed: 'пропущено'
}

async function renderHistory(user) {
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/history?apiKey=${apiKey}`, {id: user.id})
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });
    
    if (res.status === 'success') {
        const role = auth.get('role');
        const data = res.response;

        if (role !== roles.student) {
            // const addHistory = new ObjectWrapper('add-history-wrapper', [
            //     new ObjectWrapper('add-history-label-wrapper', [
            //         new Label('add-history-label', 'Добавить историю занятий')
            //     ]),

            // ]);

            // pageWrapper.children.push(addHistory);
            await renderUsersTable();
        }

        const table = createHistoryTable(data, role);

        const historyWrapper = new ObjectWrapper('history-wrapper', [
            new ObjectWrapper('history-label-wrapper', [
                new Label('history-label', 'История занятий')
            ]),
            data.length ?  table
                        : new Label('have-no-classes-history', 'На данный момент нет истории занятий')
        ]);

        historyWrapper.render('content-window');
        historyWrapper.renderChildren(block => {
            switch (block.getType()) {
                case '[object objectWrapper]':
                    block.renderChildren(() => {});

                    break;
                
                case '[object table]':
                    block.renderChildren(strip => {
                            strip.renderChildren(() => {});
                    });

                    break;
            }
        })
    }

    function createHistoryTable(data, role) {
        let tableChildren = [
            new TableCell('table-status', 'Статус'),
            new TableCell('table-date', 'Дата'),
            new TableCell('table-change', 'Изменение'),
            new TableCell('table-balance', 'Баланс'),
        ];
    
        if (role !== roles.student) tableChildren.unshift(new TableCell('table-username', 'Пользователь'));
        else tableChildren.unshift(new TableCell('table-teacher', 'Преподаватель'));
    
        const header = new TableRow('history-table-header', tableChildren);
        
        const children = data.reduce((acc, el, i) => {
            const timeZone = moment.tz.guess();
            const date = moment.tz(el.date, timeZone).format('YYYY-MM-DD HH:mm');
            
            let stripChildren = [
                new TableCell('status', status[el.status]),
                new TableCell('date', date),
                new TableCell('change', el.change),
                new TableCell('balance', el.balance)
            ];
    
            if (role !== roles.student) stripChildren.unshift(new TableCell('studentName', el.studentName));
            else stripChildren.unshift(new TableCell('teacherName', el.teacherName));
    
            const strip = new TableRow(`history-strip-${i}`, stripChildren)
            acc.push(strip);
    
            return acc;
        }, [header]);
    
        return new Table('history-table', children);
    }
}

async function renderPage() {
    renderPageLoader();
    
    const response = await auth.getUserData();

    if (response) {
        const user = response;
        renderHistory(user);
        renderHeader(user);
        renderControls(user);
    } else {
        location.reload();
    }
}

renderPage();

async function renderUsersTable() {
    const controls = [
        new Label('users-label', 'Список пользователей'),
        new SearchLine('users-search')
    ];

    const userWindow = new DataTable('users', controls);
    userWindow.render('content-window');
    userWindow.renderControls();
    userWindow.updateData();
    userWindow.controls.find(c => c.isTypeOf('searchLine')).input.change(async () => {
        await userWindow.updateData();
    });

    userWindow.renderChildren(strip => {
        strip.text = strip.data.username;
        strip.onDataChange.addListener(async () => await userWindow.updateData());
    });
}

DataTable.prototype.updateData = async function() {
    this.removeChildren();
    const searchingValue = this.controls.find(c => c.isTypeOf('searchLine')).input.val();
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/users?apiKey=${apiKey}&role=${roles.student}`, { searchingValue });
    const data = res.response;
    const options = Object.entries(status).reduce((acc, el, i) => {
        acc[i] = {value: el[0], text: el[1]};

        return acc;
    }, []);
    
    this.children = data.map(row => new DataStrip(row.username, row, [
        new ObjectWrapper('history-strip-controls', [
            new Select('role-select', options), 
            new Button('add-history', 'Отметить')
        ])
    ]), []);
    this.renderChildren(strip => {
        strip.text.text(strip.data.username);
        const coursesStr = strip.data.courses;
        const userCourses = strip.data && coursesStr ? coursesStr : [];
        const photoLink = strip.data && strip.data.photo ? `data:image/*;base64,${strip.data.photo}` : strip.defaultImg;
        strip.icon.attr('src',  photoLink);
        strip.renderChildren(wrapper => {
            wrapper.renderChildren(child => {
                if (child.isTypeOf('button')) {
                    child.object.css('background', 'rgb(132, 188, 87)')
                    child.object.click(function(e) {
                        e.stopPropagation();
                        const confirmWindow = new YesNoWindow('confirm-history', 'Вы уверены?', 'Добавить запись в историю?')
                        confirmWindow.render('');
                        confirmWindow.yes.click(async () => {
                            const select = wrapper.children.find(c => c.isTypeOf('select'));
                            const value = select.getSelected();
                            const data = wrapper.parent.data;
                            const apiKey = auth.get('apiKey');
                            const res = await request.post(`/api/db/history?apiKey=${apiKey}`, JSON.stringify({data, status: value}))
                                .catch(e => {
                                    console.error(e);
                                    notificationController.error(e.error.responseText);
                                    confirmWindow.destroy();
                                })
                            
                            if (res.status === 'success') {
                                confirmWindow.destroy();
                                notificationController.success(res.response);
                            }
                        })
                        confirmWindow.no.click(() => confirmWindow.destroy());
                    });
                }
            });
        });
    });
}