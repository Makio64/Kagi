<template>
	<DashboardLayout
		:title="buildingName"
		:user-email="user?.email || 'Mansion Admin'"
		user-role="Mansion Administrator"
		:menu-items="menuItemsWithLabels"
		:active-section="activeSection"
		@navigate="navigateToSection"
		@logout="handleLogout"
		@logo-click="navigateToSection('residents')"
	>
		<MansionResidentsManager
			v-if="activeSection === 'residents'"
			:mansion-id="mansionId"
			@residents-loaded="totalResidents = $event"
		/>

		<MansionDocumentsManager
			v-if="activeSection === 'documents'"
			:mansion-id="mansionId"
			:user="user"
			:total-residents="totalResidents"
		/>

		<MansionBookingsManager
			v-if="activeSection === 'bookings'"
			:mansion-id="mansionId"
		/>

		<MansionAnnouncementsManager
			v-if="activeSection === 'announcements'"
			:mansion-id="mansionId"
			:user="user"
			:total-residents="totalResidents"
		/>
	</DashboardLayout>
</template>
<script>
import { MANSION_ADMIN_MENU_ITEMS } from '../constants/dashboardMenus'
import * as store from '../store'

export default {
	name: 'MansionAdminDashboard',
	props: {
		routeParams: { type: Object, default: () => ( {} ) }
	},
	data() {
		return {
			menuItems: MANSION_ADMIN_MENU_ITEMS,
			totalResidents: 0
		}
	},
	computed: {
		user() {
			return store.user.value
		},
		mansionId() {
			return store.mansionId.value
		},
		buildingName() {
			return this.user?.mansionName || 'Building Dashboard'
		},
		activeSection() {
			return this.routeParams?.section || 'residents'
		},
		menuItemsWithLabels() {
			return this.menuItems.map( item => ( {
				...item,
				label: this.$t( `mansion.menu.${item.id}` )
			} ) )
		}
	},
	async mounted() {
		document.querySelector( '#app' )?.scrollTo( 0, 0 )

		// Security: Verify user has mansion admin/manager/admin role
		if ( !store.isAuthenticated.value ) {
			this.$router.push( '/login' )
			return
		}

		// H2: Verify role from server, not just localStorage
		await store.refreshUserRole()

		const allowedRoles = ['admin', 'manager', 'mansion_admin']
		if ( !store.userRoles.value.some( r => allowedRoles.includes( r ) ) ) {
			this.$router.push( '/dashboard' )
		}
	},
	methods: {
		navigateToSection( section ) {
			this.$router.push( `/mansion-dashboard/${section}` )
		},
		handleLogout() {
			store.logout()
			this.$router.push( '/login' )
		}
	}
}
</script>
