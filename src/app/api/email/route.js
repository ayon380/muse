import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  const { data, email, subject, message,type, username } = await request.json();

  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: "connectonmuse@gmail.com",
      pass: process.env.EMAIL_PASSWORD,
    },
    secure: true,
  });

  await new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });
  const htmltemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Muse</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <div style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: 20px auto; max-width: 600px; overflow: hidden; width: 100%;">
        <div style="background: linear-gradient(135deg, #8a2be2, #ff69b4); color: white; text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px; color: white; font-family: 'Pacifico', cursive;">Muse</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Welcome to a New Social Experience</h1>
        </div>
        
        <div style="padding: 40px;">
            <p style="font-size: 18px; margin-bottom: 30px; text-align: center;">
                Hi ${username}, we're thrilled to have you join our vibrant community!
            </p>
            
            <div style="margin-bottom: 30px; padding: 20px; background-color: #f0e6ff; border-radius: 10px;">
                <h2 style="color: #8a2be2; margin-top: 0; font-size: 20px;">1. Craft Your Digital Identity</h2>
                <p style="margin-bottom: 0;">Create a profile that truly represents you. Add a stunning profile picture and craft a bio that captures your essence.</p>
            </div>
            
            <div style="margin-bottom: 30px; padding: 20px; background-color: #f0e6ff; border-radius: 10px;">
                <h2 style="color: #8a2be2; margin-top: 0; font-size: 20px;">2. Connect and Grow</h2>
                <p style="margin-bottom: 0;">Discover and connect with friends, family, and like-minded individuals. Watch your network flourish!</p>
            </div>
            
            <div style="margin-bottom: 30px; padding: 20px; background-color: #f0e6ff; border-radius: 10px;">
                <h2 style="color: #8a2be2; margin-top: 0; font-size: 20px;">3. Dive into Rich Content</h2>
                <p style="margin-bottom: 0;">Explore a world of fascinating posts, engaging videos, and thought-provoking discussions tailored to your interests.</p>
            </div>
            
            <div style="margin-bottom: 30px; padding: 20px; background-color: #f0e6ff; border-radius: 10px;">
                <h2 style="color: #8a2be2; margin-top: 0; font-size: 20px;">4. Share Your Voice</h2>
                <p style="margin-bottom: 0;">It's time to be heard! Share your thoughts, experiences, and creativity with your first post.</p>
            </div>
            
            <a href="https://muse.nofilter.cloud/feed" style="display: block; width: 200px; margin: 40px auto; padding: 15px 20px; background: linear-gradient(45deg, #8a2be2, #ff69b4); color: white; text-decoration: none; border-radius: 30px; font-weight: bold; text-align: center;">Begin Your Journey</a>
            
            <p style="text-align: center;">Have questions? We're here to help! Check out our <a href="https://muse.nofilter.cloud/help" style="color: #8a2be2;">Help Center</a> or reply to this email.</p>
        </div>
        
        <div style="text-align: center; padding: 20px; background-color: #f0f0f0; border-top: 1px solid #e0e0e0;">
            <p>Stay connected with us</p>
            <div style="margin-top: 20px;">
                <a href="https://muse.nofilter.cloud/feed/profile/muse" style="display: inline-block; margin: 0 10px; color: #8a2be2; text-decoration: none; font-size: 24px;">🔗</a>
            </div>
            <p>© 2024 Muse. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  // Compose email options
  let mailOptions = {
    from: "connectonmuse@gmail.com",
    to: email,
    subject: subject,
    html: htmltemplate,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });

  return new NextResponse(JSON.stringify({ status: "OK" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
