<template>
	<div class="k-switch-wrapper">
		<label :for="switchId" class="k-switch-label" :class="{ 'is-disabled': disabled }">
			<span v-if="labelPosition === 'left'" class="k-switch-text">
				{{ label }}
				<span v-if="required" class="required" aria-label="required">*</span>
			</span>
			<button
				:id="switchId"
				type="button"
				role="switch"
				:aria-checked="modelValue"
				:aria-required="required"
				:aria-invalid="!!error"
				:aria-describedby="ariaDescribedBy"
				:aria-label="!label || labelPosition === 'none' ? ariaLabel : undefined"
				:disabled="disabled"
				class="k-switch"
				:class="{ 'is-checked': modelValue, 'is-disabled': disabled, 'has-error': error }"
				@click="toggle"
				@keydown.space.prevent="toggle"
			>
				<span class="k-switch-track" aria-hidden="true">
					<span class="k-switch-thumb">
						<span v-if="showIcons" class="k-switch-icon">
							{{ modelValue ? '✓' : '✕' }}
						</span>
					</span>
				</span>
			</button>
			<span v-if="labelPosition === 'right'" class="k-switch-text">
				{{ label }}
				<span v-if="required" class="required" aria-label="required">*</span>
			</span>
		</label>
		<span v-if="error" :id="errorId" class="k-switch-error" role="alert" aria-live="polite">{{ error }}</span>
		<span v-else-if="hint" :id="hintId" class="k-switch-hint">{{ hint }}</span>
	</div>
</template>

<script>
export default {
	name: 'KSwitch',
	props: {
		modelValue: {
			type: Boolean,
			default: false
		},
		label: {
			type: String,
			default: ''
		},
		labelPosition: {
			type: String,
			default: 'right',
			validator: value => ['left', 'right', 'none'].includes( value )
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
		ariaLabel: {
			type: String,
			default: ''
		},
		showIcons: {
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
		switchId() {
			return `k-switch-${this.uniqueId}`
		},
		errorId() {
			return `k-switch-error-${this.uniqueId}`
		},
		hintId() {
			return `k-switch-hint-${this.uniqueId}`
		},
		ariaDescribedBy() {
			const ids = []
			if ( this.error ) ids.push( this.errorId )
			else if ( this.hint ) ids.push( this.hintId )
			return ids.length ? ids.join( ' ' ) : undefined
		}
	},
	methods: {
		toggle() {
			if ( !this.disabled ) {
				const newValue = !this.modelValue
				this.$emit( 'update:modelValue', newValue )
				this.$emit( 'change', newValue )
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-switch-wrapper
	margin-bottom 1rem

.k-switch-label
	display inline-flex
	align-items center
	gap 0.75rem
	cursor pointer
	user-select none

	&.is-disabled
		cursor not-allowed
		opacity 0.6

.k-switch
	position relative
	width 52px
	height 28px
	background transparent
	border none
	padding 0
	cursor pointer
	flex-shrink 0

	&:focus-visible
		outline 2px solid $color-primary
		outline-offset 2px
		border-radius 14px

	&.is-disabled
		cursor not-allowed

.k-switch-track
	display block
	width 100%
	height 100%
	border-radius 14px
	background #ddd
	transition background-color 0.2s
	position relative

	.k-switch.is-checked &
		background $color-primary

	.k-switch.is-disabled &
		background #f0f0f0

	.k-switch.has-error &
		background #ffcdd2

.k-switch-thumb
	position absolute
	top 2px
	left 2px
	width 24px
	height 24px
	border-radius 50%
	background white
	box-shadow 0 2px 4px rgba(0, 0, 0, 0.2)
	transition transform 0.2s, background-color 0.2s
	display flex
	align-items center
	justify-content center

	.k-switch.is-checked &
		transform translateX(24px)

	.k-switch.is-disabled &
		background #fafafa
		box-shadow 0 1px 2px rgba(0, 0, 0, 0.1)

.k-switch-icon
	font-size 12px
	font-weight bold
	color #666

	.k-switch.is-checked &
		color $color-primary

.k-switch-text
	color #333
	font-size 1rem

	.required
		color #F44336
		margin-left 0.25rem

	.k-switch.is-disabled ~ &
		color #999

.k-switch-error
	display block
	margin-top 0.25rem
	color #F44336
	font-size 0.85rem

.k-switch-hint
	display block
	margin-top 0.25rem
	color #999
	font-size 0.85rem
</style>