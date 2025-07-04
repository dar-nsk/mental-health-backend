const jwt = require('jsonwebtoken');
const JWT_SECRET = "your_jwt_secret_here";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('No token provided.');

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    res.status(401).send('Invalid token.');
  }
}

module.exports = authMiddleware;
