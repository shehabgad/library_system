import express, { Request, Response } from 'express';
import { BorrowedBooks } from '../models/borrowed_books';
import { authorization } from '../middlewares/authorize';
import { format } from '@fast-csv/format';
import { pipeline } from 'stream';
import fs from 'fs';
import { QueryResult } from 'pg';
const store = new BorrowedBooks()

const index = async (req: Request, res: Response) => {
  try {
    const borrowed_books = await store.index()
    res.json(borrowed_books)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("Couldn't get all borrowed books")
  }
}

const borrow_book = async (req: Request, res: Response) => {
  try {
    const book_id = req.body.book_id
    const user_id = req.body.user_id
    const days = req.body.days
    const borrowed_book = await store.borrow_book(book_id, user_id, days)
    res.json(borrowed_book)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("couldnt borrow book")
  }
}

const return_book = async (req: Request, res: Response) => {
  const book_id = parseInt(req.params.book_id)
  const user_id = req.body.user_id
  try {
    const result = await store.return_book(book_id, user_id)
    res.json(result)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("couldnt return book")
  }
}

const get_borrowed_books_by_user = async (req: Request, res: Response) => {
  try {
    const borrowed_books = await store.get_borrowed_book_by_user(req.body.user_id)
    res.json(borrowed_books)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("couldnt get borrowed books for user")
  }
}

const get_overdue_borrowed_books = async (req: Request, res: Response) => {
  try {
    const borrowed_books = await store.get_overdue_books()
    res.json(borrowed_books)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("couldnt get overdue borrowed books")
  }
}

const get_borrowing_processes = async (req: Request, res: Response) => {
  try {
    const from = new Date(req.query.from as string);
    const to = new Date(req.query.to as string);
    const borrowing_processes = await store.get_borrowing_processes(from, to)
    export_to_csv(res, borrowing_processes, 'borrowing_processes')
  } catch (err) {
    console.log(err)
    res.status(500)
    res.json("couldnt get borrowed processes")
  }
}

const get_last_month_borrowing_processes = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 0, 0, 0, 0);
    const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);
    const borrowing_processes = await store.get_borrowing_processes(lastMonthStartDate, lastMonthEndDate);
    export_to_csv(res, borrowing_processes, 'borrowing_processes_last_month')
  } catch (err) {
    console.log(err);
    res.status(500).json("couldn't get last month's borrowed processes");
  }
}

const get_last_month_overdue_processes = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 0, 0, 0, 0);
    const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);
    const overdue_processes = await store.get_overdue_processes(lastMonthStartDate, lastMonthEndDate);
    export_to_csv(res, overdue_processes, 'overdue_processes_last_month')
  } catch (err) {
    console.log(err);
    res.status(500).json("couldn't get last month's overdue processes");
  }
}

const export_to_csv = (res: Response, data: any[], filename: string) => {
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
  res.setHeader('Content-Type', 'text/csv');
  const csvStream = format({ headers: true });
  pipeline(csvStream, res, (err) => {
    if (err) {
      console.error('Pipeline failed', err);
      res.status(500).send('Error exporting CSV');
    }
  });
  data.forEach((row) => csvStream.write(row));
  csvStream.end();
}

const borrowed_books_routes = (app: express.Application) => {
  app.get("/borrow", index)
  app.get("/borrow/borrowed_books", authorization, get_borrowed_books_by_user)
  app.post("/borrow", authorization, borrow_book)
  app.post("/borrow/return/:book_id", authorization, return_book)
  app.get("/borrow/overdue", get_overdue_borrowed_books)
  app.get("/borrow/borrowing_processes", get_borrowing_processes)
  app.get("/borrow/borrowing_processes/last_month", get_last_month_borrowing_processes)
  app.get("/borrow/overdue_processes/last_month", get_last_month_overdue_processes)

};

export default borrowed_books_routes