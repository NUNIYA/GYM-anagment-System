const User = require("../models/User");
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateTempCredentials = () => {
  const tempUsername = `user_${crypto.randomBytes(3).toString("hex")}`;
  const tempPassword = crypto.randomBytes(4).toString("hex");
  return { tempUsername, tempPassword };
};

exports.registerMember = async (req, res) => {
  try {
    const {
      fullName,
      email,
      age,
      phoneNumber,
      selectedPackage,
      campus,
      isStudent,
    } = req.body;

    // Generate temporary credentials
    const { tempUsername, tempPassword } = generateTempCredentials();

    // Create user
    const user = new User({
      username: tempUsername,
      email,
      password: tempPassword,
      role: "member",
      campus,
    });

    await user.save();

    // Create member profile
    const member = new Member({
      user: user._id,
      fullName,
      age,
      phoneNumber,
      selectedPackage,
      isStudent,
      studentIdPhoto: req.file?.filename,
      paymentScreenshot: req.files?.paymentProof[0].filename,
    });

    await member.save();

    // Send email with credentials
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "AAU Gym Registration - Pending Approval",
      html: `
                <h1>Thank you for registering!</h1>
                <p>Your registration is pending approval. We will review your payment and documents.</p>
                <p>Once approved, you can login with these temporary credentials:</p>
                <p>Username: ${tempUsername}</p>
                <p>Password: ${tempPassword}</p>
                <p>Please change your password after first login.</p>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for further instructions.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.registerTrainer = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, specialization, experience, campus } =
      req.body;

    const { tempUsername, tempPassword } = generateTempCredentials();

    // Create user
    const user = new User({
      username: tempUsername,
      email,
      password: tempPassword,
      role: "trainer",
      campus,
    });

    await user.save();

    // Create trainer profile
    const trainer = new Trainer({
      user: user._id,
      fullName,
      phoneNumber,
      specialization,
      experience,
      cv: req.files.cv[0].filename,
      applicationLetter: req.body.applicationLetter,
    });

    await trainer.save();

    // Send email notification
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "AAU Gym Trainer Application Received",
      html: `
                <h1>Application Received</h1>
                <p>Thank you for applying as a trainer. We will review your application.</p>
                <p>Once approved, you will receive your login credentials.</p>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully. We will contact you soon.",
    });
  } catch (error) {
    console.error("Trainer registration error:", error);
    res.status(400).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Check if approved
    if (!user.isApproved) {
      throw new Error("Your account is pending approval");
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Redirect based on role
    switch (user.role) {
      case "admin":
        res.redirect("/dashboard/admin");
        break;
      case "member":
        res.redirect("/dashboard/member");
        break;
      case "trainer":
        res.redirect("/dashboard/trainer");
        break;
      default:
        res.redirect("/");
    }
  } catch (error) {
    res.status(400).render("pages/login", {
      error: error.message,
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = req.user;
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    user.isTemporaryPassword = false;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
