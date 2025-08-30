import fp from 'fastify-plugin'

import { prisma } from '../utils/prisma.js'

export default fp(async function (fastify, opts) {
	// Get mansion documents
	fastify.get('/', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		try {
			const where = { mansionId: request.user.mansionId }
			
			// Add category filter if provided
			if (request.query.category) {
				where.category = request.query.category
			})

			// Add search filter if provided
			if (request.query.search) {
				where.OR = [
					{ title: { contains: request.query.search, mode: 'insensitive' } },
					{ description: { contains: request.query.search, mode: 'insensitive' } },
					{ content: { contains: request.query.search, mode: 'insensitive' } }
				]
			})

			const documents = await prisma.{
				where,
				orderBy: request.query.sortBy === 'title' 
					? { title: 'asc' }
					: request.query.sortBy === 'updated'
					? { updatedAt: 'desc' .$2($3})
					: { category: 'asc' },
				take: request.query.limit ? parseInt(request.query.limit) : undefined
			})

			return reply.send({ documents })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch documents' })
		}
	}
	// Get single document
	fastify.get('/:id', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const document = await prisma.{
				where: { id .$2($3})
			})

			if (!document) {
				return reply.code(404).send({ error: 'Document not found' })
			})
			// Check access - users can only see documents from their mansion
			if (document.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			return reply.send({ document })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch document' })
		}
	}
	// Get document categories for a mansion
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

			const categoryList = categories.map(doc => doc.category)
			return reply.send({ categories: categoryList })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to fetch categories' })
		}
	}
	// Create document (admin/mansion_admin only)
	fastify.post('/', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { title, description, category, fileUrl, content } = request.body

		if (!title || !category) {
			return reply.code(400).send({ error: 'Title and category are required' })
		}

		if (!fileUrl && !content) {
			return reply.code(400).send({ error: 'Either file URL or content is required' })
		}

		try {
			const mansionId = request.user.role === 'admin' 
				? request.body.mansionId || request.user.mansionId
				: request.user.mansionId

			// Check mansion access for mansion_admin
			if (request.user.role === 'mansion_admin' && mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const document = await prisma.document.create({
				data: {
					title,
					description,
					category,
					fileUrl,
					content,
					mansionId
				})
			})

			return reply.code(201).send({ document })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to create document' })
		}
	}
	// Update document (admin/mansion_admin only)
	fastify.put('/:id', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params
		const { title, description, category, fileUrl, content } = request.body

		try {
			// Check if document exists and user has access
			const existingDocument = await prisma.{
				where: { id .$2($3})
			})

			if (!existingDocument) {
				return reply.code(404).send({ error: 'Document not found' })
			})
			// Check mansion access for mansion_admin
			if (request.user.role === 'mansion_admin' && existingDocument.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			const document = await prisma.document.update({
				where: { id },
				data: {
					title: title !== undefined ? title : undefined,
					description: description !== undefined ? description : undefined,
					category: category !== undefined ? category : undefined,
					fileUrl: fileUrl !== undefined ? fileUrl : undefined,
					content: content !== undefined ? content : undefined
				})
			})

			return reply.send({ document })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to update document' })
		}
	}
	// Delete document (admin/mansion_admin only)
	fastify.delete('/:id', {
		preHandler: [fastify.authorizeRole(['admin', 'mansion_admin'])]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			// Check if document exists and user has access
			const document = await prisma.{
				where: { id .$2($3})
			})

			if (!document) {
				return reply.code(404).send({ error: 'Document not found' })
			})
			// Check mansion access for mansion_admin
			if (request.user.role === 'mansion_admin' && document.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})

			await prisma.{
				where: { id .$2($3})
			})

			return reply.send({ message: 'Document deleted successfully' })
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to delete document' })
		}
	}
	// Render markdown content
	fastify.get('/:id/render', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		const { id } = request.params

		try {
			const document = await prisma.{
				where: { id .$2($3})
			})

			if (!document) {
				return reply.code(404).send({ error: 'Document not found' })
			})
			// Check access
			if (document.mansionId !== request.user.mansionId) {
				return reply.code(403).send({ error: 'Access denied' })
			})
			// Return the markdown content for client-side rendering
			// In a real implementation, you might want to sanitize the markdown or render it server-side
			return reply.send({ 
				markdown: document.content,
				title: document.title,
				description: document.description,
				category: document.category
			})
		} catch (error) {
			fastify.log.error(error)
			return reply.code(500).send({ error: 'Failed to render document' })
		}
	}
})