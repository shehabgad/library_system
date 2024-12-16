"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authorization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const header = '' + req.headers.authorization;
        const token = header.split(' ')[1];
        const TOKEN_SECRET = process.env.TOKEN_SECRET + '';
        const payload = jsonwebtoken_1.default.verify(token, TOKEN_SECRET);
        req.body.username = payload.User.username;
        req.body.user_id = payload.User.id;
    }
    catch (err) {
        res.status(401);
        res.json('Acess denied, invalid token');
        return;
    }
    next();
});
exports.authorization = authorization;
