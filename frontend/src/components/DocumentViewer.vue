<template>
	<div class="document-viewer">
		<div class="viewer-header">
			<button class="back-btn" @click="$emit('close')">
				← {{ $t('common.back') || 'Back' }}
			</button>
			<h2>{{ title }}</h2>
			<button v-if="isAdmin && !isEditing" class="edit-btn" @click="startEditing">
				✏️ {{ $t('common.edit') || 'Edit' }}
			</button>
			<div v-if="isEditing" class="edit-actions">
				<button class="save-btn" @click="saveDocument">
					💾 {{ $t('common.save') || 'Save' }}
				</button>
				<button class="cancel-btn" @click="cancelEditing">
					{{ $t('common.cancel') || 'Cancel' }}
				</button>
			</div>
		</div>

		<div v-if="!isEditing" class="document-content">
			<div class="markdown-body" v-html="renderedContent" />
			<div class="last-updated">
				{{ $t('dashboard.documents.lastUpdated') }}: {{ lastUpdated }}
			</div>
		</div>

		<div v-else class="editor-container">
			<div class="editor-panel">
				<h3>{{ $t('common.editor') || 'Editor' }}</h3>
				<textarea
					v-model="editContent"
					class="markdown-editor"
					placeholder="Write your markdown here..."
				/>
			</div>
			<div class="preview-panel">
				<h3>{{ $t('common.preview') || 'Preview' }}</h3>
				<div class="markdown-body" v-html="previewContent" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
	title: String,
	content: String,
	lastUpdated: String,
	isAdmin: Boolean,
	documentId: String
})

const emit = defineEmits(['close', 'save'])

const isEditing = ref(false)
const editContent = ref(props.content || '')

// Configure marked for safe rendering
marked.setOptions({
	breaks: true,
	gfm: true
})

const renderedContent = computed(() => {
	const html = marked(props.content || '')
	return DOMPurify.sanitize(html)
})

const previewContent = computed(() => {
	const html = marked(editContent.value || '')
	return DOMPurify.sanitize(html)
})

const startEditing = () => {
	editContent.value = props.content || ''
	isEditing.value = true
}

const cancelEditing = () => {
	isEditing.value = false
	editContent.value = props.content || ''
}

const saveDocument = () => {
	emit('save', {
		id: props.documentId,
		content: editContent.value
	})
	isEditing.value = false
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

.viewer-header
	display flex
	align-items center
	gap 1rem
	padding 1.5rem 2rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-bottom 2px solid #FFC107

	h2
		flex 1
		margin 0
		color #333
		font-size 1.5rem

.back-btn, .edit-btn, .save-btn, .cancel-btn
	padding 0.6rem 1.25rem
	background white
	color #333
	border 2px solid #FFC107
	border-radius 50px
	cursor pointer
	font-size 0.9rem
	font-weight 500
	transition all 0.2s ease
	box-shadow 0 2px 8px rgba(255, 193, 7, 0.1)

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateY(-1px)
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.2)

.cancel-btn
	background white
	border 2px solid #e0e0e0
	color #666

	&:hover
		background #f5f5f5
		border-color #999

.edit-actions
	display flex
	gap 0.5rem

.document-content
	flex 1
	overflow-y auto
	padding 2rem

.markdown-body
	color #333
	line-height 1.8
	font-size 1.05rem
	max-width 900px
	margin 0 auto

	:deep(h1), :deep(h2), :deep(h3), :deep(h4)
		color #333
		margin-top 2.5rem
		margin-bottom 1rem
		font-weight 600

	:deep(h1)
		font-size 2.2rem
		border-bottom 3px solid #FFC107
		padding-bottom 0.75rem
		text-align center
		margin-bottom 2rem

	:deep(h2)
		font-size 1.7rem
		color #FF9800
		border-bottom 2px solid #FFE082
		padding-bottom 0.5rem

	:deep(h3)
		font-size 1.3rem
		color #F57C00

	:deep(h4)
		font-size 1.1rem
		color #666

	:deep(p)
		margin-bottom 1.2rem
		text-align left

	:deep(ul), :deep(ol)
		margin-bottom 1.5rem
		padding-left 2rem

	:deep(li)
		margin-bottom 0.75rem
		line-height 1.7

	:deep(code)
		background rgba(255, 193, 7, 0.1)
		padding 0.2rem 0.4rem
		border-radius 4px
		font-family 'Courier New', monospace
		font-size 0.9rem

	:deep(pre)
		background #f9f9f9
		padding 1rem
		border-radius 10px
		overflow-x auto
		margin-bottom 1rem
		border 1px solid rgba(255, 193, 7, 0.2)

	:deep(blockquote)
		border-left 4px solid #FFC107
		padding-left 1rem
		margin 1rem 0
		color #666
		font-style italic

	:deep(img)
		max-width 100%
		height auto
		border-radius 10px
		margin 1.5rem 0
		box-shadow 0 4px 12px rgba(0,0,0,0.1)
		display block

	:deep(table)
		width 100%
		border-collapse collapse
		margin-bottom 1rem

	:deep(th), :deep(td)
		padding 0.75rem
		text-align left
		border-bottom 1px solid #e0e0e0

	:deep(th)
		background rgba(255, 193, 7, 0.1)
		font-weight 600

	:deep(hr)
		border none
		border-top 2px solid #FFE082
		margin 2rem 0

.last-updated
	margin-top 3rem
	padding-top 1rem
	border-top 1px solid #e0e0e0
	color #999
	font-size 0.9rem

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