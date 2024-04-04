import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(request) {
    const { data, email, subject, message } = await request.json();

    const transporter = nodemailer.createTransport({
        port: 465,
        host: 'smtp.gmail.com',
        auth: {
            user: 'connectonmuse@gmail.com',
            pass: 'trov tcct pktt gjmq'
        },
        secure: true,
    });

    await new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Server is ready to take our messages');
                resolve(success);
            }
        });
    });

   

    // Compose email options
    let mailOptions = {
        from: 'connectonmuse@gmail.com',
        to: email,
        subject: subject,
        text: message
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

    return new NextResponse(JSON.stringify({ status: 'OK' }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}