const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.listen(3000, '192.168.1.133', () => {
    console.log('Server started');
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/register', (req, res) => {
    console.log();
})