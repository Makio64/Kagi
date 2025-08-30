<template>
	<DashboardLayout user-type="mansion" :user-name="authStore.user?.email" :user-building="buildingName">
		<!-- Overview Section -->
		<section v-if="activeSection === 'overview'" class="section">
			<SectionHeader 
				:title="$t('mansion.overview.title') || 'Building Overview'"
				:subtitle="`Managing ${buildingName}`"
				icon="📊"
			/>
			
			<!-- Building Stats -->
			<div class="stats-grid">
				<StatCard
					icon="🏠"
					:label="$t('mansion.stats.units') || 'Total Units'"
					:value="120"
					variant="primary"
					subtext="114 occupied, 6 available"
				/>
				<StatCard
					icon="👥"
					:label="$t('mansion.stats.residents') || 'Residents'"
					:value="342"
					variant="secondary"
					:trend="{ text: '+5 this month', positive: true }"
				/>
				<StatCard
					icon="🔧"
					:label="$t('mansion.stats.requests') || 'Maintenance'"
					:value="8"
					variant="warning"
					:badge="{ text: '2 URGENT', variant: 'danger' }"
				/>
				<StatCard
					icon="📅"
					:label="$t('mansion.stats.bookings') || 'Today\'s Bookings'"
					:value="3"
					variant="info"
					subtext="Party Room, Gym, Meeting"
				/>
			</div>

			<!-- Quick Actions -->
			<KCard 
				:title="$t('mansion.quickActions') || 'Quick Actions'"
				icon="⚡"
				elevated
			>
				<div class="actions-grid">
					<KCard
						icon="📢"
						:title="$t('mansion.actions.announcement') || 'Send Announcement'"
						clickable
						variant="primary"
						size="sm"
						@click="navigateToSection('announcements')"
					/>
					<KCard
						icon="📄"
						:title="$t('mansion.actions.updateDocs') || 'Update Documents'"
						clickable
						size="sm"
						@click="navigateToSection('documents')"
					/>
					<KCard
						icon="🔧"
						:title="$t('mansion.actions.maintenance') || 'View Maintenance'"
						clickable
						size="sm"
						@click="navigateToSection('maintenance')"
					/>
					<KCard
						icon="📊"
						:title="$t('mansion.actions.reports') || 'Generate Reports'"
						clickable
						size="sm"
						@click="navigateToSection('reports')"
					/>
				</div>
			</KCard>
		</section>

		<!-- Residents Management -->
		<section v-if="activeSection === 'residents'" class="section">
			<SectionHeader 
				:title="$t('mansion.residents.title') || 'Resident Management'"
				icon="👥"
				searchable
				search-placeholder="Search residents..."
			>
				<template #actions>
					<KButton variant="primary" icon="➕">
						{{ $t('mansion.residents.add') || 'Add Resident' }}
					</KButton>
				</template>
			</SectionHeader>
			
			<div class="residents-grid">
				<KCard
					v-for="resident in residents"
					:key="resident.id"
					:title="resident.name"
					outlined
				>
					<template #badge>
						<span class="resident-status active">{{ $t('common.active') || 'Active' }}</span>
					</template>
					<div class="resident-details">
						<p><strong>{{ $t('mansion.residents.unit') || 'Unit' }}:</strong> {{ resident.unit }}</p>
						<p><strong>{{ $t('mansion.residents.email') || 'Email' }}:</strong> {{ resident.email }}</p>
						<p><strong>{{ $t('mansion.residents.phone') || 'Phone' }}:</strong> {{ resident.phone }}</p>
						<p><strong>{{ $t('mansion.residents.since') || 'Since' }}:</strong> {{ resident.moveInDate }}</p>
					</div>
					<template #footer>
						<div class="resident-actions">
							<KButton size="sm" variant="secondary" icon="✏️" @click="editResident(resident)">
								{{ $t('common.edit') || 'Edit' }}
							</KButton>
							<KButton size="sm" variant="ghost">
								{{ $t('mansion.residents.message') || 'Message' }}
							</KButton>
						</div>
					</template>
				</KCard>
			</div>
		</section>

		<!-- Maintenance Management -->
		<section v-if="activeSection === 'maintenance'" class="section">
			<SectionHeader 
				:title="$t('mansion.maintenance.title') || 'Maintenance Requests'"
				icon="🔧"
			>
				<template #actions>
					<KButton variant="secondary" size="sm">
						{{ $t('mansion.maintenance.export') || 'Export' }}
					</KButton>
					<KButton variant="primary" icon="➕" size="sm">
						{{ $t('mansion.maintenance.create') || 'Create Request' }}
					</KButton>
				</template>
			</SectionHeader>
			
			<div class="maintenance-list">
				<KCard
					v-for="request in maintenanceRequests"
					:key="request.id"
					:class="['maintenance-card', request.priority]"
					outlined
				>
					<div class="request-header">
						<span class="priority-badge" :class="request.priority">
							{{ request.priority }}
						</span>
						<h4>{{ request.title }}</h4>
						<span class="request-time">{{ request.created }}</span>
					</div>
					<p class="request-description">{{ request.description }}</p>
					<div class="request-info">
						<span><strong>Unit:</strong> {{ request.unit }}</span>
						<span><strong>Status:</strong> {{ request.status }}</span>
						<span><strong>Assigned:</strong> {{ request.assignedTo || 'Unassigned' }}</span>
					</div>
					<template #footer>
						<div class="request-actions">
							<KButton size="sm" variant="primary">
								{{ $t('mansion.maintenance.assign') || 'Assign' }}
							</KButton>
							<KButton size="sm" variant="secondary">
								{{ $t('mansion.maintenance.update') || 'Update Status' }}
							</KButton>
							<KButton size="sm" variant="ghost">
								{{ $t('mansion.maintenance.view') || 'View Details' }}
							</KButton>
						</div>
					</template>
				</KCard>
			</div>
		</section>

		<!-- Facility Bookings -->
		<section v-if="activeSection === 'bookings'" class="section">
			<SectionHeader 
				:title="$t('mansion.bookings.title') || 'Facility Bookings'"
				:subtitle="`Week of ${currentWeek}`"
				icon="📅"
			>
				<template #actions>
					<KButton variant="ghost" icon="◀" @click="previousWeek" />
					<KButton variant="ghost" icon="▶" @click="nextWeek" />
					<KButton variant="primary" icon="➕">
						{{ $t('mansion.bookings.add') || 'New Booking' }}
					</KButton>
				</template>
			</SectionHeader>
			
			<KCard elevated no-padding>
				<div class="bookings-table">
					<table>
						<thead>
							<tr>
								<th>{{ $t('mansion.bookings.facility') || 'Facility' }}</th>
								<th v-for="day in weekDays" :key="day">{{ day }}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="facility in facilities" :key="facility.id">
								<td class="facility-name">{{ facility.name }}</td>
								<td v-for="day in weekDays" :key="day" class="booking-cell">
									<div v-if="getBooking(facility.id, day)" class="booking-block">
										<span class="booking-time">{{ getBooking(facility.id, day).time }}</span>
										<span class="booking-user">{{ getBooking(facility.id, day).user }}</span>
									</div>
									<span v-else class="available">{{ $t('mansion.bookings.available') || 'Available' }}</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</KCard>
		</section>

		<!-- Announcements -->
		<section v-if="activeSection === 'announcements'" class="section">
			<SectionHeader 
				:title="$t('mansion.announcements.title') || 'Announcements'"
				icon="📢"
			>
				<template #actions>
					<KButton variant="primary" icon="➕" @click="showAnnouncementModal = true">
						{{ $t('mansion.announcements.create') || 'New Announcement' }}
					</KButton>
				</template>
			</SectionHeader>
			
			<div class="announcements-list">
				<KCard
					v-for="announcement in announcements"
					:key="announcement.id"
					:title="announcement.title"
					outlined
				>
					<template #badge>
						<span class="announcement-category" :class="announcement.category">
							{{ announcement.category }}
						</span>
					</template>
					<p>{{ announcement.content }}</p>
					<div class="announcement-meta">
						<span>{{ $t('mansion.announcements.posted') || 'Posted' }}: {{ announcement.date }}</span>
						<span>{{ $t('mansion.announcements.views') || 'Views' }}: {{ announcement.views }}</span>
					</div>
					<template #footer>
						<div class="announcement-actions">
							<KButton size="sm" variant="secondary">
								{{ $t('common.edit') || 'Edit' }}
							</KButton>
							<KButton size="sm" variant="danger">
								{{ $t('common.delete') || 'Delete' }}
							</KButton>
						</div>
					</template>
				</KCard>
			</div>
		</section>

		<!-- Documents -->
		<section v-if="activeSection === 'documents'" class="section">
			<SectionHeader 
				:title="$t('mansion.documents.title') || 'Building Documents'"
				icon="📄"
				searchable
				search-placeholder="Search documents..."
			>
				<template #actions>
					<KButton variant="primary" icon="⬆️">
						{{ $t('mansion.documents.upload') || 'Upload Document' }}
					</KButton>
				</template>
			</SectionHeader>
			
			<div class="documents-grid">
				<KCard
					v-for="doc in documents"
					:key="doc.id"
					:icon="doc.icon"
					:title="doc.name"
					clickable
					outlined
				>
					<p class="doc-description">{{ doc.description }}</p>
					<div class="doc-meta">
						<span>{{ doc.size }}</span>
						<span>{{ doc.lastModified }}</span>
					</div>
					<template #footer>
						<div class="doc-actions">
							<KButton size="sm" variant="primary" icon="⬇️">
								{{ $t('mansion.documents.download') || 'Download' }}
							</KButton>
							<KButton size="sm" variant="ghost">
								{{ $t('common.delete') || 'Delete' }}
							</KButton>
						</div>
					</template>
				</KCard>
			</div>
		</section>

		<!-- Financial -->
		<section v-if="activeSection === 'financial'" class="section">
			<SectionHeader 
				:title="$t('mansion.financial.title') || 'Financial Overview'"
				icon="💰"
			>
				<template #actions>
					<KButton variant="secondary" icon="📥">
						{{ $t('mansion.financial.export') || 'Export Report' }}
					</KButton>
				</template>
			</SectionHeader>
			
			<div class="financial-stats">
				<StatCard
					icon="💵"
					:label="$t('mansion.financial.collected') || 'Collected This Month'"
					:value="9500000"
					format="currency"
					variant="success"
					:trend="{ text: '95% collection rate', positive: true }"
				/>
				<StatCard
					icon="💸"
					:label="$t('mansion.financial.pending') || 'Pending Payments'"
					:value="500000"
					format="currency"
					variant="warning"
					subtext="6 units pending"
				/>
				<StatCard
					icon="📊"
					:label="$t('mansion.financial.expenses') || 'Monthly Expenses'"
					:value="3200000"
					format="currency"
					variant="secondary"
				/>
			</div>

			<KCard 
				:title="$t('mansion.financial.breakdown') || 'Payment Status by Unit'"
				elevated
			>
				<div class="payment-list">
					<div v-for="payment in unitPayments" :key="payment.unit" class="payment-item">
						<span class="unit-number">Unit {{ payment.unit }}</span>
						<span class="resident-name">{{ payment.resident }}</span>
						<span class="amount">¥{{ payment.amount.toLocaleString() }}</span>
						<span class="status" :class="payment.status">{{ payment.status }}</span>
					</div>
				</div>
			</KCard>
		</section>

		<!-- Reports -->
		<section v-if="activeSection === 'reports'" class="section">
			<SectionHeader 
				:title="$t('mansion.reports.title') || 'Reports & Analytics'"
				icon="📊"
			/>
			
			<div class="reports-grid">
				<KCard
					icon="📈"
					title="Occupancy Report"
					clickable
					variant="primary"
				>
					<p>Monthly occupancy trends and forecasts</p>
					<template #footer>
						<KButton size="sm" variant="primary" block>
							{{ $t('mansion.reports.generate') || 'Generate Report' }}
						</KButton>
					</template>
				</KCard>
				
				<KCard
					icon="💰"
					title="Financial Report"
					clickable
					variant="success"
				>
					<p>Revenue, expenses, and collection rates</p>
					<template #footer>
						<KButton size="sm" variant="primary" block>
							{{ $t('mansion.reports.generate') || 'Generate Report' }}
						</KButton>
					</template>
				</KCard>
				
				<KCard
					icon="🔧"
					title="Maintenance Report"
					clickable
					variant="warning"
				>
					<p>Request trends and completion times</p>
					<template #footer>
						<KButton size="sm" variant="primary" block>
							{{ $t('mansion.reports.generate') || 'Generate Report' }}
						</KButton>
					</template>
				</KCard>
				
				<KCard
					icon="👥"
					title="Resident Report"
					clickable
					variant="info"
				>
					<p>Demographics and satisfaction metrics</p>
					<template #footer>
						<KButton size="sm" variant="primary" block>
							{{ $t('mansion.reports.generate') || 'Generate Report' }}
						</KButton>
					</template>
				</KCard>
			</div>
		</section>

		<!-- Settings -->
		<section v-if="activeSection === 'settings'" class="section">
			<SectionHeader 
				:title="$t('mansion.settings.title') || 'Building Settings'"
				icon="⚙️"
			/>
			
			<div class="settings-grid">
				<KCard 
					:title="$t('mansion.settings.building') || 'Building Information'"
					icon="🏢"
					outlined
				>
					<div class="setting-item">
						<label>{{ $t('mansion.settings.name') || 'Building Name' }}</label>
						<input v-model="buildingSettings.name" type="text" class="setting-input">
					</div>
					<div class="setting-item">
						<label>{{ $t('mansion.settings.address') || 'Address' }}</label>
						<input v-model="buildingSettings.address" type="text" class="setting-input">
					</div>
					<div class="setting-item">
						<label>{{ $t('mansion.settings.units') || 'Total Units' }}</label>
						<input v-model="buildingSettings.totalUnits" type="number" class="setting-input">
					</div>
					<template #footer>
						<KButton variant="primary" block>
							{{ $t('common.save') || 'Save Changes' }}
						</KButton>
					</template>
				</KCard>

				<KCard 
					:title="$t('mansion.settings.facilities') || 'Facilities Management'"
					icon="🏊"
					outlined
				>
					<div class="facilities-list">
						<div v-for="facility in buildingSettings.facilities" :key="facility.id" class="facility-item">
							<label>
								<input v-model="facility.enabled" type="checkbox">
								{{ facility.name }}
							</label>
							<span class="facility-hours">{{ facility.hours }}</span>
						</div>
					</div>
					<template #footer>
						<KButton variant="primary" block>
							{{ $t('mansion.settings.updateFacilities') || 'Update Facilities' }}
						</KButton>
					</template>
				</KCard>

				<KCard 
					:title="$t('mansion.settings.notifications') || 'Notification Settings'"
					icon="🔔"
					outlined
				>
					<div class="setting-item">
						<label>
							<input v-model="notificationSettings.emailAlerts" type="checkbox">
							{{ $t('mansion.settings.emailAlerts') || 'Email alerts for urgent maintenance' }}
						</label>
					</div>
					<div class="setting-item">
						<label>
							<input v-model="notificationSettings.dailyDigest" type="checkbox">
							{{ $t('mansion.settings.dailyDigest') || 'Daily activity digest' }}
						</label>
					</div>
					<div class="setting-item">
						<label>
							<input v-model="notificationSettings.paymentReminders" type="checkbox">
							{{ $t('mansion.settings.paymentReminders') || 'Payment reminder notifications' }}
						</label>
					</div>
				</KCard>
			</div>
		</section>

		<!-- Edit Resident Modal -->
		<transition name="modal">
			<div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
				<div class="modal-content">
					<div class="modal-header">
						<h3>{{ $t('mansion.residents.edit') || 'Edit Resident Information' }}</h3>
						<button class="modal-close" @click="showEditModal = false">✕</button>
					</div>
					<form class="modal-body" @submit.prevent="saveResident">
						<div class="form-group">
							<label>{{ $t('mansion.residents.name') || 'Name' }}</label>
							<input v-model="editingResident.name" type="text" required>
						</div>
						<div class="form-group">
							<label>{{ $t('mansion.residents.unit') || 'Unit' }}</label>
							<input v-model="editingResident.unit" type="text" required>
						</div>
						<div class="form-group">
							<label>{{ $t('mansion.residents.email') || 'Email' }}</label>
							<input v-model="editingResident.email" type="email" required>
						</div>
						<div class="form-group">
							<label>{{ $t('mansion.residents.phone') || 'Phone' }}</label>
							<input v-model="editingResident.phone" type="tel" required>
						</div>
						<div class="modal-actions">
							<KButton type="button" variant="secondary" @click="showEditModal = false">
								{{ $t('common.cancel') || 'Cancel' }}
							</KButton>
							<KButton type="submit" variant="primary">
								{{ $t('common.save') || 'Save Changes' }}
							</KButton>
						</div>
					</form>
				</div>
			</div>
		</transition>

		<!-- New Announcement Modal -->
		<transition name="modal">
			<div v-if="showAnnouncementModal" class="modal-overlay" @click.self="showAnnouncementModal = false">
				<div class="modal-content">
					<div class="modal-header">
						<h3>{{ $t('mansion.announcements.new') || 'Create New Announcement' }}</h3>
						<button class="modal-close" @click="showAnnouncementModal = false">✕</button>
					</div>
					<form class="modal-body" @submit.prevent="createAnnouncement">
						<div class="form-group">
							<label>{{ $t('mansion.announcements.title') || 'Title' }}</label>
							<input v-model="newAnnouncement.title" type="text" required>
						</div>
						<div class="form-group">
							<label>{{ $t('mansion.announcements.category') || 'Category' }}</label>
							<select v-model="newAnnouncement.category" required>
								<option value="general">{{ $t('mansion.announcements.general') || 'General' }}</option>
								<option value="maintenance">{{ $t('mansion.announcements.maintenance') || 'Maintenance' }}</option>
								<option value="event">{{ $t('mansion.announcements.event') || 'Event' }}</option>
								<option value="urgent">{{ $t('mansion.announcements.urgent') || 'Urgent' }}</option>
							</select>
						</div>
						<div class="form-group">
							<label>{{ $t('mansion.announcements.content') || 'Content' }}</label>
							<textarea v-model="newAnnouncement.content" rows="5" required />
						</div>
						<div class="modal-actions">
							<KButton type="button" variant="secondary" @click="showAnnouncementModal = false">
								{{ $t('common.cancel') || 'Cancel' }}
							</KButton>
							<KButton type="submit" variant="primary">
								{{ $t('mansion.announcements.post') || 'Post Announcement' }}
							</KButton>
						</div>
					</form>
				</div>
			</div>
		</transition>
	</DashboardLayout>
</template>

<script setup>
import { provide, ref } from 'vue'
import { getCurrentInstance } from 'vue'

import KButton from '../components/core/KButton.vue'
import KCard from '../components/core/KCard.vue'
import SectionHeader from '../components/dashboard/SectionHeader.vue'
import StatCard from '../components/dashboard/StatCard.vue'
// Components
import DashboardLayout from '../components/layout/DashboardLayout.vue'
// Stores
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const instance = getCurrentInstance()
const router = instance.proxy.$router

// Building Information
const buildingName = ref( 'Sakura Tower' )

// Provide activeSection for DashboardLayout navigation
const activeSection = ref( 'overview' )
provide( 'activeSection', activeSection )
provide( 'navigateToSection', ( section ) => {
	activeSection.value = section
} )

// Sample Data
const residents = ref( [
	{ id: 1, name: 'Tanaka Yuki', unit: '502', email: 'tanaka@example.com', phone: '090-1234-5678', moveInDate: 'Jan 2023', status: 'active' },
	{ id: 2, name: 'Sato Kenji', unit: '301', email: 'sato@example.com', phone: '090-2345-6789', moveInDate: 'Mar 2022', status: 'active' },
	{ id: 3, name: 'Yamada Hana', unit: '105', email: 'yamada@example.com', phone: '090-3456-7890', moveInDate: 'Jun 2023', status: 'active' }
] )

const maintenanceRequests = ref( [
	{ id: 1, title: 'Water leak in bathroom', description: 'Water dripping from ceiling', unit: '502', priority: 'urgent', status: 'open', created: '2 hours ago' },
	{ id: 2, title: 'AC not working', description: 'Air conditioning unit making noise', unit: '301', priority: 'high', status: 'assigned', assignedTo: 'Tech Team', created: '1 day ago' },
	{ id: 3, title: 'Door lock issue', description: 'Key card reader not responding', unit: '105', priority: 'medium', status: 'in-progress', assignedTo: 'Security', created: '3 days ago' }
] )

const announcements = ref( [
	{ id: 1, title: 'Pool Maintenance', category: 'maintenance', content: 'The swimming pool will be closed for maintenance from Dec 10-12.', date: 'Dec 5, 2024', views: 89 },
	{ id: 2, title: 'New Year Party', category: 'event', content: 'Join us for the annual New Year celebration in the party room!', date: 'Dec 3, 2024', views: 156 },
	{ id: 3, title: 'Elevator Inspection', category: 'urgent', content: 'Mandatory elevator inspection on Dec 15. Service may be interrupted.', date: 'Dec 1, 2024', views: 201 }
] )

const documents = ref( [
	{ id: 1, name: 'Building Rules', icon: '📋', description: 'Complete building rules and regulations', size: '2.3 MB', lastModified: 'Nov 15, 2024' },
	{ id: 2, name: 'Emergency Procedures', icon: '🚨', description: 'Emergency evacuation and safety procedures', size: '1.5 MB', lastModified: 'Oct 20, 2024' },
	{ id: 3, name: 'Facility Guide', icon: '📖', description: 'Guide to all building facilities', size: '4.1 MB', lastModified: 'Sep 10, 2024' }
] )

const facilities = ref( [
	{ id: 1, name: 'Party Room' },
	{ id: 2, name: 'Gym' },
	{ id: 3, name: 'Meeting Room' },
	{ id: 4, name: 'Guest Parking' }
] )

const unitPayments = ref( [
	{ unit: '101', resident: 'Tanaka Y.', amount: 125000, status: 'paid' },
	{ unit: '102', resident: 'Sato K.', amount: 125000, status: 'paid' },
	{ unit: '103', resident: 'Yamada H.', amount: 125000, status: 'pending' },
	{ unit: '201', resident: 'Suzuki M.', amount: 135000, status: 'paid' },
	{ unit: '202', resident: 'Watanabe T.', amount: 135000, status: 'overdue' }
] )

// Modal States
const showEditModal = ref( false )
const showAnnouncementModal = ref( false )
const editingResident = ref( {} )
const newAnnouncement = ref( {
	title: '',
	category: 'general',
	content: ''
} )

// Booking Calendar
const currentWeek = ref( 'Dec 9-15, 2024' )
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Settings
const buildingSettings = ref( {
	name: 'Sakura Tower',
	address: 'Shibuya, Tokyo',
	totalUnits: 120,
	facilities: [
		{ id: 1, name: 'Swimming Pool', enabled: true, hours: '6:00 - 22:00' },
		{ id: 2, name: 'Gym', enabled: true, hours: '5:00 - 23:00' },
		{ id: 3, name: 'Party Room', enabled: true, hours: 'By reservation' },
		{ id: 4, name: 'Rooftop Garden', enabled: true, hours: '7:00 - 20:00' }
	]
} )

const notificationSettings = ref( {
	emailAlerts: true,
	dailyDigest: true,
	paymentReminders: true
} )

// Methods
const editResident = ( resident ) => {
	editingResident.value = { ...resident }
	showEditModal.value = true
}

const saveResident = () => {
	// Save resident logic
	console.log( 'Saving resident:', editingResident.value )
	showEditModal.value = false
}

const createAnnouncement = () => {
	// Create announcement logic
	console.log( 'Creating announcement:', newAnnouncement.value )
	showAnnouncementModal.value = false
	// Reset form
	newAnnouncement.value = {
		title: '',
		category: 'general',
		content: ''
	}
}

const getBooking = ( facilityId, day ) => {
	// Mock booking data
	const bookings = {
		'1-Mon': { time: '14:00-16:00', user: 'Unit 502' },
		'2-Wed': { time: '18:00-19:00', user: 'Unit 301' },
		'3-Fri': { time: '19:00-21:00', user: 'Unit 105' }
	}
	return bookings[`${facilityId}-${day}`]
}

const previousWeek = () => {
	// Navigate to previous week
	console.log( 'Previous week' )
}

const nextWeek = () => {
	// Navigate to next week
	console.log( 'Next week' )
}
</script>

<style lang="stylus" scoped>
@import '../styles/tokens.styl'

.section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

// Stats grid
.stats-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(250px, 1fr))
	gap 1.5rem
	margin-bottom 2rem

// Actions grid
.actions-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
	gap 1rem

// Residents grid
.residents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
	gap 1.5rem

.resident-details
	p
		margin 0.5rem 0
		color #666
		font-size 0.95rem

.resident-actions
	display flex
	gap 0.5rem
	width 100%

.resident-status
	padding 0.25rem 0.75rem
	border-radius 12px
	font-size 0.85rem
	
	&.active
		background #E8F5E9
		color #4CAF50

// Maintenance cards
.maintenance-list
	display flex
	flex-direction column
	gap 1rem

.maintenance-card
	&.urgent
		border-left 4px solid #F44336
	
	&.high
		border-left 4px solid #FF9800
	
	&.medium
		border-left 4px solid #2196F3

.request-header
	display flex
	align-items center
	gap 1rem
	margin-bottom 1rem

	h4
		flex 1
		margin 0
		color #333

	.request-time
		color #999
		font-size 0.85rem

.priority-badge
	padding 0.25rem 0.5rem
	border-radius 12px
	font-size 0.75rem
	font-weight 600
	text-transform uppercase
	
	&.urgent
		background #FFEBEE
		color #F44336
	
	&.high
		background #FFF3E0
		color #FF9800
	
	&.medium
		background #E3F2FD
		color #2196F3

.request-description
	margin 0.5rem 0
	color #666

.request-info
	display flex
	gap 1.5rem
	margin-top 1rem
	padding-top 1rem
	border-top 1px solid #f0f0f0
	font-size 0.9rem
	color #666

.request-actions
	display flex
	gap 0.5rem
	width 100%

// Bookings table
.bookings-table
	overflow-x auto
	
	table
		width 100%
		border-collapse collapse
		
		th
			background $color-bg-tertiary
			padding 1rem
			text-align left
			color #333
			font-weight 600
			border-bottom 2px solid $color-primary
		
		td
			padding 0.75rem
			border-bottom 1px solid #f0f0f0
			
			&.facility-name
				font-weight 500
				background #f9f9f9
			
			&.booking-cell
				text-align center
				
				.available
					color #999
					font-size 0.85rem
				
				.booking-block
					background linear-gradient(135deg, $color-primary 0%, #FFB300 100%)
					padding 0.5rem
					border-radius 6px
					color white
					
					.booking-time
						display block
						font-weight 600
						font-size 0.85rem
					
					.booking-user
						display block
						font-size 0.75rem
						opacity 0.9

// Announcements
.announcements-list
	display flex
	flex-direction column
	gap 1rem

.announcement-category
	padding 0.25rem 0.75rem
	border-radius 12px
	font-size 0.85rem
	text-transform uppercase
	
	&.general
		background #E3F2FD
		color #2196F3
	
	&.maintenance
		background #FFF3E0
		color #FF9800
	
	&.event
		background #F3E5F5
		color #9C27B0
	
	&.urgent
		background #FFEBEE
		color #F44336

.announcement-meta
	display flex
	justify-content space-between
	margin-top 1rem
	padding-top 1rem
	border-top 1px solid #f0f0f0
	font-size 0.85rem
	color #999

.announcement-actions
	display flex
	gap 0.5rem
	width 100%

// Documents
.documents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap 1.5rem

.doc-description
	margin 0.5rem 0
	color #666
	font-size 0.9rem

.doc-meta
	display flex
	justify-content space-between
	margin-top 0.5rem
	font-size 0.85rem
	color #999

.doc-actions
	display flex
	gap 0.5rem
	width 100%

// Financial
.financial-stats
	display grid
	grid-template-columns repeat(3, 1fr)
	gap 1.5rem
	margin-bottom 2rem
	
	@media (max-width: 768px)
		grid-template-columns 1fr

.payment-list
	display flex
	flex-direction column
	gap 0.75rem

.payment-item
	display grid
	grid-template-columns 100px 1fr 150px 100px
	align-items center
	padding 0.75rem
	background #f9f9f9
	border-radius 8px
	
	.unit-number
		font-weight 600
		color #333
	
	.resident-name
		color #666
	
	.amount
		text-align right
		font-weight 500
	
	.status
		text-align center
		padding 0.25rem 0.5rem
		border-radius 12px
		font-size 0.85rem
		
		&.paid
			background #E8F5E9
			color #4CAF50
		
		&.pending
			background #FFF3E0
			color #FF9800
		
		&.overdue
			background #FFEBEE
			color #F44336

// Reports
.reports-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(250px, 1fr))
	gap 1.5rem

// Settings
.settings-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(400px, 1fr))
	gap 1.5rem

.setting-item
	margin-bottom 1rem
	
	label
		display block
		margin-bottom 0.5rem
		color #666
		font-weight 500
		font-size 0.9rem
	
	.setting-input
		width 100%
		padding 0.75rem
		border 1px solid #ddd
		border-radius 8px
		font-size 1rem
		
		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

.facilities-list
	display flex
	flex-direction column
	gap 0.75rem

.facility-item
	display flex
	justify-content space-between
	align-items center
	padding 0.75rem
	background #f9f9f9
	border-radius 8px
	
	label
		display flex
		align-items center
		gap 0.5rem
		margin 0
	
	.facility-hours
		color #666
		font-size 0.85rem

// Modal Styles
.modal-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	display flex
	align-items center
	justify-content center
	z-index 1000
	padding 1rem

.modal-content
	background white
	border-radius 12px
	max-width 600px
	width 100%
	max-height 90vh
	overflow-y auto
	box-shadow 0 10px 40px rgba(0, 0, 0, 0.2)

.modal-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 1px solid #e0e0e0
	
	h3
		margin 0
		color #333
		font-size 1.3rem

.modal-close
	background none
	border none
	font-size 1.5rem
	cursor pointer
	color #999
	padding 0
	width 30px
	height 30px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	transition all 0.2s
	
	&:hover
		background #f5f5f5
		color #333

.modal-body
	padding 1.5rem

.form-group
	margin-bottom 1.2rem
	
	label
		display block
		margin-bottom 0.5rem
		color #666
		font-weight 500
		font-size 0.9rem
	
	input, textarea, select
		width 100%
		padding 0.75rem
		border 1px solid #ddd
		border-radius 8px
		font-size 1rem
		transition border-color 0.2s
		
		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)
	
	textarea
		resize vertical
		font-family inherit

.modal-actions
	display flex
	justify-content flex-end
	gap 1rem
	margin-top 2rem
	padding-top 1.5rem
	border-top 1px solid #e0e0e0

// Modal animation
.modal-enter-active, .modal-leave-active
	transition opacity 0.3s

.modal-enter-from, .modal-leave-to
	opacity 0

.modal-enter-active .modal-content
	animation slideUp 0.3s ease-out

@keyframes slideUp
	from
		transform translateY(30px)
		opacity 0
	to
		transform translateY(0)
		opacity 1
</style>