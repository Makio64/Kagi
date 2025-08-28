import fp from 'fastify-plugin'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get messages
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const messages = await prisma.message.findMany({
				where: { 
					OR: [
						{ toId: request.user.id },
						{ fromId: request.user.id }
					]
				},
				include: {
					from: { select: { name: true, email: true, role: true } },
					to: { select: { name: true, email: true, role: true } }
				},
				orderBy: { createdAt: 'desc' }
			})
			return reply.send({ messages })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch messages' })
		}
	})
})