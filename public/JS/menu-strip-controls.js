const className = 'menu-strip';
$(`.${className} .users-tab`).click(() => location.href = `${location.origin}/dashboard/users`);
$(`.${className} .courses-tab`).click(() => location.href = `${location.origin}/dashboard/courses`);
$(`.${className} .blog-tab`).click(() => location.href = `${location.origin}/dashboard/blog`);
$(`.${className} .history-tab`).click(() => location.href = `${location.origin}/dashboard/hystory`);