<template>
	<div>
		<!-- Desktop Sidebar -->
		<aside class="sidebar">
			<nav class="nav-menu">
				<button
					v-for="item in items"
					:key="item.id"
					:class="['nav-item', { active: activeItem === item.id }]"
					@click="$emit('navigate', item.id)"
				>
					<span class="nav-icon">{{ item.icon }}</span>
					<span class="nav-label">{{ item.label }}</span>
				</button>
			</nav>
		</aside>

		<!-- Mobile Navigation -->
		<nav class="nav-menu-mobile">
			<button
				v-for="item in items"
				:key="item.id"
				:class="['nav-item-mobile', { active: activeItem === item.id }]"
				@click="$emit('navigate', item.id)"
			>
				<div class="nav-icon-circle">
					<span class="nav-icon">{{ item.icon }}</span>
				</div>
				<span class="nav-label-mobile">{{ item.label }}</span>
			</button>
		</nav>
	</div>
</template>

<script>
export default {
	name: 'DashboardNavigation',
	props: {
		items: {
			type: Array,
			required: true,
			validator: items => items.every(item => item.id && item.icon && item.label)
		},
		activeItem: {
			type: String,
			required: true
		}
	},
	emits: ['navigate']
}
</script>

<style lang="stylus" scoped>
// Desktop Sidebar
.sidebar
	width 280px
	background white
	border-radius 20px
	box-shadow 0 4px 20px rgba(0,0,0,0.05)
	padding 1.5rem
	display none

	@media (min-width: 768px)
		display block

.nav-menu
	display flex
	flex-direction column
	gap 0.5rem

.nav-item
	display flex
	align-items center
	gap 1rem
	padding 1rem 1.25rem
	background transparent
	border none
	border-radius 12px
	cursor pointer
	transition all 0.3s ease
	text-align left
	font-size 1rem

	&:hover
		background #FFF9E6

	&.active
		background linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)
		color white
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)

		.nav-icon
			transform scale(1.1)

	.nav-icon
		font-size 1.25rem
		transition transform 0.3s ease

	.nav-label
		font-weight 500

// Mobile Navigation
.nav-menu-mobile
	display flex
	gap 0.75rem
	padding 1rem
	background white
	border-radius 20px
	box-shadow 0 4px 20px rgba(0,0,0,0.05)
	overflow-x auto
	-webkit-overflow-scrolling touch
	scrollbar-width none

	&::-webkit-scrollbar
		display none

	@media (min-width: 768px)
		display none

.nav-item-mobile
	display flex
	flex-direction column
	align-items center
	gap 0.5rem
	padding 0.5rem
	background transparent
	border none
	cursor pointer
	transition all 0.3s ease
	min-width 70px

	&.active
		.nav-icon-circle
			background linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)
			box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)
			color white

		.nav-label-mobile
			color #FFC107
			font-weight 600

.nav-icon-circle
	width 50px
	height 50px
	border-radius 50%
	display flex
	align-items center
	justify-content center
	background #F5F5F5
	transition all 0.3s ease
	font-size 1.25rem

.nav-label-mobile
	font-size 0.75rem
	color #666
	white-space nowrap
	transition all 0.3s ease
</style>