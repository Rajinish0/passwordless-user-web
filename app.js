require('dotenv').config();

const express = require('express');
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
const fileUpload = require('express-fileupload');

const authRouter = require('./routes/auth');
const protRouter = require('./routes/prot');
const userRouter = require('./routes/user');

app.use(express.static('./public'));

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

app.use(API+API_V+AUTH_ENDPOINT, authRouter);
app.use(API+API_V+PROT_ENDPOINT, authMW, protRouter);
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