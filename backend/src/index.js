import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import mansionRoutes from './routes/mansion.js'
import userRoutes from './routes/user.js'
import bookingRoutes from './routes/booking.js'
import documentsRoutes from './routes/documents.js'
import messagesRoutes from './routes/messages.js'
import eventsRoutes from './routes/events.js'
import billsRoutes from './routes/bills.js'
import maintenanceRoutes from './routes/maintenance.js'

dotenv.config()

const fastify = Fastify({
	logger: {
		level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'HH:MM:ss Z',
				ignore: 'pid,hostname'
			}
		}
	}
})

await fastify.register(cors, {
	origin: process.env.NODE_ENV === 'production' 
		? process.env.FRONTEND_URL 
		: ['http://localhost:5173', 'http://localhost:3000'],
	credentials: true
})

await fastify.register(cookie)

await fastify.register(jwt, {
	secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
	cookie: {
		cookieName: 'kagi_token',
		signed: false
	}
})

await fastify.register(rateLimit, {
	max: 100,
	timeWindow: '1 minute'
})

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

// Routes
await fastify.register(authRoutes, { prefix: '/api/auth' })
await fastify.register(mansionRoutes, { prefix: '/api/mansions' })
await fastify.register(userRoutes, { prefix: '/api/users' })
await fastify.register(bookingRoutes, { prefix: '/api/bookings' })
await fastify.register(documentsRoutes, { prefix: '/api/documents' })
await fastify.register(messagesRoutes, { prefix: '/api/messages' })
await fastify.register(eventsRoutes, { prefix: '/api/events' })
await fastify.register(billsRoutes, { prefix: '/api/bills' })
await fastify.register(maintenanceRoutes, { prefix: '/api/maintenance' })

fastify.get('/', async (request, reply) => {
	return { 
		name: 'Kagi API',
		version: '1.0.0',
		status: 'running'
	}
})

const start = async () => {
	try {
		await fastify.listen({ 
			port: process.env.PORT || 3333,
			host: '0.0.0.0'
		})
		console.log(`🗝️  Kagi server listening on ${process.env.PORT || 3333}`)
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start()