import express from "express";
import * as dotenv from 'dotenv'
import cors from 'cors'
import { connectDB } from './mongodb/connect.js'
import userRoutes from './routes/user.js'
import propertyRoutes from './routes/property.js'

dotenv.config()

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.get('/', (req, res) => {
  res.send({ message: 'Hello World!' })
})

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/properties', propertyRoutes)

const startServer = () => {
  try {
    connectDB(process.env.MONGODB_URL)

    app.listen(port, () => {
      console.log(`App listening on port http://localhost:${port}/`)
    })
  } catch (error) {
    console.log(error)
  }
}

startServer()