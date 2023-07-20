import express from "express";
import { getUserInfoById, getAllUsers, createUser } from '../controllers/user.js'

const router = express.Router()

router.route('/:id').get(getUserInfoById)

router.route('/').get(getAllUsers)

router.route('/').post(createUser)

export default router