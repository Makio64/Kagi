<template>
	<aside class="desktop-sidebar">
		<nav class="nav-menu">
			<button
				v-for="item in menuItems"
				:key="item.id"
				:class="['nav-item', { active: activeSection === item.id }]"
				@click="$emit('navigate', item.id)"
			>
				<span class="nav-icon">{{ item.icon }}</span>
				<span class="nav-label">{{ item.label }}</span>
			</button>
		</nav>
	</aside>
</template>

<script>
export default {
	name: 'DesktopMenu',
	props: {
		activeSection: {
			type: String,
			required: true
		}
	},
	emits: ['navigate'],
	computed: {
		menuItems() {
			return [
				{ id: 'events', icon: '📢', label: this.$t( 'dashboard.menu.events' ) },
				{ id: 'services', icon: '🛎️', label: this.$t( 'dashboard.services.title' ) },
				{ id: 'booking', icon: '📅', label: this.$t( 'dashboard.menu.booking' ) },
				{ id: 'maintenance', icon: '🔧', label: this.$t( 'dashboard.menu.maintenance' ) },
				{ id: 'bills', icon: '💳', label: this.$t( 'dashboard.menu.bills' ) },
				{ id: 'contact', icon: '📱', label: this.$t( 'dashboard.menu.contact' ) },
				{ id: 'documents', icon: '📄', label: this.$t( 'dashboard.menu.documents' ) }
			]
		}
	}
}
</script>

<style lang="stylus" scoped>
.desktop-sidebar
	width 260px
	flex-shrink 0

	@media (max-width: 768px)
		display none

.nav-menu
	background white
	border-radius 16px
	padding 1rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)

.nav-item
	display flex
	align-items center
	gap 1rem
	width 100%
	padding 1rem
	background transparent
	border none
	border-radius 12px
	cursor pointer
	transition all 0.2s ease
	margin-bottom 0.5rem

	&:last-child
		margin-bottom 0

	&:hover
		background #f8f8f8

	&.active
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		border-left 3px solid #FFC107

	.nav-icon
		font-size 1.25rem
		width 24px
		text-align center

	.nav-label
		font-size 0.95rem
		color #333
		font-weight 500
</style>