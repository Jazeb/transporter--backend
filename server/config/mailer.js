const nodemailer = require('nodemailer');
const { EMAIL, CONFIG } = require('./keys');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
  port: 587,
    secure: true,
    auth: {
        user: EMAIL.mailerEmail,
        pass: EMAIL.mailerEmailPassword
    }
});

const sendForgotEmail = user => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: EMAIL.mailerEmail,
            to: user.email,
            subject: 'Reset password email',
            html: `
                <h2 style="color:black;">Welcome to Transporter App</h2>
                <p style="color:black;">Follow link to reset password </p> 
                <a style="text-decoration:none; color:#B9345A;" href="${CONFIG.base_url}?email=${user.email}" ><b style="color:#383CC1;" >Reset Password</b></a><br><br>
                Regards 
                </p>
                `
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) reject(err)
            return resolve(true)
        });

    });
};

const genNo = n => Math.floor(Math.random() * (9 * Math.pow(10, n - 1))) + Math.pow(10, n - 1);

const sendOtp = data => new Promise((resolve, reject) => {
    const otp = genNo(6);
    const mailOptions = {
        from: EMAIL.mailerEmail,
        to: data.email,
        subject: 'Reset password email',
        html: `
                <h2 style="color:black;">Welcome Transporter App</h2>
                <p style="color:black;">Thanks for signing up your OTP is: <b>${otp}</b> </p> 
                <br>
                <br>
                Regards 
                </p>
                `
    };

    transporter.sendMail(mailOptions, (err, response) => {
        console.log(response);
        if (err) reject(err);
        return resolve(otp);
    });

});


module.exports = { sendForgotEmail, sendOtp }