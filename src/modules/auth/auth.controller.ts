import {Request, Response } from 'express';
import {registerUser} from './auth.service';

export const register = async (
    req: Request,
    res: Response
) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({
            success: true,
            message: "Registration Successful",
            user,
        });
    }catch (error: any) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message: "Registration Failed",
        });
    }
};