const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
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
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Example app is listening on ${PORT}!`)
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let variable = req.params.shortURL;
  let idName = req.cookies.user_id;
  if (idName === urlDatabase[variable].userID) {
    delete urlDatabase[variable];
  }
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  let random = generateRandomString();
  let idName = req.cookies.user_id;
  let long = req.body['longURL'];
  urlDatabase[random] = { longURL: long, userID: idName };
  console.log(urlDatabase);
  res.redirect(`/urls/${random}`);
});

app.post('/urls/:shortURL/update', (req, res) => {
  let variable = req.params.shortURL;
  let long = req.body['longURL'];
  let idName = req.cookies.user_id;
  if (idName === urlDatabase[variable].userID) {
    urlDatabase[variable] = { longURL: long, userID: idName };
  }
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  let eEmail = req.body.loginEmail;
  let pPassword = req.body.loginPassword;
  let verify;
  if (isEmailRepeated(eEmail) === false) {
    res.sendStatus(403);
  }
  for (let user of Object.keys(users)) {
    if (users[user].email === eEmail) {
      verify = user
    }
  };
  console.log(verify);
  console.log(users[verify].password)
  if (users[verify].password !== pPassword) {
    res.sendStatus(403);
  } else {
    res.cookie('user_id', users[verify].id);
  }
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

app.post('/register', (req, res) => {
  let email = req.body.registerEmail;
  let password = req.body.registerPassword;
  let id = generateRandomString();
  if (email === '' || password === '') {
    res.sendStatus(400);
  } else if (isEmailRepeated(email) === true) {
    res.sendStatus(400);
  } else {
    users[id] = {
      id: id,
      email: email,
      password: password
    };
    console.log(users)
    res.cookie('user_id', users[id].id);
    res.redirect('/urls');
  }
});

app.get('/u/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  res.redirect(urlDatabase[variable].longURL);
});

app.get('/urls/new', (req, res) => {
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend }
  if (idName === undefined) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let templateVars = { shortURL: variable, longURL: urlDatabase[variable].longURL, user: objectToSend };
  console.log(templateVars)
  res.render('urls_show', templateVars);
});

app.get('/urls', (req, res) => {
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let objectWithURLs = urlsForUser(idName);
  console.log(objectWithURLs)
  let templateVars = { urls: objectWithURLs, user: objectToSend };
  console.log(templateVars)
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend };
  res.render('urls_login', templateVars);
});




