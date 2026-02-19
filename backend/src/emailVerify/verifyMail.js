// // import nodemailer from "nodemailer";
// // import dotenv from "dotenv";
// // dotenv.config();

// // export const verifyMail = async (token, email) => {
// //   try {
// //     const transporter = nodemailer.createTransport({
// //       service: "gmail",
// //       auth: {
// //         user: process.env.mailUser,
// //         pass: process.env.mailPass,
// //       },
// //     });

// //     await transporter.sendMail({
// //       from: process.env.mailUser,
// //       to: email,
// //       subject: "Email Verification",
// //       text: `Hi! There,
// // You have recently visited our website and entered your email.
// // Please click the link below to verify your email:

// //     http://localhost:5173/user/verify/${token}

// // Thanks`,
// //     });

// //     console.log("Email Sent Successfully");
// //   } catch (error) {
// //     console.error("Error sending email:", error);
// //     throw error;
// //   }
// // };
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// export const verifyMail = async (token, email) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.mailUser,
//         pass: process.env.mailPass,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.mailUser,
//       to: email,
//       subject: "Email Verification",
//       text: `Hi! There,

// You have recently visited our website and entered your email.
// Please click the link below to verify your email:

// http://localhost:5173/user/verify/${token}

// Thanks`,
//     });

//     console.log("Email Sent Successfully");
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// };
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const verifyMail = async (token, email) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.mailUser, // your Gmail
        pass: process.env.mailPass, // app password if 2FA enabled
      },
    });

    // Optional: Verify connection configuration
    await transporter.verify();

    // Send the verification email
    await transporter.sendMail({
      from: process.env.mailUser,
      to: email,
      subject: "Email Verification",
      text: `Hi! There,

You have recently visited our website and entered your email.
Please click the link below to verify your email:

http://localhost:5173/user/verify/${token}

Thanks,`,
      // Optional: For better email, you can use HTML instead of text
      // html: `<p>Hi! There,</p>
      //        <p>You have recently visited our website and entered your email.</p>
      //        <p>Click the link below to verify your email:</p>
      //        <a href="http://localhost:5173/user/verify/${token}">Verify Email</a>
      //        <p>Thanks</p>`
    });

  } catch (error) {
    throw error;
  }
};
