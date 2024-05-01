import nodemailer from "nodemailer";
import { configs } from "../configs";

const emailService = {
  sendMail(to: string, subject: string, html: any) {
    try {
      const transport = nodemailer.createTransport({
        host: "smtp.zeptomail.in",
        port: 587,
        auth: {
          user: `${configs.MAIL_USER}`,
          pass: `${configs.MAIL_PASS}`,
        },
      });
      const mailOptions = {
        from: `"Example Team" <${configs.MAIL_USER}>`,
        to,
        subject,
        html,
      };
      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Successfully sent");
      });
    } catch (error) {
      throw error;
    }
  },
};

export { emailService };
