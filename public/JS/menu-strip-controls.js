const className = 'menu-strip';
$(`.${className} .users`).click(() => location.href = `${location.origin}/dashboard/users`);
$(`.${className} .courses`).click(() => location.href = `${location.origin}/dashboard/courses`);
$(`.${className} .blog`).click(() => location.href = `${location.origin}/dashboard/blog`);
$(`.${className} .history`).click(() => location.href = `${location.origin}/dashboard/hystory`);