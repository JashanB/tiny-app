const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "ex1" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "ex2" }
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

function isEmailRepeated(input) {
  for (let user of Object.keys(users)) {
    if (users[user].email === input) {
      return true;
    }
  }
  return false;
};

function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

function urlsForUser(id) {
  let object = {};
  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === id) {
      object[key] = {longURL: urlDatabase[key].longURL, userID: id}
    }
  }
  return object;
};

app.get('/', (req, res) => {
  let idName = req.session.user_id;
  if (idName === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app is listening on ${PORT}!`)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let variable = req.params.shortURL;
  let idName = req.session.user_id;
  if (idName === urlDatabase[variable].userID) {
    delete urlDatabase[variable];
    res.redirect('/urls');
  } else if (urlDatabase[variable].userID !== idName) {
    res.sendStatus(404);
  } else if (idName === undefined) {
    res.sendStatus(404);
  }
});

app.post('/urls', (req, res) => {
  let random = generateRandomString();
  let idName = req.session.user_id;
  let long = req.body['longURL'];
  if (idName === undefined) {
    res.sendStatus(404);
  } else {
    urlDatabase[random] = { longURL: long, userID: idName };
    res.redirect(`/urls/${random}`);
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  let variable = req.params.shortURL;
  let long = req.body['longURL'];
  let idName = req.session.user_id;
  if (idName === urlDatabase[variable].userID) {
    urlDatabase[variable] = { longURL: long, userID: idName };
    res.redirect(`/urls`);
  } else if (urlDatabase[variable].userID !== idName) {
    res.sendStatus(404);
  } else if (idName === undefined) {
    res.sendStatus(404);
  }
});

app.post('/login', (req, res) => {
  let eEmail = req.body.loginEmail;
  let pPassword = req.body.loginPassword;
  let verify;
  let hashed = 'b';
  if (isEmailRepeated(eEmail) === false) {
    return res.sendStatus(403);
  }
  for (let user of Object.keys(users)) {
    if (users[user].email === eEmail) {
      verify = user;
      hashed = users[verify].password;
    }
  };
  //console.log(verify);
  //console.log(users[verify].password)
  if (bcrypt.compareSync(pPassword, hashed) === false) {
    res.sendStatus(403);
  } else {
    req.session.user_id = users[verify].id;
    res.redirect(`/urls`);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.post('/register', (req, res) => {
  let email = req.body.registerEmail;
  let password = req.body.registerPassword;
  let hashed = bcrypt.hashSync(password, 10);
  let id = generateRandomString();
  if (email === '' || password === '') {
    res.sendStatus(400);
  } else if (isEmailRepeated(email) === true) {
    res.sendStatus(400);
  } else {
    users[id] = {
      id: id,
      email: email,
      password: hashed
    };
    //console.log(users)
    req.session.user_id = users[id].id;
    res.redirect('/urls');
  }
});

app.get('/u/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  //console.log(urlDatabase[variable].longURL)
  if (urlDatabase[variable] === undefined) {
    res.sendStatus(404);
  } else if (urlDatabase[variable].longURL === '') {
    res.sendStatus(404);
  } else {
    res.redirect(urlDatabase[variable].longURL);
  }
});

app.get('/urls/new', (req, res) => {
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend }
  // console.log(idName);
  if (idName === undefined) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let templateVars = { shortURL: variable, longURL: urlDatabase[variable].longURL, user: objectToSend };
  //console.log(templateVars)
  if (idName !== urlDatabase[variable].userID) {
    res.sendStatus(404);
  } else {
    res.render('urls_show', templateVars);
  }
});

app.get('/urls', (req, res) => {
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let objectWithURLs = urlsForUser(idName);
  //console.log(objectWithURLs)
  let templateVars = { urls: objectWithURLs, user: objectToSend };
  console.log(idName)
  //console.log(templateVars)
  if (idName === undefined) {
    res.redirect('/login');
  } else {
    res.render('urls_index', templateVars);
  }
});

app.get('/register', (req, res) => {
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend };
  if (idName === undefined) {
    res.render('urls_register', templateVars);
  } else{
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend };
  if (idName === undefined) {
    res.render('urls_login', templateVars);
  } else{
    res.redirect('/urls');
  }
});




