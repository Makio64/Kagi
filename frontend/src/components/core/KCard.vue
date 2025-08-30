<template>
	<div 
		class="k-card"
		:class="[
			variantClass,
			sizeClass,
			{
				clickable: clickable || to,
				active,
				outlined,
				elevated,
				'no-padding': noPadding
			}
		]"
		@click="handleClick"
	>
		<!-- Card Header -->
		<div v-if="$slots.header || title || icon" class="k-card-header">
			<slot name="header">
				<div v-if="icon" class="k-card-icon">{{ icon }}</div>
				<h3 v-if="title" class="k-card-title">{{ title }}</h3>
			</slot>
			<div v-if="$slots.headerActions" class="k-card-header-actions">
				<slot name="headerActions" />
			</div>
		</div>

		<!-- Card Body -->
		<div class="k-card-body">
			<p v-if="description" class="k-card-description">{{ description }}</p>
			<slot />
		</div>

		<!-- Card Footer -->
		<div v-if="$slots.footer || actions" class="k-card-footer">
			<slot name="footer">
				<div v-if="actions" class="k-card-actions">
					<KButton
						v-for="action in actions"
						:key="action.text"
						:variant="action.variant || 'secondary'"
						:size="action.size || 'sm'"
						@click.stop="action.handler"
					>
						{{ action.text }}
					</KButton>
				</div>
			</slot>
		</div>

		<!-- Badge -->
		<div v-if="badge" class="k-card-badge" :class="`badge-${badge.variant || 'primary'}`">
			{{ badge.text }}
		</div>
	</div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

import KButton from './KButton.vue'

const props = defineProps( {
	// Content
	title: String,
	description: String,
	icon: String,
	
	// Appearance
	variant: {
		type: String,
		default: 'default',
		validator: value => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes( value )
	},
	size: {
		type: String,
		default: 'md',
		validator: value => ['sm', 'md', 'lg'].includes( value )
	},
	outlined: Boolean,
	elevated: Boolean,
	noPadding: Boolean,
	
	// Behavior
	to: String,
	clickable: Boolean,
	active: Boolean,
	
	// Additional features
	actions: Array,
	badge: Object
} )

const emit = defineEmits( ['click'] )
const instance = getCurrentInstance()

const variantClass = computed( () => `k-card--${props.variant}` )
const sizeClass = computed( () => `k-card--${props.size}` )

const handleClick = () => {
	if ( props.to ) {
		instance?.proxy.$router.push( props.to )
	} else if ( props.clickable ) {
		emit( 'click' )
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.k-card
	background var(--card-bg, white)
	border-radius var(--radius-lg)
	position relative
	display flex
	flex-direction column
	transition var(--transition-base)
	overflow hidden
	
	// Variants
	&--default
		background white
		
	&--primary
		background linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-lighter) 100%)
		border 1px solid var(--color-primary)
		
	&--success
		background linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)
		border 1px solid var(--color-success)
		
	&--warning
		background linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)
		border 1px solid var(--color-warning)
		
	&--danger
		background linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)
		border 1px solid var(--color-danger)
		
	&--info
		background linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)
		border 1px solid var(--color-info)
	
	// Sizes
	&--sm
		.k-card-header
			padding var(--spacing-sm) var(--spacing-md)
		.k-card-body
			padding var(--spacing-sm) var(--spacing-md)
		.k-card-footer
			padding var(--spacing-sm) var(--spacing-md)
			
	&--md
		.k-card-header
			padding var(--spacing-md) var(--spacing-lg)
		.k-card-body
			padding var(--spacing-md) var(--spacing-lg)
		.k-card-footer
			padding var(--spacing-md) var(--spacing-lg)
			
	&--lg
		.k-card-header
			padding var(--spacing-lg) var(--spacing-xl)
		.k-card-body
			padding var(--spacing-lg) var(--spacing-xl)
		.k-card-footer
			padding var(--spacing-lg) var(--spacing-xl)
	
	// States
	&.clickable
		cursor pointer
		
		&:hover
			transform translateY(-2px)
			box-shadow var(--shadow-hover)
			
	&.active
		border 2px solid var(--color-primary)
		background var(--gradient-light)
		
	&.outlined
		background transparent
		border 1px solid var(--color-border)
		
	&.elevated
		box-shadow var(--shadow-md)
		
		&:hover
			box-shadow var(--shadow-lg)
			
	&.no-padding
		.k-card-header
			padding 0
		.k-card-body
			padding 0
		.k-card-footer
			padding 0

.k-card-header
	display flex
	align-items center
	gap var(--spacing-md)
	border-bottom 1px solid var(--color-border-light)
	
	&:last-child
		border-bottom none

.k-card-icon
	font-size 2rem
	flex-shrink 0

.k-card-title
	flex 1
	margin 0
	font-size var(--font-lg)
	font-weight var(--font-semibold)
	color var(--color-text)

.k-card-header-actions
	display flex
	gap var(--spacing-sm)

.k-card-body
	flex 1
	
	&:not(:last-child):not(:first-child)
		border-bottom 1px solid var(--color-border-light)

.k-card-description
	margin 0 0 var(--spacing-md) 0
	color var(--color-text-secondary)
	line-height var(--line-relaxed)

.k-card-footer
	display flex
	justify-content flex-end
	border-top 1px solid var(--color-border-light)
	
	&:first-child
		border-top none

.k-card-actions
	display flex
	gap var(--spacing-sm)

.k-card-badge
	position absolute
	top var(--spacing-md)
	right var(--spacing-md)
	padding var(--spacing-xs) var(--spacing-sm)
	border-radius var(--radius-pill)
	font-size var(--font-sm)
	font-weight var(--font-semibold)
	
	&.badge-primary
		background var(--color-primary)
		color white
		
	&.badge-success
		background var(--color-success)
		color white
		
	&.badge-warning
		background var(--color-warning)
		color white
		
	&.badge-danger
		background var(--color-danger)
		color white
		
	&.badge-info
		background var(--color-info)
		color white
</style>