<template>
	<aside class="sidebar">
		<!-- Desktop Navigation -->
		<nav class="nav-menu">
			<button
				v-for="item in menuItems"
				:key="item.id"
				class="nav-item"
				:class="{ active: activeSection === item.id }"
				@click="$emit('navigate', item.id)"
			>
				<span class="nav-icon">{{ item.icon }}</span>
				<span class="nav-label">{{ getLabel(item) }}</span>
			</button>
		</nav>

		<!-- Mobile Navigation -->
		<nav class="nav-menu-mobile">
			<button
				v-for="item in menuItems"
				:key="item.id"
				class="nav-item-mobile"
				:class="{ active: activeSection === item.id }"
				@click="$emit('navigate', item.id)"
			>
				<div class="nav-icon-circle">
					<span class="nav-icon">{{ item.icon }}</span>
				</div>
				<span class="nav-label-mobile">{{ getLabel(item) }}</span>
			</button>
		</nav>
	</aside>
</template>

<script>
export default {
	name: 'DashboardSidebar',
	props: {
		menuItems: {
			type: Array,
			required: true
		},
		activeSection: {
			type: String,
			required: true
		}
	},
	emits: ['navigate'],
	methods: {
		getLabel( item ) {
			if ( item.translationKey && this.$t ) {
				return this.$t( item.translationKey )
			}
			return item.label
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../../styles/tokens.styl'

.sidebar
	width 250px
	background white
	border-radius 20px
	padding 1.5rem
	box-shadow 0 8px 25px rgba(255, 193, 7, 0.08)
	height fit-content
	position sticky
	top 100px
	border 1px solid rgba(255, 193, 7, 0.15)

	@media (max-width: 768px)
		width 100%
		padding 0.75rem 0
		border-radius 0
		box-shadow none
		background #f9f9f9
		position static
		border-bottom 2px solid #e0e0e0

.nav-menu
	display flex
	flex-direction column
	gap 0.5rem

	@media (max-width: 768px)
		display none

.nav-menu-mobile
	display none

	@media (max-width: 768px)
		display flex
		flex-direction row
		gap 0.75rem
		padding-bottom 0.5rem
		overflow-x auto
		overflow-y hidden
		-webkit-overflow-scrolling touch
		scrollbar-width thin

		&::-webkit-scrollbar
			height 4px

		&::-webkit-scrollbar-track
			background #f0f0f0
			border-radius 2px

		&::-webkit-scrollbar-thumb
			background #ccc
			border-radius 2px

	@media (max-width: 550px)
		gap 0.4rem

.nav-item
	display flex
	align-items center
	gap 1rem
	padding 1rem
	background transparent
	border none
	border-radius 15px
	cursor pointer
	transition all 0.3s ease
	text-align left
	text-decoration none
	color #666
	width 100%
	font-size 0.95rem
	font-family inherit

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		color #333
		transform translateX(5px)

	&.active
		background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
		color white
		font-weight 600
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)

	.nav-icon
		font-size 1.2rem

	.nav-label
		font-size 0.95rem

.nav-item-mobile
	display flex
	flex-direction column
	align-items center
	gap 0.5rem
	padding 0.5rem
	background transparent
	border none
	cursor pointer
	transition all 0.2s ease
	min-width 70px
	flex-shrink 0

	@media (max-width: 550px)
		min-width 60px
		padding 0.25rem

	.nav-icon-circle
		width 50px
		height 50px
		border-radius 50%
		background white
		display flex
		align-items center
		justify-content center
		box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
		transition all 0.2s ease

		@media (max-width: 550px)
			width 45px
			height 45px

	.nav-icon
		font-size 1.5rem

		@media (max-width: 550px)
			font-size 1.3rem

	.nav-label-mobile
		font-size 0.75rem
		color #666
		text-align center

		@media (max-width: 550px)
			font-size 0.7rem

	&:hover
		.nav-icon-circle
			background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
			transform scale(1.05)

	&.active
		.nav-icon-circle
			background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
			box-shadow 0 4px 12px rgba(255, 193, 7, 0.4)

		.nav-label-mobile
			color #333
			font-weight 600
</style>