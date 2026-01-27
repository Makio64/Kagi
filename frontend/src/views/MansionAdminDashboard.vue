<template>
	<DashboardLayout
		:title="buildingName"
		:user-email="user?.email || 'Mansion Admin'"
		user-role="Mansion Administrator"
		:menu-items="menuItemsWithLabels"
		:active-section="activeSection"
		@navigate="navigateToSection"
		@logout="handleLogout"
		@logo-click="navigateToSection('overview')"
	>
		<ResidentsSection v-if="activeSection === 'residents'" />
		<MaintenanceRequestsSection v-else-if="activeSection === 'maintenance'" />

		<!-- Placeholder sections -->
		<div v-else class="section">
			<h2>{{ $t(`mansion.${activeSection}.title`) }}</h2>
			<p>{{ $t('dashboard.comingSoon') }}</p>
		</div>
	</DashboardLayout>
</template>
<script>
import * as store from '../store'

const MENU_ITEMS = [
	{ id: 'overview', icon: '📊' },
	{ id: 'residents', icon: '👥' },
	{ id: 'maintenance', icon: '🔧' },
	{ id: 'bookings', icon: '📅' },
	{ id: 'announcements', icon: '📢' },
	{ id: 'documents', icon: '📄' },
	{ id: 'financial', icon: '💰' },
	{ id: 'reports', icon: '📈' },
	{ id: 'services', icon: '🛎️' },
	{ id: 'settings', icon: '⚙️' }
]

export default {
	name: 'MansionAdminDashboard',
	props: {
		routeParams: { type: Object, default: () => ( {} ) }
	},
	data() {
		return {
			buildingName: 'Dresser Tower'
		}
	},
	computed: {
		user() {
			return store.user.value
		},
		activeSection() {
			return this.routeParams?.section || 'overview'
		},
		menuItemsWithLabels() {
			return MENU_ITEMS.map( item => ( {
				...item,
				label: this.$t( `mansion.menu.${item.id}` )
			} ) )
		}
	},
	watch: {
		activeSection() {
			this.$nextTick( () => {
				document.querySelector( '#app' )?.scrollTo( 0, 0 )
			} )
		}
	},
	mounted() {
		document.querySelector( '#app' )?.scrollTo( 0, 0 )

		// Security: Verify user has mansion admin/manager/admin role
		if ( !store.isAuthenticated.value ) {
			this.$router.push( '/login' )
			return
		}
		const allowedRoles = ['admin', 'manager', 'mansion_admin']
		if ( !allowedRoles.includes( store.userRole.value ) ) {
			this.$router.push( '/dashboard' )
		}
	},
	methods: {
		navigateToSection( section ) {
			this.$router.push( `/mansion-admin/${section}` )
		},
		handleLogout() {
			store.logout()
			this.$router.push( '/login' )
		}
	}
}
</script>
<style lang="stylus" scoped>
.section
	padding 2rem
	background white
	border-radius 12px
	h2
		margin-bottom 1rem
</style>
