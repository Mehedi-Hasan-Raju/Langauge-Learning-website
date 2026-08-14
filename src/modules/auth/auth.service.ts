import bcrypt from 'bcrypt';
import {prisma} from "../../lib/prisma";
import {RegisterInput} from "./auth.types";

export const registerUser =  async (data: RegisterInput) => {
    const {name, email, password} = data;

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
     
    if (existingUser) {
        throw new Error("user already exists with this email")
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password,10);

    //create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    //never return password 
    const {password : _, ...userWithoutPassword} = user;
    return userWithoutPassword;

    return userWithoutPassword;
};