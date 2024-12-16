"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./handlers/users"));
const books_1 = __importDefault(require("./handlers/books"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const borrowed_books_1 = __importDefault(require("./handlers/borrowed_books"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
// rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later",
    headers: true,
});
exports.app.use(limiter);
const corsOptions = {
    origin: 'https://somedomain.com',
    optionSuccessStatus: 200,
};
exports.app.use((0, cors_1.default)(corsOptions));
exports.app.use(express_1.default.json());
// register handler routes
(0, users_1.default)(exports.app);
(0, books_1.default)(exports.app);
(0, borrowed_books_1.default)(exports.app);
exports.app.listen(parseInt(process.env.PORT + ''), () => {
    console.log("Started Listening");
});
