import bcrypt from 'bcrypt';
import {prisma} from "../../lib/prisma";
import jwt from "jsonwebtoken";
import { sendVerificationEmail,sendPasswordResetEmail } from "../../lib/email";
import type { RegisterInput } from "../auth/auth.types";
import { google } from 'googleapis';
import { googleOAuth2Client } from '../../lib/google';
import crypto from "crypto";
import {
    recordFailedLogin,
    clearFailedLogins,
} from "../../middlewares/bruteForce.middleware";


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
    await recordFailedLogin(email);
    throw new Error("Invalid email or password");
   }
   //compare pass
     const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    await recordFailedLogin(email);
    throw new Error("Invalid email or password");
  }
  // Email verification check
  if (!user.emailVerified) {
    throw new Error("Please verify your email first");
}

// Clear failed login attempts after successful authentication
await clearFailedLogins(email);

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

export const forgotPassword = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("No account found with this email");
    }

    if (!user.emailVerified) {
        throw new Error("Please verify your email first");
    }

    // Generate 6 digit reset code
    const code = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    // Expire after 10 minutes
    const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
    );

    // Delete old reset tokens
    await prisma.passwordResetToken.deleteMany({
        where: {
            userId: user.id,
        },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
        data: {
            token: code,
            expiresAt,
            userId: user.id,
        },
    });

    // Email reset code
    await sendPasswordResetEmail(
        user.email,
        code
    );

    return {
        message: "Password reset code sent to your email",
    };
};


export const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
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

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
            userId: user.id,
            token: code,
        },
    });

    if (!resetToken) {
        throw new Error("Invalid or incorrect reset code");
    }

    // Check expiration
    if (resetToken.expiresAt < new Date()) {
        await prisma.passwordResetToken.delete({
            where: {
                id: resetToken.id,
            },
        });

        throw new Error("Reset code has expired");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            password: hashedPassword,
        },
    });

    // Delete used reset token
    await prisma.passwordResetToken.delete({
        where: {
            id: resetToken.id,
        },
    });

    return {
        message: "Password reset successfully",
    };
};




export const googleLogin = async (code: string) => {
    // Exchange authorization code for tokens
    const { tokens } =
        await googleOAuth2Client.getToken(code);

    googleOAuth2Client.setCredentials(tokens);

    // Get Google user information
    const oauth2 = google.oauth2({
        auth: googleOAuth2Client,
        version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    const googleId = data.id;
    const email = data.email;
    const name = data.name;

    if (!googleId || !email) {
        throw new Error(
            "Unable to get Google account information"
        );
    }

    // Check existing user
    let user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (user) {
        // Connect Google account if not connected
        if (!user.googleId) {
            user = await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    googleId,
                    emailVerified: true,
                },
            });
        }
    } else {
        // Create new Google user
        const randomPassword = await bcrypt.hash(
            crypto.randomUUID(),
            10
        );

        user = await prisma.user.create({
            data: {
                name: name || "Google User",
                email,
                password: randomPassword,
                googleId,
                emailVerified: true,
            },
        });
    }

    // Generate our existing JWT
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "7d",
        }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        token,
    };
};