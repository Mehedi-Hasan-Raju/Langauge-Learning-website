import { google } from "googleapis";

export const googleOAuth2Client =
    new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    );

export const googleScopes = [
    "openid",
    "email",
    "profile",
];

export const getGoogleAuthUrl = () => {
    return googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: googleScopes,
        prompt: "select_account",
    });
};