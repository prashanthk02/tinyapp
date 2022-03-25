
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const verifyEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};

const userUrls = (urlDatabase, user_id) => {
  let userUrl = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]['userID'] === user_id) {
      userUrl[url] = urlDatabase[url]['longURL']
    }
  }
  return userUrl;
};

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