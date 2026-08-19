import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendVerificationEmail = async (
    email: string,
    code: string
) => {
    await transporter.sendMail({
        from: `"Deutsch Course" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your email",
        html: `
            <div style="font-family: Arial, sans-serif;">
                 <h1>Welcome to DeutschJourney 🇩🇪</h1>
                 <p>Your Journey from Learning German to Living in Germany.</p>
                 <h2>Verify your email</h2>

                 <p>Your verification code is:</p>

                 <h1 style="letter-spacing: 8px;">
                    ${code}
                 </h1>

                 <p>This code will expire in 10 minutes.</p>

                 <p>
                    If you did not create an account,
                    you can ignore this email.
                 </p>
            </div>
        `,
    });
};


export const sendPasswordResetEmail = async (
    email: string,
    code: string
) => {
    await transporter.sendMail({
        from: `"Deutsch Course" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your password",
        html: `
            <div style="font-family: Arial, sans-serif;">
             <h1>Welcome to DeutschJourney 🇩🇪</h1>
             <p>Your Journey from Learning German to Living in Germany.</p>

                <h2>Reset your password</h2>

                <p>
                    We received a request to reset your password.
                </p>

                <p>Your password reset code is:</p>

                <h1 style="letter-spacing: 8px;">
                    ${code}
                </h1>

                <p>
                    This code will expire in 10 minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    you can ignore this email.
                </p>
            </div>
        `,
    });
};