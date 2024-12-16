import express, { Request, Response } from 'express';
import { Books } from '../models/books';

const store = new Books()


const index = async (req: Request, res: Response) => {
  try {
    const books = await store.index()
    res.json(books)
  } catch (err) {
    console.log(err)
  }
}

const create = async (req: Request, res: Response) => {
  try {
    const book = await store.create(req.body.title, req.body.author, req.body.isbn, req.body.available_quantity, req.body.shelf_location)
    res.json(book)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("Something went wrong while creating the book")
  }
}


const update = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const book = await store.update(id, req.body.title, req.body.author, req.body.isbn, req.body.available_quantity, req.body.shelf_location)
    if (book == null) {
      res.status(400)
      res.json("Please provide correct key names in body")
      return
    }
    res.json(book)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("Cant update book")
  }
}

const delete_book = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    console.log(id)
    const book = await store.delete(id)
    res.json(book)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("Cant delete book")
  }
}

const search_books = async (req: Request, res: Response) => {
  try {
    const { title, author, isbn } = req.query
    const results = await store.search_books(title as string, author as string, isbn as string)
    res.json(results)
  } catch (err) {
    res.status(500)
    console.log(err)
    res.json("something went wrong while searching books")
  }
}

const books_routes = (app: express.Application) => {
  app.get("/books", index)
  app.get("/books/search", search_books)
  app.delete("/books/:id", delete_book)
  app.put("/books/:id", update)
  app.post("/books", create)
};

export default books_routes