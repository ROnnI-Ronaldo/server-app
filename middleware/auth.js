const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  const headers = req.headers.authorization;
  //header will be on Bearer format
  if (!headers) {
    return res.json({ msg: "Unauthorized user" });
  }

  //get the token by removing Bearer
  const token = headers.split(" ")[1];

  if (!token) {
    return res.json({ msg: "Unauthorized user" });
  }

  const user = await jwt.verify(token, "somesupersecretstring");
  user.password = null;
  //attach user to request if needed
  req.user = user;

  next();
};
