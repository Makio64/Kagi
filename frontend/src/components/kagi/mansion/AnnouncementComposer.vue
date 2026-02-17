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

			<div class="form-group">
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
				tags: []
			},
			tagsInput: ''
		}
	},
	watch: {
		announcement: {
			immediate: true,
			handler( ann ) {
				if ( ann ) {
					this.form.title = ann.title || ''
					this.form.description = ann.description || ''
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
