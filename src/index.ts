import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import users_routes from './handlers/users';
import books_routes from './handlers/books';
import rateLimit from 'express-rate-limit';
import borrowed_books_routes from './handlers/borrowed_books';
dotenv.config();

export const app: express.Application = express();

// rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
  headers: true,
});

app.use(limiter)

const corsOptions = {
  origin: 'https://somedomain.com',
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
// register handler routes
users_routes(app);
books_routes(app);
borrowed_books_routes(app)

app.listen(parseInt(process.env.PORT + ''), () => {
  console.log("Started Listening")
});

