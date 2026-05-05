/**
 * Client-side utility to trigger email notifications via the API route.
 */

export async function triggerEmailNotification(to: string, subject: string, html: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Email trigger failed:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error triggering email notification:', error);
    return false;
  }
}

// Templates
export const emailTemplates = {
  withdrawalSuccess: (userName: string, amount: number, method: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h1 style="color: #3b82f6;">Withdrawal Successful</h1>
      <p>Hello ${userName},</p>
      <p>Good news! Your withdrawal request has been processed successfully.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> £${amount.toLocaleString()}</p>
        <p><strong>Method:</strong> ${method}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p>The funds should arrive in your account according to the standard processing times for your selected method.</p>
      <p>If you didn't initiate this request, please contact support immediately.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} AverPay. All rights reserved.</p>
    </div>
  `,
  profileUpdate: (userName: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h1 style="color: #3b82f6;">Profile Updated</h1>
      <p>Hello ${userName},</p>
      <p>Your AverPay profile has been successfully updated with the latest information.</p>
      <p>If you did not make these changes, please secure your account by changing your password and contacting our security team.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} AverPay. All rights reserved.</p>
    </div>
  `,
  projectApproval: (userName: string, projectTitle: string, amount: number) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h1 style="color: #3b82f6;">Operation Approved!</h1>
      <p>Hello ${userName},</p>
      <p>Your submission for the operation <strong>"${projectTitle}"</strong> has been approved by the administrative team.</p>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
        <p style="color: #166534; font-weight: bold; font-size: 18px; margin: 0;">Reward: £${amount.toLocaleString()}</p>
      </div>
      <p>The funds have been credited to your total balance and are now available for withdrawal.</p>
      <p>Keep up the great work!</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} AverPay. All rights reserved.</p>
    </div>
  `,
  projectRejection: (userName: string, projectTitle: string, reason: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h1 style="color: #ef4444;">Operation Feedback</h1>
      <p>Hello ${userName},</p>
      <p>The submission for <strong>"${projectTitle}"</strong> was not approved in its current state.</p>
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p style="color: #991b1b; font-weight: bold; margin-bottom: 10px;">Reviewer Feedback:</p>
        <p style="color: #b91c1c; margin: 0;">${reason}</p>
      </div>
      <p>Please review the feedback and resubmit the operation files with the requested changes.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} Averon Workforce. All rights reserved.</p>
    </div>
  `,
  onboarding: (userName: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111; background-color: #f9fafb; padding: 40px; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1px;">AVER<span style="text-decoration: underline; text-decoration-color: #2563eb;">ON</span></h1>
        <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: #6b7280; margin-top: 5px;">Strategic Workforce Terminal</p>
      </div>
      <h2 style="color: #111827; font-size: 22px; font-weight: 800;">Welcome to the Elite, ${userName}.</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;">Your application for Averon Workforce has been initialized in our global registry. Your account is currently in <strong>PENDING APPROVAL</strong> status.</p>
      <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #dbeafe;">
        <p style="margin: 0; color: #1e40af; font-weight: 700; font-size: 14px;">NEXT STEPS:</p>
        <ul style="color: #1e40af; font-size: 14px; margin-top: 10px; padding-left: 20px;">
          <li style="margin-bottom: 5px;">Upload Identification (KYC) in your dashboard</li>
          <li style="margin-bottom: 5px;">Wait for Admiral Status Clearance</li>
          <li>Synchronize your secure bank details</li>
        </ul>
      </div>
      <p style="font-size: 14px; color: #6b7280;">Once cleared, you will receive full access to our project briefings and withdrawal pipelines.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #9ca3af; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} Averon Workforce. Operational Security Protocol Enabled.</p>
    </div>
  `,
  accountApproved: (userName: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111; background-color: #f0fdf4; padding: 40px; border-radius: 20px; border: 1px solid #dcfce7;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1px;">AVER<span style="text-decoration: underline;">CLEARANCE</span></h1>
      </div>
      <h2 style="color: #14532d; font-size: 22px; font-weight: 800;">Strategic Clearance Granted.</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #166534;">Hello ${userName}, we are pleased to inform you that your account status has been escalated to <strong>ACTIVE</strong>.</p>
      <p style="font-size: 16px; line-height: 1.6; color: #166534;">You now have full authorization to claim mission briefs, manage liquid assets, and execute global transfers.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'averon-workforce.io'}/login" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block; text-transform: uppercase; font-size: 14px;">Access Dashboard</a>
      </div>
      <hr style="border: none; border-top: 1px solid #dcfce7; margin: 30px 0;" />
      <p style="color: #166534; font-size: 11px; text-align: center;">Operational status: OPTIMAL. Welcome aboard.</p>
    </div>
  `,
  verifyAccount: (userName: string, verificationLink: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111; background-color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1px;">AVER<span style="text-decoration: underline;">PAY</span></h1>
        <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: #6b7280; margin-top: 5px;">Secure Financial Core</p>
      </div>
      <p style="font-size: 16px; color: #374151;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; color: #374151;">Welcome to AverPay. We're excited to have you on board.</p>
      <p style="font-size: 16px; color: #374151;">Please verify your account by clicking the secure link below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Verify Your Account</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${verificationLink}</p>
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you did not create this account, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">Regards,<br/>AverPay Security Team</p>
    </div>
  `,
};
