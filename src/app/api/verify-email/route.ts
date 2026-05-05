
import { NextResponse } from 'next/server';
import { sendNotificationEmail, getVerificationEmailHtml } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, name, token } = await request.json();

    if (!email || !token || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${origin}/verify-email?token=${token}`;

    console.log(`[API/VerifyEmail] Sending verification email to ${email}`);

    if (!process.env.BREVO_API_KEY) {
      console.warn('[API/VerifyEmail] BREVO_API_KEY is missing. Email will be simulated.');
    }

    const emailResult = await sendNotificationEmail({
      to: email, // simplified to string
      subject: 'Verify your AverPay account',
      html: getVerificationEmailHtml(name, verificationUrl),
    });

    if (!emailResult.success) {
      console.error(`[API/VerifyEmail] Failed to send email: ${emailResult.error}`);
      return NextResponse.json({ error: emailResult.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: emailResult.messageId });
  } catch (error) {
    console.error('[API/VerifyEmail] Internal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
