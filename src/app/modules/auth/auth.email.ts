import { sendEmailHelper } from '../../../utils/sendEmailHelper';

export const sendResetPasswordEmail = async (
  to: string,
  resetLink: string,
): Promise<void> => {
  await sendEmailHelper.sendEmail(
    to,
    'Password Reset Request',
    `
      <p>You requested a password reset.</p>
      <p>This link expires after a limited time.</p>
      <p>
        <a href="${resetLink}">Reset your password</a>
      </p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  );
};
