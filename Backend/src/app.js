import express from "express";
import config from "./config/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.router.js";
import adminRouter from "./routes/admin.router.js";
import carRouter from "./routes/car.router.js"
import dynamicRoute from "./routes/dynamic.router.js"
import videoRoute from "./routes/video.router.js"
const app = express();

app.use(cors({ origin: config.ORIGIN, credentials: true, methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));


app.use(cookieParser());
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter, carRouter);
app.use("/api/dynamic", dynamicRoute, videoRoute);

export default app;