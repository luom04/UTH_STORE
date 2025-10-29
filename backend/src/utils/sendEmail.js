// src/utils/sendEmail.js
import httpStatus from "http-status";
import { Resend } from "resend";
import { config } from "../config.js";
import { ApiError } from "./apiError.js";

const resend = new Resend(config.resend.apiKey);

export async function sendEmail({ to, subject, html, text }) {
  if (!config.resend.apiKey) {
    console.warn("[sendEmail] RESEND_API_KEY missing — dev fallback: log only");
    console.log({ to, subject, html });
    return { queued: false, dev: true };
  }

  const from =
    config.resend.from?.trim() || "UTH Store <onboarding@resend.dev>";

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[sendEmail] Resend error:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "sendEmail failed");
    }

    console.log("[sendEmail] Resend success:", data?.id);
    return { id: data?.id || null };
  } catch (err) {
    console.error("[sendEmail] Exception:", err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "sendEmail exception");
  }
}
