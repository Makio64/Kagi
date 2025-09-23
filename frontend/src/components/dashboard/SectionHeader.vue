<template>
	<div class="section-header" :class="{ 'has-actions': $slots.actions || actions }">
		<div class="section-header__main">
			<h2 class="section-header__title">
				<span v-if="icon" class="section-header__icon">{{ icon }}</span>
				{{ title }}
			</h2>
			<p v-if="subtitle" class="section-header__subtitle">{{ subtitle }}</p>
		</div>

		<div v-if="$slots.actions || actions" class="section-header__actions">
			<slot name="actions">
				<div v-if="searchable" class="section-header__search">
					<input
						v-model="searchQuery"
						type="search"
						:placeholder="searchPlaceholder || 'Search...'"
						class="search-input"
						@input="handleSearch"
					>
				</div>
				<KButton
					v-for="action in actions"
					:key="action.text"
					:variant="action.variant || 'primary'"
					:size="action.size || 'md'"
					:icon="action.icon"
					@click="action.handler"
				>
					{{ action.text }}
				</KButton>
			</slot>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

import KButton from '../core/KButton.vue'

const props = defineProps( {
	// Content
	title: {
		type: String,
		required: true
	},
	subtitle: String,
	icon: String,

	// Actions
	actions: Array, // Array of { text, variant, size, icon, handler }
	searchable: Boolean,
	searchPlaceholder: String
} )

const emit = defineEmits( ['search'] )

const searchQuery = ref( '' )

const handleSearch = () => {
	emit( 'search', searchQuery.value )
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.section-header
	display flex
	justify-content space-between
	align-items center
	margin-bottom $spacing-xl
	padding-bottom $spacing-lg
	border-bottom 2px solid $color-border-light

	&.has-actions
		flex-wrap wrap
		gap $spacing-md

		@media (max-width: $breakpoint-md)
			.section-header__main
				width 100%

			.section-header__actions
				width 100%
				justify-content flex-start

.section-header__main
	flex 1

.section-header__title
	margin 0
	font-size $font-xxl
	font-weight $font-semibold
	color $color-text
	display flex
	align-items center
	gap $spacing-md

.section-header__icon
	font-size 2rem
	display inline-flex
	align-items center

.section-header__subtitle
	margin $spacing-sm 0 0 0
	font-size $font-base
	color $color-text-secondary
	line-height $line-relaxed

.section-header__actions
	display flex
	align-items center
	gap $spacing-md
	flex-shrink 0

.section-header__search
	position relative

.search-input
	padding $spacing-sm $spacing-lg
	border 1px solid $color-border
	border-radius $radius-pill
	font-size $font-base
	min-width 250px
	transition $transition-base
	background white

	&::placeholder
		color $color-text-light

	&:focus
		outline none
		border-color $color-primary
		box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

	// Search icon
	&[type="search"]
		padding-left $spacing-xl
		background-image url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E")
		background-repeat no-repeat
		background-position $spacing-md center
		background-size 20px 20px

// Mobile responsive
@media (max-width: $breakpoint-md)
	.section-header__title
		font-size $font-xl

	.section-header__icon
		font-size 1.5rem

	.search-input
		min-width auto
		width 100%
</style>
