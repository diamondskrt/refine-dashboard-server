import { userModel } from '../mongodb/models/user.js'

export const getUserInfoById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findOne({ _id: id }).populate("allProperties");

    if (user) return res.status(200).json(user);
        
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).limit(req.query._end);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createUser = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const userExist = await userModel.findOne({ email });

    if (userExist) return res.status(200).json(userExist);

    const newUser = await userModel.create({ name, email, avatar });

    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}