<template>
	<section class="announcement-review">
		<!-- Header -->
		<div class="review-header">
			<button class="back-btn" @click="$emit('back')">
				← {{ $t('mansion.announcements.review.back') }}
			</button>
			<div class="review-header-actions">
				<KButton
					v-if="announcement.status === 'draft'"
					variant="secondary"
					size="sm"
					@click="$emit('edit')"
				>
					{{ $t('common.edit') }}
				</KButton>
				<KButton variant="danger" size="sm" @click="$emit('delete')">
					{{ $t('common.delete') }}
				</KButton>
			</div>
		</div>

		<!-- Preview Card -->
		<div class="preview-card">
			<div class="preview-label">{{ $t('mansion.announcements.review.preview') }}</div>
			<div class="preview-header">
				<h2 class="preview-title">{{ announcement.title }}</h2>
				<StatusBadge :status="statusLabel" :variant="statusVariant" />
			</div>
			<p class="preview-description">{{ announcement.description }}</p>
			<div class="preview-meta">
				<span class="priority-dot" :class="'priority-dot--' + (announcement.priority || 'medium')"></span>
				<span>{{ priorityLabel }}</span>
				<span v-if="announcement.tags && announcement.tags.length" class="preview-tags">
					<span v-for="tag in announcement.tags" :key="tag" class="tag-pill">{{ tag }}</span>
				</span>
			</div>
		</div>

		<!-- Submit for Review button (draft only) -->
		<div v-if="announcement.status === 'draft'" class="action-panel">
			<KButton variant="primary" @click="$emit('submit-for-review')">
				{{ $t('mansion.announcements.submitReview') }}
			</KButton>
		</div>

		<!-- AI Writing Assistant Panel -->
		<div v-if="announcement.status === 'in_review' || aiLoading" class="ai-panel">
			<div class="panel-header">
				<span class="panel-icon">✨</span>
				<h3>{{ $t('mansion.announcements.review.aiTitle') }}</h3>
			</div>

			<div v-if="aiLoading" class="ai-loading">
				<div class="ai-loading-spinner"></div>
				<span>{{ $t('mansion.announcements.review.aiLoading') }}</span>
			</div>

			<div v-else-if="aiSuggestions.length === 0" class="ai-empty">
				<span class="ai-check">✓</span>
				{{ $t('mansion.announcements.review.noSuggestions') }}
			</div>

			<div v-else class="ai-suggestions">
				<div
					v-for="sug in aiSuggestions"
					:key="sug.id"
					class="suggestion-card"
					:class="{ 'suggestion-card--applied': sug.applied, 'suggestion-card--dismissed': sug.dismissedAt }"
				>
					<div class="suggestion-type">{{ sug.type }}</div>
					<div class="suggestion-content">
						<span class="suggestion-original">{{ sug.original }}</span>
						<span class="suggestion-arrow">→</span>
						<span class="suggestion-replacement">{{ sug.suggested }}</span>
					</div>
					<div v-if="!sug.applied && !sug.dismissedAt" class="suggestion-actions">
						<button class="sug-btn sug-btn--apply" @click="$emit('apply-suggestion', sug.id)">
							{{ $t('mansion.announcements.review.apply') }}
						</button>
						<button class="sug-btn sug-btn--dismiss" @click="$emit('dismiss-suggestion', sug.id)">
							{{ $t('mansion.announcements.review.dismiss') }}
						</button>
					</div>
					<div v-else class="suggestion-resolved">
						{{ sug.applied ? $t('mansion.announcements.review.applied') : $t('mansion.announcements.review.dismissed') }}
					</div>
				</div>
			</div>
		</div>

		<!-- Approvals Panel -->
		<div v-if="announcement.status === 'in_review'" class="approvals-panel">
			<div class="panel-header">
				<span class="panel-icon">👍</span>
				<h3>{{ $t('mansion.announcements.review.approvalsTitle') }}</h3>
			</div>

			<div v-if="approvals.length === 0" class="approvals-empty">
				{{ $t('mansion.announcements.review.needsApproval') }}
			</div>

			<div v-for="appr in approvals" :key="appr.userId" class="approval-item">
				<span class="approval-check">✓</span>
				<span class="approval-name">{{ appr.userName }}</span>
				<span class="approval-date">{{ formatRelativeDate(appr.approvedAt) }}</span>
			</div>

			<KButton
				v-if="!hasCurrentUserApproved"
				variant="secondary"
				class="approve-btn"
				@click="$emit('approve')"
			>
				👍 {{ $t('mansion.announcements.review.approveBtn') }}
			</KButton>
		</div>

		<!-- Comments Section -->
		<div v-if="announcement.status !== 'draft'" class="comments-panel">
			<div class="panel-header">
				<span class="panel-icon">💬</span>
				<h3>{{ $t('mansion.announcements.review.commentsTitle') }}</h3>
			</div>

			<div v-if="comments.length === 0" class="comments-empty">
				{{ $t('mansion.announcements.review.noComments') }}
			</div>

			<div v-for="c in comments" :key="c.id" class="comment-item">
				<div class="comment-header">
					<span class="comment-author">{{ c.authorName }}</span>
					<span class="comment-date">{{ formatRelativeDate(c.createdAt) }}</span>
				</div>
				<p class="comment-text">{{ c.text }}</p>
			</div>

			<div class="comment-input">
				<textarea
					v-model="newComment"
					rows="2"
					:placeholder="$t('mansion.announcements.review.addComment')"
				></textarea>
				<KButton
					variant="primary"
					size="sm"
					:disabled="!newComment.trim()"
					@click="postComment"
				>
					{{ $t('mansion.announcements.review.postComment') }}
				</KButton>
			</div>
		</div>

		<!-- Publish Actions -->
		<div
			v-if="announcement.status === 'in_review' && approvals.length > 0"
			class="publish-panel"
		>
			<div class="panel-header">
				<span class="panel-icon">🚀</span>
				<h3>{{ $t('mansion.announcements.publish.title') }}</h3>
			</div>
			<div class="publish-actions">
				<KButton variant="primary" :loading="publishing" @click="$emit('publish')">
					{{ $t('mansion.announcements.publish.now') }}
				</KButton>
				<KButton variant="secondary" @click="$emit('schedule')">
					{{ $t('mansion.announcements.publish.schedule') }}
				</KButton>
			</div>
		</div>

		<!-- Read rate for published -->
		<div v-if="announcement.status === 'published' && readRate !== null" class="published-stats">
			<div class="read-rate-big">
				<div class="read-rate-value">{{ readRate }}%</div>
				<div class="read-rate-label">{{ $t('mansion.announcements.stats.avgReadRate') }}</div>
			</div>
			<div class="read-rate-bar-big">
				<div class="read-rate-fill" :style="{ width: readRate + '%' }"></div>
			</div>
		</div>
	</section>
</template>
<script>
export default {
	name: 'AnnouncementReview',
	props: {
		announcement: {
			type: Object,
			required: true
		},
		currentUser: {
			type: Object,
			required: true
		},
		aiLoading: {
			type: Boolean,
			default: false
		},
		publishing: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		'back',
		'submit-for-review',
		'apply-suggestion',
		'dismiss-suggestion',
		'add-comment',
		'approve',
		'publish',
		'schedule',
		'edit',
		'delete'
	],
	data() {
		return {
			newComment: ''
		}
	},
	computed: {
		statusLabel() {
			const map = {
				draft: this.$t( 'mansion.announcements.status.draft' ),
				in_review: this.$t( 'mansion.announcements.status.inReview' ),
				published: this.$t( 'mansion.announcements.status.published' ),
				scheduled: this.$t( 'mansion.announcements.status.scheduled' ),
				expired: this.$t( 'mansion.announcements.status.expired' )
			}
			return map[this.announcement.status] || this.announcement.status
		},
		statusVariant() {
			const map = {
				draft: 'secondary',
				in_review: 'warning',
				published: 'success',
				scheduled: 'info',
				expired: 'danger'
			}
			return map[this.announcement.status] || 'secondary'
		},
		priorityLabel() {
			const key = `mansion.announcements.priority.${this.announcement.priority || 'medium'}`
			return this.$t( key )
		},
		aiSuggestions() {
			return this.announcement.metadata?.review?.aiSuggestions || []
		},
		approvals() {
			return this.announcement.metadata?.approvals || []
		},
		comments() {
			return this.announcement.metadata?.comments || []
		},
		hasCurrentUserApproved() {
			return this.approvals.some( a => a.userId === this.currentUser?.id )
		},
		readRate() {
			const tracking = this.announcement.metadata?.readTracking
			if ( !tracking || !tracking.totalResidents ) return null
			return Math.round( ( tracking.readCount / tracking.totalResidents ) * 100 )
		}
	},
	methods: {
		postComment() {
			if ( !this.newComment.trim() ) return
			this.$emit( 'add-comment', this.newComment.trim() )
			this.newComment = ''
		},
		formatRelativeDate( dateStr ) {
			if ( !dateStr ) return ''
			const date = new Date( dateStr )
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

.announcement-review
	animation fadeIn 0.3s ease
	max-width 800px

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

// Header
.review-header
	display flex
	align-items center
	justify-content space-between
	margin-bottom 1.5rem

.back-btn
	border none
	background none
	color $color-text-secondary
	cursor pointer
	font-size 0.95rem
	padding 0.5rem 0
	transition color 0.2s

	&:hover
		color $color-text-primary

.review-header-actions
	display flex
	gap 0.5rem

// Preview card
.preview-card
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)
	margin-bottom 1.5rem
	border-left 4px solid $color-primary

.preview-label
	font-size 0.75rem
	text-transform uppercase
	letter-spacing 0.05em
	color $color-text-tertiary
	margin-bottom 0.75rem

.preview-header
	display flex
	align-items center
	gap 0.75rem
	margin-bottom 0.75rem

.preview-title
	font-size 1.2rem
	font-weight 600
	margin 0
	color $color-text-primary

.preview-description
	font-size 0.95rem
	line-height 1.6
	color $color-text-secondary
	margin 0 0 1rem 0
	white-space pre-wrap

.preview-meta
	display flex
	align-items center
	gap 0.5rem
	font-size 0.85rem
	color $color-text-secondary
	flex-wrap wrap

.preview-tags
	display flex
	gap 0.3rem
	margin-left 0.5rem

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

.tag-pill
	padding 0.15rem 0.6rem
	font-size 0.75rem
	background $color-bg-tertiary
	color $color-text-secondary
	border-radius 12px

// Action panel (draft submit)
.action-panel
	margin-bottom 1.5rem

// Panels shared
.panel-header
	display flex
	align-items center
	gap 0.5rem
	margin-bottom 1rem

	h3
		font-size 1rem
		font-weight 600
		margin 0
		color $color-text-primary

.panel-icon
	font-size 1.1rem

// AI Panel
.ai-panel
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)
	margin-bottom 1.5rem

.ai-loading
	display flex
	align-items center
	gap 0.75rem
	color $color-text-secondary
	padding 1rem 0

.ai-loading-spinner
	width 20px
	height 20px
	border 2px solid #e0e0e0
	border-top-color $color-primary
	border-radius 50%
	animation spin 0.8s linear infinite

@keyframes spin
	to
		transform rotate(360deg)

.ai-empty
	color #4caf50
	display flex
	align-items center
	gap 0.5rem

.ai-check
	font-weight bold

.ai-suggestions
	display flex
	flex-direction column
	gap 0.75rem

.suggestion-card
	border 1px solid #e0e0e0
	border-radius 8px
	padding 0.75rem 1rem
	transition all 0.2s

	&--applied
		border-color #c8e6c9
		background #f1f8e9

	&--dismissed
		opacity 0.5
		border-color #eee

.suggestion-type
	font-size 0.7rem
	text-transform uppercase
	letter-spacing 0.05em
	color $color-text-tertiary
	margin-bottom 0.35rem

.suggestion-content
	display flex
	align-items center
	gap 0.5rem
	flex-wrap wrap
	margin-bottom 0.5rem

.suggestion-original
	text-decoration line-through
	color #d32f2f
	background rgba(211, 47, 47, 0.06)
	padding 0.1rem 0.4rem
	border-radius 4px

.suggestion-arrow
	color $color-text-tertiary

.suggestion-replacement
	color #2e7d32
	background rgba(46, 125, 50, 0.06)
	padding 0.1rem 0.4rem
	border-radius 4px
	font-weight 500

.suggestion-actions
	display flex
	gap 0.5rem

.sug-btn
	padding 0.3rem 0.7rem
	border-radius 6px
	border 1px solid #ddd
	background white
	font-size 0.8rem
	cursor pointer
	transition all 0.2s

	&--apply
		color #2e7d32
		border-color #c8e6c9

		&:hover
			background #e8f5e9

	&--dismiss
		color #666

		&:hover
			background #f5f5f5

.suggestion-resolved
	font-size 0.8rem
	color $color-text-tertiary
	font-style italic

// Approvals
.approvals-panel
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)
	margin-bottom 1.5rem

.approvals-empty
	color $color-text-secondary
	font-size 0.9rem
	padding 0.5rem 0

.approval-item
	display flex
	align-items center
	gap 0.5rem
	padding 0.5rem 0
	border-bottom 1px solid #f5f5f5

.approval-check
	color #4caf50
	font-weight bold
	font-size 1.1rem

.approval-name
	font-weight 500
	color $color-text-primary

.approval-date
	font-size 0.8rem
	color $color-text-tertiary
	margin-left auto

.approve-btn
	margin-top 1rem

// Comments
.comments-panel
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)
	margin-bottom 1.5rem

.comments-empty
	color $color-text-secondary
	font-size 0.9rem
	padding 0.5rem 0

.comment-item
	padding 0.75rem 0
	border-bottom 1px solid #f5f5f5

	&:last-of-type
		border-bottom none

.comment-header
	display flex
	align-items center
	gap 0.5rem
	margin-bottom 0.25rem

.comment-author
	font-weight 500
	font-size 0.9rem
	color $color-text-primary

.comment-date
	font-size 0.8rem
	color $color-text-tertiary

.comment-text
	font-size 0.9rem
	line-height 1.5
	color $color-text-secondary
	margin 0

.comment-input
	display flex
	gap 0.5rem
	align-items flex-end
	margin-top 1rem
	padding-top 1rem
	border-top 1px solid #f0f0f0

	textarea
		flex 1
		padding 0.6rem 0.75rem
		border 1px solid #ddd
		border-radius 8px
		font-size 0.9rem
		font-family inherit
		resize none

		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

// Publish
.publish-panel
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)
	margin-bottom 1.5rem
	border 2px solid rgba(255, 193, 7, 0.3)

.publish-actions
	display flex
	gap 0.75rem

// Published stats
.published-stats
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)
	margin-bottom 1.5rem
	text-align center

.read-rate-big
	margin-bottom 1rem

.read-rate-value
	font-size 2.5rem
	font-weight 700
	color $color-text-primary

.read-rate-label
	font-size 0.85rem
	color $color-text-secondary

.read-rate-bar-big
	height 10px
	background #e0e0e0
	border-radius 5px
	overflow hidden

.read-rate-fill
	height 100%
	background linear-gradient(90deg, #4caf50, #66bb6a)
	border-radius 5px
	transition width 0.5s ease
</style>
