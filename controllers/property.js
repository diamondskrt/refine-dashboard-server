import { propertyModel } from '../mongodb/models/property.js';
import { userModel } from '../mongodb/models/user.js';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getPropertyDetailById = async (req, res) => {
  const { id } = req.params;

  const propertyExist = await propertyModel.findOne({ _id: id }).populate('creator');

  if (propertyExist) return res.status(200).json(propertyExist);

  return res.status(404).json({ message: 'Property not found' });
}

export const getAllProperty = async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
    title_like = '',
    type,
  } = req.query;

  const query = {
    title: { $regex: title_like, $options: "i" }
  };

  if (type && type !== 'all') {
    query.type = type;
  }

  try {
    const count = await propertyModel.countDocuments({ query });
    
    const properties = await propertyModel.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createProperty = async (req, res) => {
  try {
    const { 
      title,
      description,
      type,
      price,
      location,
      photoUrl,
      email,
    } = req.body;

    const session = await mongoose.startSession();

    session.startTransaction();

    const user = await userModel.findOne({ email }).session(session);

    if (!user) return res.status(404).json({ message: 'User not found' })

    const cloudinaryPhoto = await cloudinary.uploader.upload(photoUrl, {
      folder: 'userPhoto',
    });

    const newProperty = await propertyModel.create({
        title,
        description,
        type,
        price,
        location,
        photo: cloudinaryPhoto.url,
        creator: user._id,
    });

    user.allProperties.push(newProperty._id);

    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({ message: "Property created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, price, location, photoUrl } = req.body;

    const cloudinaryPhoto = await cloudinary.uploader.upload(photoUrl, {
      folder: 'userPhoto',
    });

    await propertyModel.findByIdAndUpdate(
        { _id: id },
        {
          title,
          description,
          type,
          location,
          price,
          photo: cloudinaryPhoto.url,
        },
    );

    res.status(200).json({ message: "Property updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const propertyToDelete = await propertyModel.findById({ _id: id }).populate("creator");

    if (!propertyToDelete) return res.status(404).json({ message: 'Property not found' });

    const session = await mongoose.startSession();
    session.startTransaction();

    propertyToDelete.remove({ session });
    propertyToDelete.creator.allProperties.pull(propertyToDelete);

    await propertyToDelete.creator.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}