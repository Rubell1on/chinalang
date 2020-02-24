const className = 'menu-strip';
const k = 'apiKey';
const data = ['apiKey', 'role'].reduce((acc, key) => {
    const value = auth.get(key);

    if (value) acc[key] = auth.get(key);

    return acc;
}, {});
// const part = `?${k}=${data.apiKey}`;

if (data.role === 'student') {
    $(`.${className} .main-tab`).click(() => location.href = `${location.origin}/dashboard/main`);
    $(`.${className} .courses-tab`).click(() => location.href = `${location.origin}/dashboard/courses`);
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
