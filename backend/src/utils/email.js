import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp.gmail.com',
	port: process.env.SMTP_PORT || 587,
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	}
})

export async function sendMagicLink(email, magicLinkUrl) {
	const mailOptions = {
		from: process.env.SMTP_FROM || 'Kagi <noreply@kagi.jp>',
		to: email,
		subject: '🗝️ Your Kagi Login Link',
		html: `
			<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background: linear-gradient(135deg, #FFC107 0%, #FFD54F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: #333; margin: 0; font-size: 32px;">🗝️ Kagi</h1>
					<p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Your Building Management Portal</p>
				</div>
				<div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
					<h2 style="color: #333; margin-top: 0;">Welcome back!</h2>
					<p style="color: #666; line-height: 1.6;">Click the button below to securely log in to your Kagi account. This link will expire in 15 minutes.</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${magicLinkUrl}" style="display: inline-block; background: #FFC107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In to Kagi</a>
					</div>
					<p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this login link, you can safely ignore this email.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
					<p style="color: #999; font-size: 12px; text-align: center;">
						Or copy this link: <br>
						<a href="${magicLinkUrl}" style="color: #FFC107; word-break: break-all;">${magicLinkUrl}</a>
					</p>
				</div>
			</div>
		`
	}

	return transporter.sendMail(mailOptions)
}

export async function sendNotification(email, subject, content) {
	const mailOptions = {
		from: process.env.SMTP_FROM || 'Kagi <noreply@kagi.jp>',
		to: email,
		subject: `🗝️ ${subject}`,
		html: `
			<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background: linear-gradient(135deg, #FFC107 0%, #FFD54F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: #333; margin: 0; font-size: 32px;">🗝️ Kagi</h1>
				</div>
				<div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
					<h2 style="color: #333; margin-top: 0;">${subject}</h2>
					<div style="color: #666; line-height: 1.6;">
						${content}
					</div>
				</div>
			</div>
		`
	}

	return transporter.sendMail(mailOptions)
}