const jwt = require('jsonwebtoken');

const config = require('config');

/**
 * @param middleware will validate token from user
 * @get token from header
 * @check if token is present
 * @verify token
 * @Notauthorized header response 401
 * @
 */

module.exports = function (req, res, next) {
  // get token
  const token = req.header('x-auth-token');

  // check if token is present on header
  if (!token) {
    return res.status(401).json({ msg: 'Access denied, You must be authorized first.' });
  }

  // verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtsecret'));
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};
