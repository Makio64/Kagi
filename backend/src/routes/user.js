import fp from 'fastify-plugin'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get users in mansion
	fastify.get('/', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		try {
			const where = request.user.role === 'mansion_admin' 
				? { mansionId: request.user.mansionId }
				: {}

			const users = await prisma.user.findMany({
				where,
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					unit: true,
					isActive: true,
					createdAt: true
				}
			})
			return reply.send({ users })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch users' })
		}
	})
})