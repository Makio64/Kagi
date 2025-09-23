<template>
	<div class="dashboard">
		<DashboardHeader
			:title="buildingName"
			:userRole="'Mansion Admin'"
			:user="user"
			@menuToggle="showMobileMenu = !showMobileMenu"
		/>

		<MobileSettingsMenu
			:show="showMobileMenu"
			:user="user"
			userRole="Mansion Admin"
			@close="showMobileMenu = false"
		/>

		<div class="dashboard-content">
			<DashboardNavigation
				:items="menuItems"
				:activeItem="activeSection"
				@navigate="navigateToSection"
			/>

			<main class="main-content">
				<!-- Overview Section -->
				<DashboardSection
					:active="activeSection === 'overview'"
					:title="$t('mansion.overview.title')"
					:subtitle="`Managing ${buildingName}`"
					icon="📊"
				>
					<OverviewStats />
					<QuickActions @action="handleQuickAction" />
				</DashboardSection>

				<!-- Residents Section -->
				<DashboardSection
					:active="activeSection === 'residents'"
					:title="$t('mansion.residents.title')"
					icon="👥"
					showSearch
				>
					<ResidentsSection
						:residents="residents"
						@edit="editResident"
						@message="messageResident"
						@add="showAddResidentModal = true"
					/>
				</DashboardSection>

				<!-- Maintenance Section -->
				<DashboardSection
					:active="activeSection === 'maintenance'"
					:title="$t('mansion.maintenance.title')"
					icon="🔧"
				>
					<MaintenanceRequestsSection
						:requests="maintenanceRequests"
						@view="viewRequest"
						@update="updateRequest"
					/>
				</DashboardSection>

				<!-- Bookings Section -->
				<DashboardSection
					:active="activeSection === 'bookings'"
					:title="$t('mansion.bookings.title')"
					icon="📅"
				>
					<BookingCalendar
						:facilities="facilities"
						:currentWeek="currentWeek"
						@previousWeek="previousWeek"
						@nextWeek="nextWeek"
						@getBooking="getBooking"
					/>
				</DashboardSection>

				<!-- Announcements Section -->
				<DashboardSection
					:active="activeSection === 'announcements'"
					:title="$t('mansion.announcements.title')"
					icon="📢"
				>
					<AnnouncementsList
						:announcements="announcements"
						@edit="editAnnouncement"
						@delete="deleteAnnouncement"
						@create="showAnnouncementModal = true"
					/>
				</DashboardSection>

				<!-- Other sections follow similar pattern... -->
			</main>
		</div>

		<!-- Modals -->
		<KModal v-if="showEditModal" @close="showEditModal = false">
			<template #header>Edit Resident</template>
			<FormSection @submit="saveResident" @cancel="showEditModal = false">
				<KInput v-model="editingResident.name" label="Name" required />
				<KInput v-model="editingResident.email" label="Email" type="email" required />
				<KInput v-model="editingResident.phone" label="Phone" />
				<KInput v-model="editingResident.unit" label="Unit" required />
			</FormSection>
		</KModal>

		<KModal v-if="showAnnouncementModal" @close="showAnnouncementModal = false">
			<template #header>Create Announcement</template>
			<FormSection @submit="createAnnouncement" @cancel="showAnnouncementModal = false">
				<KInput v-model="newAnnouncement.title" label="Title" required />
				<KSelect v-model="newAnnouncement.category" label="Category" :options="announcementCategories" />
				<KTextarea v-model="newAnnouncement.content" label="Content" rows="5" required />
			</FormSection>
		</KModal>
	</div>
</template>

<script>
import * as store from '../store'
import OverviewStats from '../components/mansion/OverviewStats.vue'
import QuickActions from '../components/mansion/QuickActions.vue'
import BookingCalendar from '../components/mansion/BookingCalendar.vue'
import AnnouncementsList from '../components/mansion/AnnouncementsList.vue'

export default {
	name: 'MansionAdminDashboardRefactored',
	components: {
		OverviewStats,
		QuickActions,
		BookingCalendar,
		AnnouncementsList
	},
	data() {
		return {
			// Building Information
			buildingName: 'Sakura Tower',

			// Navigation
			activeSection: 'overview',
			showMobileMenu: false,

			// Menu items
			menuItems: [
				{ id: 'overview', icon: '📊', label: 'Overview' },
				{ id: 'residents', icon: '👥', label: 'Residents' },
				{ id: 'maintenance', icon: '🔧', label: 'Maintenance' },
				{ id: 'bookings', icon: '📅', label: 'Bookings' },
				{ id: 'announcements', icon: '📢', label: 'Announcements' },
				{ id: 'documents', icon: '📄', label: 'Documents' },
				{ id: 'services', icon: '🛎️', label: 'Services' },
				{ id: 'financial', icon: '💳', label: 'Financial' },
				{ id: 'reports', icon: '📊', label: 'Reports' },
				{ id: 'settings', icon: '⚙️', label: 'Settings' }
			],

			// Data
			residents: [],
			maintenanceRequests: [],
			announcements: [],
			facilities: [],

			// Modal States
			showEditModal: false,
			showAnnouncementModal: false,
			showAddResidentModal: false,
			editingResident: {},
			newAnnouncement: {
				title: '',
				category: 'general',
				content: ''
			},

			// Other
			currentWeek: 'Dec 9-15, 2024',
			announcementCategories: [
				{ value: 'general', label: 'General' },
				{ value: 'maintenance', label: 'Maintenance' },
				{ value: 'event', label: 'Event' },
				{ value: 'urgent', label: 'Urgent' }
			]
		}
	},
	computed: {
		user() {
			return store.user.value
		}
	},
	async mounted() {
		await this.loadData()
	},
	methods: {
		navigateToSection(section) {
			this.activeSection = section
		},

		async loadData() {
			// Load residents, requests, announcements, etc.
			// This would typically be API calls
			this.residents = await this.fetchResidents()
			this.maintenanceRequests = await this.fetchMaintenanceRequests()
			this.announcements = await this.fetchAnnouncements()
			this.facilities = await this.fetchFacilities()
		},

		async fetchResidents() {
			// Mock data - replace with API call
			return [
				{ id: 1, name: 'Tanaka Yuki', unit: '502', email: 'tanaka@example.com', phone: '090-1234-5678', moveInDate: 'Jan 2023', status: 'active' },
				{ id: 2, name: 'Sato Kenji', unit: '301', email: 'sato@example.com', phone: '090-2345-6789', moveInDate: 'Mar 2022', status: 'active' },
				{ id: 3, name: 'Yamada Hana', unit: '105', email: 'yamada@example.com', phone: '090-3456-7890', moveInDate: 'Jun 2023', status: 'active' }
			]
		},

		async fetchMaintenanceRequests() {
			// Mock data - replace with API call
			return [
				{ id: 1, title: 'Water leak in bathroom', description: 'Water dripping from ceiling', unit: '502', priority: 'urgent', status: 'open', created: '2 hours ago' },
				{ id: 2, title: 'AC not working', description: 'Air conditioning unit making noise', unit: '301', priority: 'high', status: 'assigned', assignedTo: 'Tech Team', created: '1 day ago' }
			]
		},

		async fetchAnnouncements() {
			// Mock data - replace with API call
			return [
				{ id: 1, title: 'Pool Maintenance', category: 'maintenance', content: 'The swimming pool will be closed for maintenance from Dec 10-12.', date: 'Dec 5, 2024', views: 89 },
				{ id: 2, title: 'New Year Party', category: 'event', content: 'Join us for the annual New Year celebration!', date: 'Dec 3, 2024', views: 156 }
			]
		},

		async fetchFacilities() {
			// Mock data - replace with API call
			return [
				{ id: 1, name: 'Party Room' },
				{ id: 2, name: 'Gym' },
				{ id: 3, name: 'Meeting Room' },
				{ id: 4, name: 'Guest Parking' }
			]
		},

		editResident(resident) {
			this.editingResident = { ...resident }
			this.showEditModal = true
		},

		async saveResident() {
			// API call to save resident
			console.log('Saving resident:', this.editingResident)
			this.showEditModal = false
			await this.loadData() // Reload data
		},

		async createAnnouncement() {
			// API call to create announcement
			console.log('Creating announcement:', this.newAnnouncement)
			this.showAnnouncementModal = false
			// Reset form
			this.newAnnouncement = {
				title: '',
				category: 'general',
				content: ''
			}
			await this.loadData() // Reload data
		},

		messageResident(resident) {
			// Open messaging modal or navigate to messages
			console.log('Message resident:', resident)
		},

		viewRequest(request) {
			console.log('View request:', request)
		},

		updateRequest(request) {
			console.log('Update request:', request)
		},

		editAnnouncement(announcement) {
			console.log('Edit announcement:', announcement)
		},

		deleteAnnouncement(announcement) {
			console.log('Delete announcement:', announcement)
		},

		handleQuickAction(action) {
			console.log('Quick action:', action)
		},

		getBooking(facilityId, day) {
			// Mock booking data
			const bookings = {
				'1-Mon': { time: '14:00-16:00', user: 'Unit 502' },
				'2-Wed': { time: '18:00-19:00', user: 'Unit 301' }
			}
			return bookings[`${facilityId}-${day}`]
		},

		previousWeek() {
			console.log('Previous week')
		},

		nextWeek() {
			console.log('Next week')
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '../styles/tokens.styl'

.dashboard
	min-height 100vh
	display flex
	flex-direction column
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)

.dashboard-content
	flex 1
	display flex
	gap 2rem
	max-width 1400px
	margin 0 auto
	padding 2rem
	width 100%

	@media (max-width: 768px)
		flex-direction column
		padding 1rem
		gap 1rem

.main-content
	flex 1
	min-width 0

.stats-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(250px, 1fr))
	gap 1.5rem
	margin-bottom 2rem
</style>