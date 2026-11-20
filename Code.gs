// ============================================================================
// NUREXA GROUP - GOOGLE APPS SCRIPT (SAVES TO GOOGLE SHEET + SENDS EMAILS)
// ============================================================================
const OWNER_EMAIL = "nurexagroup@gmail.com"; // <-- Replace with your Gmail/Workspace email
const SHEET_NAME  = "Leads";

function doPost(e) {
  try {
    // Parse incoming JSON or Form data
    const data = e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : e.parameter;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Auto-create "Leads" tab with styled headers if it doesn't exist
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

    // 1. Save Lead Row to Google Sheet
    sheet.appendRow([
      timestamp,
      data.fullName || "",
      data.company || "",
      data.phone || "",
      data.email || "",
      data.solutionArea || "",
      data.budget || "",
      data.projectScope || "",
      "New Lead"
    ]);

    // 2. Send Instant Notification Email to NUREXA Owner
    const ownerSubject = "New Software Lead: " + (data.company || data.fullName) + " (" + (data.solutionArea || "Custom Software") + ")";
    const ownerHtml = `
      
        NUREXA Group — New Client Inquiry
        Date/Time: ${timestamp}
        Client Name: ${data.fullName}
        Business Name: ${data.company}
        Phone / WhatsApp: ${data.phone}
        Email: ${data.email}
        Solution Needed: ${data.solutionArea}
        Budget Range: ${data.budget}
        Requirements:${data.projectScope}
      
    `;
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: ownerSubject,
      htmlBody: ownerHtml
    });

    // 3. Send Automated Confirmation Email to Client
    if (data.email) {
      const clientSubject = "We Received Your Software Inquiry — NUREXA Group";
      const clientHtml = `
        
          Thank You, ${data.fullName}!
          We have received your inquiry for ${data.company} regarding ${data.solutionArea}.
          Our NUREXA Group solutions architect is reviewing your requirements and will contact you within 24 hours with a tailored quote and free live demo.
          
          NUREXA Group • Custom Websites, Mobile Apps, Windows Offline Software & Multi-Store Billing Systems
        
      `;
      MailApp.sendEmail({
        to: data.email,
        subject: clientSubject,
        htmlBody: clientHtml
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Lead saved and emails sent." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}