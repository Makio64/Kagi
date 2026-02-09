<template>
	<div>
		<!-- Review Detail View -->
		<DocumentReview
			v-if="selectedDocument"
			:document="selectedDocument"
			:current-user="user"
			:publishing="isPublishing"
			@back="selectedDocument = null"
			@submit-for-review="submitForReview"
			@approve="approveDocument"
			@add-comment="addComment"
			@publish="publishDocument"
			@archive="confirmArchiveDocument(selectedDocument)"
			@edit="openComposerModal(selectedDocument)"
			@delete="confirmDeleteDocument(selectedDocument)"
		/>

		<!-- List View -->
		<DocumentsListSection
			v-else
			:documents="documents"
			:loading="isLoadingDocuments"
			:stats="documentsStats"
			:active-filter="documentFilter"
			:pagination="documentPagination"
			@create="openComposerModal()"
			@upload="openUploadModal"
			@view="viewDocument"
			@filter="handleDocumentFilter"
			@page-change="handleDocumentPageChange"
		/>

		<!-- Composer Modal -->
		<KModal
			v-model="showComposerModal"
			:title="editingDocument ? $t('mansion.documents.form.editTitle') : $t('mansion.documents.form.createTitle')"
			size="large"
		>
			<DocumentComposer
				ref="composer"
				:document="editingDocument"
				:saving="isSavingDocument"
			/>

			<template #footer>
				<KButton variant="secondary" @click="showComposerModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="secondary" :loading="isSavingDocument" @click="saveDocument('draft')">
					{{ $t('mansion.documents.saveDraft') }}
				</KButton>
				<KButton variant="primary" :loading="isSavingDocument" @click="saveDocument('review')">
					{{ $t('mansion.documents.submitReview') }}
				</KButton>
			</template>
		</KModal>

		<!-- Upload Modal -->
		<KModal
			v-model="showUploadModal"
			:title="$t('mansion.documents.upload')"
		>
			<form @submit.prevent="uploadDocument">
				<div class="form-group">
					<label for="upload-file">{{ $t('mansion.documents.selectFile') }}</label>
					<input
						id="upload-file"
						type="file"
						accept=".pdf,.doc,.docx"
						@change="handleFileSelect"
					>
					<p class="help-text">{{ $t('mansion.documents.uploadHelp') }}</p>
				</div>
				<div class="form-group">
					<label for="upload-title">{{ $t('mansion.documents.form.title') }}</label>
					<input
						id="upload-title"
						v-model="uploadForm.title"
						type="text"
						required
						:placeholder="$t('mansion.documents.form.titlePlaceholder')"
					>
				</div>
				<div class="form-group">
					<label for="upload-category">{{ $t('mansion.documents.form.category') }}</label>
					<select id="upload-category" v-model="uploadForm.category">
						<option value="rules">{{ $t('mansion.documents.category.rules') }}</option>
						<option value="safety">{{ $t('mansion.documents.category.safety') }}</option>
						<option value="financial">{{ $t('mansion.documents.category.financial') }}</option>
						<option value="minutes">{{ $t('mansion.documents.category.minutes') }}</option>
						<option value="general">{{ $t('mansion.documents.category.general') }}</option>
					</select>
				</div>
				<!-- Converted preview -->
				<div v-if="uploadForm.content" class="form-group">
					<label>{{ $t('mansion.documents.review.preview') }}</label>
					<div class="upload-preview" v-html="uploadPreview" />
				</div>
				<div v-if="isConverting" class="form-group">
					<p class="help-text">{{ $t('common.loading') }}</p>
				</div>
			</form>

			<template #footer>
				<KButton variant="secondary" @click="showUploadModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton
					variant="primary"
					:loading="isUploadingDocument"
					:disabled="!uploadForm.title || !uploadForm.content"
					@click="uploadDocument"
				>
					{{ $t('mansion.documents.upload') }}
				</KButton>
			</template>
		</KModal>

		<!-- Archive Confirmation Modal -->
		<KModal
			v-model="showArchiveConfirm"
			:title="$t('mansion.documents.confirmArchive')"
			size="small"
		>
			<p>{{ $t('mansion.documents.archiveMessage') }}</p>

			<template #footer>
				<KButton variant="secondary" @click="showArchiveConfirm = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="danger" :loading="isArchiving" @click="archiveDocument">
					{{ $t('mansion.documents.archive') }}
				</KButton>
			</template>
		</KModal>

		<!-- Delete Confirmation Modal -->
		<KModal
			v-model="showDeleteConfirm"
			:title="$t('common.confirmDelete')"
			size="small"
		>
			<p>{{ $t('mansion.documents.deleteConfirm') }}</p>

			<template #footer>
				<KButton variant="secondary" @click="showDeleteConfirm = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="danger" :loading="isDeletingDocument" @click="deleteDocument">
					{{ $t('common.delete') }}
				</KButton>
			</template>
		</KModal>
	</div>
</template>
<script>
import { marked } from 'marked'

import { sanitizeHtml } from '@/utils/sanitize'

import backend from '../../../services/SupabaseBackend'

export default {
	name: 'MansionDocumentsManager',
	props: {
		mansionId: {
			type: String,
			required: true
		},
		user: {
			type: Object,
			required: true
		},
		totalResidents: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			// Data
			documents: [],
			isLoadingDocuments: false,
			documentFilter: 'all',
			documentPagination: {
				page: 1,
				limit: 25,
				total: 0,
				totalPages: 0
			},
			// Detail view
			selectedDocument: null,
			// Composer modal
			showComposerModal: false,
			editingDocument: null,
			isSavingDocument: false,
			// Upload modal
			showUploadModal: false,
			uploadForm: { title: '', category: 'general', content: '' },
			isUploadingDocument: false,
			isConverting: false,
			// Publishing
			isPublishing: false,
			// Archive modal
			showArchiveConfirm: false,
			archiveTarget: null,
			isArchiving: false,
			// Delete modal
			showDeleteConfirm: false,
			deleteDocumentTarget: null,
			isDeletingDocument: false
		}
	},
	computed: {
		documentsStats() {
			const all = this.documents
			return {
				total: this.documentPagination.total || all.length,
				drafts: all.filter( d => d.status === 'draft' ).length,
				inReview: all.filter( d => d.status === 'ready_to_review' ).length,
				readyToPublish: all.filter( d => d.status === 'ready_to_publish' ).length,
				published: all.filter( d => d.status === 'published' ).length,
				archived: all.filter( d => d.status === 'archived' ).length,
				totalReads: all.reduce( ( sum, d ) => sum + ( d.readsCount || 0 ), 0 )
			}
		},
		uploadPreview() {
			if ( !this.uploadForm.content ) return ''
			const html = marked( this.uploadForm.content )
			return sanitizeHtml( html )
		}
	},
	async mounted() {
		await this.fetchDocuments()
	},
	methods: {
		// ==========================================
		// DATA LOADING
		// ==========================================

		async fetchDocuments() {
			this.isLoadingDocuments = true
			try {
				const params = {
					mansionId: this.mansionId,
					page: this.documentPagination.page,
					limit: this.documentPagination.limit,
					sort: '-createdAt'
				}
				if ( this.documentFilter && this.documentFilter !== 'all' ) {
					params.status = this.documentFilter
				}
				const response = await backend.query( 'documents', params )
				if ( response.success ) {
					this.documents = response.data
					this.documentPagination.total = response.meta?.total || response.data.length
					this.documentPagination.totalPages = response.meta?.totalPages || 1
				}
			} catch ( error ) {
				console.error( 'Failed to fetch documents:', error )
			} finally {
				this.isLoadingDocuments = false
			}
		},

		handleDocumentFilter( filter ) {
			this.documentFilter = filter
			this.documentPagination.page = 1
			this.fetchDocuments()
		},

		handleDocumentPageChange( page ) {
			this.documentPagination.page = page
			this.fetchDocuments()
		},

		viewDocument( doc ) {
			this.selectedDocument = doc
		},

		// ==========================================
		// CREATE / EDIT
		// ==========================================

		openComposerModal( doc ) {
			this.editingDocument = doc || null
			this.showComposerModal = true
		},

		async saveDocument( action ) {
			const composer = this.$refs.composer
			if ( !composer ) return
			const formData = composer.getFormData()
			if ( !formData.title?.trim() ) return

			this.isSavingDocument = true
			try {
				const payload = {
					...formData,
					mansionId: this.mansionId,
					status: action === 'review' ? 'ready_to_review' : 'draft'
				}

				let response
				if ( this.editingDocument ) {
					response = await backend.update( 'documents', this.editingDocument.id, payload )
				} else {
					response = await backend.create( 'documents', payload )
				}

				if ( response.success ) {
					this.showComposerModal = false
					this.editingDocument = null
					await this.fetchDocuments()

					// If submitted for review, navigate to the document
					if ( action === 'review' && response.data ) {
						this.selectedDocument = response.data
					}
				}
			} catch ( error ) {
				console.error( 'Failed to save document:', error )
				alert( error.error?.message || this.$t( 'mansion.documents.saveFailed' ) )
			} finally {
				this.isSavingDocument = false
			}
		},

		// ==========================================
		// UPLOAD
		// ==========================================

		openUploadModal() {
			this.uploadForm = { title: '', category: 'general', content: '' }
			this.showUploadModal = true
		},

		async handleFileSelect( event ) {
			const file = event.target.files[0]
			if ( !file ) return

			this.uploadForm.title = this.uploadForm.title || file.name.replace( /\.[^/.]+$/, '' )
			this.isConverting = true

			try {
				if ( file.name.endsWith( '.docx' ) || file.name.endsWith( '.doc' ) ) {
					const mammoth = await import( 'mammoth' )
					const arrayBuffer = await file.arrayBuffer()
					const result = await mammoth.convertToMarkdown( { arrayBuffer } )
					this.uploadForm.content = result.value
				} else if ( file.name.endsWith( '.pdf' ) ) {
					const pdfjsLib = await import( 'pdfjs-dist' )
					pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
					const pdf = await pdfjsLib.getDocument( { data: await file.arrayBuffer() } ).promise
					let text = ''
					for ( let i = 1; i <= pdf.numPages; i++ ) {
						const page = await pdf.getPage( i )
						const content = await page.getTextContent()
						text += content.items.map( item => item.str ).join( ' ' ) + '\n\n'
					}
					this.uploadForm.content = text
				}
			} catch ( error ) {
				console.error( 'Failed to convert file:', error )
				this.uploadForm.content = ''
			} finally {
				this.isConverting = false
			}
		},

		async uploadDocument() {
			if ( !this.uploadForm.title || !this.uploadForm.content ) return
			this.isUploadingDocument = true
			try {
				const response = await backend.create( 'documents', {
					title: this.uploadForm.title,
					content: this.uploadForm.content,
					category: this.uploadForm.category,
					mansionId: this.mansionId,
					status: 'draft',
					fileType: 'markdown'
				} )
				if ( response.success ) {
					this.showUploadModal = false
					await this.fetchDocuments()
				}
			} catch ( error ) {
				console.error( 'Failed to upload document:', error )
				alert( error.error?.message || this.$t( 'mansion.documents.saveFailed' ) )
			} finally {
				this.isUploadingDocument = false
			}
		},

		// ==========================================
		// STATUS TRANSITIONS
		// ==========================================

		async submitForReview() {
			if ( !this.selectedDocument ) return
			try {
				const response = await backend.update( 'documents', this.selectedDocument.id, {
					status: 'ready_to_review',
					metadata: {
						...( this.selectedDocument.metadata || {} ),
						review: {
							...( this.selectedDocument.metadata?.review || {} ),
							submittedAt: new Date().toISOString()
						}
					}
				} )
				if ( response.success ) {
					this.selectedDocument = { ...this.selectedDocument, ...response.data }
					await this.fetchDocuments()
				}
			} catch ( error ) {
				console.error( 'Failed to submit for review:', error )
			}
		},

		async approveDocument() {
			if ( !this.selectedDocument ) return
			const meta = { ...( this.selectedDocument.metadata || {} ) }
			const approvals = [...( meta.approvals || [] )]

			// Prevent duplicate approval
			if ( approvals.some( a => a.userId === this.user?.id ) ) return

			approvals.push( {
				userId: this.user?.id,
				userName: this.user?.name || this.user?.email,
				approvedAt: new Date().toISOString()
			} )
			meta.approvals = approvals

			// If at least 1 admin approved, transition to ready_to_publish
			const newStatus = approvals.length >= 1 ? 'ready_to_publish' : this.selectedDocument.status

			try {
				const response = await backend.update( 'documents', this.selectedDocument.id, {
					status: newStatus,
					metadata: meta
				} )
				if ( response.success ) {
					this.selectedDocument = { ...this.selectedDocument, status: newStatus, metadata: meta }
					await this.fetchDocuments()
				}
			} catch ( error ) {
				console.error( 'Failed to approve document:', error )
			}
		},

		async publishDocument() {
			if ( !this.selectedDocument ) return
			this.isPublishing = true
			try {
				const meta = { ...( this.selectedDocument.metadata || {} ) }
				meta.publishedAt = new Date().toISOString()
				meta.publishedBy = this.user?.id
				meta.readTracking = {
					totalResidents: this.totalResidents || 0,
					readCount: 0
				}

				const response = await backend.update( 'documents', this.selectedDocument.id, {
					status: 'published',
					metadata: meta
				} )
				if ( response.success ) {
					this.selectedDocument = {
						...this.selectedDocument,
						status: 'published',
						metadata: meta
					}
					await this.fetchDocuments()
				}
			} catch ( error ) {
				console.error( 'Failed to publish document:', error )
			} finally {
				this.isPublishing = false
			}
		},

		// ==========================================
		// COMMENTS
		// ==========================================

		async addComment( text ) {
			if ( !this.selectedDocument || !text?.trim() ) return
			const meta = { ...( this.selectedDocument.metadata || {} ) }
			const comments = [...( meta.comments || [] )]
			comments.push( {
				id: `cmt_${Date.now()}`,
				authorId: this.user?.id,
				authorName: this.user?.name || this.user?.email,
				text: text.trim(),
				createdAt: new Date().toISOString()
			} )
			meta.comments = comments

			try {
				const response = await backend.update( 'documents', this.selectedDocument.id, { metadata: meta } )
				if ( response.success ) {
					this.selectedDocument = { ...this.selectedDocument, metadata: meta }
				}
			} catch ( error ) {
				console.error( 'Failed to add comment:', error )
			}
		},

		// ==========================================
		// ARCHIVE
		// ==========================================

		confirmArchiveDocument( doc ) {
			this.archiveTarget = doc
			this.showArchiveConfirm = true
		},

		async archiveDocument() {
			if ( !this.archiveTarget ) return
			this.isArchiving = true
			try {
				const response = await backend.update( 'documents', this.archiveTarget.id, {
					status: 'archived'
				} )
				if ( response.success ) {
					if ( this.selectedDocument?.id === this.archiveTarget.id ) {
						this.selectedDocument = { ...this.selectedDocument, status: 'archived' }
					}
					this.showArchiveConfirm = false
					this.archiveTarget = null
					await this.fetchDocuments()
				}
			} catch ( error ) {
				console.error( 'Failed to archive document:', error )
			} finally {
				this.isArchiving = false
			}
		},

		// ==========================================
		// DELETE
		// ==========================================

		confirmDeleteDocument( doc ) {
			this.deleteDocumentTarget = doc
			this.showDeleteConfirm = true
		},

		async deleteDocument() {
			if ( !this.deleteDocumentTarget ) return
			this.isDeletingDocument = true
			try {
				const targetId = this.deleteDocumentTarget.id
				const response = await backend.delete( 'documents', targetId )
				if ( response.success ) {
					if ( this.selectedDocument?.id === targetId ) {
						this.selectedDocument = null
					}
					this.showDeleteConfirm = false
					this.deleteDocumentTarget = null
					await this.fetchDocuments()
				}
			} catch ( error ) {
				console.error( 'Failed to delete document:', error )
				alert( error.error?.message || this.$t( 'mansion.documents.deleteFailed' ) )
			} finally {
				this.isDeletingDocument = false
			}
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/_form-modal.styl'

.upload-preview
	max-height 300px
	overflow-y auto
	padding 1rem
	border 1px solid #e0e0e0
	border-radius 8px
	background #fafafa
	font-size 0.9rem
	line-height 1.6
</style>
