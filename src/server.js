const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '/dragon/source')));

// All other requests are handled by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '.', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
