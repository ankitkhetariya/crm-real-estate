const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // 3. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find User (Added _id check just in case)
    const userId = decoded.id || decoded.userId || decoded._id;
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      // ⚠️ Important for your conflict: check if DB is connected to right instance
      console.error(`Auth Error: User ID ${userId} not found in current DB.`);
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error("JWT Verification Failed:", err.message);
    // Specifically identifying if secret is wrong or expired
    const msg =
      err.name === "TokenExpiredError"
        ? "Token expired"
        : "Not authorized, token failed";
    res.status(401).json({ message: msg });
  }
};
