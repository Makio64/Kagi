<template>
	<section class="announcements-section">
		<SectionHeader
			:title="$t('mansion.announcements.title')"
			icon="📢"
		>
			<template #actions>
				<KButton variant="primary" icon="➕" @click="$emit('create')">
					{{ $t('mansion.announcements.new') }}
				</KButton>
			</template>
		</SectionHeader>

		<!-- Stats -->
		<div class="stats-grid">
			<StatCard
				icon="📰"
				:label="$t('mansion.announcements.stats.published')"
				:value="stats.published"
				variant="success"
			/>
			<StatCard
				icon="👀"
				:label="$t('mansion.announcements.stats.pendingReview')"
				:value="stats.inReview"
				variant="warning"
			/>
			<StatCard
				icon="📊"
				:label="$t('mansion.announcements.stats.totalViews')"
				:value="totalViews"
				variant="info"
			/>
		</div>

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
		<div v-else-if="announcements.length === 0" class="empty-state">
			<p v-if="activeFilter !== 'all'">{{ $t('mansion.announcements.emptyFiltered') }}</p>
			<p v-else>{{ $t('mansion.announcements.empty') }}</p>
			<KButton v-if="activeFilter === 'all'" variant="primary" @click="$emit('create')">
				{{ $t('mansion.announcements.new') }}
			</KButton>
		</div>

		<!-- Announcements List -->
		<div v-else class="announcements-list">
			<div
				v-for="ann in announcements"
				:key="ann.id"
				class="announcement-card"
				@click="$emit('view', ann)"
			>
				<div class="announcement-card-header">
					<div class="announcement-card-title-row">
						<h3 class="announcement-card-title">{{ ann.title }}</h3>
						<StatusBadge :status="statusLabel(ann.status)" :variant="statusVariant(ann.status)" />
					</div>
					<div class="announcement-card-meta">
						<span class="priority-dot" :class="'priority-dot--' + (ann.priority || 'medium')" />
						<span class="announcement-date">{{ formatRelativeDate(ann.dates?.created || ann.createdAt) }}</span>
						<span v-if="ann.creator?.name || ann.creatorName" class="announcement-author">
							{{ $t('mansion.announcements.createdBy', { name: ann.creator?.name || ann.creatorName }) }}
						</span>
					</div>
				</div>

				<p class="announcement-card-description">{{ truncate(ann.description, 120) }}</p>

				<!-- Views count (published only) -->
				<div v-if="ann.status === 'published' && getReadCount(ann) !== null" class="views-count">
					<span class="views-icon">👁</span>
					<span class="views-text">{{ $t('mansion.announcements.views', { count: getReadCount(ann) }) }}</span>
				</div>

				<!-- Scheduled info -->
				<div v-if="ann.status === 'scheduled' && ann.metadata?.scheduling?.publishAt" class="scheduled-info">
					{{ $t('mansion.announcements.publish.scheduledFor', { date: formatDate(ann.metadata.scheduling.publishAt) }) }}
				</div>

				<!-- Tags -->
				<div v-if="ann.tags && ann.tags.length" class="announcement-tags">
					<span v-for="tag in ann.tags" :key="tag" class="tag-pill">{{ tag }}</span>
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
	name: 'AnnouncementsSection',
	props: {
		announcements: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		},
		stats: {
			type: Object,
			default: () => ( { total: 0, drafts: 0, inReview: 0, published: 0, avgReadRate: 0 } )
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
	emits: ['create', 'view', 'filter', 'page-change'],
	computed: {
		filters() {
			return [
				{ value: 'all', labelKey: 'mansion.announcements.filter.all', count: this.stats.total },
				{ value: 'draft', labelKey: 'mansion.announcements.filter.drafts', count: this.stats.drafts },
				{ value: 'in_review', labelKey: 'mansion.announcements.filter.inReview', count: this.stats.inReview },
				{ value: 'published', labelKey: 'mansion.announcements.filter.published', count: this.stats.published },
				{ value: 'scheduled', labelKey: 'mansion.announcements.filter.scheduled', count: this.stats.scheduled }
			]
		},
		totalViews() {
			let sum = 0
			for ( const ann of this.announcements ) {
				const count = ann.metadata?.readTracking?.readCount
				if ( count ) sum += count
			}
			return sum
		}
	},
	methods: {
		statusLabel( status ) {
			const map = {
				draft: this.$t( 'mansion.announcements.status.draft' ),
				in_review: this.$t( 'mansion.announcements.status.inReview' ),
				published: this.$t( 'mansion.announcements.status.published' ),
				scheduled: this.$t( 'mansion.announcements.status.scheduled' ),
				expired: this.$t( 'mansion.announcements.status.expired' )
			}
			return map[status] || status
		},
		statusVariant( status ) {
			const map = {
				draft: 'secondary',
				in_review: 'warning',
				published: 'success',
				scheduled: 'info',
				expired: 'danger'
			}
			return map[status] || 'secondary'
		},
		getReadCount( ann ) {
			const tracking = ann.metadata?.readTracking
			if ( !tracking ) return null
			return tracking.readCount || 0
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
		},
		formatDate( dateStr ) {
			if ( !dateStr ) return ''
			return new Date( dateStr ).toLocaleString()
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'

.announcements-section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.stats-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(220px, 1fr))
	gap 1.5rem
	margin-bottom 2rem

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

// Announcements list
.announcements-list
	display flex
	flex-direction column
	gap 1rem

.announcement-card
	background white
	border-radius 12px
	padding 1.25rem 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)
	cursor pointer
	transition all 0.2s

	&:hover
		box-shadow 0 4px 16px rgba(0, 0, 0, 0.1)
		transform translateY(-1px)

.announcement-card-header
	margin-bottom 0.5rem

.announcement-card-title-row
	display flex
	align-items center
	gap 0.75rem
	margin-bottom 0.35rem

.announcement-card-title
	font-size 1.05rem
	font-weight 600
	color $color-text-primary
	margin 0

.announcement-card-meta
	display flex
	align-items center
	gap 0.75rem
	font-size 0.85rem
	color $color-text-secondary

.priority-dot
	width 8px
	height 8px
	border-radius 50%
	flex-shrink 0

	&--low
		background #4caf50
	&--medium
		background #ff9800
	&--high
		background #f44336
	&--urgent
		background #d32f2f
		box-shadow 0 0 0 2px rgba(211, 47, 47, 0.2)

.announcement-card-description
	font-size 0.9rem
	color $color-text-secondary
	line-height 1.5
	margin 0 0 0.75rem 0

// Views count
.views-count
	display flex
	align-items center
	gap 0.35rem
	margin-bottom 0.5rem

.views-icon
	font-size 0.85rem

.views-text
	font-size 0.8rem
	color $color-text-secondary

// Scheduled info
.scheduled-info
	font-size 0.85rem
	color #1976d2
	margin-bottom 0.5rem

// Tags
.announcement-tags
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
