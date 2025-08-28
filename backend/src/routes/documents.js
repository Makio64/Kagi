import fp from 'fastify-plugin'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get mansion documents
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const documents = await prisma.document.findMany({
				where: { mansionId: request.user.mansionId },
				orderBy: { category: 'asc' }
			})
			return reply.send({ documents })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch documents' })
		}
	})
})