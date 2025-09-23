<template>
	<div class="k-radio-wrapper">
		<fieldset class="k-radio-fieldset" :aria-required="required" :aria-invalid="!!error">
			<legend v-if="legend" class="k-radio-legend">
				{{ legend }}
				<span v-if="required" class="required" aria-label="required">*</span>
			</legend>
			<div class="k-radio-options" role="radiogroup" :aria-labelledby="legendId" :aria-describedby="ariaDescribedBy">
				<label
					v-for="option in options"
					:key="getOptionValue(option)"
					:for="`${radioName}-${getOptionValue(option)}`"
					class="k-radio-label"
					:class="{ 'is-disabled': disabled || getOptionDisabled(option) }"
				>
					<input
						:id="`${radioName}-${getOptionValue(option)}`"
						v-model="internalValue"
						type="radio"
						:name="radioName"
						:value="getOptionValue(option)"
						:disabled="disabled || getOptionDisabled(option)"
						:required="required"
						:aria-checked="internalValue === getOptionValue(option)"
						class="k-radio-input"
						@change="handleChange"
					>
					<span class="k-radio-circle" aria-hidden="true">
						<span v-if="internalValue === getOptionValue(option)" class="k-radio-dot" />
					</span>
					<span class="k-radio-text">{{ getOptionLabel(option) }}</span>
				</label>
			</div>
		</fieldset>
		<span v-if="error" :id="errorId" class="k-radio-error" role="alert" aria-live="polite">{{ error }}</span>
		<span v-else-if="hint" :id="hintId" class="k-radio-hint">{{ hint }}</span>
	</div>
</template>

<script>
export default {
	name: 'KRadio',
	props: {
		modelValue: {
			type: [String, Number, Boolean],
			default: null
		},
		options: {
			type: Array,
			required: true
		},
		legend: {
			type: String,
			default: ''
		},
		optionLabel: {
			type: [String, Function],
			default: 'label'
		},
		optionValue: {
			type: [String, Function],
			default: 'value'
		},
		optionDisabled: {
			type: [String, Function],
			default: 'disabled'
		},
		disabled: {
			type: Boolean,
			default: false
		},
		required: {
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
		inline: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'change'],
	data() {
		return {
			uniqueId: Math.random().toString( 36 ).substring( 2, 9 )
		}
	},
	computed: {
		radioName() {
			return `k-radio-${this.uniqueId}`
		},
		legendId() {
			return `k-radio-legend-${this.uniqueId}`
		},
		errorId() {
			return `k-radio-error-${this.uniqueId}`
		},
		hintId() {
			return `k-radio-hint-${this.uniqueId}`
		},
		ariaDescribedBy() {
			const ids = []
			if ( this.error ) ids.push( this.errorId )
			else if ( this.hint ) ids.push( this.hintId )
			return ids.length ? ids.join( ' ' ) : undefined
		},
		internalValue: {
			get() {
				return this.modelValue
			},
			set( value ) {
				this.$emit( 'update:modelValue', value )
			}
		}
	},
	methods: {
		getOptionLabel( option ) {
			if ( typeof this.optionLabel === 'function' ) {
				return this.optionLabel( option )
			}
			return typeof option === 'object' ? option[this.optionLabel] : option
		},
		getOptionValue( option ) {
			if ( typeof this.optionValue === 'function' ) {
				return this.optionValue( option )
			}
			return typeof option === 'object' ? option[this.optionValue] : option
		},
		getOptionDisabled( option ) {
			if ( typeof this.optionDisabled === 'function' ) {
				return this.optionDisabled( option )
			}
			return typeof option === 'object' ? option[this.optionDisabled] : false
		},
		handleChange( event ) {
			this.$emit( 'change', event.target.value )
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-radio-wrapper
	margin-bottom 1.2rem

.k-radio-fieldset
	border none
	padding 0
	margin 0

.k-radio-legend
	display block
	margin-bottom 0.5rem
	color #666
	font-weight 500
	font-size 0.9rem

	.required
		color #F44336
		margin-left 0.25rem

.k-radio-options
	display flex
	flex-direction column
	gap 0.75rem

	&.inline
		flex-direction row
		flex-wrap wrap
		gap 1.5rem

.k-radio-label
	display inline-flex
	align-items center
	cursor pointer
	user-select none
	position relative

	&.is-disabled
		cursor not-allowed
		opacity 0.6

.k-radio-input
	position absolute
	opacity 0
	width 0
	height 0

	&:focus-visible + .k-radio-circle
		outline 2px solid $color-primary
		outline-offset 2px

.k-radio-circle
	display inline-flex
	align-items center
	justify-content center
	width 20px
	height 20px
	border 2px solid #ddd
	border-radius 50%
	margin-right 0.75rem
	transition all 0.2s
	background white
	flex-shrink 0

	.k-radio-input:checked + &
		border-color $color-primary

	.k-radio-input:disabled + &
		background #f5f5f5
		border-color #ddd

	.k-radio-input[aria-invalid="true"] + &
		border-color #F44336

.k-radio-dot
	width 10px
	height 10px
	border-radius 50%
	background $color-primary
	animation radio-scale-in 0.2s ease-out

@keyframes radio-scale-in
	from
		transform scale(0)
	to
		transform scale(1)

.k-radio-text
	color #333
	font-size 1rem

	.k-radio-input:disabled ~ &
		color #999

.k-radio-error
	display block
	margin-top 0.25rem
	color #F44336
	font-size 0.85rem

.k-radio-hint
	display block
	margin-top 0.25rem
	color #999
	font-size 0.85rem
</style>