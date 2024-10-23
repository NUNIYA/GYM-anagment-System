const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { authenticateUser } = require("../middleware/auth");
const authController = require("../controllers/authController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "public/uploads/";
    if (file.fieldname === "studentId") {
      uploadPath += "student-ids/";
    } else if (file.fieldname === "paymentProof") {
      uploadPath += "payments/";
    } else if (file.fieldname === "cv") {
      uploadPath += "cvs/";
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "studentId" || file.fieldname === "paymentProof") {
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return cb(new Error("Please upload an image or PDF file"));
      }
    } else if (file.fieldname === "cv") {
      if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
        return cb(new Error("Please upload a PDF or Word document"));
      }
    }
    cb(null, true);
  },
});

// Routes
router.post(
  "/register/member",
  upload.fields([
    { name: "studentId", maxCount: 1 },
    { name: "paymentProof", maxCount: 1 },
  ]),
  authController.registerMember
);

router.post(
  "/register/trainer",
  upload.fields([{ name: "cv", maxCount: 1 }]),
  authController.registerTrainer
);

router.post("/login", authController.login);
router.get("/logout", authenticateUser, authController.logout);
router.post(
  "/change-password",
  authenticateUser,
  authController.changePassword
);

module.exports = router;
