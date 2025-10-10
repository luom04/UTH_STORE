import { Resend } from "resend";
import { config } from "../config.js";

const resend = new Resend(config.resend.apiKey);

export const sendEmail = async ({ to, subject, html }) => {
  if (!config.resend.apiKey) {
    console.warn("⚠️ RESEND_API_KEY not set; skipping email send");
    return { skipped: true };
  }
  return resend.emails.send({ from: config.resend.from, to, subject, html });
};
