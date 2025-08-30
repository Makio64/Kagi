import fp from 'fastify-plugin'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { sendMagicLink } from '../utils/email.js'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Magic link request
	fastify.post('/magic-link', async (request, reply) => {
		const { email, role, mansionId } = request.body

		if (!email) {
			return reply.code(400).send({ error: 'Email is required' })
		}

		// Generate magic link token
		const token = nanoid(32)
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

		try {
			// Store token in database
			await prisma.magicLink.create({
				data: {
					token,
					email,
					role: role || 'resident',
					mansionId,
					expiresAt
				}
			})

			// Send email with magic link
			const magicLinkUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`
			await sendMagicLink(email, magicLinkUrl)

			return reply.send({ 
				message: 'Magic link sent to your email',
				success: true 
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to send magic link' })
		}
	})

	// Verify magic link
	fastify.post('/verify-magic-link', async (request, reply) => {
		const { token } = request.body

		if (!token) {
			return reply.code(400).send({ error: 'Token is required' })
		}

		try {
			// Find and validate token
			const magicLink = await prisma.magicLink.findFirst({
				where: {
					token,
					expiresAt: { gt: new Date() },
					used: false
				}
			})

			if (!magicLink) {
				return reply.code(400).send({ error: 'Invalid or expired token' })
			})

			// Find or create user
			let user = await prisma.{
				where: { email: magicLink.email .$2($3})
			})

			if (!user) {
				user = await prisma.user.create({
					data: {
						email: magicLink.email,
						role: magicLink.role,
						mansionId: magicLink.mansionId,
						isActive: true
					})
				}
			})

			// Mark token as used
			await prisma.{
				where: { id: magicLink.id },
				data: { used: true .$2($3})
			})

			// Generate JWT token
			const jwtToken = await reply.jwtSign({
				id: user.id,
				email: user.email,
				role: user.role,
				mansionId: user.mansionId
			})

			return reply
				.setCookie('kagi_token', jwtToken, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax'
				})
				.send({
					user: {
						id: user.id,
						email: user.email,
						role: user.role,
						mansionId: user.mansionId
					},
					token: jwtToken
				})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to verify magic link' })
		}
	})

	// Admin login with password
	fastify.post('/admin-login', async (request, reply) => {
		const { email, password } = request.body

		if (!email || !password) {
			return reply.code(400).send({ error: 'Email and password are required' })
		}

		try {
			const admin = await prisma.{
				where: { 
					email,
					role: { in: ['admin', 'mansion_admin'] .$2($3})
				}
			})

			if (!admin || !admin.password) {
				return reply.code(401).send({ error: 'Invalid credentials' })
			})

			const validPassword = await bcrypt.compare(password, admin.password)
			if (!validPassword) {
				return reply.code(401).send({ error: 'Invalid credentials' })
			})

			const token = await reply.jwtSign({
				id: admin.id,
				email: admin.email,
				role: admin.role,
				mansionId: admin.mansionId
			})

			return reply
				.setCookie('kagi_token', token, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax'
				})
				.send({
					user: {
						id: admin.id,
						email: admin.email,
						role: admin.role,
						mansionId: admin.mansionId
					},
					token
				})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Login failed' })
		}
	})

	// Get current user
	fastify.get('/me', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: request.user.id },
				include: {
					mansion: {
						select: {
							id: true,
							name: true,
							address: true
						})
					})
				}
			})

			if (!user) {
				return reply.code(404).send({ error: 'User not found' })
			})

			return reply.send({ user })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to get user info' })
		}
	})

	// Logout
	fastify.post('/logout', async (request, reply) => {
		return reply
			.clearCookie('kagi_token')
			.send({ message: 'Logged out successfully' })
	})
})