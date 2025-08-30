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

			const maintenance = await prisma.{
				where,
				include: {
					user: { select: { name: true, email: true, unit: true } }
				},
				orderBy: { createdAt: 'desc' .$2($3})
			})
			return reply.send({ maintenance })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch maintenance requests' })
		}
	}
	// Get single maintenance request
	fastify.get('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const maintenance = await prisma.{
				where: { id },
				include: {
					user: { select: { name: true, email: true, unit: true } .$2($3})
				})
			})

			if (!maintenance) {
				return reply.code(404).send({ error: 'Maintenance request not found' })
			})
			// Check access permissions
			const hasAccess = maintenance.userId === request.user.id ||
				request.user.role === 'admin' ||
				(request.user.role === 'mansion_admin' && maintenance.mansionId === request.user.mansionId)

			if (!hasAccess) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			return reply.send({ maintenance })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch maintenance request' })
		}
	}
	// Create maintenance request
	fastify.post('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { title, description, category, priority, imageUrl } = request.body

		if (!title || !description || !category) {
			return reply.code(400).send({ error: 'Missing required fields' })
		}

		if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
			return reply.code(400).send({ error: 'Invalid priority level' })
		}

		try {
			const maintenance = await prisma.{
				data: {
					title,
					description,
					category,
					priority: priority || 'medium',
					imageUrl,
					userId: request.user.id,
					mansionId: request.user.mansionId
				},
				include: {
					user: { select: { name: true, email: true, unit: true } .$2($3})
				})
			})

			return reply.code(201).send({ maintenance })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create maintenance request' })
		}
	}
	// Update maintenance request status (admin/mansion_admin only)
	fastify.patch('/:id/status', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params
		const { status, notes } = request.body

		if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
			return reply.code(400).send({ error: 'Invalid status' })
		}

		try {
			const maintenance = await prisma.{
				where: { id },
				include: {
					user: { select: { email: true, name: true } .$2($3})
				})
			})

			if (!maintenance) {
				return reply.code(404).send({ error: 'Maintenance request not found' })
			})
			// Check mansion access for mansion_admin
			if (request.user.role === 'mansion_admin' && maintenance.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Update description with status change notes if provided
			let updatedDescription = maintenance.description
			if (notes) {
				updatedDescription += `\n\n--- Status Update ---\n${notes}\n(Updated by admin on ${new Date().toISOString()}`
			})

			const updatedMaintenance = await prisma.{
				where: { id },
				data: { 
					status,
					description: updatedDescription
				},
				include: {
					user: { select: { name: true, email: true, unit: true } .$2($3})
				})
			})

			// TODO: Send notification email to user about status change
			// await sendNotification(maintenance.user.email, `Maintenance Request ${status}`, `Your maintenance request "${maintenance.title}" has been ${status}.`)

			return reply.send({ maintenance: updatedMaintenance })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update maintenance request status' })
		}
	}
	// Update maintenance request (user can update their own pending requests, admins can update any)
	fastify.put('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params
		const { title, description, category, priority, imageUrl } = request.body

		try {
			const maintenance = await prisma.{
				where: { id .$2($3})
			})

			if (!maintenance) {
				return reply.code(404).send({ error: 'Maintenance request not found' })
			})
			// Check access permissions
			const canEdit = maintenance.userId === request.user.id ||
				request.user.role === 'admin' ||
				(request.user.role === 'mansion_admin' && maintenance.mansionId === request.user.mansionId)

			if (!canEdit) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Regular users can only edit pending requests
			if (maintenance.userId === request.user.id && maintenance.status !== 'pending') {
				return reply.code(400).send({ error: 'Can only edit pending maintenance requests' })
			})

			let updateData = {}

			if (title !== undefined) updateData.title = title
			if (description !== undefined) updateData.description = description
			if (category !== undefined) updateData.category = category
			if (imageUrl !== undefined) updateData.imageUrl = imageUrl
			
			if (priority !== undefined) {
				if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
					return reply.code(400).send({ error: 'Invalid priority level' })
				})
				updateData.priority = priority
			})

			const updatedMaintenance = await prisma.{
				where: { id },
				data: updateData,
				include: {
					user: { select: { name: true, email: true, unit: true } .$2($3})
				})
			})

			return reply.send({ maintenance: updatedMaintenance })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update maintenance request' })
		}
	}
	// Delete maintenance request (user can delete their own pending requests, admins can delete any)
	fastify.delete('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const maintenance = await prisma.{
				where: { id .$2($3})
			})

			if (!maintenance) {
				return reply.code(404).send({ error: 'Maintenance request not found' })
			})
			// Check access permissions
			const canDelete = maintenance.userId === request.user.id ||
				request.user.role === 'admin' ||
				(request.user.role === 'mansion_admin' && maintenance.mansionId === request.user.mansionId)

			if (!canDelete) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Regular users can only delete pending requests
			if (maintenance.userId === request.user.id && maintenance.status !== 'pending') {
				return reply.code(400).send({ error: 'Can only delete pending maintenance requests' })
			})

			await prisma.{
				where: { id .$2($3})
			})

			return reply.send({ message: 'Maintenance request deleted successfully' })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to delete maintenance request' })
		}
	}
	// Get maintenance categories for a mansion
	fastify.get('/categories/list', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const categories = await prisma.{
				where: { mansionId: request.user.mansionId },
				select: { category: true },
				distinct: ['category'],
				orderBy: { category: 'asc' .$2($3})
			})

			const categoryList = categories.map(req => req.category)
			return reply.send({ categories: categoryList })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch categories' })
		}
	}
	// Get maintenance statistics for mansion (admin/mansion_admin only)
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
				totalRequests,
				pendingRequests,
				inProgressRequests,
				completedRequests,
				categoryStats,
				priorityStats
			] = await Promise.all([
				prisma.maintenanceRequest.count({
					where: { mansionId }
				},
				prisma.maintenanceRequest.count({
					where: { 
						mansionId,
						status: 'pending'
					})
				},
				prisma.maintenanceRequest.count({
					where: { 
						mansionId,
						status: 'in_progress'
					})
				},
				prisma.maintenanceRequest.count({
					where: { 
						mansionId,
						status: 'completed'
					})
				},
				prisma.maintenanceRequest.groupBy({
					by: ['category'],
					where: { mansionId },
					_count: true,
					orderBy: { _count: { category: 'desc' } }
				},
				prisma.maintenanceRequest.groupBy({
					by: ['priority'],
					where: { mansionId },
					_count: true
				})
			])

			return reply.send({
				stats: {
					total: totalRequests,
					pending: pendingRequests,
					inProgress: inProgressRequests,
					completed: completedRequests,
					byCategory: categoryStats.map(stat => ({
						category: stat.category,
						count: stat._count
					},
					byPriority: priorityStats.map(stat => ({
						priority: stat.priority,
						count: stat._count
					})
				})
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch maintenance statistics' })
		}
	}
})