async function main() {
    const userWindow = new UsersWindow('data');
    await userWindow.getData();
    userWindow.render('content-window');
    userWindow.renderChildren();
}

main();