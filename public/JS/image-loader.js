(async () => {
    const tags = document.querySelectorAll('.disk-image');
    const array = [...tags];
    
    const promises = array.map(async e => {
            const path = e.getAttribute('path');

            return await request.get(`${location.origin}/api/download?type=image`, { path });
        });

    const resolved = await Promise.all(promises);
    resolved.forEach((e, i) => {
        if (e.status === 'success') {
            array[i].setAttribute('src', `data:image/*;base64,${e.response}`);
        }
    });
})();