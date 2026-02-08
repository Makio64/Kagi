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
@import '../../../styles/tokens-modern.styl'

.stat-card
	background rgba(255, 255, 255, 0.8)
	backdrop-filter blur(20px)
	-webkit-backdrop-filter blur(20px)
	border-radius var(--radius-xl)
	padding var(--space-4)
	position relative
	transition all var(--transition-base)
	display flex
	flex-direction row
	align-items center
	gap var(--space-4)
	border 1px solid rgba(255, 255, 255, 0.6)
	box-shadow 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)

	&--default
		background rgba(255, 255, 255, 0.8)

	&--primary
		border-left 3px solid var(--color-primary-500)
		.stat-card__icon
			background var(--color-primary-50)
			color var(--color-primary-700)

	&--secondary
		border-left 3px solid var(--color-gray-400)
		.stat-card__icon
			background var(--color-gray-100)
			color var(--color-gray-600)

	&--success
		border-left 3px solid var(--color-success-500)
		.stat-card__icon
			background var(--color-success-50)
			color var(--color-success-700)

	&--warning
		border-left 3px solid var(--color-warning-500)
		.stat-card__icon
			background var(--color-warning-50)
			color var(--color-warning-700)

	&--danger
		border-left 3px solid var(--color-danger-500)
		.stat-card__icon
			background var(--color-danger-50)
			color var(--color-danger-700)

	&--info
		border-left 3px solid var(--color-info-500)
		.stat-card__icon
			background var(--color-info-50)
			color var(--color-info-700)

	&--clickable
		cursor pointer
		&:hover
			transform translateY(-2px)
			background rgba(255, 255, 255, 0.95)
			box-shadow 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)

.stat-card__header
	flex-shrink 0

.stat-card__icon
	width 40px
	height 40px
	border-radius var(--radius-lg)
	display flex
	align-items center
	justify-content center
	font-size 1.25rem
	line-height 1
	background var(--color-gray-50)
	color var(--color-gray-600)
	transition all var(--transition-base)

.stat-card__badge
	position absolute
	top var(--space-3)
	right var(--space-3)
	padding var(--space-1) var(--space-2)
	border-radius var(--radius-full)
	font-size var(--text-xs)
	font-weight var(--font-semibold)
	text-transform uppercase
	letter-spacing 0.5px

	&.badge--default
		background var(--color-gray-100)
		color var(--color-gray-600)
	&.badge--primary
		background var(--color-primary-500)
		color white
	&.badge--success
		background var(--color-success-500)
		color white
	&.badge--warning
		background var(--color-warning-500)
		color white
	&.badge--danger
		background var(--color-danger-500)
		color white
	&.badge--info
		background var(--color-info-500)
		color white

.stat-card__body
	flex 1
	min-width 0

.stat-card__label
	margin 0 0 var(--space-1) 0
	font-size var(--text-xs)
	font-weight var(--font-medium)
	color var(--color-gray-500)
	letter-spacing 0.02em

.stat-card__value
	margin 0
	font-size var(--text-xl)
	font-weight var(--font-bold)
	color var(--color-gray-900)
	line-height var(--leading-tight)

.stat-card__footer
	display flex
	align-items center
	gap var(--space-2)
	margin-top var(--space-1)

.stat-card__trend
	display inline-flex
	align-items center
	gap var(--space-1)
	font-size var(--text-xs)
	font-weight var(--font-semibold)
	padding var(--space-1) var(--space-2)
	border-radius var(--radius-full)

	&.positive
		color var(--color-success-700)
		background var(--color-success-50)
		.trend-arrow
			color var(--color-success-700)
	&.negative
		color var(--color-danger-700)
		background var(--color-danger-50)
		.trend-arrow
			color var(--color-danger-700)

.trend-arrow
	font-size var(--text-sm)
	font-weight var(--font-bold)

.stat-card__subtext
	font-size var(--text-xs)
	color var(--color-gray-500)

.stat-card__actions
	margin-top var(--space-3)
	padding-top var(--space-3)
	border-top 1px solid var(--color-gray-100)

// Responsive
@media (max-width: 480px)
	.stat-card
		padding var(--space-3)
		gap var(--space-3)

	.stat-card__icon
		width 36px
		height 36px
		font-size 1.1rem

	.stat-card__value
		font-size var(--text-lg)
</style>