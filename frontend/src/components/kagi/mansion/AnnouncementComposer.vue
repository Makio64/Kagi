<template>
	<div class="announcement-composer">
		<form @submit.prevent="handleSave('draft')">
			<div class="form-group">
				<label for="ann-title">{{ $t('mansion.announcements.form.title') }}</label>
				<input
					id="ann-title"
					v-model="form.title"
					type="text"
					required
					:placeholder="$t('mansion.announcements.form.titlePlaceholder')"
				>
			</div>

			<div class="form-group">
				<label for="ann-content">{{ $t('mansion.announcements.form.content') }}</label>
				<textarea
					id="ann-content"
					v-model="form.description"
					required
					rows="6"
					:placeholder="$t('mansion.announcements.form.contentPlaceholder')"
				/>
			</div>

			<div class="form-row">
				<div class="form-group form-group--half">
					<label>{{ $t('mansion.announcements.form.priority') }}</label>
					<div class="priority-options">
						<label
							v-for="p in priorities"
							:key="p.value"
							class="priority-option"
							:class="{ 'priority-option--selected': form.priority === p.value }"
						>
							<input
								v-model="form.priority"
								type="radio"
								:value="p.value"
								class="sr-only"
							>
							<span class="priority-dot" :class="'priority-dot--' + p.value" />
							{{ $t(p.labelKey) }}
						</label>
					</div>
				</div>

				<div class="form-group form-group--half">
					<label for="ann-tags">{{ $t('mansion.announcements.form.tags') }}</label>
					<input
						id="ann-tags"
						v-model="tagsInput"
						type="text"
						:placeholder="$t('mansion.announcements.form.tagsPlaceholder')"
					>
					<div v-if="form.tags.length" class="tags-preview">
						<span v-for="(tag, i) in form.tags" :key="i" class="tag-pill">
							{{ tag }}
							<button type="button" class="tag-remove" @click="removeTag(i)">&times;</button>
						</span>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>
<script>
export default {
	name: 'AnnouncementComposer',
	props: {
		announcement: {
			type: Object,
			default: null
		},
		saving: {
			type: Boolean,
			default: false
		}
	},
	emits: ['save', 'submit-review', 'cancel'],
	data() {
		return {
			form: {
				title: '',
				description: '',
				priority: 'medium',
				tags: []
			},
			tagsInput: '',
			priorities: [
				{ value: 'low', labelKey: 'mansion.announcements.priority.low' },
				{ value: 'medium', labelKey: 'mansion.announcements.priority.medium' },
				{ value: 'high', labelKey: 'mansion.announcements.priority.high' },
				{ value: 'urgent', labelKey: 'mansion.announcements.priority.urgent' }
			]
		}
	},
	watch: {
		announcement: {
			immediate: true,
			handler( ann ) {
				if ( ann ) {
					this.form.title = ann.title || ''
					this.form.description = ann.description || ''
					this.form.priority = ann.priority || 'medium'
					this.form.tags = Array.isArray( ann.tags ) ? [...ann.tags] : []
					this.tagsInput = ''
				} else {
					this.resetForm()
				}
			}
		},
		tagsInput( val ) {
			if ( val.includes( ',' ) ) {
				const parts = val.split( ',' )
				for ( let i = 0; i < parts.length - 1; i++ ) {
					const tag = parts[i].trim()
					if ( tag && !this.form.tags.includes( tag ) ) {
						this.form.tags.push( tag )
					}
				}
				this.tagsInput = parts[parts.length - 1]
			}
		}
	},
	methods: {
		handleSave( action ) {
			if ( !this.form.title.trim() || !this.form.description.trim() ) return
			// Finalize any pending tag
			if ( this.tagsInput.trim() ) {
				const tag = this.tagsInput.trim()
				if ( !this.form.tags.includes( tag ) ) {
					this.form.tags.push( tag )
				}
				this.tagsInput = ''
			}
			this.$emit( action === 'review' ? 'submit-review' : 'save', { ...this.form } )
		},
		removeTag( index ) {
			this.form.tags.splice( index, 1 )
		},
		resetForm() {
			this.form = {
				title: '',
				description: '',
				priority: 'medium',
				tags: []
			}
			this.tagsInput = ''
		},
		getFormData() {
			// Finalize pending tag
			if ( this.tagsInput.trim() ) {
				const tag = this.tagsInput.trim()
				if ( !this.form.tags.includes( tag ) ) {
					this.form.tags.push( tag )
				}
				this.tagsInput = ''
			}
			return { ...this.form }
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'

.announcement-composer
	.form-group
		margin-bottom 1.2rem

		label
			display block
			margin-bottom 0.5rem
			color #666
			font-weight 500
			font-size 0.9rem

		input, textarea, select
			width 100%
			padding 0.75rem
			border 1px solid #ddd
			border-radius 8px
			font-size 1rem
			box-sizing border-box
			font-family inherit

			&:focus
				outline none
				border-color $color-primary
				box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

		textarea
			resize vertical
			line-height 1.6

	.form-group--half
		flex 1
		min-width 200px

.form-row
	display flex
	gap 1.5rem

	@media (max-width: 640px)
		flex-direction column
		gap 0

// Priority options
.priority-options
	display flex
	gap 0.5rem
	flex-wrap wrap

.priority-option
	display flex
	align-items center
	gap 0.4rem
	padding 0.45rem 0.8rem
	border 1px solid #e0e0e0
	border-radius 20px
	cursor pointer
	font-size 0.85rem
	color #666
	transition all 0.2s

	&:hover
		border-color #ccc

	&--selected
		border-color $color-primary
		background rgba(255, 193, 7, 0.08)
		color #333

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

.sr-only
	position absolute
	width 1px
	height 1px
	margin -1px
	padding 0
	overflow hidden
	clip rect(0, 0, 0, 0)
	border 0

// Tags
.tags-preview
	display flex
	gap 0.35rem
	flex-wrap wrap
	margin-top 0.5rem

.tag-pill
	display inline-flex
	align-items center
	gap 0.3rem
	padding 0.2rem 0.6rem
	font-size 0.8rem
	background $color-bg-tertiary
	color $color-text-secondary
	border-radius 12px

.tag-remove
	border none
	background none
	color #999
	cursor pointer
	font-size 1rem
	padding 0
	line-height 1

	&:hover
		color #333
</style>
