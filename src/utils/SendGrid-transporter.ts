import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";

export const transporter = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY,
  })
);
