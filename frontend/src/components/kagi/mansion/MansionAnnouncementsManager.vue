<template>
	<div>
		<!-- Review Detail View -->
		<AnnouncementReview
			v-if="selectedAnnouncement"
			:announcement="selectedAnnouncement"
			:current-user="user"
			:ai-loading="isAiReviewing"
			:publishing="isPublishing"
			@back="selectedAnnouncement = null"
			@submit-for-review="submitForReview"
			@apply-suggestion="applySuggestion"
			@dismiss-suggestion="dismissSuggestion"
			@add-comment="addComment"
			@approve="approveAnnouncement"
			@publish="publishAnnouncement"
			@schedule="showScheduleModal = true"
			@edit="openComposerModal(selectedAnnouncement)"
			@delete="confirmDeleteAnnouncement(selectedAnnouncement)"
		/>

		<!-- List View -->
		<AnnouncementsSection
			v-else
			:announcements="announcements"
			:loading="isLoadingAnnouncements"
			:stats="announcementsStats"
			:active-filter="announcementFilter"
			:pagination="announcementPagination"
			@create="openComposerModal()"
			@view="viewAnnouncement"
			@filter="handleAnnouncementFilter"
			@page-change="handleAnnouncementPageChange"
		/>

		<!-- Composer Modal -->
		<KModal
			v-model="showComposerModal"
			:title="editingAnnouncement ? $t('mansion.announcements.form.editTitle') : $t('mansion.announcements.form.createTitle')"
			size="large"
		>
			<AnnouncementComposer
				ref="composer"
				:announcement="editingAnnouncement"
				:saving="isSavingAnnouncement"
			/>

			<template #footer>
				<KButton variant="secondary" @click="showComposerModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="secondary" :loading="isSavingAnnouncement" @click="saveAnnouncement('draft')">
					{{ $t('mansion.announcements.saveDraft') }}
				</KButton>
				<KButton variant="primary" :loading="isSavingAnnouncement" @click="saveAnnouncement('review')">
					{{ $t('mansion.announcements.submitReview') }}
				</KButton>
			</template>
		</KModal>

		<!-- Schedule Modal -->
		<KModal
			v-model="showScheduleModal"
			:title="$t('mansion.announcements.publish.scheduleTitle')"
			size="small"
		>
			<div class="form-group">
				<label for="schedule-date">{{ $t('mansion.announcements.publish.scheduleDate') }}</label>
				<input
					id="schedule-date"
					v-model="scheduleDate"
					type="date"
					:min="todayDate"
				>
			</div>
			<div class="form-group">
				<label for="schedule-time">{{ $t('mansion.announcements.publish.scheduleTime') }}</label>
				<input
					id="schedule-time"
					v-model="scheduleTime"
					type="time"
				>
			</div>

			<template #footer>
				<KButton variant="secondary" @click="showScheduleModal = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="primary" :disabled="!scheduleDate || !scheduleTime" @click="scheduleAnnouncement">
					{{ $t('mansion.announcements.publish.schedule') }}
				</KButton>
			</template>
		</KModal>

		<!-- Delete Announcement Confirmation Modal -->
		<KModal
			v-model="showDeleteAnnouncementConfirm"
			:title="$t('common.confirmDelete')"
			size="small"
		>
			<p>{{ $t('mansion.announcements.deleteConfirm') }}</p>

			<template #footer>
				<KButton variant="secondary" @click="showDeleteAnnouncementConfirm = false">
					{{ $t('common.cancel') }}
				</KButton>
				<KButton variant="danger" :loading="isDeletingAnnouncement" @click="deleteAnnouncement">
					{{ $t('common.delete') }}
				</KButton>
			</template>
		</KModal>
	</div>
</template>
<script>
import backend from '../../../services/SupabaseBackend'

export default {
	name: 'MansionAnnouncementsManager',
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
			announcements: [],
			isLoadingAnnouncements: false,
			announcementFilter: 'all',
			announcementPagination: {
				page: 1,
				limit: 25,
				total: 0,
				totalPages: 0
			},
			// Detail view
			selectedAnnouncement: null,
			// Composer modal
			showComposerModal: false,
			editingAnnouncement: null,
			isSavingAnnouncement: false,
			// AI review
			isAiReviewing: false,
			// Publishing
			isPublishing: false,
			// Schedule modal
			showScheduleModal: false,
			scheduleDate: '',
			scheduleTime: '',
			// Delete
			showDeleteAnnouncementConfirm: false,
			deleteAnnouncementTarget: null,
			isDeletingAnnouncement: false
		}
	},
	computed: {
		announcementsStats() {
			const all = this.announcements
			const published = all.filter( a => a.status === 'published' )
			return {
				total: this.announcementPagination.total || all.length,
				drafts: all.filter( a => a.status === 'draft' ).length,
				inReview: all.filter( a => a.status === 'in_review' ).length,
				published: published.length,
				scheduled: all.filter( a => a.status === 'scheduled' ).length,
				avgReadRate: this._calculateAvgReadRate( published )
			}
		},
		todayDate() {
			return new Date().toISOString().split( 'T' )[0]
		}
	},
	async mounted() {
		await this.fetchAnnouncements()
	},
	methods: {
		// ==========================================
		// DATA LOADING
		// ==========================================

		async fetchAnnouncements() {
			this.isLoadingAnnouncements = true
			try {
				const params = {
					mansionId: this.mansionId,
					page: this.announcementPagination.page,
					limit: this.announcementPagination.limit,
					sort: '-createdAt'
				}
				if ( this.announcementFilter && this.announcementFilter !== 'all' ) {
					params.status = this.announcementFilter
				}
				const response = await backend.query( 'announcements', params )
				if ( response.success ) {
					this.announcements = response.data
					this.announcementPagination.total = response.meta?.total || response.data.length
					this.announcementPagination.totalPages = response.meta?.totalPages || 1
				}
			} catch ( error ) {
				console.error( 'Failed to fetch announcements:', error )
			} finally {
				this.isLoadingAnnouncements = false
			}
		},

		handleAnnouncementFilter( filter ) {
			this.announcementFilter = filter
			this.announcementPagination.page = 1
			this.fetchAnnouncements()
		},

		handleAnnouncementPageChange( page ) {
			this.announcementPagination.page = page
			this.fetchAnnouncements()
		},

		viewAnnouncement( announcement ) {
			this.selectedAnnouncement = announcement
		},

		// ==========================================
		// CREATE / EDIT
		// ==========================================

		openComposerModal( announcement ) {
			this.editingAnnouncement = announcement || null
			this.showComposerModal = true
		},

		async saveAnnouncement( action ) {
			const composer = this.$refs.composer
			if ( !composer ) return
			const formData = composer.getFormData()
			if ( !formData.title?.trim() || !formData.description?.trim() ) return

			this.isSavingAnnouncement = true
			try {
				const payload = {
					...formData,
					mansionId: this.mansionId,
					status: action === 'review' ? 'in_review' : 'draft'
				}

				let response
				if ( this.editingAnnouncement ) {
					response = await backend.update( 'announcements', this.editingAnnouncement.id, payload )
				} else {
					response = await backend.create( 'announcements', payload )
				}

				if ( response.success ) {
					this.showComposerModal = false
					this.editingAnnouncement = null
					await this.fetchAnnouncements()

					// If submitted for review, run AI check
					if ( action === 'review' && response.data ) {
						this.selectedAnnouncement = response.data
						this.runAiReview( response.data )
					}
				}
			} catch ( error ) {
				console.error( 'Failed to save announcement:', error )
				alert( error.error?.message || this.$t( 'mansion.announcements.saveFailed' ) )
			} finally {
				this.isSavingAnnouncement = false
			}
		},

		// ==========================================
		// AI REVIEW
		// ==========================================

		async submitForReview() {
			if ( !this.selectedAnnouncement ) return
			try {
				const response = await backend.update( 'announcements', this.selectedAnnouncement.id, {
					status: 'in_review',
					metadata: {
						...( this.selectedAnnouncement.metadata || {} ),
						review: {
							...( this.selectedAnnouncement.metadata?.review || {} ),
							submittedAt: new Date().toISOString()
						}
					}
				} )
				if ( response.success ) {
					this.selectedAnnouncement = { ...this.selectedAnnouncement, ...response.data }
					this.runAiReview( this.selectedAnnouncement )
					await this.fetchAnnouncements()
				}
			} catch ( error ) {
				console.error( 'Failed to submit for review:', error )
			}
		},

		runAiReview( announcement ) {
			this.isAiReviewing = true
			setTimeout( async () => {
				const suggestions = this._generateMockAiSuggestions( announcement.description || '' )
				const metadata = {
					...( announcement.metadata || {} ),
					review: {
						...( announcement.metadata?.review || {} ),
						aiSuggestions: suggestions,
						aiReviewedAt: new Date().toISOString()
					}
				}
				try {
					const response = await backend.update( 'announcements', announcement.id, { metadata } )
					if ( response.success ) {
						this.selectedAnnouncement = { ...this.selectedAnnouncement, metadata }
					}
				} catch ( error ) {
					console.error( 'AI review update failed:', error )
				} finally {
					this.isAiReviewing = false
				}
			}, 1500 )
		},

		_generateMockAiSuggestions( text ) {
			const suggestions = []
			let id = 1

			const patterns = [
				{ regex: /will be provide\b/gi, original: 'will be provide', suggested: 'will be provided', type: 'grammar' },
				{ regex: /their familys\b/gi, original: 'their familys', suggested: 'their families', type: 'grammar' },
				{ regex: /\s{2,}/g, original: '  ', suggested: ' ', type: 'formatting' },
				{ regex: /dont\b/gi, original: 'dont', suggested: "don't", type: 'grammar' },
				{ regex: /wont\b/gi, original: 'wont', suggested: "won't", type: 'grammar' },
				{ regex: /cant\b/gi, original: 'cant', suggested: "can't", type: 'grammar' },
				{ regex: /informations\b/gi, original: 'informations', suggested: 'information', type: 'grammar' },
				{ regex: /equipments\b/gi, original: 'equipments', suggested: 'equipment', type: 'grammar' },
				{ regex: /\bwich\b/gi, original: 'wich', suggested: 'which', type: 'spelling' },
				{ regex: /\bteh\b/gi, original: 'teh', suggested: 'the', type: 'spelling' }
			]

			for ( const p of patterns ) {
				if ( p.regex.test( text ) ) {
					suggestions.push( {
						id: `sug_${id++}`,
						type: p.type,
						original: p.original,
						suggested: p.suggested,
						applied: false
					} )
				}
			}

			// If no patterns found, add a generic clarity suggestion
			if ( suggestions.length === 0 && text.length > 50 ) {
				suggestions.push( {
					id: 'sug_1',
					type: 'clarity',
					original: '',
					suggested: '',
					description: this.$t( 'mansion.announcements.review.aiNoIssues' ),
					applied: false
				} )
			}

			return suggestions
		},

		async applySuggestion( suggestionId ) {
			if ( !this.selectedAnnouncement ) return
			const meta = { ...( this.selectedAnnouncement.metadata || {} ) }
			const suggestions = meta.review?.aiSuggestions || []
			const sug = suggestions.find( s => s.id === suggestionId )
			if ( !sug || sug.applied ) return

			// Apply text replacement
			let description = this.selectedAnnouncement.description || ''
			if ( sug.original ) {
				description = description.replace( new RegExp( sug.original.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ), 'gi' ), sug.suggested )
			}

			// Mark suggestion as applied
			sug.applied = true
			meta.review = { ...meta.review, aiSuggestions: [...suggestions] }

			try {
				const response = await backend.update( 'announcements', this.selectedAnnouncement.id, {
					description,
					metadata: meta
				} )
				if ( response.success ) {
					this.selectedAnnouncement = {
						...this.selectedAnnouncement,
						description,
						metadata: meta
					}
				}
			} catch ( error ) {
				console.error( 'Failed to apply suggestion:', error )
			}
		},

		async dismissSuggestion( suggestionId ) {
			if ( !this.selectedAnnouncement ) return
			const meta = { ...( this.selectedAnnouncement.metadata || {} ) }
			const suggestions = ( meta.review?.aiSuggestions || [] ).filter( s => s.id !== suggestionId )
			meta.review = { ...meta.review, aiSuggestions: suggestions }

			try {
				await backend.update( 'announcements', this.selectedAnnouncement.id, { metadata: meta } )
				this.selectedAnnouncement = { ...this.selectedAnnouncement, metadata: meta }
			} catch ( error ) {
				console.error( 'Failed to dismiss suggestion:', error )
			}
		},

		// ==========================================
		// COMMENTS
		// ==========================================

		async addComment( text ) {
			if ( !this.selectedAnnouncement || !text?.trim() ) return
			const meta = { ...( this.selectedAnnouncement.metadata || {} ) }
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
				const response = await backend.update( 'announcements', this.selectedAnnouncement.id, { metadata: meta } )
				if ( response.success ) {
					this.selectedAnnouncement = { ...this.selectedAnnouncement, metadata: meta }
				}
			} catch ( error ) {
				console.error( 'Failed to add comment:', error )
			}
		},

		// ==========================================
		// APPROVALS
		// ==========================================

		async approveAnnouncement() {
			if ( !this.selectedAnnouncement ) return
			const meta = { ...( this.selectedAnnouncement.metadata || {} ) }
			const approvals = [...( meta.approvals || [] )]

			// Prevent duplicate approval
			if ( approvals.some( a => a.userId === this.user?.id ) ) return

			approvals.push( {
				userId: this.user?.id,
				userName: this.user?.name || this.user?.email,
				approvedAt: new Date().toISOString()
			} )
			meta.approvals = approvals

			try {
				const response = await backend.update( 'announcements', this.selectedAnnouncement.id, { metadata: meta } )
				if ( response.success ) {
					this.selectedAnnouncement = { ...this.selectedAnnouncement, metadata: meta }
					await this.fetchAnnouncements()
				}
			} catch ( error ) {
				console.error( 'Failed to approve announcement:', error )
			}
		},

		// ==========================================
		// PUBLISHING
		// ==========================================

		async publishAnnouncement() {
			if ( !this.selectedAnnouncement ) return
			this.isPublishing = true
			try {
				const meta = { ...( this.selectedAnnouncement.metadata || {} ) }
				meta.publishedAt = new Date().toISOString()
				meta.publishedBy = this.user?.id
				meta.readTracking = {
					totalResidents: this.totalResidents || 45,
					readCount: 0
				}

				const response = await backend.update( 'announcements', this.selectedAnnouncement.id, {
					status: 'published',
					metadata: meta
				} )
				if ( response.success ) {
					this.selectedAnnouncement = {
						...this.selectedAnnouncement,
						status: 'published',
						metadata: meta
					}
					await this.fetchAnnouncements()
				}
			} catch ( error ) {
				console.error( 'Failed to publish announcement:', error )
			} finally {
				this.isPublishing = false
			}
		},

		async scheduleAnnouncement() {
			if ( !this.selectedAnnouncement || !this.scheduleDate || !this.scheduleTime ) return
			const publishAt = new Date( `${this.scheduleDate}T${this.scheduleTime}` ).toISOString()
			const meta = { ...( this.selectedAnnouncement.metadata || {} ) }
			meta.scheduling = { publishAt }

			try {
				const response = await backend.update( 'announcements', this.selectedAnnouncement.id, {
					status: 'scheduled',
					metadata: meta
				} )
				if ( response.success ) {
					this.selectedAnnouncement = {
						...this.selectedAnnouncement,
						status: 'scheduled',
						metadata: meta
					}
					this.showScheduleModal = false
					this.scheduleDate = ''
					this.scheduleTime = ''
					await this.fetchAnnouncements()
				}
			} catch ( error ) {
				console.error( 'Failed to schedule announcement:', error )
			}
		},

		// ==========================================
		// DELETE
		// ==========================================

		confirmDeleteAnnouncement( announcement ) {
			this.deleteAnnouncementTarget = announcement
			this.showDeleteAnnouncementConfirm = true
		},

		async deleteAnnouncement() {
			if ( !this.deleteAnnouncementTarget ) return
			this.isDeletingAnnouncement = true
			try {
				const targetId = this.deleteAnnouncementTarget.id
				const response = await backend.delete( 'announcements', targetId )
				if ( response.success ) {
					if ( this.selectedAnnouncement?.id === targetId ) {
						this.selectedAnnouncement = null
					}
					this.showDeleteAnnouncementConfirm = false
					this.deleteAnnouncementTarget = null
					await this.fetchAnnouncements()
				}
			} catch ( error ) {
				console.error( 'Failed to delete announcement:', error )
				alert( error.error?.message || this.$t( 'mansion.announcements.deleteFailed' ) )
			} finally {
				this.isDeletingAnnouncement = false
			}
		},

		// ==========================================
		// HELPERS
		// ==========================================

		_calculateAvgReadRate( publishedAnnouncements ) {
			if ( !publishedAnnouncements ) return 0
			const withTracking = publishedAnnouncements.filter( a => a.metadata?.readTracking?.totalResidents )
			if ( withTracking.length === 0 ) return 0
			const total = withTracking.reduce( ( sum, a ) => {
				const t = a.metadata.readTracking
				return sum + Math.round( ( t.readCount / t.totalResidents ) * 100 )
			}, 0 )
			return Math.round( total / withTracking.length )
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/_form-modal.styl'
</style>
