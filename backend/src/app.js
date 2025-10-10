import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { jwtStrategy, googleStrategy } from "./middlewares/passport.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { config } from "./config.js";

export const createApp = () => {
  const app = express();
  app.disable("x-powered-by");
  // app.set("trust proxy", 1); // bật khi deploy sau proxy

  app.set("cookieCfg", {
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
  });

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  passport.use("jwt", jwtStrategy);
  passport.use("google", googleStrategy);
  app.use(passport.initialize());

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
};
