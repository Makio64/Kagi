const request = require('supertest')
const { PrismaClient } = require('@prisma/client')
const createTestApp = require('../helpers/testApp')
const jwt = require('jsonwebtoken')

describe('Authentication API Tests', () => {
	let app
	let prisma

	beforeAll(async () => {
		app = await createTestApp()
		prisma = new PrismaClient()
	})

	afterAll(async () => {
		await prisma.$disconnect()
		await app.close()
	})

	beforeEach(async () => {
		// Clean database before each test
		await prisma.magicLink.deleteMany()
		await prisma.user.deleteMany()
		await prisma.mansion.deleteMany()
	})

	describe('POST /api/auth/magic-link', () => {
		it('should create magic link for existing user', async () => {
			// Create test mansion and user
			const mansion = await prisma.mansion.create({
				data: {
					name: 'Test Mansion',
					address: '123 Test St'
				}
			})

			await prisma.user.create({
				data: {
					email: 'test@example.com',
					name: 'Test User',
					mansionId: mansion.id,
					role: 'resident'
				}
			})

			const response = await request(app.server)
				.post('/api/auth/magic-link')
				.send({ email: 'test@example.com' })

			expect(response.status).toBe(200)
			expect(response.body.message).toBe('Magic link sent to your email')

			// Verify magic link was created
			const magicLink = await prisma.magicLink.findFirst({
				where: { email: 'test@example.com' }
			})
			expect(magicLink).toBeTruthy()
		})

		it('should fail for non-existent user', async () => {
			const response = await request(app.server)
				.post('/api/auth/magic-link')
				.send({ email: 'nonexistent@example.com' })

			expect(response.status).toBe(404)
			expect(response.body.error).toBe('User not found')
		})

		it('should validate email format', async () => {
			const response = await request(app.server)
				.post('/api/auth/magic-link')
				.send({ email: 'invalid-email' })

			expect(response.status).toBe(400)
		})
	})

	describe('POST /api/auth/verify-magic-link', () => {
		it('should verify valid magic link and return JWT', async () => {
			const mansion = await prisma.mansion.create({
				data: {
					name: 'Test Mansion',
					address: '123 Test St'
				}
			})

			const user = await prisma.user.create({
				data: {
					email: 'test@example.com',
					name: 'Test User',
					mansionId: mansion.id,
					role: 'resident'
				}
			})

			const token = 'test-token-123'
			await prisma.magicLink.create({
				data: {
					email: user.email,
					token,
					expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
				}
			})

			const response = await request(app.server)
				.post('/api/auth/verify-magic-link')
				.send({ token })

			expect(response.status).toBe(200)
			expect(response.body.user).toMatchObject({
				email: user.email,
				name: user.name,
				role: user.role
			})
			expect(response.headers['set-cookie']).toBeDefined()

			// Verify magic link was consumed
			const magicLink = await prisma.magicLink.findFirst({
				where: { token }
			})
			expect(magicLink.used).toBe(true)
		})

		it('should reject expired magic link', async () => {
			const token = 'expired-token'
			await prisma.magicLink.create({
				data: {
					email: 'test@example.com',
					token,
					expiresAt: new Date(Date.now() - 1000) // Already expired
				}
			})

			const response = await request(app.server)
				.post('/api/auth/verify-magic-link')
				.send({ token })

			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Magic link expired or invalid')
		})

		it('should reject already used magic link', async () => {
			const token = 'used-token'
			await prisma.magicLink.create({
				data: {
					email: 'test@example.com',
					token,
					used: true,
					expiresAt: new Date(Date.now() + 15 * 60 * 1000)
				}
			})

			const response = await request(app.server)
				.post('/api/auth/verify-magic-link')
				.send({ token })

			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Magic link expired or invalid')
		})
	})

	describe('POST /api/auth/admin-login', () => {
		it('should authenticate admin with correct password', async () => {
			const mansion = await prisma.mansion.create({
				data: {
					name: 'Test Mansion',
					address: '123 Test St'
				}
			})

			const bcrypt = require('bcryptjs')
			const hashedPassword = await bcrypt.hash('admin123', 10)

			await prisma.user.create({
				data: {
					email: 'admin@example.com',
					name: 'Admin User',
					password: hashedPassword,
					mansionId: mansion.id,
					role: 'admin'
				}
			})

			const response = await request(app.server)
				.post('/api/auth/admin-login')
				.send({
					email: 'admin@example.com',
					password: 'admin123'
				})

			expect(response.status).toBe(200)
			expect(response.body.user.email).toBe('admin@example.com')
			expect(response.body.user.role).toBe('admin')
			expect(response.headers['set-cookie']).toBeDefined()
		})

		it('should reject non-admin users', async () => {
			const mansion = await prisma.mansion.create({
				data: {
					name: 'Test Mansion',
					address: '123 Test St'
				}
			})

			const bcrypt = require('bcryptjs')
			const hashedPassword = await bcrypt.hash('password123', 10)

			await prisma.user.create({
				data: {
					email: 'resident@example.com',
					name: 'Resident User',
					password: hashedPassword,
					mansionId: mansion.id,
					role: 'resident'
				}
			})

			const response = await request(app.server)
				.post('/api/auth/admin-login')
				.send({
					email: 'resident@example.com',
					password: 'password123'
				})

			expect(response.status).toBe(403)
			expect(response.body.error).toBe('Admin access only')
		})

		it('should reject incorrect password', async () => {
			const mansion = await prisma.mansion.create({
				data: {
					name: 'Test Mansion',
					address: '123 Test St'
				}
			})

			const bcrypt = require('bcryptjs')
			const hashedPassword = await bcrypt.hash('correct-password', 10)

			await prisma.user.create({
				data: {
					email: 'admin@example.com',
					name: 'Admin User',
					password: hashedPassword,
					mansionId: mansion.id,
					role: 'admin'
				}
			})

			const response = await request(app.server)
				.post('/api/auth/admin-login')
				.send({
					email: 'admin@example.com',
					password: 'wrong-password'
				})

			expect(response.status).toBe(401)
			expect(response.body.error).toBe('Invalid credentials')
		})
	})

	describe('GET /api/auth/me', () => {
		it('should return current user when authenticated', async () => {
			const mansion = await prisma.mansion.create({
				data: {
					name: 'Test Mansion',
					address: '123 Test St'
				}
			})

			const user = await prisma.user.create({
				data: {
					email: 'test@example.com',
					name: 'Test User',
					mansionId: mansion.id,
					role: 'resident'
				}
			})

			// Generate valid JWT
			const token = jwt.sign(
				{ userId: user.id, role: user.role },
				process.env.JWT_SECRET || 'test-secret',
				{ expiresIn: '7d' }
			)

			const response = await request(app.server)
				.get('/api/auth/me')
				.set('Cookie', `token=${token}`)

			expect(response.status).toBe(200)
			expect(response.body.user).toMatchObject({
				email: user.email,
				name: user.name,
				role: user.role
			})
		})

		it('should return 401 when not authenticated', async () => {
			const response = await request(app.server)
				.get('/api/auth/me')

			expect(response.status).toBe(401)
			expect(response.body.error).toBe('Not authenticated')
		})

		it('should reject invalid JWT', async () => {
			const response = await request(app.server)
				.get('/api/auth/me')
				.set('Cookie', 'token=invalid-jwt-token')

			expect(response.status).toBe(401)
		})
	})

	describe('POST /api/auth/logout', () => {
		it('should clear authentication cookie', async () => {
			const response = await request(app.server)
				.post('/api/auth/logout')

			expect(response.status).toBe(200)
			expect(response.body.message).toBe('Logged out successfully')
			
			// Check that cookie is cleared
			const cookies = response.headers['set-cookie']
			expect(cookies).toBeDefined()
			expect(cookies[0]).toContain('token=;')
			expect(cookies[0]).toContain('Max-Age=0')
		})
	})

	describe('Security Tests', () => {
		it('should rate limit magic link requests', async () => {
			const mansion = await prisma.mansion.create({
				data: {
					name: 'Test Mansion',
					address: '123 Test St'
				}
			})

			await prisma.user.create({
				data: {
					email: 'test@example.com',
					name: 'Test User',
					mansionId: mansion.id,
					role: 'resident'
				}
			})

			// Make multiple rapid requests
			const promises = []
			for (let i = 0; i < 10; i++) {
				promises.push(
					request(app.server)
						.post('/api/auth/magic-link')
						.send({ email: 'test@example.com' })
				)
			}

			const responses = await Promise.all(promises)
			const rateLimited = responses.some(r => r.status === 429)
			expect(rateLimited).toBe(true)
		})

		it('should prevent SQL injection in email field', async () => {
			const response = await request(app.server)
				.post('/api/auth/magic-link')
				.send({ email: "test@example.com'; DROP TABLE users; --" })

			expect(response.status).toBe(400)
			// Database should still be intact
			const users = await prisma.user.findMany()
			expect(users).toBeDefined()
		})

		it('should prevent XSS in user data', async () => {
			const mansion = await prisma.mansion.create({
				data: {
					name: 'Test Mansion',
					address: '123 Test St'
				}
			})

			const user = await prisma.user.create({
				data: {
					email: 'test@example.com',
					name: '<script>alert("XSS")</script>',
					mansionId: mansion.id,
					role: 'resident'
				}
			})

			const token = jwt.sign(
				{ userId: user.id, role: user.role },
				process.env.JWT_SECRET || 'test-secret',
				{ expiresIn: '7d' }
			)

			const response = await request(app.server)
				.get('/api/auth/me')
				.set('Cookie', `token=${token}`)

			expect(response.status).toBe(200)
			// Name should be escaped or sanitized
			expect(response.body.user.name).not.toContain('<script>')
		})
	})
})