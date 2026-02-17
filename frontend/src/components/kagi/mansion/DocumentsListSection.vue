<template>
	<section class="documents-list-section">
		<SectionHeader
			:title="$t('mansion.documents.title')"
			icon="📄"
		>
			<template #actions>
				<KButton variant="secondary" icon="📤" @click="$emit('upload')">
					{{ $t('mansion.documents.upload') }}
				</KButton>
				<KButton variant="primary" icon="➕" @click="$emit('create')">
					{{ $t('mansion.documents.create') }}
				</KButton>
			</template>
		</SectionHeader>

		<!-- Filter Tabs -->
		<div class="filter-tabs">
			<button
				v-for="f in filters"
				:key="f.value"
				class="filter-tab"
				:class="{ 'filter-tab--active': activeFilter === f.value }"
				@click="$emit('filter', f.value)"
			>
				{{ $t(f.labelKey) }}
				<span v-if="f.count !== undefined" class="filter-tab-count">{{ f.count }}</span>
			</button>
		</div>

		<!-- Loading -->
		<div v-if="loading" class="loading-state">
			<p>{{ $t('common.loading') }}</p>
		</div>

		<!-- Empty State -->
		<div v-else-if="documents.length === 0" class="empty-state">
			<p v-if="activeFilter !== 'all'">{{ $t('mansion.documents.emptyFiltered') }}</p>
			<p v-else>{{ $t('mansion.documents.empty') }}</p>
			<KButton v-if="activeFilter === 'all'" variant="primary" @click="$emit('create')">
				{{ $t('mansion.documents.create') }}
			</KButton>
		</div>

		<!-- Documents List -->
		<div v-else class="documents-list">
			<div
				v-for="doc in documents"
				:key="doc.id"
				class="document-card"
				@click="$emit('view', doc)"
			>
				<div class="document-card-header">
					<div class="document-card-title-row">
						<h3 class="document-card-title">{{ doc.title }}</h3>
						<StatusBadge :status="statusLabel(doc.status)" :variant="statusVariant(doc.status)" />
					</div>
					<div class="document-card-meta">
						<span v-if="doc.category" class="category-tag">{{ getCategoryLabel(doc.category) }}</span>
						<span class="document-date">{{ formatRelativeDate(doc.dates?.created || doc.createdAt) }}</span>
						<span v-if="doc.creator?.name || doc.creatorName" class="document-author">
							{{ $t('mansion.documents.createdBy', { name: doc.creator?.name || doc.creatorName }) }}
						</span>
					</div>
				</div>

				<p v-if="doc.description" class="document-card-description">{{ truncate(doc.description, 120) }}</p>

				<!-- Read Stats (published only) -->
				<div v-if="doc.status === 'published' && doc.readsCount !== undefined" class="read-stats">
					<span class="read-stats-icon">👁️</span>
					<span class="read-stats-text">{{ $t('mansion.documents.reads', { count: doc.readsCount || 0 }) }}</span>
				</div>

				<!-- Tags -->
				<div v-if="doc.tags && doc.tags.length" class="document-tags">
					<span v-for="tag in doc.tags" :key="tag" class="tag-pill">{{ tag }}</span>
				</div>
			</div>
		</div>

		<!-- Pagination -->
		<div v-if="pagination.totalPages > 1" class="pagination">
			<KButton
				size="sm"
				variant="secondary"
				:disabled="pagination.page === 1"
				@click="$emit('page-change', pagination.page - 1)"
			>
				{{ $t('common.previous') }}
			</KButton>
			<span class="pagination-info">
				{{ $t('common.pageOf', { current: pagination.page, total: pagination.totalPages }) }}
			</span>
			<KButton
				size="sm"
				variant="secondary"
				:disabled="pagination.page >= pagination.totalPages"
				@click="$emit('page-change', pagination.page + 1)"
			>
				{{ $t('common.next') }}
			</KButton>
		</div>
	</section>
</template>
<script>
export default {
	name: 'DocumentsListSection',
	props: {
		documents: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		},
		stats: {
			type: Object,
			default: () => ( { total: 0, drafts: 0, inReview: 0, readyToPublish: 0, published: 0, archived: 0, totalReads: 0 } )
		},
		activeFilter: {
			type: String,
			default: 'all'
		},
		pagination: {
			type: Object,
			default: () => ( { page: 1, total: 0, totalPages: 0 } )
		}
	},
	emits: ['create', 'upload', 'view', 'filter', 'page-change'],
	computed: {
		filters() {
			return [
				{ value: 'all', labelKey: 'mansion.documents.filter.all', count: this.stats.total },
				{ value: 'draft', labelKey: 'mansion.documents.filter.drafts', count: this.stats.drafts },
				{ value: 'ready_to_review', labelKey: 'mansion.documents.filter.readyToReview', count: this.stats.inReview },
				{ value: 'ready_to_publish', labelKey: 'mansion.documents.filter.readyToPublish', count: this.stats.readyToPublish },
				{ value: 'published', labelKey: 'mansion.documents.filter.published', count: this.stats.published },
				{ value: 'archived', labelKey: 'mansion.documents.filter.archived', count: this.stats.archived }
			]
		}
	},
	methods: {
		statusLabel( status ) {
			const map = {
				draft: this.$t( 'mansion.documents.status.draft' ),
				ready_to_review: this.$t( 'mansion.documents.status.readyToReview' ),
				ready_to_publish: this.$t( 'mansion.documents.status.readyToPublish' ),
				published: this.$t( 'mansion.documents.status.published' ),
				archived: this.$t( 'mansion.documents.status.archived' )
			}
			return map[status] || status
		},
		statusVariant( status ) {
			const map = {
				draft: 'secondary',
				ready_to_review: 'warning',
				ready_to_publish: 'info',
				published: 'success',
				archived: 'danger'
			}
			return map[status] || 'secondary'
		},
		getCategoryLabel( category ) {
			const key = `mansion.documents.category.${category}`
			return this.$t( key )
		},
		truncate( text, maxLen ) {
			if ( !text ) return ''
			if ( text.length <= maxLen ) return text
			return text.substring( 0, maxLen ) + '...'
		},
		formatRelativeDate( dateStr ) {
			if ( !dateStr ) return ''
			const date = typeof dateStr === 'number' ? new Date( dateStr ) : new Date( dateStr )
			const now = new Date()
			const diffMs = now - date
			const diffMin = Math.floor( diffMs / 60000 )
			const diffHr = Math.floor( diffMs / 3600000 )
			const diffDay = Math.floor( diffMs / 86400000 )

			if ( diffMin < 1 ) return 'just now'
			if ( diffMin < 60 ) return `${diffMin}m ago`
			if ( diffHr < 24 ) return `${diffHr}h ago`
			if ( diffDay < 7 ) return `${diffDay}d ago`
			return date.toLocaleDateString()
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'

.documents-list-section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.loading-state, .empty-state
	text-align center
	padding 3rem
	color #666
	p
		margin-bottom 1rem

// Filter tabs
.filter-tabs
	display flex
	gap 0.5rem
	margin-bottom 1.5rem
	padding 0.25rem
	background $color-bg-tertiary
	border-radius $radius-lg
	overflow-x auto

.filter-tab
	padding 0.6rem 1rem
	border none
	border-radius $radius-md
	background transparent
	color $color-text-secondary
	font-size 0.9rem
	font-weight 500
	cursor pointer
	white-space nowrap
	transition all 0.2s

	&:hover
		color $color-text-primary
		background rgba(255, 193, 7, 0.08)

	&--active
		background white
		color $color-text-primary
		box-shadow 0 1px 3px rgba(0, 0, 0, 0.1)

.filter-tab-count
	display inline-block
	margin-left 0.35rem
	padding 0.1rem 0.45rem
	font-size 0.75rem
	border-radius 10px
	background $color-bg-tertiary
	color $color-text-secondary

	.filter-tab--active &
		background rgba(255, 193, 7, 0.15)
		color $color-primary-dark

// Documents list
.documents-list
	display flex
	flex-direction column
	gap 1rem

.document-card
	background white
	border-radius 12px
	padding 1.25rem 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)
	cursor pointer
	transition all 0.2s

	&:hover
		box-shadow 0 4px 16px rgba(0, 0, 0, 0.1)
		transform translateY(-1px)

.document-card-header
	margin-bottom 0.5rem

.document-card-title-row
	display flex
	align-items center
	gap 0.75rem
	margin-bottom 0.35rem

.document-card-title
	font-size 1.05rem
	font-weight 600
	color $color-text-primary
	margin 0

.document-card-meta
	display flex
	align-items center
	gap 0.75rem
	font-size 0.85rem
	color $color-text-secondary

.category-tag
	padding 0.15rem 0.6rem
	font-size 0.75rem
	background rgba(255, 193, 7, 0.1)
	color #E65100
	border-radius 12px
	font-weight 500

.document-card-description
	font-size 0.9rem
	color $color-text-secondary
	line-height 1.5
	margin 0 0 0.75rem 0

// Read stats
.read-stats
	display flex
	align-items center
	gap 0.5rem
	margin-bottom 0.5rem

.read-stats-icon
	font-size 0.85rem

.read-stats-text
	font-size 0.8rem
	color $color-text-secondary

// Tags
.document-tags
	display flex
	gap 0.35rem
	flex-wrap wrap

.tag-pill
	padding 0.15rem 0.6rem
	font-size 0.75rem
	background $color-bg-tertiary
	color $color-text-secondary
	border-radius 12px

// Pagination
.pagination
	display flex
	justify-content center
	align-items center
	gap 1rem
	padding 1.5rem 0

	.pagination-info
		font-size 0.9rem
		color $color-text-secondary
</style>
