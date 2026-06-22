import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config({ override: true });

const app = express();

// Enable JSON request body parsing
app.use(express.json());

// API endpoint for project enquiry email auto-sending
app.post("/api/send-enquiry", async (req, res) => {
  try {
    const {
      serviceLine,
      budgetRange,
      timeline,
      clientName,
      clientEmail,
      companyName,
      notes,
      referenceId,
    } = req.body;

    console.log("\n=================== NEW CORPORATE INQUIRY ===================");
    console.log(`REFERENCE ID:   ${referenceId}`);
    console.log(`CLIENT PARTNER: ${clientName} (${clientEmail})`);
    console.log(`COMPANY NAME:   ${companyName || "None Provided"}`);
    console.log(`SERVICE TYPE:   ${serviceLine}`);
    console.log(`BUDGET RANGE:   ${budgetRange}`);
    console.log(`TARGET TIMELINE:${timeline}`);
    console.log(`REQUIREMENTS:  ${notes || "No extra developer notes"}`);
    console.log("=============================================================\n");

    const smtpUser = (process.env.SMTP_USER || "").trim().replace(/^["']|["']$/g, "");
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "").trim().replace(/^["']|["']$/g, "");
    const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim().replace(/^["']|["']$/g, "");
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    let emailSent = false;
    let statusDetails = "";

    if (smtpUser && smtpPass) {
      try {
        const isGmailHost = smtpHost.includes("gmail.com") || smtpHost.includes("google");
        const transporter = nodemailer.createTransport(
          isGmailHost
            ? {
                service: "gmail",
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
                connectionTimeout: 4000,
                greetingTimeout: 4000,
                socketTimeout: 5000,
              }
            : {
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
                connectionTimeout: 4000,
                greetingTimeout: 4000,
                socketTimeout: 5000,
              }
        );

        const mailOptions = {
          from: `"${clientName} via CoreBit" <${smtpUser}>`,
          to: "corebitsolutionspvtltd@gmail.com",
          replyTo: clientEmail,
          subject: `[CoreBit Inquiry] ${referenceId} - ${clientName} (${companyName || "No Company"})`,
          text: `
New Corporate Inquiry Received

Reference ID: ${referenceId}
Client Partner: ${clientName} (${clientEmail})
Company Name: ${companyName || "N/A"}

Project Configuration:
---------------------
Service Line: ${serviceLine}
Estimated Budget: ${budgetRange}
Target Timeline: ${timeline}

Brief Checklist / Requirements Notes:
${notes || "No extra description provided."}

This inquiry statement was generated automatically from the CoreBit Solutions Interaction Planner.
          `,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 20px; max-width: 600px; margin: 20px auto; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
              <div style="border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
                <h1 style="color: #f97316; margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">CoreBit Solutions</h1>
                <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Corporate Client Intake Statement</p>
              </div>
              
              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 22px; border-radius: 14px; margin-bottom: 25px;">
                <h3 style="color: #f97316; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 13px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">1. Client Identity</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Client Partner:</td>
                    <td style="padding: 8px 0; color: #ffffff; font-weight: bold;">${clientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Corporate Email:</td>
                    <td style="padding: 8px 0; color: #f97316;"><a href="mailto:${clientEmail}" style="color: #f97316; text-decoration: none; font-weight: bold;">${clientEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Organization Name:</td>
                    <td style="padding: 8px 0; color: #ffffff;">${companyName || "N/A"}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 22px; border-radius: 14px; margin-bottom: 25px;">
                <h3 style="color: #f97316; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 13px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">2. Project Specifications</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Service Line:</td>
                    <td style="padding: 8px 0; color: #ffffff; font-weight: 550;">${serviceLine}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Estimated Budget:</td>
                    <td style="padding: 8px 0; color: #f97316; font-weight: bold; font-family: monospace; font-size: 15px;">${budgetRange}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #38bdf8; font-weight: bold;">${timeline}</td>
                  </tr>
                </table>
              </div>

              ${notes ? `
                <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 22px; border-radius: 14px; margin-bottom: 25px;">
                  <h3 style="color: #f97316; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 13px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">3. Requirements Overview</h3>
                  <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap;">${notes}</p>
                </div>
              ` : ""}

              <div style="text-align: center; margin-top: 35px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <span style="font-family: monospace; color: #64748b; font-size: 11px;">SYSTEM LOG CODE: ${referenceId}</span>
                <p style="margin: 10px 0 0 0; color: #475569; font-size: 10px;">This file is confidential and dispatched autonomously on behalf of your platform visitor.</p>
              </div>
            </div>
          `,
        };

        transporter.sendMail(mailOptions)
          .then(() => {
            console.log(`[SMTP Success] Email registered and successfully sent for corporate enquiry reference: ${referenceId}`);
          })
          .catch((mailErr: any) => {
            console.warn(`[SMTP Background Warning] Failed sending email for reference ${referenceId}:`, mailErr.message || mailErr);
          });
        emailSent = true;
        statusDetails = "Corporate inquiry statement registered. Real-time email delivery initiated in background!";
      } catch (err: any) {
        console.warn("Nodemailer setup warning:", err);
        statusDetails = "Registered statement locally, background email system init failed.";
      }
    } else {
      statusDetails = "SMTP credentials (SMTP_USER, SMTP_PASS) not configured in environment. The inquiry detail statement was successfully logged to the node terminal console.";
    }

    res.json({
      success: true,
      referenceId,
      emailSent,
      statusDetails,
    });
  } catch (err: any) {
    console.warn("Enquiry API handling warning:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error during enquiry logging",
    });
  }
});

// API endpoint for direct contact email sending
app.post("/api/send-contact", async (req, res) => {
  try {
    const { name, email, subject, message, timestamp, id } = req.body;

    console.log("\n=================== NEW DIRECT CONTACT MESSAGE ===================");
    console.log(`MESSAGE ID: ${id}`);
    console.log(`NAME:       ${name} (${email})`);
    console.log(`SUBJECT:    ${subject}`);
    console.log(`MESSAGE:    ${message}`);
    console.log("==================================================================\n");

    const smtpUser = (process.env.SMTP_USER || "").trim().replace(/^["']|["']$/g, "");
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "").trim().replace(/^["']|["']$/g, "");
    const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim().replace(/^["']|["']$/g, "");
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    let emailSent = false;
    let statusDetails = "";

    if (smtpUser && smtpPass) {
      try {
        const isGmailHost = smtpHost.includes("gmail.com") || smtpHost.includes("google");
        const transporter = nodemailer.createTransport(
          isGmailHost
            ? {
                service: "gmail",
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
                connectionTimeout: 4000,
                greetingTimeout: 4000,
                socketTimeout: 5000,
              }
            : {
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
                connectionTimeout: 4000,
                greetingTimeout: 4000,
                socketTimeout: 5000,
              }
        );

        const mailOptions = {
          from: `"${name} via CoreBit" <${smtpUser}>`,
          to: "corebitsolutionspvtltd@gmail.com",
          replyTo: email,
          subject: `[CoreBit Contact] ${subject} - ${name}`,
          text: `
New Contact Message Received

Message ID: ${id}
Name: ${name} (${email})
Subject: ${subject}
Date: ${timestamp}

Message:
${message}

This message was sent from the contact page of CoreBit Solutions.
          `,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 20px; max-width: 600px; margin: 20px auto; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
              <div style="border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
                <h1 style="color: #f97316; margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">CoreBit Solutions</h1>
                <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Direct Communication Portal Message</p>
              </div>
              
              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 22px; border-radius: 14px; margin-bottom: 25px;">
                <h3 style="color: #f97316; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 13px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">Sender Details</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Sender Name:</td>
                    <td style="padding: 8px 0; color: #ffffff; font-weight: bold;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Email Address:</td>
                    <td style="padding: 8px 0; color: #f97316;"><a href="mailto:${email}" style="color: #f97316; text-decoration: none; font-weight: bold;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Subject:</td>
                    <td style="padding: 8px 0; color: #ffffff; font-weight: bold;">${subject}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 22px; border-radius: 14px; margin-bottom: 25px;">
                <h3 style="color: #f97316; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 13px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">Message Content</h3>
                <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="text-align: center; margin-top: 35px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <span style="font-family: monospace; color: #64748b; font-size: 11px;">MESSAGE TIMESTAMP: ${timestamp}</span>
                <p style="margin: 10px 0 0 0; color: #475569; font-size: 10px;">This file is confidential and dispatched autonomously on behalf of your platform visitor.</p>
              </div>
            </div>
          `,
        };

        transporter.sendMail(mailOptions)
          .then(() => {
            console.log(`[SMTP Success] Contact email registered and successfully sent for direct message ID: ${id}`);
          })
          .catch((mailErr: any) => {
            console.warn(`[SMTP Background Warning] Failed sending email for contact ID ${id}:`, mailErr.message || mailErr);
          });
        emailSent = true;
        statusDetails = "Contact message registered. Real-time email delivery initiated in background!";
      } catch (err: any) {
        console.warn("Nodemailer setup warning:", err);
        statusDetails = "Registered message locally, background email system init failed.";
      }
    } else {
      statusDetails = "SMTP credentials not configured. Message logged to node terminal console.";
    }

    res.json({
      success: true,
      emailSent,
      statusDetails,
    });
  } catch (err: any) {
    console.warn("Contact API handling warning:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error during direct contact dispatch",
    });
  }
});

export default app;
