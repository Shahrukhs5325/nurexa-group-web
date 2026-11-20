#!/usr/bin/env python3
"""
NUREXA Group - Email Template Dispatch Script
Contains strictly the contact form fields.
"""

import os
import sys
import argparse
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_FILE = os.path.join(BASE_DIR, "email-template.html")
LOGO_FILE = os.path.join(BASE_DIR, "logo-N.jpeg")

def render_template(context):
    with open(TEMPLATE_FILE, "r", encoding="utf-8") as f:
        html = f.read()
    
    for key, value in context.items():
        html = html.replace(f"{{{{{key}}}}}", str(value))
    
    return html

def create_message(sender, recipient, subject, html_content, attach_logo=True):
    msg = MIMEMultipart("related")
    msg["Subject"] = subject
    msg["From"] = f"NUREXA Group <{sender}>"
    msg["To"] = recipient

    msg_alternative = MIMEMultipart("alternative")
    msg.attach(msg_alternative)

    plain_text = (
        f"Thank you for contacting NUREXA Group!\n\n"
        f"We have received your software inquiry and a senior solutions architect is currently reviewing your project.\n\n"
        f"Direct Email: nurexagroup@gmail.com\n"
        f"WhatsApp: +91 98765 43210\n"
        f"NUREXA Group - 2026"
    )
    msg_alternative.attach(MIMEText(plain_text, "plain", "utf-8"))
    msg_alternative.attach(MIMEText(html_content, "html", "utf-8"))

    if attach_logo and os.path.exists(LOGO_FILE):
        try:
            with open(LOGO_FILE, "rb") as img_f:
                img_data = img_f.read()
            img = MIMEImage(img_data)
            img.add_header("Content-ID", "<nurexa_logo>")
            img.add_header("Content-Disposition", "inline", filename="logo.jpg")
            msg.attach(img)
        except Exception as e:
            print(f"Notice: Could not attach inline logo image: {e}")

    return msg

def main():
    parser = argparse.ArgumentParser(description="Send or preview NUREXA Group contact form email.")
    parser.add_argument("--fullName", default="Rahul Sharma", help="Your Name *")
    parser.add_argument("--company", default="Sharma Enterprises", help="Shop / Business Name *")
    parser.add_argument("--phone", default="+91 98765 43210", help="Phone / WhatsApp Number *")
    parser.add_argument("--email", default="rahul@company.com", help="Email Address *")
    parser.add_argument("--solutionArea", default="Billing, POS & Inventory Software (Online/Offline)", help="Software Solution Needed")
    parser.add_argument("--budget", default="Standard Business Package", help="Estimated Budget Range")
    parser.add_argument("--projectScope", default="Need 2-counter barcode billing software with offline local sync and WhatsApp receipt integration.", help="Your Requirements *")
    parser.add_argument("--send", action="store_true", help="Send email via Gmail SMTP")
    parser.add_argument("--smtp-user", default=os.getenv("SMTP_USER", "nurexagroup@gmail.com"), help="Gmail address")
    parser.add_argument("--smtp-pass", default=os.getenv("SMTP_PASS", ""), help="Gmail App Password")
    parser.add_argument("--smtp-host", default=os.getenv("SMTP_HOST", "smtp.gmail.com"), help="SMTP Host")
    parser.add_argument("--smtp-port", type=int, default=int(os.getenv("SMTP_PORT", 587)), help="SMTP Port")
    parser.add_argument("--preview", action="store_true", help="Generate preview HTML file")

    args = parser.parse_args()

    context = {
        "fullName": args.fullName,
        "company": args.company,
        "phone": args.phone,
        "email": args.email,
        "solutionArea": args.solutionArea,
        "budget": args.budget,
        "projectScope": args.projectScope
    }

    html = render_template(context)

    preview_path = os.path.join(BASE_DIR, "preview-email.html")
    with open(preview_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✓ Rendered HTML preview saved: {preview_path}")

    if not args.send:
        print("\n=== Email Details (Contact Form Fields Only) ===")
        print(f"1. Your Name:                   {args.fullName}")
        print(f"2. Shop / Business Name:        {args.company}")
        print(f"3. Phone / WhatsApp Number:     {args.phone}")
        print(f"4. Email Address:               {args.email}")
        print(f"5. Software Solution Needed:    {args.solutionArea}")
        print(f"6. Estimated Budget Range:      {args.budget}")
        print(f"7. Your Requirements:           {args.projectScope}")
        print(f"\nRecipient:   {args.email}")
        print(f"Subject:     Inquiry Confirmation — NUREXA Group")
        print("\nReady to dispatch.")
        return

    if not args.smtp_pass:
        print("\n❌ Error: SMTP password is required to send emails.")
        print("Generate a 16-character App Password at: https://myaccount.google.com/apppasswords")
        sys.exit(1)

    subject = f"Inquiry Confirmation — NUREXA Group ({args.company})"
    msg = create_message(args.smtp_user, args.email, subject, html)

    print(f"Connecting to {args.smtp_host}:{args.smtp_port}...")
    try:
        server = smtplib.SMTP(args.smtp_host, args.smtp_port)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(args.smtp_user, args.smtp_pass)
        server.sendmail(args.smtp_user, [args.email], msg.as_string())
        server.quit()
        print(f"🎉 Email successfully dispatched to {args.email}!")
    except Exception as e:
        print(f"❌ Failed to dispatch email: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
