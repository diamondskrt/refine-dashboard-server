import express from "express"
import {
  getPropertyDetailById,
  getAllProperty,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/property.js'

const router = express.Router()

router.route('/:id').get(getPropertyDetailById)

router.route('/').get(getAllProperty)

router.route('/').post(createProperty)

router.route('/:id').patch(updateProperty)

router.route('/:id').delete(deleteProperty)

export default router