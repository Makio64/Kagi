import fp from 'fastify-plugin'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get all mansions (admin only)
	fastify.get('/', {
		preHandler: [fastify.authorizeRole(['admin'])]
	}, async (request, reply) => {
		try {
			const mansions = await prisma.mansion.findMany({
				include: {
					_count: {
						select: {
							users: true,
							events: true,
							facilities: true
						}
					}
				}
			})
			return reply.send({ mansions })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch mansions' })
		}
	})

	// Get single mansion details
	fastify.get('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params
		
		try {
			// Check if user has access to this mansion
			if (request.user.role !== 'admin' && request.user.mansionId !== id) {
				return reply.code(403).send({ error: 'Access denied' })
			}

			const mansion = await prisma.mansion.findUnique({
				where: { id },
				include: {
					facilities: true,
					events: {
						where: {
							date: { gte: new Date() }
						},
						orderBy: { date: 'asc' },
						take: 5
					},
					_count: {
						select: {
							users: true,
							documents: true
						}
					}
				}
			})

			if (!mansion) {
				return reply.code(404).send({ error: 'Mansion not found' })
			}

			return reply.send({ mansion })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch mansion' })
		}
	})

	// Create mansion (admin only)
	fastify.post('/', {
		preHandler: [fastify.authorizeRole(['admin'])]
	}, async (request, reply) => {
		const { name, address, description, facilities, rules } = request.body

		if (!name || !address) {
			return reply.code(400).send({ error: 'Name and address are required' })
		}

		try {
			const mansion = await prisma.mansion.create({
				data: {
					name,
					address,
					description,
					facilities,
					rules
				}
			})

			return reply.code(201).send({ mansion })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create mansion' })
		}
	})

	// Update mansion (admin or mansion_admin)
	fastify.put('/:id', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params
		const { name, address, description, facilities, rules } = request.body

		try {
			// Check if mansion_admin has access to this mansion
			if (request.user.role === 'mansion_admin' && request.user.mansionId !== id) {
				return reply.code(403).send({ error: 'Access denied' })
			}

			const mansion = await prisma.mansion.update({
				where: { id },
				data: {
					name,
					address,
					description,
					facilities,
					rules
				}
			})

			return reply.send({ mansion })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update mansion' })
		}
	})
})