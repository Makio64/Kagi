import fp from 'fastify-plugin'
import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get user's bookings
	fastify.get('/my-bookings', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const bookings = await prisma.booking.findMany({
				where: { userId: request.user.id },
				include: {
					facility: true
				},
				orderBy: { startTime: 'desc' }
			})
			return reply.send({ bookings })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch bookings' })
		}
	})

	// Get facility availability
	fastify.get('/availability/:facilityId', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { facilityId } = request.params
		const { date } = request.query

		try {
			const startOfDay = new Date(date || new Date())
			startOfDay.setHours(0, 0, 0, 0)
			const endOfDay = new Date(startOfDay)
			endOfDay.setDate(endOfDay.getDate() + 1)

			const bookings = await prisma.booking.findMany({
				where: {
					facilityId,
					startTime: {
						gte: startOfDay,
						lt: endOfDay
					},
					status: { in: ['confirmed', 'pending'] }
				},
				orderBy: { startTime: 'asc' }
			})

			return reply.send({ bookings })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch availability' })
		}
	})

	// Create booking
	fastify.post('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { facilityId, startTime, endTime, notes } = request.body

		if (!facilityId || !startTime || !endTime) {
			return reply.code(400).send({ error: 'Missing required fields' })
		}

		try {
			// Check for conflicts
			const conflicts = await prisma.booking.findFirst({
				where: {
					facilityId,
					status: { in: ['confirmed', 'pending'] },
					OR: [
						{
							startTime: { lte: new Date(startTime) },
							endTime: { gt: new Date(startTime) }
						},
						{
							startTime: { lt: new Date(endTime) },
							endTime: { gte: new Date(endTime) }
						},
						{
							startTime: { gte: new Date(startTime) },
							endTime: { lte: new Date(endTime) }
						}
					]
				}
			})

			if (conflicts) {
				return reply.code(409).send({ error: 'Time slot not available' })
			}

			// Get facility details for pricing
			const facility = await prisma.facility.findUnique({
				where: { id: facilityId }
			})

			if (!facility) {
				return reply.code(404).send({ error: 'Facility not found' })
			}

			// Calculate price if applicable
			const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)
			const totalPrice = facility.price ? facility.price * hours : 0

			const booking = await prisma.booking.create({
				data: {
					userId: request.user.id,
					facilityId,
					mansionId: request.user.mansionId,
					startTime: new Date(startTime),
					endTime: new Date(endTime),
					notes,
					totalPrice,
					status: 'pending'
				},
				include: {
					facility: true
				}
			})

			return reply.code(201).send({ booking })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create booking' })
		}
	})

	// Cancel booking
	fastify.delete('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const booking = await prisma.booking.findUnique({
				where: { id }
			})

			if (!booking) {
				return reply.code(404).send({ error: 'Booking not found' })
			}

			if (booking.userId !== request.user.id && request.user.role !== 'admin' && request.user.role !== 'mansion_admin') {
				return reply.code(403).send({ error: 'Access denied' })
			}

			await prisma.booking.update({
				where: { id },
				data: { status: 'cancelled' }
			})

			return reply.send({ message: 'Booking cancelled successfully' })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to cancel booking' })
		}
	})
})