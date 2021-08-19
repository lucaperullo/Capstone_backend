import UserModel from "../routes/users/schema.js";

export const loginWare = async (req, res, next) => {
  const { username, password } = req.body;

  const user = await UserModel.findByCredentials(username, password);

  req.user = user;
  next();
};
