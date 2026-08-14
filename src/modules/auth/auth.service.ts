import bcrypt from 'bcrypt';
import {prisma} from "../../lib/prisma";
import {RegisterInput} from "./auth.types";
import jwt from "jsonwebtoken";

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


//login user
export const loginUser = async (
    email: string,
    password: string,
) => {
    //check if user exists
   const user = await prisma.user.findUnique({
    where: {
        email,
    },
   });
   if(!user) {
    throw new Error("Invalid email or password");
   }
   //compare pass
     const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }
  //jwt secret
  const jwtSecret = process.env.JWT_SECRET;
  if(!jwtSecret) {
    throw new Error ("JWt secret is not defined in env");
  }

  //generate token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  )
  // Don't return password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};