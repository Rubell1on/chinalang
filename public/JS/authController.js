const key = localStorage.getItem('apiKey');
const origin = location.origin;

if (!key) {
    location.href = `${origin}/`;
}