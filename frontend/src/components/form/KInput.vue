<template>
	<div class="k-input-wrapper">
		<label v-if="label" :for="inputId" class="k-input-label">
			{{ label }}
			<span v-if="required" class="required" aria-label="required">*</span>
		</label>
		<input
			:id="inputId"
			:type="type"
			:value="modelValue"
			:placeholder="placeholder"
			:required="required"
			:disabled="disabled"
			:readonly="readonly"
			:min="min"
			:max="max"
			:step="step"
			:aria-invalid="!!error"
			:aria-required="required"
			:aria-describedby="ariaDescribedBy"
			:aria-label="!label ? ariaLabel : undefined"
			class="k-input"
			:class="{ 'has-error': error }"
			@input="$emit( 'update:modelValue', $event.target.value )"
			@blur="$emit( 'blur', $event )"
			@focus="$emit( 'focus', $event )"
		>
		<span v-if="error" :id="errorId" class="k-input-error" role="alert" aria-live="polite">{{ error }}</span>
		<span v-else-if="hint" :id="hintId" class="k-input-hint">{{ hint }}</span>
	</div>
</template>

<script>
export default {
	name: 'KInput',
	props: {
		modelValue: {
			type: [String, Number],
			default: ''
		},
		type: {
			type: String,
			default: 'text'
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
		error: {
			type: String,
			default: ''
		},
		hint: {
			type: String,
			default: ''
		},
		min: {
			type: [String, Number],
			default: undefined
		},
		max: {
			type: [String, Number],
			default: undefined
		},
		step: {
			type: [String, Number],
			default: undefined
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
		inputId() {
			return `k-input-${this.uniqueId}`
		},
		errorId() {
			return `k-input-error-${this.uniqueId}`
		},
		hintId() {
			return `k-input-hint-${this.uniqueId}`
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

.k-input-wrapper
	margin-bottom 1.2rem

.k-input-label
	display block
	margin-bottom 0.5rem
	color #666
	font-weight 500
	font-size 0.9rem

	.required
		color #F44336
		margin-left 0.25rem

.k-input
	width 100%
	padding 0.75rem
	border 1px solid #ddd
	border-radius 8px
	font-size 1rem
	transition border-color 0.2s, box-shadow 0.2s
	font-family inherit

	&:focus
		outline none
		border-color $color-primary
		box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

	&:disabled
		background #f5f5f5
		cursor not-allowed
		opacity 0.7

	&:readonly
		background #fafafa

	&.has-error
		border-color #F44336

		&:focus
			box-shadow 0 0 0 3px rgba(244, 67, 54, 0.1)

.k-input-error
	display block
	margin-top 0.25rem
	color #F44336
	font-size 0.85rem

.k-input-hint
	display block
	margin-top 0.25rem
	color #999
	font-size 0.85rem
</style>