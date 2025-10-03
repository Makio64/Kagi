<template>
	<DashboardLayout
		:title="$t('dashboard.residentPortal')"
		:user-email="user?.email || 'Resident'"
		user-role="Resident"
		:menu-items="menuItemsWithLabels"
		:active-section="activeSection"
		@navigate="navigateToSection"
		@logout="logout"
	>
		<HomeSection v-if="activeSection === 'home'" :menu-items="menuItemsWithLabels" @navigate="navigateToSection" />
		<EventsSection v-else-if="activeSection === 'events'" />
		<ServicesSection v-else-if="activeSection === 'services'" />
		<BookingsSection v-else-if="activeSection === 'booking'" />
		<MaintenanceSection v-else-if="activeSection === 'maintenance'" />
		<BillsSection v-else-if="activeSection === 'bills'" />
		<ContactSection v-else-if="activeSection === 'contact'" />
		<DocumentsSection v-else-if="activeSection === 'documents'" />
		<ProfileSection v-else-if="activeSection === 'profile'" />
	</DashboardLayout>
</template>
<script>
import * as store from '../store'

const MENU_ITEMS = [
	{ id: 'home', icon: '🏠' },
	{ id: 'documents', icon: '📄' },
	{ id: 'events', icon: '📢' },
	{ id: 'services', icon: '🛎️' },
	{ id: 'booking', icon: '📅' },
	{ id: 'maintenance', icon: '🔧' },
	{ id: 'contact', icon: '📱' },
	{ id: 'bills', icon: '💳' }
]

export default {
	name: 'Dashboard',
	props: {
		routeParams: { type: Object, default: () => ({}) }
	},
	computed: {
		user() {
			return store.user.value
		},
		activeSection() {
			return this.routeParams?.section || 'home'
		},
		menuItemsWithLabels() {
			return MENU_ITEMS.map(item => ({
				...item,
				label: this.$t(`dashboard.menu.${item.id}`),
				description: this.$t(`dashboard.menu.${item.id}.description`)
			}))
		}
	},
	methods: {
		navigateToSection(section) {
			this.$router.push(`/dashboard/${section}`)
		},
		logout() {
			store.logout()
			this.$router.push('/login')
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

@media (max-width: 768px)
	.section
		padding 0.5rem
		border-radius 0
</style>
