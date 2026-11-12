const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        status: "success",
        message: "Hello World! Microservice is running successfully.",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application successfully running on port ${PORT}`);
});
