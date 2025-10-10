import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret);
export const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);
