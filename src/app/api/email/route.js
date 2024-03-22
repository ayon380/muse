import { NextResponse } from "next/server";

import sendemail from "../../../externalfn/SendEmail"
export async function POST(req) {
    const data = await req.json()
    const email = data.email
    const subject = data.subject
    const message = data.message
    console.log(email, subject, message);
    sendemail(email, subject, message)
    .then(() => {
        console.log('Email sent successfully');
        // Handle success
        return NextResponse.json({ status: 200 })
    })
    .catch(error => {
        console.error('Failed to send email:', error);
        return NextResponse.json({ status: 400 })
        // Handle error
    });

    return NextResponse.json({ status: 400 })
}