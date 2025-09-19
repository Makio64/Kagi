<template>
	<div class="k-checkbox-wrapper">
		<label :for="checkboxId" class="k-checkbox-label" :class="{ 'is-disabled': disabled }">
			<input
				:id="checkboxId"
				v-model="internalValue"
				type="checkbox"
				:value="value"
				:disabled="disabled"
				:required="required"
				:indeterminate.prop="indeterminate"
				:aria-required="required"
				:aria-invalid="!!error"
				:aria-describedby="ariaDescribedBy"
				:aria-checked="isChecked"
				class="k-checkbox-input"
				@change="handleChange"
			>
			<span class="k-checkbox-box" aria-hidden="true">
				<span v-if="isChecked && !indeterminate" class="k-checkbox-checkmark">✓</span>
				<span v-else-if="indeterminate" class="k-checkbox-indeterminate">−</span>
			</span>
			<span class="k-checkbox-text">
				{{ label }}
				<span v-if="required" class="required" aria-label="required">*</span>
			</span>
		</label>
		<span v-if="error" :id="errorId" class="k-checkbox-error" role="alert" aria-live="polite">{{ error }}</span>
		<span v-else-if="hint" :id="hintId" class="k-checkbox-hint">{{ hint }}</span>
	</div>
</template>

<script>
export default {
	name: 'KCheckbox',
	props: {
		modelValue: {
			type: [Boolean, Array],
			default: false
		},
		value: {
			type: [String, Number, Boolean],
			default: true
		},
		label: {
			type: String,
			required: true
		},
		disabled: {
			type: Boolean,
			default: false
		},
		required: {
			type: Boolean,
			default: false
		},
		indeterminate: {
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
		}
	},
	emits: ['update:modelValue', 'change'],
	data() {
		return {
			uniqueId: Math.random().toString( 36 ).substring( 2, 9 )
		}
	},
	computed: {
		checkboxId() {
			return `k-checkbox-${this.uniqueId}`
		},
		errorId() {
			return `k-checkbox-error-${this.uniqueId}`
		},
		hintId() {
			return `k-checkbox-hint-${this.uniqueId}`
		},
		ariaDescribedBy() {
			const ids = []
			if ( this.error ) ids.push( this.errorId )
			else if ( this.hint ) ids.push( this.hintId )
			return ids.length ? ids.join( ' ' ) : undefined
		},
		internalValue: {
			get() {
				if ( Array.isArray( this.modelValue ) ) {
					return this.modelValue.includes( this.value )
				}
				return this.modelValue
			},
			set( checked ) {
				if ( Array.isArray( this.modelValue ) ) {
					const newValue = [...this.modelValue]
					if ( checked ) {
						if ( !newValue.includes( this.value ) ) {
							newValue.push( this.value )
						}
					} else {
						const index = newValue.indexOf( this.value )
						if ( index > -1 ) {
							newValue.splice( index, 1 )
						}
					}
					this.$emit( 'update:modelValue', newValue )
				} else {
					this.$emit( 'update:modelValue', checked )
				}
			}
		},
		isChecked() {
			if ( this.indeterminate ) return 'mixed'
			return this.internalValue
		}
	},
	methods: {
		handleChange( event ) {
			this.$emit( 'change', event.target.checked, this.value )
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-checkbox-wrapper
	margin-bottom 1rem

.k-checkbox-label
	display inline-flex
	align-items center
	cursor pointer
	user-select none
	position relative

	&.is-disabled
		cursor not-allowed
		opacity 0.6

.k-checkbox-input
	position absolute
	opacity 0
	width 0
	height 0

	&:focus-visible + .k-checkbox-box
		outline 2px solid $color-primary
		outline-offset 2px

.k-checkbox-box
	display inline-flex
	align-items center
	justify-content center
	width 20px
	height 20px
	border 2px solid #ddd
	border-radius 4px
	margin-right 0.75rem
	transition all 0.2s
	background white
	flex-shrink 0

	.k-checkbox-input:checked + &
		background $color-primary
		border-color $color-primary

	.k-checkbox-input:disabled + &
		background #f5f5f5
		border-color #ddd

	.k-checkbox-input[aria-invalid="true"] + &
		border-color #F44336

.k-checkbox-checkmark
	color white
	font-size 14px
	font-weight bold
	line-height 1

.k-checkbox-indeterminate
	color white
	font-size 16px
	font-weight bold
	line-height 1

.k-checkbox-text
	color #333
	font-size 1rem

	.required
		color #F44336
		margin-left 0.25rem

	.k-checkbox-input:disabled ~ &
		color #999

.k-checkbox-error
	display block
	margin-top 0.25rem
	margin-left 32px
	color #F44336
	font-size 0.85rem

.k-checkbox-hint
	display block
	margin-top 0.25rem
	margin-left 32px
	color #999
	font-size 0.85rem
</style>