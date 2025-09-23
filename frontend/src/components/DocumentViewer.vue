<template>
	<div class="document-viewer">
		<button class="back-btn" :title="$t('common.back')" @click="$emit('close')">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<button class="close-btn" :title="$t('common.close')" @click="$emit('close')">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		<div v-if="isAdmin && !isEditing" class="admin-bar">
			<button class="edit-btn" @click="startEditing">
				✏️ {{ $t('common.edit') }}
			</button>
		</div>

		<div v-if="isAdmin && isEditing" class="admin-bar editing">
			<button class="save-btn" @click="saveDocument">
				💾 {{ $t('common.save') }}
			</button>
			<button class="cancel-btn" @click="cancelEditing">
				{{ $t('common.cancel') }}
			</button>
		</div>

		<div v-if="!isEditing" class="document-content">
			<div class="markdown-body" v-html="renderedContent" />
			<div class="last-updated">
				{{ $t('dashboard.documents.lastUpdated') }}: {{ lastUpdated }}
			</div>
		</div>

		<div v-else class="editor-container">
			<div class="editor-panel">
				<h3>{{ $t('common.editor') }}</h3>
				<textarea
					v-model="editContent"
					class="markdown-editor"
					placeholder="Write your markdown here..."
				/>
			</div>
			<div class="preview-panel">
				<h3>{{ $t('common.preview') }}</h3>
				<div class="markdown-body" v-html="previewContent" />
			</div>
		</div>
	</div>
</template>

<script>
import DOMPurify from 'dompurify'
import { marked } from 'marked'

export default {
	name: 'DocumentViewer',
	emits: ['close', 'save'],
	props: {
		title: String,
		content: String,
		lastUpdated: String,
		isAdmin: Boolean,
		documentId: String
	},
	data() {
		return {
			isEditing: false,
			editContent: this.content || ''
		}
	},
	computed: {
		renderedContent() {
			const html = marked( this.content || '' )
			return DOMPurify.sanitize( html )
		},
		previewContent() {
			const html = marked( this.editContent || '' )
			return DOMPurify.sanitize( html )
		}
	},
	created() {
		// Configure marked for safe rendering
		marked.setOptions( {
			breaks: true,
			gfm: true
		} )
	},
	methods: {
		startEditing() {
			this.editContent = this.content || ''
			this.isEditing = true
		},
		cancelEditing() {
			this.isEditing = false
			this.editContent = this.content || ''
		},
		saveDocument() {
			this.$emit( 'save', {
				id: this.documentId,
				content: this.editContent
			} )
			this.isEditing = false
		}
	}
}
</script>

<style lang="stylus" scoped>
.document-viewer
	height 100%
	display flex
	flex-direction column
	background white
	border-radius 20px
	overflow hidden

.back-btn, .close-btn
	position absolute
	top 1.5rem
	width 40px
	height 40px
	background rgba(255, 255, 255, 0.95)
	backdrop-filter blur(10px)
	color #666
	border none
	border-radius 50%
	cursor pointer
	transition all 0.2s ease
	display flex
	align-items center
	justify-content center
	z-index 10
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)

	&:hover
		background white
		color #333
		transform scale(1.05)
		box-shadow 0 4px 12px rgba(0, 0, 0, 0.15)

	svg
		width 20px
		height 20px

.back-btn
	left 1.5rem

.close-btn
	right 1.5rem

.edit-btn, .save-btn, .cancel-btn
	padding 0.5rem 1rem
	background rgba(255, 255, 255, 0.95)
	backdrop-filter blur(10px)
	color #333
	border 1px solid rgba(255, 193, 7, 0.3)
	border-radius 20px
	cursor pointer
	font-size 0.85rem
	font-weight 500
	transition all 0.2s ease
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)

	&:hover
		background white
		border-color #FFC107
		transform translateY(-1px)
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.2)

.cancel-btn
	background white
	border 2px solid #e0e0e0
	color #666

	&:hover
		background #f5f5f5
		border-color #999

.admin-bar
	position absolute
	top 1.5rem
	left 50%
	transform translateX(-50%)
	z-index 10
	display flex
	gap 0.5rem

	&.editing
		display flex
		gap 0.5rem

.document-content
	flex 1
	overflow-y auto
	padding 0
	padding-top 3rem

.markdown-body
	color #333
	line-height 1.8
	font-size 1.05rem
	width 100%
	padding-top 0
	padding-bottom 1rem

	// Reduced padding for text content
	:deep(> *:not(img))
		max-width 900px
		margin-left auto
		margin-right auto
		padding-left 1rem
		padding-right 1rem

	:deep(h1), :deep(h2), :deep(h3), :deep(h4)
		color #333
		margin-top 2rem
		margin-bottom 1rem
		font-weight 600
		position relative

	:deep(h1)
		font-size 2.4rem
		background linear-gradient(135deg, #FFC107, #FFB300)
		-webkit-background-clip text
		-webkit-text-fill-color transparent
		background-clip text
		text-align center
		margin-bottom 2rem
		padding 1rem
		position relative

		&::after
			content ''
			position absolute
			bottom 0
			left 50%
			transform translateX(-50%)
			width 100px
			height 3px
			background linear-gradient(90deg, #FFC107, #FFB300)
			border-radius 2px

	:deep(h2)
		font-size 1.7rem
		color #FF9800
		text-align left
		padding-left 1.5rem
		position relative

		&::before
			content '✨'
			position absolute
			left 0
			font-size 1.2rem

	:deep(h3)
		font-size 1.3rem
		color #F57C00
		text-align left
		padding-left 1.2rem

		&::before
			content '▸'
			position absolute
			left 0
			color #FFC107

	:deep(h4)
		font-size 1.1rem
		color #666
		text-align left
		font-weight 500

	:deep(p)
		margin-bottom 1.2rem
		text-align left
		line-height 1.8
		color #444

	:deep(ul), :deep(ol)
		margin-bottom 1.5rem
		padding-left 2rem
		text-align left

	:deep(ul li)
		position relative
		padding-left 0.5rem

		&::marker
			content '🔸'
			color #FFC107

	:deep(ol li)
		position relative
		padding-left 0.5rem

		&::marker
			color #FF9800
			font-weight 600

	:deep(li)
		margin-bottom 0.75rem
		line-height 1.7
		text-align left
		color #444

	:deep(strong)
		color #FF9800
		font-weight 600

	:deep(em)
		color #F57C00
		font-style italic

	:deep(code)
		background linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 183, 77, 0.1))
		padding 0.2rem 0.5rem
		border-radius 20px
		font-family 'Monaco', 'Courier New', monospace
		font-size 0.9rem
		color #E65100
		border 1px solid rgba(255, 193, 7, 0.2)

	:deep(pre)
		background linear-gradient(135deg, #FFFDE7, #FFF9C4)
		padding 1.2rem
		border-radius 12px
		overflow-x auto
		margin 1.5rem 0
		border-left 4px solid #FFC107
		box-shadow 0 2px 8px rgba(255, 193, 7, 0.1)

		code
			background none
			border none
			color #333
			padding 0

	:deep(blockquote)
		background linear-gradient(135deg, rgba(255, 249, 196, 0.2), rgba(255, 236, 179, 0.2))
		border-left 4px solid #FFC107
		padding 1rem 1.5rem
		margin 1.5rem 0
		border-radius 8px
		position relative

		&::before
			content '💡'
			position absolute
			top 1rem
			left -0.5rem
			background white
			padding 0.2rem
			font-size 1.2rem

		p
			color #555
			font-style italic
			margin-bottom 0.5rem

	:deep(img)
		width 100%
		max-width 100%
		height auto
		margin 2rem 0
		box-shadow 0 8px 24px rgba(0,0,0,0.12)
		display block
		padding 0
		border-radius 0
		transition transform 0.3s ease

		&:hover
			transform scale(1.02)

	:deep(table)
		width 100%
		border-collapse separate
		border-spacing 0
		margin 1.5rem 0
		border-radius 12px
		overflow hidden
		box-shadow 0 2px 8px rgba(0, 0, 0, 0.08)

	:deep(th), :deep(td)
		padding 1rem
		text-align left

	:deep(th)
		background linear-gradient(135deg, #FFC107, #FFB300)
		color white
		font-weight 600
		text-transform uppercase
		font-size 0.9rem
		letter-spacing 0.5px

		&:first-child
			border-top-left-radius 12px

		&:last-child
			border-top-right-radius 12px

	:deep(tr)
		transition all 0.2s ease

		&:nth-child(even) td
			background rgba(255, 249, 196, 0.15)

		&:hover td
			background rgba(255, 193, 7, 0.1)

	:deep(td)
		border-bottom 1px solid rgba(224, 224, 224, 0.5)

	:deep(hr)
		border none
		height 2px
		background linear-gradient(90deg, transparent, #FFC107, #FFB300, #FFC107, transparent)
		margin 2.5rem auto
		max-width 300px
		border-radius 2px
		position relative

		&::before
			content '⭐'
			position absolute
			top 50%
			left 50%
			transform translate(-50%, -50%)
			background white
			padding 0 0.5rem
			font-size 1.2rem

	// Clean list styling
	:deep(ul), :deep(ol)
		li
			color #444

	// Special styling for thank you or conclusion paragraphs
	:deep(p:last-child)
		&:not(:first-child)
			margin-top 2.5rem
			padding 1.5rem
			background linear-gradient(135deg, #FFF9C4, #FFECB3)
			border-radius 12px
			font-style italic
			color #555
			line-height 1.8
			position relative
			box-shadow 0 4px 12px rgba(255, 193, 7, 0.15)

			&::before
				content '🌟'
				position absolute
				top -0.5rem
				left 1rem
				font-size 1.5rem
				animation float 3s ease-in-out infinite

	// Add links styling
	:deep(a)
		color #FF9800
		text-decoration none
		font-weight 500
		position relative
		transition all 0.2s ease

		&::after
			content ''
			position absolute
			bottom -2px
			left 0
			width 0
			height 2px
			background #FFC107
			transition width 0.3s ease

		&:hover
			color #F57C00

			&::after
				width 100%

@keyframes float
	0%, 100%
		transform translateY(0)
	50%
		transform translateY(-5px)

.last-updated
	margin-top 3rem
	padding 1rem 2rem
	border-top 1px solid #e0e0e0
	color #999
	font-size 0.9rem
	text-align center
	max-width 900px
	margin-left auto
	margin-right auto

.editor-container
	flex 1
	display grid
	grid-template-columns 1fr 1fr
	gap 1px
	background #e0e0e0
	overflow hidden

	@media (max-width: 768px)
		grid-template-columns 1fr
		grid-template-rows 1fr 1fr

.editor-panel, .preview-panel
	background white
	display flex
	flex-direction column
	overflow hidden

	h3
		margin 0
		padding 1rem 1.5rem
		background #f9f9f9
		color #666
		font-size 0.9rem
		font-weight 600
		text-transform uppercase
		letter-spacing 0.5px
		border-bottom 1px solid #e0e0e0

.markdown-editor
	flex 1
	padding 1.5rem
	border none
	outline none
	font-family 'Courier New', monospace
	font-size 1rem
	line-height 1.6
	resize none
	color #333

.preview-panel
	.markdown-body
		flex 1
		padding 1.5rem
		overflow-y auto
</style>
