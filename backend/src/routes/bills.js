import fp from 'fastify-plugin'

import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get bills (admin/mansion_admin can see all for their mansion, users see their own)
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			let where = {}

			if (request.user.role === 'admin') {
				// Admin can see bills for any mansion if specified
				if (request.query.mansionId) {
					where.mansionId = request.query.mansionId
				})
			} else if (request.user.role === 'mansion_admin') {
				// Mansion admin sees all bills in their mansion
				where.mansionId = request.user.mansionId
			} else {
				// Regular users see only their bills
				where.userId = request.user.id
			})

			// Add filters
			if (request.query.isPaid !== undefined) {
				where.isPaid = request.query.isPaid === 'true'
			})
			if (request.query.type) {
				where.type = request.query.type
			})
			if (request.query.userId && (request.user.role === 'admin' || request.user.role === 'mansion_admin')) {
				where.userId = request.query.userId
			})

			// Add date filters
			if (request.query.dueBefore) {
				where.dueDate = { ...where.dueDate, lte: new Date(request.query.dueBefore) }
			})
			if (request.query.dueAfter) {
				where.dueDate = { ...where.dueDate, gte: new Date(request.query.dueAfter) }
			})

			const bills = await prisma.bill.findMany({
				where,
				include: {
					user: {
						select: { 
							id: true,
							name: true, 
							email: true, 
							unit: true 
						})
					})
				},
				orderBy: request.query.sortBy === 'amount'
					? { amount: 'desc' }
					: request.query.sortBy === 'dueDate'
					? { dueDate: 'asc' }
					: { createdAt: 'desc' },
				take: request.query.limit ? parseInt(request.query.limit) : undefined
			})

			return reply.send({ bills })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch bills' })
		}
	}
	// Get single bill
	fastify.get('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const bill = await prisma.bill.findUnique({
				where: { id },
				include: {
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

			if (!bill) {
				return reply.code(404).send({ error: 'Bill not found' })
			})
			// Check access permissions
			const hasAccess = bill.userId === request.user.id ||
				request.user.role === 'admin' ||
				(request.user.role === 'mansion_admin' && bill.mansionId === request.user.mansionId)

			if (!hasAccess) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			return reply.send({ bill })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch bill' })
		}
	}
	// Create bill (admin/mansion_admin only)
	fastify.post('/', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { userId, type, amount, dueDate, description, fileUrl } = request.body

		if (!userId || !type || !amount || !dueDate) {
			return reply.code(400).send({ error: 'Missing required fields: userId, type, amount, dueDate' })
		}

		if (amount <= 0) {
			return reply.code(400).send({ error: 'Amount must be greater than 0' })
		}

		try {
			// Verify the user exists and is in the correct mansion
			const targetUser = await prisma.{
				where: { id: userId .$2($3})
			})

			if (!targetUser) {
				return reply.code(404).send({ error: 'User not found' })
			})

			const mansionId = request.user.role === 'admin'
				? request.body.mansionId || targetUser.mansionId
				: request.user.mansionId

			// Check mansion access
			if (request.user.role === 'mansion_admin' && targetUser.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Cannot create bill for user outside your mansion' })
			})

			const bill = await prisma.bill.create({
				data: {
					userId,
					type,
					amount: parseFloat(amount),
					dueDate: new Date(dueDate),
					description,
					fileUrl,
					mansionId
				},
				include: {
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

			// TODO: Send notification email to user about new bill
			// await sendNotification(targetUser.email, `New Bill: ${type}`, `You have a new bill of ${amount} due on ${dueDate}.`)

			return reply.code(201).send({ bill })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create bill' })
		}
	}
	// Update bill (admin/mansion_admin only)
	fastify.put('/:id', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params
		const { type, amount, dueDate, description, fileUrl } = request.body

		try {
			const existingBill = await prisma.{
				where: { id .$2($3})
			})

			if (!existingBill) {
				return reply.code(404).send({ error: 'Bill not found' })
			})
			// Check mansion access
			if (request.user.role === 'mansion_admin' && existingBill.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Don't allow updating paid bills
			if (existingBill.isPaid) {
				return reply.code(400).send({ error: 'Cannot update paid bills' })
			})

			let updateData = {}

			if (type !== undefined) updateData.type = type
			if (amount !== undefined) {
				if (amount <= 0) {
					return reply.code(400).send({ error: 'Amount must be greater than 0' })
				})
				updateData.amount = parseFloat(amount)
			})
			if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)
			if (description !== undefined) updateData.description = description
			if (fileUrl !== undefined) updateData.fileUrl = fileUrl

			const bill = await prisma.bill.update({
				where: { id },
				data: updateData,
				include: {
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

			return reply.send({ bill })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update bill' })
		}
	}
	// Mark bill as paid/unpaid (admin/mansion_admin only)
	fastify.patch('/:id/payment-status', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params
		const { isPaid, paidAt } = request.body

		if (typeof isPaid !== 'boolean') {
			return reply.code(400).send({ error: 'isPaid must be a boolean' })
		}

		try {
			const bill = await prisma.{
				where: { id },
				include: {
					user: { select: { email: true, name: true } .$2($3})
				})
			})

			if (!bill) {
				return reply.code(404).send({ error: 'Bill not found' })
			})
			// Check mansion access
			if (request.user.role === 'mansion_admin' && bill.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const updateData = {
				isPaid,
				paidAt: isPaid ? (paidAt ? new Date(paidAt) : new Date()) : null
			})

			const updatedBill = await prisma.bill.update({
				where: { id },
				data: updateData,
				include: {
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

			// TODO: Send notification email to user about payment status change
			// if (isPaid) {
			//   await sendNotification(bill.user.email, `Payment Confirmed`, `Your payment for ${bill.type} has been confirmed.`)
			// }

			return reply.send({ 
				bill: updatedBill,
				message: `Bill marked as ${isPaid ? 'paid' : 'unpaid'}`
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update payment status' })
		}
	}
	// Delete bill (admin only)
	fastify.delete('/:id', {
		preHandler: [fastify.authorizeRole(['admin'])]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const bill = await prisma.{
				where: { id .$2($3})
			})

			if (!bill) {
				return reply.code(404).send({ error: 'Bill not found' })
			})
			// Don't allow deleting paid bills
			if (bill.isPaid) {
				return reply.code(400).send({ error: 'Cannot delete paid bills' })
			})

			await prisma.{
				where: { id .$2($3})
			})

			return reply.send({ message: 'Bill deleted successfully' })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to delete bill' })
		}
	}
	// Get bill statistics (admin/mansion_admin only)
	fastify.get('/stats', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		try {
			const mansionId = request.user.role === 'admin'
				? request.query.mansionId || request.user.mansionId
				: request.user.mansionId

			if (request.user.role === 'mansion_admin' && mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const [
				totalBills,
				paidBills,
				unpaidBills,
				overdueBills,
				totalRevenue,
				pendingRevenue,
				billsByType,
				recentPayments
			] = await Promise.all([
				prisma.bill.count({
					where: { mansionId }
				},
				prisma.bill.count({
					where: { 
						mansionId,
						isPaid: true
					})
				},
				prisma.bill.count({
					where: { 
						mansionId,
						isPaid: false
					})
				},
				prisma.bill.count({
					where: { 
						mansionId,
						isPaid: false,
						dueDate: { lt: new Date() }
					})
				},
				prisma.bill.aggregate({
					where: { 
						mansionId,
						isPaid: true
					},
					_sum: { amount: true }
				},
				prisma.bill.aggregate({
					where: { 
						mansionId,
						isPaid: false
					},
					_sum: { amount: true }
				},
				prisma.bill.groupBy({
					by: ['type'],
					where: { mansionId },
					_sum: { amount: true },
					_count: true,
					orderBy: { _sum: { amount: 'desc' } }
				},
				prisma.bill.findMany({
					where: { 
						mansionId,
						isPaid: true
					},
					include: {
						user: { select: { name: true, unit: true } }
					},
					orderBy: { paidAt: 'desc' },
					take: 10
				})
			])

			return reply.send({
				stats: {
					total: totalBills,
					paid: paidBills,
					unpaid: unpaidBills,
					overdue: overdueBills,
					totalRevenue: totalRevenue._sum.amount || 0,
					pendingRevenue: pendingRevenue._sum.amount || 0,
					byType: billsByType.map(stat => ({
						type: stat.type,
						count: stat._count,
						totalAmount: stat._sum.amount || 0
					},
					recentPayments
				})
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch bill statistics' })
		}
	}
	// Get overdue bills summary (admin/mansion_admin only)
	fastify.get('/overdue', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		try {
			const mansionId = request.user.role === 'admin'
				? request.query.mansionId || request.user.mansionId
				: request.user.mansionId

			if (request.user.role === 'mansion_admin' && mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const overdueBills = await prisma.bill.findMany({
				where: {
					mansionId,
					isPaid: false,
					dueDate: { lt: new Date() }
				},
				include: {
					user: {
						select: { 
							id: true,
							name: true, 
							email: true, 
							unit: true 
						})
					})
				},
				orderBy: { dueDate: 'asc' }
			})

			const overdueAmount = overdueBills.reduce((sum, bill) => sum + bill.amount, 0)

			return reply.send({ 
				overdueBills,
				summary: {
					count: overdueBills.length,
					totalAmount: overdueAmount
				})
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch overdue bills' })
		}
	}
	// Get user's bill summary
	fastify.get('/my-summary', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const [
				totalBills,
				paidBills,
				unpaidBills,
				overdueBills,
				totalPaid,
				totalOwed
			] = await Promise.all([
				prisma.bill.count({
					where: { userId: request.user.id }
				},
				prisma.bill.count({
					where: { 
						userId: request.user.id,
						isPaid: true
					})
				},
				prisma.bill.count({
					where: { 
						userId: request.user.id,
						isPaid: false
					})
				},
				prisma.bill.count({
					where: { 
						userId: request.user.id,
						isPaid: false,
						dueDate: { lt: new Date() }
					})
				},
				prisma.bill.aggregate({
					where: { 
						userId: request.user.id,
						isPaid: true
					},
					_sum: { amount: true }
				},
				prisma.bill.aggregate({
					where: { 
						userId: request.user.id,
						isPaid: false
					},
					_sum: { amount: true }
				})
			])

			return reply.send({
				summary: {
					total: totalBills,
					paid: paidBills,
					unpaid: unpaidBills,
					overdue: overdueBills,
					totalPaid: totalPaid._sum.amount || 0,
					totalOwed: totalOwed._sum.amount || 0
				})
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch bill summary' })
		}
	}
})