const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //set ejs view engine

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}), cookieParser());

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const verifyEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  if (!user) {
    return res.redirect("/login", templateVars);
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const sURL = req.params.shortURL;
  const lURL = urlDatabase[sURL];
  const templateVars = { shortURL: sURL, longURL: lURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//upon delete request server deletes the requested url from database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//send an edit request to the server, server redirects to /urls/shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//changes made by client are saved to the database and redirected to /urls
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//user registration page route
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies.user_id };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    return res.status(400).send("Please fill in the required fields!!!");
  }
  if (verifyEmail(userEmail, users)) {
    return res.status(400).send("Email already exists! Please login")
  }
  const user_id = generateRandomString();
  const { email, password } = req.body;
  users[user_id] = { user_id, email, password };
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

//login route and set cookie
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies.user_id }
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
    if (req.body.password !== users[id]['password']) {
      return res.status(403).send("Incorrect Password");
    }
  };
  res.cookie("user_id", verifyEmail(req.body.email, users)['user_id']);
  res.redirect("/urls");
});

//logout route and clears cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});