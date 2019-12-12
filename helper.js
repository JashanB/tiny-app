const getUserByEmail = function(email, database) {
  let user;
  for (let key of Object.keys(database)) {
    if (database[key].email === email) {
      user = database[key];
    }
  }
  return user;
};

module.exports = getUserByEmail;