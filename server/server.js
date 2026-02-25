require('dotenv').config();
const express = require("express");
const app = express();
const serverConfig = require('./config/serverConfig');
const PORT = process.env.PORT || 5001;
const userRouter = require('./routers/userRouter');
const carRouter = require('./routers/carRouter');
const scraperWorker = require('./workers/scraper.worker');

serverConfig(app)

app.get("/api/status", (_, res) => {
    res.json({ message: 'ok', uptime: process.uptime() })
});

app.use('/api/users', userRouter);
app.use('/api/cars', carRouter);

// Запуск scraper worker
scraperWorker.start();

app.listen(PORT, () => {
    console.log("server started on port: ", PORT)
    console.log(`🚗 Auto-ads service ready!`)
});