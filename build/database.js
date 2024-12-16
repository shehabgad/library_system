"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
const { PG_HOST, PG_DB, PG_DB_TEST, PG_USER, PG_PASSWORD, ENV } = process.env;
const PG_PORT = process.env.PG_PORT + '';
const client = new pg_1.Pool({
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASSWORD,
    database: ENV === 'test' ? PG_DB_TEST : PG_DB,
    port: parseInt(PG_PORT),
});
exports.default = client;
