// Serverin pohjusta

// Tarvitut moduulit
const express = require('express');
const path = require('path');

// Express sovellus
const app = express();

// Määritetään portti, jossa serveri pyörii
const PORT = process.env.PORT || 3000;

// api
const sanatJaNiidenLogiikkaa = require('/routes/sanat');

app.use('/api/sanat', sanatJaNiidenLogiikkaa);
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    // Lähetetään sivun pohjana toimiva html tiedosto
    res.sendFile(path.join(__dirname, '../public/html/index.html'));
});

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
});
