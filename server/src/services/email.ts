/**
 * Email Service
 * Handles sending verification emails using SendGrid
 */

import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@aiplatform.com';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️ SENDGRID_API_KEY is not set. Email sending will fail.');
}

/**
 * Generate verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get token expiration time (24 hours from now)
 */
export function getTokenExpiration(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    to: email,
    from: EMAIL_FROM,
    subject: 'AI Platform - 이메일 인증',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Platform</h1>
            <p>이메일 인증</p>
          </div>
          <div class="content">
            <h2>안녕하세요, ${username}님!</h2>
            <p>AI Platform에 가입해주셔서 감사합니다.</p>
            <p>아래 버튼을 클릭하여 이메일 주소를 인증해주세요:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">이메일 인증하기</a>
            </div>
            <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            <p><strong>주의:</strong> 이 링크는 24시간 동안만 유효합니다.</p>
            <p>본인이 요청한 것이 아니라면 이 이메일을 무시하셔도 됩니다.</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
안녕하세요, ${username}님!

AI Platform에 가입해주셔서 감사합니다.
아래 링크를 클릭하여 이메일 주소를 인증해주세요:

${verificationUrl}

주의: 이 링크는 24시간 동안만 유효합니다.

본인이 요청한 것이 아니라면 이 이메일을 무시하셔도 됩니다.

© 2024 AI Platform
    `,
  };

  try {
    await sgMail.send(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email (for future use)
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    to: email,
    from: EMAIL_FROM,
    subject: 'AI Platform - 비밀번호 재설정',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Platform</h1>
            <p>비밀번호 재설정</p>
          </div>
          <div class="content">
            <h2>안녕하세요, ${username}님!</h2>
            <p>비밀번호 재설정을 요청하셨습니다.</p>
            <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">비밀번호 재설정</a>
            </div>
            <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p><strong>주의:</strong> 이 링크는 1시간 동안만 유효합니다.</p>
            <p>본인이 요청한 것이 아니라면 이 이메일을 무시하셔도 됩니다.</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
