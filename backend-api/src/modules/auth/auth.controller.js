import {z} from 'zod';

import * as authService from './auth.service.js';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const register = async (req , res, next)=>{
    try {
        const {name, email, password} = registerSchema.parse(req.body);
        const result = await authService.register(name, email, password);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        next(error);
    }
};