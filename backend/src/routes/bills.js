import fp from 'fastify-plugin'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get user bills
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const bills = await prisma.bill.findMany({
				where: { userId: request.user.id },
				orderBy: { dueDate: 'desc' }
			})
			return reply.send({ bills })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch bills' })
		}
	})
})