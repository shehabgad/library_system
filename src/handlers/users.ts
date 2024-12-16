import express, { Request, Response } from 'express';
import { Users } from '../models/users';
import { authorization } from '../middlewares/authorize';
import jwt from 'jsonwebtoken';

const store = new Users();
const TOKEN_SECRET: string = process.env.TOKEN_SECRET + '';

const index = async (req: Request, res: Response) => {
  try {
    const users = await store.index()
    res.json(users)
  } catch (err) {
    console.log(err)
    throw new Error("something went wrong")
  }
}
const signup = async (req: Request, res: Response) => {
  try {
    const user = await store.create(
      req.body.username,
      req.body.email,
      req.body.password
    );
    const token = jwt.sign({ User: user }, TOKEN_SECRET);
    res.json(token);
  } catch (err) {
    res.status(400)
    res.json("Bad Request: you entered a duplicate username or email")
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const user = await store.login(req.body.username, req.body.password);
    if (user !== null) {
      const token = jwt.sign({ User: user }, TOKEN_SECRET);
      res.json(token);
    } else {
      res.json('username or password is incorrect');
    }
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("cant login")
  }

};

const update = async (req: Request, res: Response) => {
  try {
    const username = req.body.username
    const user = await store.update(username, req.body.email, req.body.password)
    res.json(user)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("Cant update user")
  }
}

const delete_user = async (req: Request, res: Response) => {
  try {
    const username = req.body.username
    console.log(username)
    const user = await store.delete(username)
    res.json(user)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("Cant delete user")
  }
}

const users_routes = (app: express.Application) => {
  app.post('/users/signup', signup);
  app.post('/users/login', login);
  app.put('/users', authorization, update)
  app.delete('/users', authorization, delete_user)
  app.get("/users", index)
};

export default users_routes;