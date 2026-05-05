import 'server-only';

/**
 * Sends an email using Brevo (formerly Sendinblue) Transactional Email API.
 * Includes a basic retry mechanism to improve reliability.
 */
export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  fromEmail?: string;
  fromName?: string;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendNotificationEmail(payload: EmailPayload) {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.warn('BREVO_API_KEY is not configured. Email not sent:', payload.subject);
    // Return success to prevent frontend crashes in dev environments without keys
    return { success: true, simulated: true };
  }

  const senderEmail = payload.fromEmail || process.env.BREVO_SENDER_EMAIL || 'notifications@averpay.io';
  const senderName = payload.fromName || process.env.BREVO_SENDER_NAME || 'AverPay Security';

  // Format recipient(s) for Brevo API
  const recipients = Array.isArray(payload.to) 
    ? payload.to.map(email => ({ email }))
    : [{ email: payload.to }];

  const body = {
    sender: { name: senderName, email: senderEmail },
    to: recipients,
    subject: payload.subject,
    htmlContent: payload.html,
  };

  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Email attempt ${attempt}/${MAX_RETRIES} to ${JSON.stringify(payload.to)}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Brevo API error (${response.status}): ${JSON.stringify(responseData)}`);
      }

      console.log('Email sent successfully via Brevo:', responseData.messageId);
      return { success: true, data: responseData };
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt); // Exponential-ish backoff
      }
    }
  }

  return { success: false, error: lastError };
}

/**
 * Generate the Verification Email Template
 */
export function getVerificationEmailHtml(name: string, verificationUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; margin: 0;">AverPay Portal</h1>
        <p style="color: #64748b;">Secure Workforce Management</p>
      </div>
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 6px; margin-bottom: 24px;">
        <h2 style="margin-top: 0; color: #1e293b;">Verify your email address</h2>
        <p style="color: #334155; line-height: 1.6;">Hello ${name},</p>
        <p style="color: #334155; line-height: 1.6;">Thank you for joining AverPay. To complete your registration and activate your workspace, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 500; display: inline-block;">Verify Email Address</a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
      </div>
      <div style="text-align: center; color: #94a3b8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} AverPay Workforce Platform. All rights reserved.<br>
        123 Neural Way, Silicon Valley, CA
      </div>
    </div>
  `;
}
