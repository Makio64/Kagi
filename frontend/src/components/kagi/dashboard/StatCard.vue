<template>
	<div 
		class="stat-card"
		:class="[
			`stat-card--${variant}`,
			{ 'stat-card--clickable': clickable }
		]"
		@click="handleClick"
	>
		<div class="stat-card__header">
			<div v-if="icon" class="stat-card__icon">{{ icon }}</div>
			<div v-if="badge" class="stat-card__badge" :class="`badge--${badge.variant || 'default'}`">
				{{ badge.text }}
			</div>
		</div>
		
		<div class="stat-card__body">
			<h3 class="stat-card__label">{{ label }}</h3>
			<p class="stat-card__value">{{ formattedValue }}</p>
			
			<div v-if="trend || subtext" class="stat-card__footer">
				<span v-if="trend" class="stat-card__trend" :class="{ positive: trend.positive, negative: !trend.positive }">
					<span class="trend-arrow">{{ trend.positive ? '↑' : '↓' }}</span>
					{{ trend.text || trend.value }}
				</span>
				<span v-else-if="subtext" class="stat-card__subtext">
					{{ subtext }}
				</span>
			</div>
		</div>
		
		<div v-if="$slots.actions" class="stat-card__actions">
			<slot name="actions" />
		</div>
	</div>
</template>

<script>
export default {
	name: 'StatCard',
	emits: ['click'],
	props: {
		// Content
		icon: String,
		label: {
			type: String,
			required: true
		},
		value: {
			type: [String, Number],
			required: true
		},
		format: {
			type: String,
			default: 'number', // number, currency, percent
			validator: value => ['number', 'currency', 'percent'].includes( value )
		},

		// Additional info
		trend: Object, // { value/text: string, positive: boolean }
		subtext: String,
		badge: Object, // { text: string, variant: string }

		// Appearance
		variant: {
			type: String,
			default: 'default',
			validator: value => ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes( value )
		},

		// Behavior
		clickable: Boolean
	},
	computed: {
		formattedValue() {
			const val = this.value

			switch ( this.format ) {
				case 'currency':
					// Format as currency (assuming JPY for now)
					if ( typeof val === 'number' ) {
						return `¥${val.toLocaleString()}`
					}
					return val

				case 'percent':
					// Format as percentage
					if ( typeof val === 'number' ) {
						return `${val}%`
					}
					return val

				case 'number':
				default:
					// Format as number with thousand separators
					if ( typeof val === 'number' ) {
						return val.toLocaleString()
					}
					return val
			}
		}
	},
	methods: {
		handleClick() {
			if ( this.clickable ) {
				this.$emit( 'click' )
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'

.stat-card
	background white
	border-radius $radius-lg
	padding $spacing-lg
	position relative
	transition $transition-base
	min-height 140px
	display flex
	flex-direction column
	
	// Variants with gradient borders
	&--default
		background white
		box-shadow $shadow-sm
		
	&--primary
		background $gradient-light
		border-top 4px solid $color-primary
		
	&--secondary
		background linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)
		border-top 4px solid $color-text-secondary
		
	&--success
		background linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)
		border-top 4px solid $color-success
		
	&--warning
		background linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)
		border-top 4px solid $color-warning
		
	&--danger
		background linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)
		border-top 4px solid $color-danger
		
	&--info
		background linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)
		border-top 4px solid $color-info
	
	&--clickable
		cursor pointer
		
		&:hover
			transform translateY(-2px)
			box-shadow $shadow-hover

.stat-card__header
	display flex
	justify-content space-between
	align-items flex-start
	margin-bottom $spacing-md

.stat-card__icon
	font-size 2.5rem
	line-height 1
	opacity 0.9

.stat-card__badge
	padding $spacing-xs $spacing-sm
	border-radius $radius-pill
	font-size $font-xs
	font-weight $font-semibold
	text-transform uppercase
	letter-spacing 0.5px
	
	&.badge--default
		background $color-background-light
		color $color-text-secondary
		
	&.badge--primary
		background $color-primary
		color white
		
	&.badge--success
		background $color-success
		color white
		
	&.badge--warning
		background $color-warning
		color white
		
	&.badge--danger
		background $color-danger
		color white
		
	&.badge--info
		background $color-info
		color white

.stat-card__body
	flex 1

.stat-card__label
	margin 0 0 $spacing-sm 0
	font-size $font-sm
	font-weight $font-medium
	color $color-text-secondary
	text-transform uppercase
	letter-spacing 0.5px

.stat-card__value
	margin 0 0 $spacing-md 0
	font-size $font-xxl
	font-weight $font-bold
	color $color-text
	line-height 1.2

.stat-card__footer
	display flex
	align-items center
	gap $spacing-sm

.stat-card__trend
	display inline-flex
	align-items center
	gap $spacing-xs
	font-size $font-sm
	font-weight $font-semibold
	padding $spacing-xs $spacing-sm
	border-radius $radius-pill
	
	&.positive
		color $color-success
		background rgba(76, 175, 80, 0.1)
		
		.trend-arrow
			color $color-success
	
	&.negative
		color $color-danger
		background rgba(255, 82, 82, 0.1)
		
		.trend-arrow
			color $color-danger

.trend-arrow
	font-size $font-lg
	font-weight $font-bold

.stat-card__subtext
	font-size $font-sm
	color $color-text-secondary

.stat-card__actions
	margin-top $spacing-md
	padding-top $spacing-md
	border-top 1px solid $color-border-light

// Responsive
@media (max-width: $breakpoint-sm)
	.stat-card
		padding $spacing-md
		min-height 120px
		
	.stat-card__value
		font-size $font-xl
		
	.stat-card__icon
		font-size 2rem
</style>