const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const morgan = require('morgan')
const {errorHandler} = require('./middlewares')
const AuthRoute = require('./routes/authRoutes')
const UserRoute = require('./routes/userRoutes')
const facebookAuth = require('./routes/facebookAuthRoutes')



class App {
    constructor() {
        this.app = express();
        this.connectDB();
        this.setMiddlewares();
        this.setRoutes();
    }

    async connectDB() {
        await mongoose.connect(config.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    }

    async disconnectDB() {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }

    setMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(errorHandler)
        this.app.use(morgan('dev'))
    }

    setRoutes() {
        this.app.use("/auth", AuthRoute)
        this.app.use("/auth/facebook", facebookAuth)
        //User
       this.app.use("/user", UserRoute)
        // this.app.get("/", authMiddleware, (req, res) => res.json({ message: "Welcome to dashboard" }));
    }

    start() {
        this.server = this.app.listen(3000, () => console.log("Server started on port 3000"));
    }

    async stop() {
        await mongoose.disconnect();
        this.server.close();
        console.log("Server stopped");
    }
}

module.exports = App;