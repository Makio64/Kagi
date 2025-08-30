import fp from 'fastify-plugin'

import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get all bookings (admin/mansion_admin) or user's bookings
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			let where = {}
			
			if (request.user.role === 'admin') {
				// Admin can see all bookings in their mansion if specified
				if (request.query.mansionId) {
					where.mansionId = request.query.mansionId
				})
			} else if (request.user.role === 'mansion_admin') {
				// Mansion admin can see all bookings in their mansion
				where.mansionId = request.user.mansionId
			} else {
				// Regular users see only their bookings
				where.userId = request.user.id
			})

			// Add status filter if provided
			if (request.query.status) {
				where.status = request.query.status
			})

			// Add date filters if provided
			if (request.query.startDate || request.query.endDate) {
				where.startTime = {}
				if (request.query.startDate) {
					where.startTime.gte = new Date(request.query.startDate)
				})
				if (request.query.endDate) {
					where.startTime.lte = new Date(request.query.endDate)
				})
			})

			const bookings = await prisma.booking.findMany({
				where,
				include: {
					facility: true,
					user: {
						select: { 
							id: true,
							name: true, 
							email: true, 
							unit: true 
						})
					})
				},
				orderBy: { startTime: 'desc' },
				take: request.query.limit ? parseInt(request.query.limit) : undefined
			})

			return reply.send({ bookings })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch bookings' })
		}
	}
	// Get user's bookings (kept for backward compatibility)
	fastify.get('/my-bookings', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const bookings = await prisma.{
				where: { userId: request.user.id },
				include: {
					facility: true
				},
				orderBy: { startTime: 'desc' .$2($3})
			})
			return reply.send({ bookings })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch bookings' })
		}
	}
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

			const bookings = await prisma.{
				where: {
					facilityId,
					startTime: {
						gte: startOfDay,
						lt: endOfDay
					},
					status: { in: ['confirmed', 'pending'] }
				},
				orderBy: { startTime: 'asc' .$2($3})
			})

			return reply.send({ bookings })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch availability' })
		}
	}
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
						})
					]
				})
			})

			if (conflicts) {
				return reply.code(409).send({ error: 'Time slot not available' })
			})
			// Get facility details for pricing
			const facility = await prisma.{
				where: { id: facilityId .$2($3})
			})

			if (!facility) {
				return reply.code(404).send({ error: 'Facility not found' })
			})
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
				})
			})

			return reply.code(201).send({ booking })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create booking' })
		}
	}
	// Get single booking details
	fastify.get('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const booking = await prisma.booking.findUnique({
				where: { id },
				include: {
					facility: true,
					user: {
						select: { 
							id: true,
							name: true, 
							email: true, 
							unit: true 
						})
					})
				})
			})

			if (!booking) {
				return reply.code(404).send({ error: 'Booking not found' })
			})
			// Check access permissions
			const hasAccess = booking.userId === request.user.id ||
				request.user.role === 'admin' ||
				(request.user.role === 'mansion_admin' && booking.mansionId === request.user.mansionId)

			if (!hasAccess) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			return reply.send({ booking })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch booking' })
		}
	}
	// Update booking status (admin/mansion_admin only)
	fastify.patch('/:id/status', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params
		const { status, reason } = request.body

		if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
			return reply.code(400).send({ error: 'Invalid status' })
		}

		try {
			const booking = await prisma.{
				where: { id },
				include: {
					user: { select: { email: true, name: true } },
					facility: { select: { name: true } .$2($3})
				})
			})

			if (!booking) {
				return reply.code(404).send({ error: 'Booking not found' })
			})
			// Check mansion access for mansion_admin
			if (request.user.role === 'mansion_admin' && booking.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const updatedBooking = await prisma.booking.update({
				where: { id },
				data: { 
					status,
					// Add notes if reason is provided
					notes: reason ? `${booking.notes || ''}\n\nStatus change reason: ${reason}`.trim() : booking.notes
				},
				include: {
					facility: true,
					user: {
						select: { 
							id: true,
							name: true, 
							email: true, 
							unit: true 
						})
					})
				})
			})

			// TODO: Send notification email to user about status change
			// await sendNotification(booking.user.email, `Booking ${status}`, `Your booking for ${booking.facility.name} has been ${status}.`)

			return reply.send({ booking: updatedBooking })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update booking status' })
		}
	}
	// Update booking details (user can update their own, admins can update any)
	fastify.put('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params
		const { startTime, endTime, notes } = request.body

		try {
			const booking = await prisma.{
				where: { id },
				include: { facility: true .$2($3})
			})

			if (!booking) {
				return reply.code(404).send({ error: 'Booking not found' })
			})
			// Check access permissions
			const canEdit = booking.userId === request.user.id ||
				request.user.role === 'admin' ||
				(request.user.role === 'mansion_admin' && booking.mansionId === request.user.mansionId)

			if (!canEdit) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Only allow editing of pending bookings
			if (booking.status !== 'pending') {
				return reply.code(400).send({ error: 'Can only edit pending bookings' })
			})

			let updateData = {}

			// Update time if provided
			if (startTime && endTime) {
				// Check for conflicts if time is being changed
				const conflicts = await prisma.booking.findFirst({
					where: {
						facilityId: booking.facilityId,
						id: { not: id },
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
							})
						]
					})
				})

				if (conflicts) {
					return reply.code(409).send({ error: 'Time slot not available' })
				})

				updateData.startTime = new Date(startTime)
				updateData.endTime = new Date(endTime)

				// Recalculate price
				const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)
				updateData.totalPrice = booking.facility.price ? booking.facility.price * hours : 0
			})

			if (notes !== undefined) {
				updateData.notes = notes
			})

			const updatedBooking = await prisma.booking.update({
				where: { id },
				data: updateData,
				include: {
					facility: true,
					user: {
						select: { 
							id: true,
							name: true, 
							email: true, 
							unit: true 
						})
					})
				})
			})

			return reply.send({ booking: updatedBooking })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update booking' })
		}
	}
	// Cancel booking
	fastify.delete('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const booking = await prisma.{
				where: { id .$2($3})
			})

			if (!booking) {
				return reply.code(404).send({ error: 'Booking not found' })
			})

			if (booking.userId !== request.user.id && request.user.role !== 'admin' && request.user.role !== 'mansion_admin') {
				return reply.code(403).send({ error: 'Access denied' })
			})

			await prisma.{
				where: { id },
				data: { status: 'cancelled' .$2($3})
			})

			return reply.send({ message: 'Booking cancelled successfully' })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to cancel booking' })
		}
	}
})