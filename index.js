const express = require("express")
const mongoose = require('mongoose');
const session = require("express-session")
const redis = require("redis")
var bodyParser = require('body-parser');


const {MONGO_USER,
    MONGO_PASSWORD, 
    MONGO_IP,
    MONGO_PORT, 
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET} = require("./config/config");
//const { createClient } = require("redis")/////


//await redisClient.connect();
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`
//const REDIS_URL=`redis://:REDIS_PASSWORD@redis_app_name.internal:10000`
const url = `redis://${process.env.redisHost}:${process.env.redisPort}`;
/*
const redisClient = redis.createClient({
    url,
    password: process.env.redisKey
});
*/

const connectWithRetry = () =>{
    mongoose.connect(mongoURL, {
        //useCreatendex:true,
        //useFindAndModify: false,
        //useNewUrlParser: true,
        //useUnifiedTopology: true,
        })
        .then(()=> console.log("successfully connected"))
        .catch((e)=>{console.log(e)
        setTimeout(connectWithRetry,5000)});
};

connectWithRetry()
//await redisClient.connect();
console.log("kiiir");
let redisClient =  redis.createClient( url,
    password: process.env.redisKey)
let RedisStore = require('connect-redis')(session)
redisClient.connect().catch(console.error)
app.use(session({
    port: REDIS_PORT,
    host: "redis",
    store: new RedisStore({port: REDIS_PORT,
        host: "redis",client: redisClient}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    
    cookie:{
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 60000
    }
}))

app.use(express.json());

app.get("/", (req,res) =>{
    res.send("<h2> Hi There Ashkan Divband Azizam</h2>")
})

app.use("/api/v1/posts",postRouter)
app.use("/api/v1/users",userRouter)

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listenning on port ${port}`))

