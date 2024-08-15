require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const API = '/api';
const API_V = '/v1';
const AUTH_ENDPOINT = '/auth';
const PROT_ENDPOINT = '/prot';
const USERS_ENDPOINT = '/user';

const notFoundMW = require('./middleware/not-found');
const errorHandlerMW = require('./middleware/error-handler');
const authMW = require('./middleware/auth');
const connectDB = require('./db/connect');
const path = require('path')
const fileUpload = require('express-fileupload');

const authRouter = require('./routes/auth');
const protRouter = require('./routes/prot');
const userRouter = require('./routes/user');
const appRouter  = require('./routes/app-routes');

app.use(cookieParser());
app.use(express.static('./public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
//this puts files in req obj
app.use( fileUpload( 
    {useTempFiles: true,
     limits : { fileSize : (process.env.MAX_IMG_SIZE ?
                            parseInt(process.env.MAX_IMG_SIZE) :
                            5 * 1024 * 1024
       ) }
} ) );
app.use(express.urlencoded({ extended: false }));

// app.route('/').get( (req, res) =>{
//     res.status(200).send("Success bro");
// } )


app.get('/api/check-auth', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ authenticated: false });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ authenticated: false });
        }
        res.json({ authenticated: true, user: decoded });
    });
});


app.use(API+API_V+AUTH_ENDPOINT, authRouter);
app.use(API+API_V+PROT_ENDPOINT, authMW, protRouter);
app.use(API+API_V+USERS_ENDPOINT, appRouter);
app.use(API+API_V+USERS_ENDPOINT, userRouter);


app.use(notFoundMW);
app.use(errorHandlerMW);

const port = process.env.PORT || 80;

const start = async () => {
    try {
        console.log('connecting db');
        connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        } )
    }
    catch (error){
        console.log(error);
    }
}

start();