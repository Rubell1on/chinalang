const className = 'menu-strip';
const k = 'apiKey';
const data = ['apiKey', 'role'].reduce((acc, key) => {
    const value = auth.get(key);

    if (value) acc[key] = auth.get(key);

    return acc;
}, {});
const part = `?${k}=${data.apiKey}`;

if (data.role === 'student') {
    $(`.${className} .main-tab`).click(() => location.href = `${location.origin}/dashboard/main${part}`);
    $(`.${className} .courses-tab`).click(() => location.href = `${location.origin}/dashboard/courses${part}`);
    $(`.${className} .history-tab`).css('opacity', '0.5');
} else {
    $(`.${className} .users-tab`).click(() => location.href = `${location.origin}/dashboard/users${part}`);
    $(`.${className} .courses-tab`).click(() => location.href = `${location.origin}/dashboard/courses${part}`);
    $(`.${className} .files-tab`).click(() => location.href = `${location.origin}/dashboard/files${part}`);
    $(`.${className} .blog-tab`).css('opacity', '0.5');
    // .click(() => location.href = `${location.origin}/dashboard/blog${part}`);
    $(`.${className} .history-tab`).css('opacity', '0.5');
    // .click(() => location.href = `${location.origin}/dashboard/hystory${part}`);
}
