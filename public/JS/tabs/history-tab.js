const status = {
    occured: {
        text: 'состоялось',
        subtractValue: -1
    },
    canceled: { 
        text: 'отменено',
        subtractValue: 0
    },
    missed: { 
        text: 'пропущено',
        subtractValue: -1
    }
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

        if (role !== roles.student) await renderUsersTable();

        const table = createHistoryTable(data, role);

        const historyWrapper = new ObjectWrapper('history-wrapper', [
            new ObjectWrapper('history-label-wrapper', [
                new Label('window-label', 'История занятий')
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
                new TableCell('status', status[el.status].text),
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

        $('.history-tab').addClass('strip-button-selected');
    } else {
        location.reload();
    }
}

renderPage();

async function renderUsersTable() {
    const controls = [
        new Label('window-label', 'Список пользователей'),
        new SearchLine('users-search')
    ];

    const userWindow = new DataTable('users', controls);
    userWindow.render('content-window');
    userWindow.renderControls(() => {});
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
        const data = { value: el[0], text: el[1].text, subtractValue: el[1].subtractValue}
        const option = new SelectOption(`${el[0]}`, data);

        acc[i] = option;

        return acc;
    }, []);
    
    this.children = data.map((row, i)=> {
        const template = [
            new Select('status-select', options), 
            new Button('add-history', 'Отметить')
        ];

        if (auth.get('role') === roles.admin) template.unshift(new Select('role-select', [{ value: 'teacher', text: 'Рускоговорящий преподаватель' }, { value: 'nativeTeacher', text: 'Носитель языка' }]));

        return new DataStrip(row && row.realname ? `${translate(row.realname.decrease())}-${i}` : `${row.username.decrease()}-${i}`, row, [
            new ObjectWrapper('history-strip-controls', template)
        ])
    }, []);

    this.renderChildren(async strip => {
        const data = strip.data;
        strip.text.text(data && data.realname ? data.realname : data.username);
        const coursesStr = strip.data.courses;
        const userCourses = strip.data && coursesStr ? coursesStr : [];
        strip.renderChildren(wrapper => {
            wrapper.renderChildren(child => {
                if (child.isTypeOf('button')) {
                    child.object.css('background', 'rgb(132, 188, 87)')
                    child.object.click(function(e) {
                        e.stopPropagation();
                        const confirmWindow = new YesNoWindow('confirm-history', 'Вы уверены?', 'Добавить запись в историю?')
                        confirmWindow.render('');
                        confirmWindow.yes.click(async () => {
                            const data = wrapper.parent.data;
                            const historyRecord = { data };
                            const status = wrapper.children.find(c => c.isTypeOf('select') && c.className === 'status-select');
                            historyRecord.status = status.getSelected();
                            if (auth.get('role') === roles.admin) {
                                const teacherType = wrapper.children.find(c => c.isTypeOf('select') && c.className === 'role-select');
                                historyRecord.teacherType = teacherType.getSelected();
                            }
                            const apiKey = auth.get('apiKey');
                            const res = await request.post(`/api/db/history?apiKey=${apiKey}`, JSON.stringify(historyRecord))
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

        const tempData = data.reduce((acc, el) => {
            acc.push({
                email: el && el.email ? el.email : '',
                photoLink: el && el.photoLink ? el.photoLink : ''
            });
    
            return acc;
        }, []);
    
        const photosRes = await request.get(`/api/download?apiKey=${apiKey}`, {data: tempData, type: 'photo'})
            .catch(e => console.log(e));
    
        if (photosRes.status === 'success') {
            photosRes.response.forEach(el => {
                for (let i in this.children) {
                    const strip = this.children[i];
    
                    if (strip.data.email === el.email) {
                        if (el && el.photo) strip.image = `data:image/*;base64,${el.photo}`;
    
                        break;
                    }
                }
            })
        }
    });
}