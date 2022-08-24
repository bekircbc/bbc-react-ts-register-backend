import express from "express";
import dotenv from "dotenv";
import { getUsers } from "./models.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";

declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3047;

const users = getUsers();
const loginSecondsMax = 10;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "tempsecret",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

app.all("/", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

const logAnonymousUserIn = (req: express.Request, res: express.Response) => {
  const user = users.find((user) => user.username === "anonymousUser");
  if (user) {
    req.session.user = user;
    req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
    req.session.save();
    res.send({
      currentUser: user,
    });
  } else {
    res.status(500).send("bad login");
  }
};

const logUserIn = (
  username: string,
  req: express.Request,
  res: express.Response
) => {
  let user = users.find((user) => user.username === username);
  if (user) {
    req.session.user = user;
    req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
    req.session.save();
    res.send({
      currentUser: user,
    });
  } else {
    logAnonymousUserIn(req, res);
  }
};

app.get("/", (req: express.Request, res: express.Response) => {
  res.send(users);
});

app.post("/login", (req: express.Request, res: express.Response) => {
  const username = req.body.username;
  logUserIn(username, req, res);
});

app.get("/current-user", (req: express.Request, res: express.Response) => {
  const user = req.session.user;
  if (user) {
    res.send({
      currentUser: user,
    });
  } else {
    logAnonymousUserIn(req, res);
  }
});

app.get("/logout", (req: express.Request, res: express.Response) => {
  logAnonymousUserIn(req, res);
});

app.listen(PORT, () => {
  console.log(`listening to API on http://localhost:${PORT}`);
});
