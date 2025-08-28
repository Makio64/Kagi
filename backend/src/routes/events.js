import fp from 'fastify-plugin'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get upcoming events
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const events = await prisma.event.findMany({
				where: {
					mansionId: request.user.mansionId,
					date: { gte: new Date() }
				},
				orderBy: { date: 'asc' }
			})
			return reply.send({ events })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch events' })
		}
	})
})