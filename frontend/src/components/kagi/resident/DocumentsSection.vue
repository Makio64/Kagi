<template>
	<section class="section">
		<!-- Document List -->
		<div v-if="!selectedDocument">
			<div class="section-header">
				<h2 class="section-title">
					<Icon name="document" :size="30" color="#FFC107" />
					{{ $t('dashboard.menu.documents') }}
				</h2>
			</div>

			<!-- Loading State -->
			<div v-if="loading" class="loading-state">
				<p>{{ $t('common.loading') }}</p>
			</div>

			<!-- Empty State -->
			<div v-else-if="documents.length === 0" class="empty-state">
				<p>{{ $t('mansion.documents.empty') }}</p>
			</div>

			<!-- Documents Grid -->
			<div v-else class="documents-grid">
				<div
					v-for="doc in documents"
					:key="doc.id"
					class="document-card"
					@click="viewDocument(doc)"
				>
					<div class="document-icon">{{ getCategoryIcon(doc.category) }}</div>
					<div class="document-content">
						<h3>{{ doc.title }}</h3>
						<p class="document-updated">{{ $t('dashboard.documents.lastUpdated') }}: {{ formatDate(doc.updatedAt) }}</p>
					</div>
					<div class="document-action">
						<span class="view-btn">{{ $t('dashboard.documents.view') }} →</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Document Viewer -->
		<div v-else class="document-viewer-wrapper">
			<DocumentViewer
				:title="selectedDocument.title"
				:content="selectedDocument.content"
				:last-updated="formatDate(selectedDocument.updatedAt)"
				:document-id="selectedDocument.id"
				@close="selectedDocument = null"
			/>
		</div>
	</section>
</template>

<script>
import backend from '../../../services/SupabaseBackend'

export default {
	name: 'DocumentsSection',
	data() {
		return {
			selectedDocument: null,
			documents: [],
			loading: true
		}
	},
	async mounted() {
		await this.fetchDocuments()
	},
	methods: {
		async fetchDocuments() {
			this.loading = true
			try {
				const response = await backend.query( 'documents', { status: 'published', sort: '-updatedAt' } )
				if ( response.success ) {
					this.documents = response.data
				}
			} catch ( error ) {
				console.error( 'Failed to fetch documents:', error )
			} finally {
				this.loading = false
			}
		},

		viewDocument( doc ) {
			this.selectedDocument = doc
			this.recordRead( doc.id )
		},

		async recordRead( documentId ) {
			try {
				await backend.create( 'document_reads', { documentId } )
			} catch {
				// Silently fail - read tracking is non-critical
			}
		},

		getCategoryIcon( category ) {
			const icons = {
				rules: '📋',
				safety: '🛡️',
				financial: '💰',
				minutes: '📝',
				general: '📄'
			}
			return icons[category] || '📄'
		},

		formatDate( dateStr ) {
			if ( !dateStr ) return ''
			const d = new Date( dateStr )
			return `${d.getFullYear()}/${String( d.getMonth() + 1 ).padStart( 2, '0' )}`
		}
	}
}
</script>

<style lang="stylus" scoped>
.section
	padding 0

.section-header
	padding 2rem 2rem 2rem 2rem

.section-title
	margin 0
	font-size 1.75rem
	font-weight 600
	color #333
	display flex
	align-items center
	gap 0.5rem
	justify-content center


.documents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(320px, 1fr))
	gap 1.5rem
	padding 0 2rem 3rem 2rem

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem
		margin-bottom 1rem

	.documents-grid
		padding 0 1rem 2rem 1rem

.document-card
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	transition all 0.3s ease
	cursor pointer
	display flex
	align-items center
	gap 1rem

	&:hover
		transform translateY(-2px)
		box-shadow 0 4px 16px rgba(0,0,0,0.15)

.document-icon
	font-size 2.5rem
	min-width 60px
	height 60px
	display flex
	align-items center
	justify-content center
	background linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)
	border-radius 10px

.document-content
	flex 1

	h3
		margin 0 0 0.5rem 0
		font-size 1.1rem
		color #333
		font-weight 600

.document-updated
	margin 0
	color #888
	font-size 0.9rem

.document-action
	.view-btn
		color #FFB300
		font-weight 500
		font-size 0.95rem
		white-space nowrap

@media (max-width: 768px)
	.documents-grid
		grid-template-columns 1fr

	.document-action
		display none

.document-viewer-wrapper
	position relative
	min-height 600px
	padding 0

.loading-state
	text-align center
	padding 3rem
	color #888

.empty-state
	text-align center
	padding 3rem
	color #888
</style>
