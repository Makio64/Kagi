import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import { PrismaClient } from '@prisma/client'

// Test routes imports
import authRoutes from '../../src/routes/auth.js'
import mansionRoutes from '../../src/routes/mansion.js'
import userRoutes from '../../src/routes/user.js'
import bookingRoutes from '../../src/routes/booking.js'
import documentsRoutes from '../../src/routes/documents.js'
import messagesRoutes from '../../src/routes/messages.js'
import eventsRoutes from '../../src/routes/events.js'
import billsRoutes from '../../src/routes/bills.js'
import maintenanceRoutes from '../../src/routes/maintenance.js'
import facilitiesRoutes from '../../src/routes/facilities.js'

export async function createTestApp() {
	const fastify = Fastify({
		logger: false // Disable logging in tests
	})

	await fastify.register(cors, {
		origin: true,
		credentials: true
	})

	await fastify.register(cookie)

	await fastify.register(jwt, {
		secret: 'test-secret-key',
		cookie: {
			cookieName: 'kagi_token',
			signed: false
		}
	})

	// Add authentication decorators
	fastify.decorate('authenticate', async function(request, reply) {
		try {
			await request.jwtVerify()
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' })
		}
	})

	fastify.decorate('authorizeRole', (roles) => {
		return async function(request, reply) {
			try {
				await request.jwtVerify()
				if (!roles.includes(request.user.role)) {
					reply.code(403).send({ error: 'Forbidden' })
				}
			} catch (err) {
				reply.code(401).send({ error: 'Unauthorized' })
			}
		}
	})

	// Register routes
	await fastify.register(authRoutes, { prefix: '/api/auth' })
	await fastify.register(mansionRoutes, { prefix: '/api/mansions' })
	await fastify.register(userRoutes, { prefix: '/api/users' })
	await fastify.register(bookingRoutes, { prefix: '/api/bookings' })
	await fastify.register(documentsRoutes, { prefix: '/api/documents' })
	await fastify.register(messagesRoutes, { prefix: '/api/messages' })
	await fastify.register(eventsRoutes, { prefix: '/api/events' })
	await fastify.register(billsRoutes, { prefix: '/api/bills' })
	await fastify.register(maintenanceRoutes, { prefix: '/api/maintenance' })
	await fastify.register(facilitiesRoutes, { prefix: '/api/facilities' })

	return fastify
}

export function createTestPrismaClient() {
	return new PrismaClient({
		datasources: {
			db: {
				url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/kagi_test'
			}
		}
	})
}

export async function generateTestToken(fastify, user) {
	return await fastify.jwt.sign({
		id: user.id,
		email: user.email,
		role: user.role,
		mansionId: user.mansionId
	})
}

export function createTestUser(overrides = {}) {
	return {
		id: 'test-user-id',
		email: 'test@example.com',
		role: 'resident',
		name: 'Test User',
		unit: 'A101',
		mansionId: 'test-mansion-id',
		isActive: true,
		...overrides
	}
}

export function createTestAdmin(overrides = {}) {
	return createTestUser({
		id: 'test-admin-id',
		email: 'admin@example.com',
		role: 'admin',
		name: 'Test Admin',
		...overrides
	})
}

export function createTestMansionAdmin(overrides = {}) {
	return createTestUser({
		id: 'test-mansion-admin-id',
		email: 'mansionadmin@example.com',
		role: 'mansion_admin',
		name: 'Test Mansion Admin',
		...overrides
	})
}