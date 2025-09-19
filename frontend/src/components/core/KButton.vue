<template>
	<button
		:type="type"
		:disabled="disabled || loading"
		:aria-label="ariaLabel || (!$slots.default && icon ? iconAriaLabel : undefined)"
		:aria-busy="loading"
		:aria-disabled="disabled || loading"
		:aria-pressed="isToggle ? pressed : undefined"
		:class="[
			'k-button',
			`k-button--${variant}`,
			`k-button--${size}`,
			{
				'k-button--block': block,
				'k-button--rounded': rounded,
				'k-button--outlined': outlined,
				'k-button--loading': loading,
				'k-button--icon-only': !$slots.default && icon,
				'k-button--pressed': pressed
			}
		]"
		@click="handleClick"
		@keydown.enter.space.prevent="handleKeyPress"
	>
		<span v-if="loading" class="k-button__spinner" aria-hidden="true">
			<Spinner :size="spinnerSize" />
			<span class="sr-only">{{ loadingText || 'Loading...' }}</span>
		</span>
		<span v-if="icon && !loading" class="k-button__icon" aria-hidden="true">{{ icon }}</span>
		<span v-if="$slots.default" class="k-button__content">
			<slot />
		</span>
	</button>
</template>

<script>
export default {
	name: 'KButton',
	props: {
		// Button type
		type: {
			type: String,
			default: 'button',
			validator: value => ['button', 'submit', 'reset'].includes( value )
		},

		// Appearance
		variant: {
			type: String,
			default: 'primary',
			validator: value => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost'].includes( value )
		},
		size: {
			type: String,
			default: 'md',
			validator: value => ['xs', 'sm', 'md', 'lg', 'xl'].includes( value )
		},

		// Options
		block: Boolean,
		rounded: Boolean,
		outlined: Boolean,
		disabled: Boolean,
		loading: Boolean,
		icon: String,

		// Accessibility
		ariaLabel: String,
		loadingText: String,
		isToggle: Boolean,
		pressed: Boolean
	},
	emits: ['click', 'update:pressed'],
	computed: {
		spinnerSize() {
			const sizes = {
				xs: 12,
				sm: 14,
				md: 16,
				lg: 20,
				xl: 24
			}
			return sizes[this.size] || 16
		},
		iconAriaLabel() {
			// Default labels for common icons
			const iconLabels = {
				'✕': 'Close',
				'✓': 'Confirm',
				'➕': 'Add',
				'✏️': 'Edit',
				'🗑️': 'Delete',
				'⚙️': 'Settings',
				'📥': 'Download',
				'📤': 'Upload',
				'🔍': 'Search',
				'↻': 'Refresh'
			}
			return iconLabels[this.icon] || 'Button'
		}
	},
	methods: {
		handleClick( event ) {
			if ( !this.disabled && !this.loading ) {
				if ( this.isToggle ) {
					this.$emit( 'update:pressed', !this.pressed )
				}
				this.$emit( 'click', event )
			}
		},
		handleKeyPress( event ) {
			if ( event.key === ' ' || event.key === 'Enter' ) {
				this.handleClick( event )
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-button
	display inline-flex
	align-items center
	justify-content center
	gap $spacing-sm
	border none
	border-radius $radius-md
	font-family $font-family
	font-weight $font-medium
	cursor pointer
	transition $transition-base
	position relative
	white-space nowrap
	text-decoration none
	outline none
	
	&:focus-visible
		box-shadow 0 0 0 3px rgba(255, 193, 7, 0.25)
	
	&:disabled
		opacity 0.6
		cursor not-allowed
	
	// Variants
	&--primary
		background $gradient-primary
		color white
		
		&:hover:not(:disabled)
			transform translateY(-1px)
			box-shadow $shadow-primary
		
		&:active:not(:disabled)
			transform translateY(0)
			
		&.k-button--outlined
			background transparent
			color $color-primary
			border 2px solid $color-primary
			
			&:hover:not(:disabled)
				background $color-primary-light
	
	&--secondary
		background white
		color $color-text
		border 1px solid $color-border
		
		&:hover:not(:disabled)
			background $color-background-light
			border-color $color-text-secondary
			
		&.k-button--outlined
			background transparent
	
	&--success
		background $color-success
		color white
		
		&:hover:not(:disabled)
			background darken($color-success, 10%)
			transform translateY(-1px)
			
		&.k-button--outlined
			background transparent
			color $color-success
			border 2px solid $color-success
			
			&:hover:not(:disabled)
				background rgba(76, 175, 80, 0.1)
	
	&--danger
		background $color-danger
		color white
		
		&:hover:not(:disabled)
			background darken($color-danger, 10%)
			transform translateY(-1px)
			
		&.k-button--outlined
			background transparent
			color $color-danger
			border 2px solid $color-danger
			
			&:hover:not(:disabled)
				background rgba(255, 82, 82, 0.1)
	
	&--warning
		background $color-warning
		color white
		
		&:hover:not(:disabled)
			background darken($color-warning, 10%)
			transform translateY(-1px)
			
		&.k-button--outlined
			background transparent
			color $color-warning
			border 2px solid $color-warning
			
			&:hover:not(:disabled)
				background rgba(255, 152, 0, 0.1)
	
	&--info
		background $color-info
		color white
		
		&:hover:not(:disabled)
			background darken($color-info, 10%)
			transform translateY(-1px)
			
		&.k-button--outlined
			background transparent
			color $color-info
			border 2px solid $color-info
			
			&:hover:not(:disabled)
				background rgba(33, 150, 243, 0.1)
	
	&--ghost
		background transparent
		color $color-text
		
		&:hover:not(:disabled)
			background $color-background-light
	
	// Sizes
	&--xs
		padding $spacing-xs ($spacing-sm * 0.75)
		font-size $font-xs
		min-height 24px
		
	&--sm
		padding ($spacing-xs * 1.5) $spacing-md
		font-size $font-sm
		min-height 32px
		
	&--md
		padding $spacing-sm $spacing-lg
		font-size $font-base
		min-height 40px
		
	&--lg
		padding ($spacing-sm * 1.5) $spacing-xl
		font-size $font-lg
		min-height 48px
		
	&--xl
		padding $spacing-md ($spacing-xl * 1.25)
		font-size $font-xl
		min-height 56px
	
	// Modifiers
	&--block
		width 100%
		
	&--rounded
		border-radius $radius-pill
		
	&--icon-only
		padding $spacing-sm
		
		&.k-button--xs
			padding ($spacing-xs * 1.5)
			min-width 24px
			
		&.k-button--sm
			padding $spacing-sm
			min-width 32px
			
		&.k-button--md
			padding ($spacing-sm * 1.5)
			min-width 40px
			
		&.k-button--lg
			padding $spacing-md
			min-width 48px
			
		&.k-button--xl
			padding ($spacing-md * 1.25)
			min-width 56px
	
	&--loading
		color transparent
		pointer-events none

.k-button__spinner
	position absolute
	top 50%
	left 50%
	transform translate(-50%, -50%)
	display flex
	align-items center
	justify-content center

.k-button__icon
	font-size 1.2em
	display flex
	align-items center

.k-button__content
	display flex
	align-items center
	gap $spacing-xs

// Screen reader only text
.sr-only
	position absolute
	width 1px
	height 1px
	padding 0
	margin -1px
	overflow hidden
	clip rect(0,0,0,0)
	white-space nowrap
	border 0

// Pressed state
.k-button--pressed
	box-shadow inset 0 2px 4px rgba(0, 0, 0, 0.1)
	transform translateY(1px)
</style>