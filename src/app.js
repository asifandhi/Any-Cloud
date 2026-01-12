import express from 'express';
import cors from 'cors';

import cookieParser from 'cookie-parser';



const app = express();

app.use(cors({
    // origion is the front-end url and tell us that where we can allow the request
    origin:process.env.CORS_ORIGIN,
    credentials:true


}));
// use foe json size that we allow from the clint side
app.use(express.json({limit:"20kb"}))
// this is for to encode the url data
app.use(express.urlencoded({extended:true,limit:"20kb"}))
// this for the public folder to access the static files
app.use(express.static('public'));
// this is for cookie parser only server can read the cookie from the browser
app.use(cookieParser());


export { app };