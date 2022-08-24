import express from "express";
import dotenv from "dotenv";
import { getUsers } from "./models.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3047;
const users = getUsers();
const loginSecondsMax = 10;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
}));
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "tempsecret",
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    },
}));
app.all("/", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
const logAnonymousUserIn = (req, res) => {
    const user = users.find((user) => user.username === "anonymousUser");
    if (user) {
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
        req.session.save();
        res.send({
            currentUser: user,
        });
    }
    else {
        res.status(500).send("bad login");
    }
};
const logUserIn = (username, req, res) => {
    let user = users.find((user) => user.username === username);
    if (user) {
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
        req.session.save();
        res.send({
            currentUser: user,
        });
    }
    else {
        logAnonymousUserIn(req, res);
    }
};
app.get("/", (req, res) => {
    res.send(users);
});
app.post("/login", (req, res) => {
    const username = req.body.username;
    logUserIn(username, req, res);
});
app.get("/current-user", (req, res) => {
    const user = req.session.user;
    if (user) {
        res.send({
            currentUser: user,
        });
    }
    else {
        logAnonymousUserIn(req, res);
    }
});
app.get("/logout", (req, res) => {
    logAnonymousUserIn(req, res);
});
app.listen(PORT, () => {
    console.log(`listening to API on http://localhost:${PORT}`);
});
