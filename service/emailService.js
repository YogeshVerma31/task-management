var nodemailer = require('nodemailer');
var http = require('http');
var url = require('url');
console.log("Creating Transport")

exports.sendEmail = (to) =>{

    var transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
            user:'jiyogi9758@gmail.com',
            pass: 'stom qvoy dfqt leof'
       }
    });
    var mailOptions = {
        from: 'jiyogi9758@gmail.com',
        to: to,
        subject: 'Registration successfully!',
        text:'You have registered successfully!'
    }
    console.log("Sending mail")
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response)
        }
    })

}

