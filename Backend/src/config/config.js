import dotenv from 'dotenv';
dotenv.config();

const   _config = {
    PORT: process.env.PORT,
    MONGO_URL:process.env.MONGO_URL,
    ORIGIN:process.env.ORIGIN,
    JWT_SECRET:process.env.JWT_SECRET,
    SESSION_SECRET:process.env.SESSION_SECRET,
    EMAIL_USER:process.env.EMAIL_USER,
    EMAIL_PASS:process.env.EMAIL_PASS,
    REDIS_HOST:process.env.REDIS_HOST,
    REDIS_PORT:process.env.REDIS_PORT,
    REDIS_PASSWORD:process.env.REDIS_PASSWORD,
    JWT_SECRET_reset_Password:process.env.JWT_SECRET_reset_Password
    
}
const config = Object.freeze(_config);
export default config;