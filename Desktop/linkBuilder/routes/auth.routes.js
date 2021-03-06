const { Router } = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");

const router = Router();

router.post(
  "/register",
  [
    check("email", "invalid email").isEmail(),
    check("password", "password must be more than 6").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "invalid registration data",
        });
      }

      const { email, password } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        res.status(400).json({ message: "this user is already exist" });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
      });
      await user.save();
      res.status(201).json({ message: "user created" });
    } catch (e) {
      res.status(500).json({ message: "something went wrong" });
    }
  }
);

router.post(
  "/login",
  [
    check("email", "invalid email").normalizeEmail().isEmail(),
    check("password", "input the password").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errors: errors.array(), message: "invalid login data" });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "user is not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "wrong password, try again" });
      }

      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {expiresIn: '1h'});

      res.json({token, userId: user.id})
    } catch (e) {
      res.status(500).json({ message: "something went wrong" });
    }
  }
);

module.exports = router;
