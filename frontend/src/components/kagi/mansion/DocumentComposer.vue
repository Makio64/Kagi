<template>
	<div class="document-composer">
		<form @submit.prevent>
			<div class="form-group">
				<label for="doc-title">{{ $t('mansion.documents.form.title') }}</label>
				<input
					id="doc-title"
					v-model="form.title"
					type="text"
					required
					:placeholder="$t('mansion.documents.form.titlePlaceholder')"
				>
			</div>

			<div class="form-group">
				<label for="doc-description">{{ $t('mansion.documents.form.description') }}</label>
				<input
					id="doc-description"
					v-model="form.description"
					type="text"
					:placeholder="$t('mansion.documents.form.descriptionPlaceholder')"
				>
			</div>

			<div class="form-row">
				<div class="form-group form-group--half">
					<label for="doc-category">{{ $t('mansion.documents.form.category') }}</label>
					<select id="doc-category" v-model="form.category">
						<option value="rules">{{ $t('mansion.documents.category.rules') }}</option>
						<option value="safety">{{ $t('mansion.documents.category.safety') }}</option>
						<option value="financial">{{ $t('mansion.documents.category.financial') }}</option>
						<option value="minutes">{{ $t('mansion.documents.category.minutes') }}</option>
						<option value="general">{{ $t('mansion.documents.category.general') }}</option>
					</select>
				</div>

				<div class="form-group form-group--half">
					<label for="doc-tags">{{ $t('mansion.documents.form.tags') }}</label>
					<input
						id="doc-tags"
						v-model="tagsInput"
						type="text"
						:placeholder="$t('mansion.documents.form.tagsPlaceholder')"
					>
					<div v-if="form.tags.length" class="tags-preview">
						<span v-for="(tag, i) in form.tags" :key="i" class="tag-pill">
							{{ tag }}
							<button type="button" class="tag-remove" @click="removeTag(i)">&times;</button>
						</span>
					</div>
				</div>
			</div>

			<div class="form-group">
				<label for="doc-content">{{ $t('mansion.documents.form.content') }}</label>
				<textarea
					id="doc-content"
					v-model="form.content"
					rows="15"
					class="markdown-editor"
					:placeholder="$t('mansion.documents.form.contentPlaceholder')"
				/>
			</div>
		</form>
	</div>
</template>
<script>
export default {
	name: 'DocumentComposer',
	props: {
		document: {
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
				content: '',
				category: 'general',
				tags: []
			},
			tagsInput: ''
		}
	},
	watch: {
		document: {
			immediate: true,
			handler( doc ) {
				if ( doc ) {
					this.form.title = doc.title || ''
					this.form.description = doc.description || ''
					this.form.content = doc.content || ''
					this.form.category = doc.category || 'general'
					this.form.tags = Array.isArray( doc.tags ) ? [...doc.tags] : []
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
		removeTag( index ) {
			this.form.tags.splice( index, 1 )
		},
		resetForm() {
			this.form = {
				title: '',
				description: '',
				content: '',
				category: 'general',
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

.document-composer
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

.markdown-editor
	font-family 'Monaco', 'Courier New', monospace
	font-size 0.95rem
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
