<template>
	<div class="k-textarea-wrapper">
		<label v-if="label" :for="textareaId" class="k-textarea-label">
			{{ label }}
			<span v-if="required" class="required" aria-label="required">*</span>
		</label>
		<textarea
			:id="textareaId"
			:value="modelValue"
			:placeholder="placeholder"
			:required="required"
			:disabled="disabled"
			:readonly="readonly"
			:rows="rows"
			:maxlength="maxlength"
			:aria-invalid="!!error"
			:aria-required="required"
			:aria-describedby="ariaDescribedBy"
			:aria-label="!label ? ariaLabel : undefined"
			class="k-textarea"
			:class="{ 'has-error': error }"
			@input="$emit( 'update:modelValue', $event.target.value )"
			@blur="$emit( 'blur', $event )"
			@focus="$emit( 'focus', $event )"
		/>
		<div class="k-textarea-footer">
			<span v-if="error" :id="errorId" class="k-textarea-error" role="alert" aria-live="polite">{{ error }}</span>
			<span v-else-if="hint" :id="hintId" class="k-textarea-hint">{{ hint }}</span>
			<span v-if="showCount && maxlength" class="k-textarea-count" :aria-label="`${modelValue.length} of ${maxlength} characters`">
				{{ modelValue.length }} / {{ maxlength }}
			</span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'KTextarea',
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		label: {
			type: String,
			default: ''
		},
		placeholder: {
			type: String,
			default: ''
		},
		required: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		readonly: {
			type: Boolean,
			default: false
		},
		rows: {
			type: Number,
			default: 4
		},
		maxlength: {
			type: Number,
			default: undefined
		},
		showCount: {
			type: Boolean,
			default: false
		},
		error: {
			type: String,
			default: ''
		},
		hint: {
			type: String,
			default: ''
		},
		ariaLabel: {
			type: String,
			default: ''
		}
	},
	emits: ['update:modelValue', 'blur', 'focus'],
	data() {
		return {
			uniqueId: Math.random().toString( 36 ).substring( 2, 9 )
		}
	},
	computed: {
		textareaId() {
			return `k-textarea-${this.uniqueId}`
		},
		errorId() {
			return `k-textarea-error-${this.uniqueId}`
		},
		hintId() {
			return `k-textarea-hint-${this.uniqueId}`
		},
		ariaDescribedBy() {
			const ids = []
			if ( this.error ) ids.push( this.errorId )
			else if ( this.hint ) ids.push( this.hintId )
			return ids.length ? ids.join( ' ' ) : undefined
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-textarea-wrapper
	margin-bottom 1.2rem

.k-textarea-label
	display block
	margin-bottom 0.5rem
	color #666
	font-weight 500
	font-size 0.9rem

	.required
		color #F44336
		margin-left 0.25rem

.k-textarea
	width 100%
	padding 0.75rem
	border 1px solid #ddd
	border-radius 8px
	font-size 1rem
	transition border-color 0.2s, box-shadow 0.2s
	resize vertical
	font-family inherit
	min-height 100px

	&:focus
		outline none
		border-color $color-primary
		box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

	&:disabled
		background #f5f5f5
		cursor not-allowed
		opacity 0.7
		resize none

	&:readonly
		background #fafafa

	&.has-error
		border-color #F44336

		&:focus
			box-shadow 0 0 0 3px rgba(244, 67, 54, 0.1)

.k-textarea-footer
	display flex
	justify-content space-between
	margin-top 0.25rem

.k-textarea-error
	color #F44336
	font-size 0.85rem

.k-textarea-hint
	color #999
	font-size 0.85rem

.k-textarea-count
	color #999
	font-size 0.85rem
	margin-left auto
</style>
