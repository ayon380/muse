const sendemail = (email, subject, message) => {
    return new Promise((resolve, reject) => {
        const nodemailer = require('nodemailer');

        // Create a transporter object using SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail', // e.g., 'gmail', 'hotmail', etc.
            auth: {
                user: 'connectonmuse@gmail.com',
                pass: 'trov tcct pktt gjmq'
            }
        });
        // Compose email options
        let mailOptions = {
            from: 'connectonmuse@gmail.com',
            to: email,
            subject: subject,
            text: message
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error occurred: ', error);
                reject(error);
            } else {
                console.log('Email sent: ', info.response);
                resolve(true);
            }
        });
    });
};

export default sendemail;
