const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

const port = 3000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
