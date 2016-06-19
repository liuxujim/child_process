var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport('smtps://<username>%40gmail.com:<password>@smtp.gmail.com');


module.exports = transporter;