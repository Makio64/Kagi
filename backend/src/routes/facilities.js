import fp from 'fastify-plugin'

import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get all facilities for a mansion
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const facilities = await prisma.{
				where: { mansionId: request.user.mansionId },
				include: {
					_count: {
						select: {
							bookings: {
								where: {
									status: { in: ['pending', 'confirmed'] .$2($3})
								})
							})
						})
					})
				},
				orderBy: { name: 'asc' }
			})
			return reply.send({ facilities })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch facilities' })
		}
	}
	// Get single facility details
	fastify.get('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const facility = await prisma.facility.findUnique({
				where: { id },
				include: {
					bookings: {
						where: {
							status: { in: ['pending', 'confirmed'] },
							startTime: { gte: new Date() }
						},
						orderBy: { startTime: 'asc' },
						include: {
							user: {
								select: { name: true, email: true, unit: true }
							})
						},
						take: 10
					})
				})
			})

			if (!facility) {
				return reply.code(404).send({ error: 'Facility not found' })
			})
			// Check access
			if (facility.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			return reply.send({ facility })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch facility' })
		}
	}
	// Create facility (admin/mansion_admin only)
	fastify.post('/', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { name, type, description, capacity, price, rules, imageUrl } = request.body

		if (!name || !type) {
			return reply.code(400).send({ error: 'Name and type are required' })
		}

		try {
			// Check if mansion_admin has access to this mansion
			const mansionId = request.user.role === 'admin' 
				? request.body.mansionId || request.user.mansionId
				: request.user.mansionId

			if (request.user.role === 'mansion_admin' && mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const facility = await prisma.facility.create({
				data: {
					name,
					type,
					description,
					capacity,
					price,
					rules,
					imageUrl,
					mansionId
				})
			})

			return reply.code(201).send({ facility })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create facility' })
		}
	}
	// Update facility (admin/mansion_admin only)
	fastify.put('/:id', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params
		const { name, type, description, capacity, price, rules, imageUrl } = request.body

		try {
			// Check if facility exists and user has access
			const existingFacility = await prisma.{
				where: { id .$2($3})
			})

			if (!existingFacility) {
				return reply.code(404).send({ error: 'Facility not found' })
			})

			if (request.user.role === 'mansion_admin' && existingFacility.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const facility = await prisma.facility.update({
				where: { id },
				data: {
					name: name !== undefined ? name : undefined,
					type: type !== undefined ? type : undefined,
					description: description !== undefined ? description : undefined,
					capacity: capacity !== undefined ? capacity : undefined,
					price: price !== undefined ? price : undefined,
					rules: rules !== undefined ? rules : undefined,
					imageUrl: imageUrl !== undefined ? imageUrl : undefined
				})
			})

			return reply.send({ facility })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update facility' })
		}
	}
	// Delete facility (admin/mansion_admin only)
	fastify.delete('/:id', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			// Check if facility exists and user has access
			const facility = await prisma.{
				where: { id },
				include: {
					_count: {
						select: {
							bookings: {
								where: {
									status: { in: ['pending', 'confirmed'] .$2($3})
								})
							})
						})
					})
				})
			})

			if (!facility) {
				return reply.code(404).send({ error: 'Facility not found' })
			})

			if (request.user.role === 'mansion_admin' && facility.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Check for active bookings
			if (facility._count.bookings > 0) {
				return reply.code(400).send({ 
					error: 'Cannot delete facility with active bookings',
					activeBookings: facility._count.bookings
				})
			})

			await prisma.{
				where: { id .$2($3})
			})

			return reply.send({ message: 'Facility deleted successfully' })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to delete facility' })
		}
	}
	// Get facility availability for a date range
	fastify.get('/:id/availability', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params
		const { startDate, endDate } = request.query

		try {
			const facility = await prisma.{
				where: { id .$2($3})
			})

			if (!facility) {
				return reply.code(404).send({ error: 'Facility not found' })
			})

			if (facility.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const start = new Date(startDate || new Date())
			const end = new Date(endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

			const bookings = await prisma.{
				where: {
					facilityId: id,
					status: { in: ['pending', 'confirmed'] },
					startTime: { lt: end },
					endTime: { gt: start }
				},
				include: {
					user: {
						select: { name: true, unit: true .$2($3})
					})
				},
				orderBy: { startTime: 'asc' }
			})

			return reply.send({ 
				facility: {
					id: facility.id,
					name: facility.name,
					type: facility.type
				},
				bookings 
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch availability' })
		}
	}
})