import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/User.js";

dotenv.config();

const generateAccessToken = (id) => {
  const payload = { id };
  return jwt.sign(payload, process.env.SECRET, { expiresIn: "30d" });
};

const authController = {
  registration: async (req, res) => {
   
    try {
      const { username, email, password } = req.body;

      const existUserName = await User.findOne({ username });
      if (existUserName) {
        return res
          .status(400)
          .json({ message: "Це імя вже зайняте" });
      }

      const existEmail = await User.findOne({ email });
      if (existEmail) {
        return res
          .status(400)
          .json({ message: "Цей email вже використовується" });
      }

      const hashPass = bcrypt.hashSync(password, 7);
      const user = new User({
        username,
        email,
        password: hashPass,
      });

      await user.save();
      return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(400).json({ message: "Помилка регістрації", error });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) { console.log(33)
        return res.status(401).json({ message: "Не вірний email" });
       
      }
      const validatePass = bcrypt.compareSync(password, user.password);
      if (!validatePass) {
        return res.status(400).json({ message: "Не вірний пароль" });
      }

      const token = generateAccessToken(user._id);
      return res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ message: "Login error", error });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ message: "Error getting profile", error });
    }
  },
};

export default authController;
