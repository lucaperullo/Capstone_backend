import UserModel from "../models/users/schema.js";

export const loginWare = async (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body);
  const user = await UserModel.findByCredentials(username, password);
  console.log(user);
  req.user = user;
  next();
};
