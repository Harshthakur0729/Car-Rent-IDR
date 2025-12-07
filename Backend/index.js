import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";


const server = app.listen(config.PORT, () => {
    connectDB();
    console.log(`Server is running Port ${config.PORT}`);
});

// Increase default server timeout for long uploads (e.g., large videos) to 10 minutes
server.timeout = 10 * 60 * 1000; 
server.keepAliveTimeout = 5 * 60 * 1000; 

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});