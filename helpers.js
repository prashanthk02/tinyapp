
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//to verify if the user been already registered
const verifyEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

//to verify the urls belongs to the logged in user
const userUrls = (urlDatabase, userId) => {
  let userUrl = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]['userID'] === userId) {
      userUrl[url] = urlDatabase[url]['longURL']
    }
  }
  return userUrl;
};

//to check if longURL was already shortened and is in MyURLs.
const findLongUrl = (userID, userLongURL, urlDatabase) => {
  for (let url of Object.keys(urlDatabase)) {
    if (urlDatabase[url].userID === userID) {
      if (urlDatabase[url].longURL === userLongURL) {
        return urlDatabase[url].longURL;
      }
    }
  }
  return null;
};

module.exports = {
  generateRandomString,
  verifyEmail,
  userUrls,
  findLongUrl
 }