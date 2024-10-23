const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).redirect("/login");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    // Add user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).redirect("/login");
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).render("pages/error", {
        message: "Access denied",
      });
    }
    next();
  };
};

exports.isCampusAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).render("pages/error", {
      message: "Access denied",
    });
  }

  // Check if admin is accessing their assigned campus
  if (req.params.campus && req.params.campus !== req.user.campus) {
    return res.status(403).render("pages/error", {
      message: "You can only access your assigned campus",
    });
  }

  next();
};
