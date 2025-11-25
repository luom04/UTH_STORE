//src/config.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL,
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  },
  cookie: {
    // secure: process.env.COOKIE_SECURE === "true",
    // domain: process.env.COOKIE_DOMAIN,
    // sameSite: "lax",
    secure: true, // localhost hiện coi là secure context
    domain: undefined, // DEV: bỏ domain
    sameSite: "none",
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
