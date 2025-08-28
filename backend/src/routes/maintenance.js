import fp from 'fastify-plugin'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get maintenance requests
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const where = request.user.role === 'admin' || request.user.role === 'mansion_admin'
				? { mansionId: request.user.mansionId }
				: { userId: request.user.id }

			const maintenance = await prisma.maintenanceRequest.findMany({
				where,
				include: {
					user: { select: { name: true, email: true, unit: true } }
				},
				orderBy: { createdAt: 'desc' }
			})
			return reply.send({ maintenance })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch maintenance requests' })
		}
	})

	// Create maintenance request
	fastify.post('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { title, description, category, priority, imageUrl } = request.body

		if (!title || !description || !category) {
			return reply.code(400).send({ error: 'Missing required fields' })
		}

		try {
			const maintenance = await prisma.maintenanceRequest.create({
				data: {
					title,
					description,
					category,
					priority,
					imageUrl,
					userId: request.user.id,
					mansionId: request.user.mansionId
				}
			})
			return reply.code(201).send({ maintenance })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create maintenance request' })
		}
	})
})