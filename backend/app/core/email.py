import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("software_failure.email")

def send_password_reset_email(to_email: str, token: str) -> bool:
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "Password Reset - ForeSafe AI Defect & Risk Intelligence"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155;">
          <h2 style="color: #38bdf8; margin-bottom: 16px;">ForeSafe AI</h2>
          <p style="font-size: 16px; color: #cbd5e1;">You requested a password reset for your account.</p>
          <p style="font-size: 14px; color: #94a3b8;">Click the button below to reset your password. This link is valid for 1 hour.</p>
          <div style="margin: 32px 0;">
            <a href="{reset_url}" style="background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
          <p style="font-size: 11px; color: #475569;">Or copy and paste this link in your browser: <br/><a href="{reset_url}" style="color: #38bdf8;">{reset_url}</a></p>
        </div>
      </body>
    </html>
    """
    
    # Check if SMTP is configured
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print("\n" + "="*70)
        print("  [DEV EMAIL DISPATCHER] Password Reset Request")
        print(f"  Recipient: {to_email}")
        print(f"  Reset Link: {reset_url}")
        print(f"  Token: {token}")
        print("="*70 + "\n")
        logger.info(f"Dev mode password reset link for {to_email}: {reset_url}")
        return True
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())
            
        logger.info(f"Password reset email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
