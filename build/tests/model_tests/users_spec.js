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
const users_1 = require("../../models/users");
const database_1 = __importDefault(require("../../database"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const store = new users_1.Users();
let user;
describe('Users model ', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const conn = yield database_1.default.connect();
        const sql = 'INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING *';
        const salt_rounds = '' + process.env.SALT_ROUNDS;
        const hash = bcrypt_1.default.hashSync('password123' + process.env.PEPPER, parseInt(salt_rounds));
        const result = yield conn.query(sql, ['shehabgad', 'shehabgad@gmail', hash]);
        user = result.rows[0];
        conn.release();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const conn = yield database_1.default.connect();
            let sql = 'DELETE FROM users;\nALTER SEQUENCE users_id_seq RESTART WITH 1;';
            yield conn.query(sql);
            conn.release();
        }
        catch (err) {
            throw new Error(err + '');
        }
    }));
    it('should have an index method', () => {
        expect(store.index).toBeDefined();
    });
    it('should have a get_user method', () => {
        expect(store.get_user).toBeDefined();
    });
    it('should have an create method', () => {
        expect(store.create).toBeDefined();
    });
    it('should have an update method', () => {
        expect(store.update).toBeDefined();
    });
    it('should have a login method', () => {
        expect(store.login).toBeDefined();
    });
    it('index method should return a list of all users', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield store.index();
        expect(result).toEqual([user]);
    }));
    it('get_user method should return a user with the provided username', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield store.get_user('shehabgad');
        expect(result).toEqual(user);
    }));
    it('create method should create a new user and return the data of the created user', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield store.create('tarekgad', 'tarek@gmail.com', 'password321');
        expect(result).toBeDefined();
    }));
    it('update method should update user with a certain email,password and return the updated data of the user', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield store.update('shehabgad', 'shehabgad56565@gmail.com', '56533711');
        expect(result).toBeDefined();
    }));
    it('login method should return a user provided the username and password', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield store.login('shehabgad', '56533711');
        expect(result).not.toBeNull();
    }));
});
