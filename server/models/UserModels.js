const { database } = require("../config/mongodb");
const { hashPassword } = require("../helpers/bcrypt");
const bcrypt = require("bcryptjs");
const { signToken } = require("../helpers/jwt");

class User {
  static async register(newUser) {
    if (!newUser.name) {
      throw new Error("Name is required");
    }

    if (!newUser.email) {
      throw new Error("Email is required");
    }

    const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!pattern.test(newUser.email)) {
      throw new Error(`Invalid email format`);
    }

    if (!newUser.password) {
      throw new Error("Password is required");
    }

    const findByEmail = await database
      .collection("users")
      .findOne({ email: newUser.email });

    if (findByEmail) {
      throw new Error("Email already registered");
    }

    if (newUser.password.length < 5) {
      throw new Error("Password length minimal 5 character");
    }
    newUser.password = hashPassword(newUser.password);
    return await database.collection("users").insertOne(newUser);
  }

  static async login(user) {
    // let dataUser = require("../db/user.json");
    // await database.collection("test").insertMany(dataUser);
    if (!user.email) {
      throw new Error("Email is required");
    }
    if (!user.password) {
      throw new Error("Password is required");
    }

    const findUser = await database
      .collection("users")
      .findOne({ email: user.email });
    if (!findUser) {
      throw new Error("Invalid email/password");
    }

    const isValidPassword = bcrypt.compareSync(
      user.password,
      findUser.password
    );
    if (!isValidPassword) {
      throw new Error("Invalid email/password");
    }

    const access_token = signToken({ _id: findUser._id });

    return { access_token };
  }
}

module.exports = User;
