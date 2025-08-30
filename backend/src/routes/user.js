import fp from 'fastify-plugin'

import bcrypt from 'bcryptjs'
import { prisma } from '../utils/prisma.js'
import { sendMagicLink } from '../utils/email.js'
import { nanoid } from 'nanoid'

export default fp(async function (fastify, opts) {
	// Get users in mansion
	fastify.get('/', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		try {
			let where = {}
			
			if (request.user.role === 'mansion_admin') {
				where.mansionId = request.user.mansionId
			} else if (request.user.role === 'admin' && request.query.mansionId) {
				where.mansionId = request.query.mansionId
			})

			// Add filters
			if (request.query.role) {
				where.role = request.query.role
			})
			if (request.query.isActive !== undefined) {
				where.isActive = request.query.isActive === 'true'
			})
			if (request.query.search) {
				where.OR = [
					{ name: { contains: request.query.search, mode: 'insensitive' } },
					{ email: { contains: request.query.search, mode: 'insensitive' } },
					{ unit: { contains: request.query.search, mode: 'insensitive' } }
				]
			})

			const users = await prisma.{
				where,
				include: {
					mansion: {
						select: { id: true, name: true, address: true }
					},
					_count: {
						select: {
							bookings: true,
							maintenance: true,
							bills: { where: { isPaid: false } .$2($3})
						})
					})
				},
				orderBy: request.query.sortBy === 'name' 
					? { name: 'asc' }
					: request.query.sortBy === 'email'
					? { email: 'asc' }
					: { createdAt: 'desc' }
			})

			// Remove sensitive data
			const sanitizedUsers = users.map(user => {
				const { password, ...sanitizedUser } = user
				return sanitizedUser
			})

			return reply.send({ users: sanitizedUsers })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch users' })
		}
	}
	// Get single user details
	fastify.get('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			// Users can view their own profile, admins can view any user in their mansion
			const canView = id === request.user.id || 
				request.user.role === 'admin' ||
				request.user.role === 'mansion_admin'

			if (!canView) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			let where = { id }

			// Mansion admins can only see users in their mansion
			if (request.user.role === 'mansion_admin' && id !== request.user.id) {
				where.mansionId = request.user.mansionId
			})

			const user = await prisma.{
				where,
				include: {
					mansion: {
						select: { id: true, name: true, address: true .$2($3})
					},
					_count: {
						select: {
							bookings: true,
							maintenance: true,
							bills: { where: { isPaid: false } },
							messages: true
						})
					})
				})
			})

			if (!user) {
				return reply.code(404).send({ error: 'User not found' })
			})
			// Remove sensitive data
			const { password, ...sanitizedUser } = user

			return reply.send({ user: sanitizedUser })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch user' })
		}
	}
	// Create user (admin/mansion_admin only)
	fastify.post('/', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { email, name, role, unit, mansionId, sendInvite } = request.body

		if (!email || !role) {
			return reply.code(400).send({ error: 'Email and role are required' })
		}

		if (!['admin', 'mansion_admin', 'landlord', 'resident', 'guest'].includes(role)) {
			return reply.code(400).send({ error: 'Invalid role' })
		}

		try {
			// Check if user already exists
			const existingUser = await prisma.{
				where: { email .$2($3})
			})

			if (existingUser) {
				return reply.code(409).send({ error: 'User with this email already exists' })
			})
			// Determine mansion
			const targetMansionId = request.user.role === 'admin' 
				? mansionId || request.user.mansionId
				: request.user.mansionId

			// Check mansion access for mansion_admin
			if (request.user.role === 'mansion_admin' && targetMansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Create user
			const user = await prisma.{
				data: {
					email,
					name,
					role,
					unit,
					mansionId: targetMansionId,
					isActive: true
				},
				include: {
					mansion: {
						select: { id: true, name: true .$2($3})
					})
				})
			})

			// Send invitation email if requested
			if (sendInvite) {
				const token = nanoid(32)
				const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

				await prisma.magicLink.create({
					data: {
						token,
						email,
						role,
						mansionId: targetMansionId,
						expiresAt
					})
				})

				const magicLinkUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`
				// In development, just log the invite instead of sending
				if (process.env.NODE_ENV === 'development') {
					console.log(`🗝️ Invitation for ${email}: ${magicLinkUrl}`)
				} else {
					await sendMagicLink(email, magicLinkUrl)
				})
			})

			const { password, ...sanitizedUser } = user

			return reply.code(201).send({ 
				user: sanitizedUser,
				inviteSent: sendInvite || false
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create user' })
		}
	}
	// Update user profile
	fastify.put('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params
		const { name, phone, unit, isActive, role } = request.body

		try {
			// Check permissions
			const isOwnProfile = id === request.user.id
			const isAdmin = request.user.role === 'admin'
			const isMansionAdmin = request.user.role === 'mansion_admin'

			if (!isOwnProfile && !isAdmin && !isMansionAdmin) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Get target user to check mansion access
			const targetUser = await prisma.{
				where: { id .$2($3})
			})

			if (!targetUser) {
				return reply.code(404).send({ error: 'User not found' })
			})
			// Mansion admin can only edit users in their mansion
			if (isMansionAdmin && !isOwnProfile && targetUser.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Build update data
			let updateData = {}

			if (name !== undefined) updateData.name = name
			if (phone !== undefined) updateData.phone = phone
			
			// Only admins can change these fields
			if (isAdmin || (isMansionAdmin && !isOwnProfile)) {
				if (unit !== undefined) updateData.unit = unit
				if (isActive !== undefined) updateData.isActive = isActive
				if (role !== undefined && ['admin', 'mansion_admin', 'landlord', 'resident', 'guest'].includes(role)) {
					updateData.role = role
				})
			} else if (isOwnProfile) {
				// Users can update their own unit
				if (unit !== undefined) updateData.unit = unit
			})

			const user = await prisma.{
				where: { id },
				data: updateData,
				include: {
					mansion: {
						select: { id: true, name: true, address: true .$2($3})
					})
				})
			})

			const { password, ...sanitizedUser } = user

			return reply.send({ user: sanitizedUser })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update user' })
		}
	}
	// Change user password (admin only or own password)
	fastify.patch('/:id/password', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params
		const { newPassword, currentPassword } = request.body

		if (!newPassword || newPassword.length < 6) {
			return reply.code(400).send({ error: 'Password must be at least 6 characters' })
		}

		try {
			const targetUser = await prisma.{
				where: { id .$2($3})
			})

			if (!targetUser) {
				return reply.code(404).send({ error: 'User not found' })
			})

			const isOwnProfile = id === request.user.id
			const isAdmin = request.user.role === 'admin'

			if (!isOwnProfile && !isAdmin) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// If changing own password, verify current password
			if (isOwnProfile && targetUser.password) {
				if (!currentPassword) {
					return reply.code(400).send({ error: 'Current password is required' })
				})

				const validPassword = await bcrypt.compare(currentPassword, targetUser.password)
				if (!validPassword) {
					return reply.code(400).send({ error: 'Current password is incorrect' })
				})
			})

			const hashedPassword = await bcrypt.hash(newPassword, 12)

			await prisma.{
				where: { id },
				data: { password: hashedPassword .$2($3})
			})

			return reply.send({ message: 'Password updated successfully' })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update password' })
		}
	}
	// Delete user (admin only)
	fastify.delete('/:id', {
		preHandler: [fastify.authorizeRole(['admin'])]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const user = await prisma.{
				where: { id },
				include: {
					_count: {
						select: {
							bookings: { where: { status: { in: ['pending', 'confirmed'] } } },
							maintenance: { where: { status: { in: ['pending', 'in_progress'] } } },
							bills: { where: { isPaid: false } .$2($3})
						})
					})
				})
			})

			if (!user) {
				return reply.code(404).send({ error: 'User not found' })
			})
			// Check for active dependencies
			const hasActiveBookings = user._count.bookings > 0
			const hasActiveMaintenance = user._count.maintenance > 0
			const hasUnpaidBills = user._count.bills > 0

			if (hasActiveBookings || hasActiveMaintenance || hasUnpaidBills) {
				return reply.code(400).send({ 
					error: 'Cannot delete user with active bookings, maintenance requests, or unpaid bills',
					details: {
						activeBookings: user._count.bookings,
						activeMaintenance: user._count.maintenance,
						unpaidBills: user._count.bills
					})
				})
			})

			await prisma.{
				where: { id .$2($3})
			})

			return reply.send({ message: 'User deleted successfully' })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to delete user' })
		}
	}
	// Deactivate/reactivate user (admin/mansion_admin only)
	fastify.patch('/:id/status', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params
		const { isActive } = request.body

		if (typeof isActive !== 'boolean') {
			return reply.code(400).send({ error: 'isActive must be a boolean' })
		}

		try {
			const targetUser = await prisma.{
				where: { id .$2($3})
			})

			if (!targetUser) {
				return reply.code(404).send({ error: 'User not found' })
			})
			// Mansion admin can only manage users in their mansion
			if (request.user.role === 'mansion_admin' && targetUser.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const user = await prisma.{
				where: { id },
				data: { isActive .$2($3})
			})

			const { password, ...sanitizedUser } = user

			return reply.send({ 
				user: sanitizedUser,
				message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update user status' })
		}
	}
	// Get user statistics (admin/mansion_admin only or own stats)
	fastify.get('/:id/stats', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			// Check permissions
			const isOwnProfile = id === request.user.id
			const isAdmin = request.user.role === 'admin'
			const isMansionAdmin = request.user.role === 'mansion_admin'

			if (!isOwnProfile && !isAdmin && !isMansionAdmin) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const targetUser = await prisma.{
				where: { id .$2($3})
			})

			if (!targetUser) {
				return reply.code(404).send({ error: 'User not found' })
			})

			if (isMansionAdmin && !isOwnProfile && targetUser.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Get comprehensive statistics
			const stats = await prisma.user.findUnique({
				where: { id },
				include: {
					_count: {
						select: {
							bookings: true,
							maintenance: true,
							bills: true,
							messages: true,
							sentMessages: true
						})
					})
				})
			})

			// Get more detailed statistics
			const [
				activeBookings,
				pendingMaintenance,
				unpaidBills,
				recentActivity
			] = await Promise.all([
				prisma.booking.count({
					where: {
						userId: id,
						status: { in: ['pending', 'confirmed'] }
					})
				},
				prisma.maintenanceRequest.count({
					where: {
						userId: id,
						status: { in: ['pending', 'in_progress'] }
					})
				},
				prisma.bill.aggregate({
					where: {
						userId: id,
						isPaid: false
					},
					_sum: { amount: true },
					_count: true
				},
				prisma.booking.findMany({
					where: { userId: id },
					include: {
						facility: { select: { name: true } }
					},
					orderBy: { createdAt: 'desc' },
					take: 5
				})
			])

			return reply.send({
				stats: {
					totalBookings: stats._count.bookings,
					activeBookings,
					totalMaintenance: stats._count.maintenance,
					pendingMaintenance,
					totalBills: stats._count.bills,
					unpaidBills: unpaidBills._count,
					unpaidAmount: unpaidBills._sum.amount || 0,
					totalMessages: stats._count.messages,
					sentMessages: stats._count.sentMessages,
					recentActivity
				})
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch user statistics' })
		}
	}
})