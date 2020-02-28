async function renderGoodsTable() {
    const apiKey = auth.get('apiKey');
    const res = await request.get(`/api/db/prices?apiKey=${apiKey}`)
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });
    if (res.status === 'success') {
        const data = res.response;
        const temp = Object.entries(data);
        const blocks = temp.reduce((acc, curr) => {
            const key = curr[0];
            const type = curr[1];

            acc[key] = type.map(e => {
                const benefit = e.oldTotalPrice - e.newTotalPrice;
                return new PriceBlock(`price-block-${e.id}`)
                    .setClasses(e.count)
                    .setNewPrice(e.newClassPrice)
                    .setOldPrice(e.oldClassPrice)
                    .setOldTotal(e.oldTotalPrice)
                    .setNewTotal(e.newTotalPrice)
                    .setBenefit(benefit)
                    .setDiscount(e.discount)
            }, []);

            return acc;
        }, [])

        
        const children = [
            new ObjectWrapper('russian-teacher-prices', [
                new Label('russian-teachers', 'Цены занятий у рускоязычного преподавателя'),
                ...blocks.russianTeachers                
            ]),
            new ObjectWrapper('native-teacher-prices', [
                new Label('native-teachers', 'Цены занятий у носителя языка'),
                ...blocks.nativeTeachers
            ])
        ]

        const purchaseTable = new DataTable('purchase-table', [], children)
        purchaseTable.render('content-window');
        purchaseTable.renderChildren(tableWrapper => {
            tableWrapper.renderChildren(() => {});
        });
    }
}

async function renderPage() {
    renderPageLoader();
    renderGoodsTable();

    const apiKey = auth.get('apiKey');
    const response = await request.get('/api/db/userData', { apiKey })
        .catch(e => {
            console.error(e);
            notificationController.error(e.error.responseText);
        });

    const user = response.response[0];

    renderHeader(user);
    renderControls(user);
}

renderPage();