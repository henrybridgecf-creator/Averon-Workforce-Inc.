import { NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    // Basic validation
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Email format validation (rough)
    const emailArray = Array.isArray(to) ? to : [to];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allValid = emailArray.every(email => emailRegex.test(email));

    if (!allValid) {
      return NextResponse.json(
        { error: 'Invalid email address provided' },
        { status: 400 }
      );
    }

    const result = await sendNotificationEmail({ to, subject, html });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data || { simulated: result.simulated } });
  } catch (error) {
    console.error('API Error in send-email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
