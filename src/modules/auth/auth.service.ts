import bcrypt from 'bcrypt';
import {prisma} from "../../lib/prisma";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../../lib/email";
import type { RegisterInput } from "../auth/auth.types";

export const registerUser = async (data: RegisterInput) => {
    const { name, email, password } = data;

    // Check existing user
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            emailVerified: false,
        },
    });

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Code expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save verification code
    await prisma.emailVerificationToken.create({
        data: {
            token: code,
            expiresAt,
            userId: user.id,
        },
    });

    // Send verification email
    await sendVerificationEmail(email, code);

    // Never return password
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
};


export const verifyEmail = async (
    email: string,
    code: string
) => {
    // Find user
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Already verified?
    if (user.emailVerified) {
        throw new Error("Email is already verified");
    }

    // Find verification token
    const verificationToken =
        await prisma.emailVerificationToken.findFirst({
            where: {
                userId: user.id,
                token: code,
            },
        });

    if (!verificationToken) {
        throw new Error("Invalid verification code");
    }

    // Check expiration
    if (verificationToken.expiresAt < new Date()) {
        throw new Error("Verification code has expired");
    }

    // Verify user
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            emailVerified: true,
        },
    });

    // Delete used verification token
    await prisma.emailVerificationToken.delete({
        where: {
            id: verificationToken.id,
        },
    });

    return {
        message: "Email verified successfully",
    };
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


export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};