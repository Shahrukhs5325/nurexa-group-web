// ============================================================================
// NUREXA GROUP - GOOGLE APPS SCRIPT (CODE.GS)
// Saves Contact Form Leads to Google Sheet + Sends Branded HTML Email Template
// ============================================================================
// SETUP INSTRUCTIONS:
// 1. Open your Google Sheet > Click "Extensions" > "Apps Script"
// 2. Paste this entire file into Code.gs
// 3. To Test: Select "testSendEmail" from the function dropdown and click "Run"
// 4. To Deploy: Click "Deploy" > "New Deployment"
//    - Select type: "Web app"
//    - Description: "NUREXA Leads Webhook"
//    - Execute as: "Me"
//    - Who has access: "Anyone"
// 5. Copy the deployed Web App URL and paste it into GAS_WEB_APP_URL in index.html
// ============================================================================

const OWNER_EMAIL = "nurexagroup@gmail.com";
const SHEET_NAME  = "Leads";

/**
 * Webhook triggered by website consultation-form submit
 */
function doPost(e) {
  try {
    const data = e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : e.parameter;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp", "Full Name", "Business Name", "Phone / WhatsApp",
        "Email", "Software Solution", "Budget Range", "Requirements", "Status"
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#121215").setFontColor("#E6CB97");
      sheet.setFrozenRows(1);
    }

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // 1. Save strictly the 7 contact form fields to Google Sheet
    sheet.appendRow([
      timestamp,
      data.fullName || "",
      data.company || "",
      data.phone || "",
      data.email || "",
      data.solutionArea || "",
      data.budget || "",
      data.projectScope || "",
      "Inquiry Received"
    ]);

    // 2. Send Branded HTML Confirmation Email to Client
    if (data.email) {
      const clientSubject = "Inquiry Confirmation — NUREXA Group";
      const clientHtml = getClientEmailTemplate(data);
      MailApp.sendEmail({
        to: data.email,
        subject: clientSubject,
        htmlBody: clientHtml
      });
    }

    // 3. Send Notification Email to NUREXA Owner
    const ownerSubject = "New Software Lead: " + (data.company || data.fullName) + " (" + (data.solutionArea || "Custom Software") + ")";
    const ownerHtml = getOwnerEmailTemplate(data, timestamp);
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: ownerSubject,
      htmlBody: ownerHtml
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Inquiry saved and confirmation email sent." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Generates the luxury dark & gold HTML email template
 * Contains strictly the fields from the contact form
 */
function getClientEmailTemplate(data) {
  const fullName     = data.fullName || "Valued Client";
  const company      = data.company || "N/A";
  const phone        = data.phone || "N/A";
  const email        = data.email || "N/A";
  const solutionArea = data.solutionArea || "Custom Software Solution";
  const budget       = data.budget || "Standard Business Package";
  const projectScope = data.projectScope || "None provided";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Confirmation — NUREXA Group</title>
</head>
<body style="margin:0;padding:0;background-color:#09090B;color:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#09090B;padding:30px 12px 50px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#121215;border:1px solid #2A2A32;border-radius:14px;overflow:hidden;">
          
          <!-- Top Champagne Gold Accent Bar -->
          <tr>
            <td style="height:4px;background:#E6CB97;font-size:4px;line-height:4px;">&nbsp;</td>
          </tr>

          <!-- Header / Brand -->
          <tr>
            <td style="padding:28px 36px 20px 36px;border-bottom:1px solid #1E1E24;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="font-size:20px;font-weight:800;letter-spacing:2px;color:#FAF8F5;">NUREXA</span>
                    <span style="font-size:10px;font-weight:700;letter-spacing:4px;color:#E6CB97;margin-left:4px;">GROUP</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:5px 12px;background:rgba(230,203,151,0.12);border:1px solid rgba(230,203,151,0.35);border-radius:16px;color:#E6CB97;font-family:monospace;font-size:11px;font-weight:bold;">
                      ● INQUIRY RECEIVED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Headline & Greeting -->
          <tr>
            <td style="padding:32px 36px 16px 36px;">
              <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#FAF8F5;line-height:1.3;">
                Thank You, ${fullName}!
              </h1>
              <p style="margin:0;font-size:14px;color:#9A9893;line-height:1.6;">
                We have received your software inquiry for <strong style="color:#FAF8F5;">${company}</strong>. Our solutions architect is reviewing your specifications and will contact you within <strong style="color:#E6CB97;">24 hours</strong> with a tailored quote and free live demo.
              </p>
            </td>
          </tr>

          <!-- Contact Form Details (Strictly Contact Form Fields) -->
          <tr>
            <td style="padding:10px 36px 26px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#16161B;border:1px solid rgba(230,203,151,0.28);border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;background-color:#1A1A21;border-bottom:1px solid #26262E;">
                    <span style="font-family:monospace;font-size:11px;font-weight:bold;color:#E6CB97;letter-spacing:1.5px;text-transform:uppercase;">
                      📋 Submitted Inquiry Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="38%" valign="top" style="padding:7px 0;font-size:13px;color:#9A9893;border-bottom:1px solid #212128;">Your Name:</td>
                        <td width="62%" valign="top" style="padding:7px 0;font-size:13px;font-weight:600;color:#FAF8F5;border-bottom:1px solid #212128;">${fullName}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding:7px 0;font-size:13px;color:#9A9893;border-bottom:1px solid #212128;">Shop / Business Name:</td>
                        <td valign="top" style="padding:7px 0;font-size:13px;font-weight:600;color:#FAF8F5;border-bottom:1px solid #212128;">${company}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding:7px 0;font-size:13px;color:#9A9893;border-bottom:1px solid #212128;">Phone / WhatsApp Number:</td>
                        <td valign="top" style="padding:7px 0;font-size:13px;font-weight:600;color:#E6CB97;border-bottom:1px solid #212128;">${phone}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding:7px 0;font-size:13px;color:#9A9893;border-bottom:1px solid #212128;">Email Address:</td>
                        <td valign="top" style="padding:7px 0;font-size:13px;font-weight:600;color:#FAF8F5;border-bottom:1px solid #212128;">${email}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding:7px 0;font-size:13px;color:#9A9893;border-bottom:1px solid #212128;">Software Solution Needed:</td>
                        <td valign="top" style="padding:7px 0;font-size:13px;font-weight:600;color:#FAF8F5;border-bottom:1px solid #212128;">${solutionArea}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding:7px 0;font-size:13px;color:#9A9893;border-bottom:1px solid #212128;">Estimated Budget Range:</td>
                        <td valign="top" style="padding:7px 0;font-size:13px;font-weight:600;color:#FAF8F5;border-bottom:1px solid #212128;">${budget}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding:9px 0 2px 0;font-size:13px;color:#9A9893;">Requirements:</td>
                        <td valign="top" style="padding:9px 0 2px 0;font-size:13px;color:#FAF8F5;line-height:1.5;font-style:italic;">"${projectScope}"</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding:0 36px 30px 36px;">
              <a href="https://wa.me/919876543210" target="_blank" style="background-color:#E6CB97;color:#09090B;padding:12px 26px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;display:inline-block;">
                💬 Instant WhatsApp Support (+91 98765 43210)
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 36px;background-color:#0E0E12;text-align:center;border-top:1px solid #1E1E24;">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#FAF8F5;">
                NUREXA Group • Custom Websites, Mobile Apps &amp; Offline Multi-Store POS
              </p>
              <p style="margin:0;font-size:11px;color:#7A7873;line-height:1.5;">
                Direct Inquiries: <a href="mailto:${OWNER_EMAIL}" style="color:#E6CB97;text-decoration:none;">${OWNER_EMAIL}</a> | WhatsApp: +91 98765 43210<br/>
                &copy; 2026 NUREXA Group. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generates notification template sent to the owner (nurexagroup@gmail.com)
 */
function getOwnerEmailTemplate(data, timestamp) {
  return `
    <div style="font-family:Arial,sans-serif;background:#09090B;color:#FAF8F5;padding:24px;border-radius:12px;max-width:550px;">
      <h2 style="color:#E6CB97;margin-top:0;">🚨 New Lead Received</h2>
      <p style="color:#9A9893;font-size:12px;">Timestamp: ${timestamp}</p>
      <hr style="border-color:#2A2A32;"/>
      <p><strong>1. Full Name:</strong> ${data.fullName || "N/A"}</p>
      <p><strong>2. Business Name:</strong> ${data.company || "N/A"}</p>
      <p><strong>3. Phone / WhatsApp:</strong> <a href="tel:${data.phone}" style="color:#E6CB97;">${data.phone || "N/A"}</a></p>
      <p><strong>4. Email:</strong> <a href="mailto:${data.email}" style="color:#E6CB97;">${data.email || "N/A"}</a></p>
      <p><strong>5. Solution:</strong> ${data.solutionArea || "N/A"}</p>
      <p><strong>6. Budget:</strong> ${data.budget || "N/A"}</p>
      <p><strong>7. Requirements:</strong><br/>${data.projectScope || "None"}</p>
    </div>
  `;
}

/**
 * ONE-CLICK TEST FUNCTION
 * Run this function in Apps Script editor to send a test email immediately!
 */
function testSendEmail() {
  const testData = {
    fullName: "Rahul Sharma",
    company: "Sharma Supermart",
    phone: "+91 98765 43210",
    email: OWNER_EMAIL, // Sends test email to your owner email
    solutionArea: "Billing, POS & Inventory Software (Online/Offline)",
    budget: "Standard Business Package",
    projectScope: "Need 2-counter barcode billing software with offline local sync and WhatsApp receipts."
  };

  const html = getClientEmailTemplate(testData);
  MailApp.sendEmail({
    to: testData.email,
    subject: "Test Inquiry Confirmation — NUREXA Group",
    htmlBody: html
  });
  Logger.log("✅ Test email successfully sent to: " + testData.email);
}
