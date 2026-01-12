import express from 'express';
import cors from 'cors';

import cookieParser from 'cookie-parser';



const app = express();

app.use(cors({
    // origion is the front-end url and tell us that where we can allow the request
    origin:process.env.CORS_ORIGIN,
    credentials:true


}));
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static('public'));
app.use(cookieParser());

import userRouter from './routes/user.routes.js';
import filesRouter from './routes/files.routes.js';

app.use("/api/v1/users",userRouter);
app.use("/api/v1/posts",filesRouter)


export { app };