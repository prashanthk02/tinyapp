const { assert } = require('chai');

const { verifyEmail } = require('../helpers.js');

const testUsers = {
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

describe('verifyEmail', function() {
  it('should return a user with valid email', function() {
    const user = verifyEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert(user, expectedUserID);
  });
  it('should return undefined when email is notfound', function() {
    const user = verifyEmail("abc@xyz.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
