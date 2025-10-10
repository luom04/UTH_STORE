// src/middlewares/passport.js
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "../config.js";
import { User } from "../models/user.model.js";

// === JWT Strategy (giữ như bạn đang có) ===
export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req) => req?.cookies?.access_token,
    ]),
    secretOrKey: config.jwt.accessSecret,
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.sub);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (e) {
      done(e, false);
    }
  }
);

// === Google OAuth 2.0 Strategy (mới thêm) ===
export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID, // bắt buộc
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // bắt buộc
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // vd: http://localhost:5001/api/auth/google/callback
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile?.emails?.[0]?.value?.toLowerCase();
      if (!email) return done(null, false);

      // Tìm user theo email; nếu chưa có thì tạo user mới và coi như đã verify email
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          // Đặt password random (user đăng nhập bằng Google, không dùng pass này)
          password: Math.random().toString(36),
          name: profile.displayName || profile?.name?.givenName || "",
          isEmailVerified: true,
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
);
