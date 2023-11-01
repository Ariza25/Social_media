const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

//generate user token

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

//register user and sign in
const register = async (req, res) => {
  const { name, email, password } = req.body;

  //check if user exists

  const user = await User.findOne({ email });

  if (user) {
    res.status(422).json({ errors: ["Por favor, utilize outro e-mail"] });
    return;
  }

  //generate password hash
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  //Create user
  const newUser = await User.create({
    name,
    email,
    password: passwordHash,
  });

  //if user was created sucessfully, return token
  if (!newUser) {
    res
      .status(422)
      .json({ errors: ["Houver um erro. Por favor, tente mais tarde."] });
    return;
  }
  res.status(201).json({
    _id: newUser._id,
    token: generateToken(newUser._id),
  });
};

//Sign in
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  //check if user exists
  if (!user) {
    res.status(404).json({ errors: ["Usuário não foi encontrado"] });
    return;
  }

  //check if password matches
  if (!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({ errors: ["Senha inválida"] });
    return;
  }

  //Return user token
  res.status(201).json({
    _id: user._id,
    profileImg: user.profileImg,
    token: generateToken(user._id),
  });
};

//Get current logged in user
const getCurrentUser = async (req, res) => {
  const user = req.user;

  res.status(200).json(user);
};

//update an user
const update = async (req, res) => {
  const { name, password, bio } = req.body;

  let profileImg = null;

  if (req.file) {
    profileImg = req.file.filename;
  }
  const reqUser = req.user;
  const user = await User.findById(
    new mongoose.Types.ObjectId(reqUser._id)
  ).select("-password");

  if (name) {
    user.name = name;
  }
  if (password) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.password = passwordHash;
  }
  if (profileImg) {
    user.profileImg = profileImg;
  }
  if (bio) {
    user.bio = bio;
  }

  await user.save();
  res.status(200).json(user);
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("ID do usuário a ser buscado:", id);
    const user = await User.findById(new mongoose.Types.ObjectId(id)).select("-password");

    if (!user) {
      console.log("Usuário não encontrado");
      res.status(404).json({ errors: ["Usuário não encontrado"] });
      return;
    }

    console.log("Usuário encontrado:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar o usuário:", error);
    res.status(500).json({ errors: ["Ocorreu um erro ao buscar o usuário"] });
    return;
  }
};


module.exports = {
  register,
  login,
  getCurrentUser,
  update,
  getUserById,
};
