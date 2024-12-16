import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/users';
dotenv.config();

export const authorization = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const header = '' + req.headers.authorization;
    const token = header.split(' ')[1];
    const TOKEN_SECRET = process.env.TOKEN_SECRET + ''
    const payload = jwt.verify(token, TOKEN_SECRET) as JwtPayload;
    req.body.username = payload.User.username;
    req.body.user_id = payload.User.id
  } catch (err) {
    res.status(401);
    res.json('Acess denied, invalid token');
    return;
  }
  next();
};