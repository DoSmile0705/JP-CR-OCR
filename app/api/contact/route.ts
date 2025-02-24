import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer';
export const dynamic = "force-static";


export async function POST(request: Request) {
    // This API route is dynamic, and it will not be statically generated.
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const subject = formData.get('subject') as string;
  
    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_EMAIL_HOST,
      port: process.env.NEXT_PUBLIC_EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
      },
    });
  
    try {
      await transporter.sendMail({
        from: `"${name}" <${process.env.NEXT_PUBLIC_EMAIL_USER}>`,
        to: process.env.NEXT_PUBLIC_EMAIL_TO,
        replyTo: email,
        subject: `${subject}`,
        html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
      });
  
      return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Email sending error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  }
  