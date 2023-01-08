import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js'
import postRoutes from './routes/posts.js'
import { createPost } from './controllers/posts.js'
import { register } from './controllers/auth.js'
import { verifyToken } from './middleware/auth.js';

/* CONFIGURATION */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json()); // This method is basically parse the incoming request with the JSON Payload
app.use(helmet());// it basically used for set security-related HTTP headers. 
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));// it allows the resources to be loaded from any origin
app.use(morgan('common'));// it logs out the incoming request in different format
app.use(cors());// it allows the Cross-origin resource sharing 
app.use(bodyParser.json({ limit: "30mb", extended: true }));// it basically parsed the request body that are in JSON format and allow that in req.body
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));// encoding the data as part of URL or an HTTP request 
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets')
    },
    filename:(req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register)
app.post('/posts', verifyToken, upload.single("picture"), createPost)

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

/* ROUTES */
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/posts', postRoutes)

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 5000;
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    })
}).catch((err) => {
    console.log(`${err} did not connect`);
})

