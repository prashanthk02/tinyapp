const express = require("express");
const {generateRandomString, verifyEmail, userUrls, findLongUrl} = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //set ejs view engine

const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {};

const users = {};

app.get("/urls", (req,res) => {
  const currentUserId = req.session.userId;
  if (currentUserId) {
    const templateVars = { 
      urls: userUrls(urlDatabase, currentUserId),
      user: users[currentUserId],
    };
  res.render("urls_index", templateVars);
  } else {
    const templateVars = {
      urls: {},
      user: ''
    }
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.userId] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Requested URL not found!");
  }
});

//upon request for shortURL creation server generates a shortURL and save short and long URL to database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userId;
  const existingURL = findLongUrl(userID, longURL, urlDatabase);
  if (!userID) {
    return res.redirect("/login");
  }
  if (existingURL === longURL) {
    return res.send(`shortURL exists for ${existingURL} <a href="/urls">My URLs</a>`);
  }
  urlDatabase[shortURL] =  { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userId]
  };
  res.render("urls_show", templateVars);
});

//upon delete request server deletes the requested url from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUserId = req.session.userId;
  const urlUserId = urlDatabase[shortURL]["userID"];
  if (currentUserId !== urlUserId) {
    return res.status(401).send("Access denied!");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//send an edit request to the server, server redirects to /urls/shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUserId = req.session.userId;
  const urlUserId = urlDatabase[shortURL]["userID"];
  if (currentUserId !== urlUserId) {
    return res.status(401).send("Access denied!");
  }
  res.redirect(`/urls/${shortURL}`);
});

//changes made by client are saved to the database and redirected to /urls
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.userId;
  urlDatabase[shortURL] =  { longURL, userID };
  res.redirect("/urls");
});

//user registration page route
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.session.userId };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    return res.status(400).send(`Please fill in the <a href="/register">required</a> fields!`);
  }
  if (verifyEmail(userEmail, users)) {
    return res.status(400).send(`Email already exists! Please <a href="/login">login</a>`)
  }
  const user_id = generateRandomString();
  const { email, password } = req.body;
  users[user_id] = { user_id, email, password: bcrypt.hashSync(password, 10) };
  req.session.userId = user_id;
  res.redirect("/urls");
});

//login route and set cookie
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.session.userId }
  res.render("login", templateVars);
});

app.post("/login", (req,res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Please provide email and password");
  };
  if (!verifyEmail(req.body.email, users)) {
    return res.status(403).send("Email not found, please register");
  };
  if (verifyEmail(req.body.email, users)) {
    const id = verifyEmail(req.body.email, users)['user_id'];
    if (!bcrypt.compareSync(req.body.password, users[id]['password'])) {
      return res.status(403).send("Invalid Credentials");
    }
  };
  req.session.userId = verifyEmail(req.body.email, users)['user_id'];
  res.redirect("/urls");
});

//logout route and clears cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});