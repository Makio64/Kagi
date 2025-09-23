<template>
	<div class="dashboard">
		<header class="header">
			<div class="header-content">
				<div class="header-left" style="cursor: pointer;" @click="navigateToSection('overview')">
					<KagiLogo :size="40" />
					<h1>{{ buildingName }}</h1>
				</div>
				<div class="header-right">
					<span class="user-badge">Mansion Admin</span>
					<button class="user-menu-btn" @click="showMobileMenu = !showMobileMenu">
						<span class="user-email">{{ user?.email }}</span>
						<span class="menu-arrow">▼</span>
					</button>
				</div>
			</div>
		</header>

		<!-- Mobile Settings Menu -->
		<transition name="slide">
			<div v-if="showMobileMenu" class="mobile-settings-menu">
				<div class="mobile-menu-header">
					<h3>{{ $t('common.settings') }}</h3>
					<button class="close-menu-btn" @click="showMobileMenu = false">✕</button>
				</div>
				<div class="mobile-menu-content">
					<div class="mobile-user-info">
						<div class="user-email">{{ user?.email }}</div>
						<div class="user-role">Mansion Admin</div>
					</div>
					<div class="mobile-lang-section">
						<LanguageSwitcher />
					</div>
					<button class="mobile-logout-btn" @click="handleLogout">
						{{ $t('nav.logout') }}
					</button>
				</div>
			</div>
		</transition>

		<div class="dashboard-content">
			<aside class="sidebar">
				<nav class="nav-menu">
					<button
						v-for="item in menuItems"
						:key="item.id"
						:class="['nav-item', { active: activeSection === item.id }]"
						@click="navigateToSection(item.id)"
					>
						<span class="nav-icon">{{ item.icon }}</span>
						<span class="nav-label">{{ item.label }}</span>
					</button>
				</nav>

				<!-- Mobile menu with circular icons -->
				<nav class="nav-menu-mobile">
					<button
						v-for="item in menuItems"
						:key="item.id"
						:class="['nav-item-mobile', { active: activeSection === item.id }]"
						@click="navigateToSection(item.id)"
					>
						<div class="nav-icon-circle">
							<span class="nav-icon">{{ item.icon }}</span>
						</div>
						<span class="nav-label-mobile">{{ item.label }}</span>
					</button>
				</nav>
			</aside>

			<main class="main-content">
				<!-- Overview Section -->
				<section v-if="activeSection === 'overview'" class="section">
					<SectionHeader 
						:title="$t('mansion.overview.title')"
						:subtitle="`Managing ${buildingName}`"
						icon="📊"
					/>
			
					<!-- Building Stats -->
					<div class="stats-grid">
						<StatCard
							icon="🏠"
							:label="$t('mansion.stats.units')"
							:value="120"
							variant="primary"
							subtext="114 occupied, 6 available"
						/>
						<StatCard
							icon="👥"
							:label="$t('mansion.stats.residents')"
							:value="342"
							variant="secondary"
							:trend="{ text: '+5 this month', positive: true }"
						/>
						<StatCard
							icon="🔧"
							:label="$t('mansion.stats.requests')"
							:value="8"
							variant="warning"
							:badge="{ text: '2 URGENT', variant: 'danger' }"
						/>
						<StatCard
							icon="📅"
							:label="$t('mansion.stats.bookings')"
							:value="3"
							variant="info"
							subtext="Party Room, Gym, Meeting"
						/>
					</div>

					<!-- Quick Actions -->
					<KCard 
						:title="$t('mansion.quickActions')"
						icon="⚡"
						elevated
					>
						<div class="actions-grid">
							<KCard
								icon="📢"
								:title="$t('mansion.actions.announcement')"
								clickable
								variant="primary"
								size="sm"
								@click="navigateToSection('announcements')"
							/>
							<KCard
								icon="📄"
								:title="$t('mansion.actions.updateDocs')"
								clickable
								size="sm"
								@click="navigateToSection('documents')"
							/>
							<KCard
								icon="🔧"
								:title="$t('mansion.actions.maintenance')"
								clickable
								size="sm"
								@click="navigateToSection('maintenance')"
							/>
							<KCard
								icon="📊"
								:title="$t('mansion.actions.reports')"
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
						:title="$t('mansion.residents.title')"
						icon="👥"
						searchable
						search-placeholder="Search residents..."
					>
						<template #actions>
							<KButton variant="primary" icon="➕">
								{{ $t('mansion.residents.add') }}
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
								<span class="resident-status active">{{ $t('common.active') }}</span>
							</template>
							<div class="resident-details">
								<p><strong>{{ $t('mansion.residents.unit') }}:</strong> {{ resident.unit }}</p>
								<p><strong>{{ $t('mansion.residents.email') }}:</strong> {{ resident.email }}</p>
								<p><strong>{{ $t('mansion.residents.phone') }}:</strong> {{ resident.phone }}</p>
								<p><strong>{{ $t('mansion.residents.since') }}:</strong> {{ resident.moveInDate }}</p>
							</div>
							<template #footer>
								<div class="resident-actions">
									<KButton size="sm" variant="secondary" icon="✏️" @click="editResident(resident)">
										{{ $t('common.edit') }}
									</KButton>
									<KButton size="sm" variant="ghost">
										{{ $t('mansion.residents.message') }}
									</KButton>
								</div>
							</template>
						</KCard>
					</div>
				</section>

				<!-- Maintenance Management -->
				<section v-if="activeSection === 'maintenance'" class="section">
					<SectionHeader 
						:title="$t('mansion.maintenance.title')"
						icon="🔧"
					>
						<template #actions>
							<KButton variant="secondary" size="sm">
								{{ $t('mansion.maintenance.export') }}
							</KButton>
							<KButton variant="primary" icon="➕" size="sm">
								{{ $t('mansion.maintenance.create') }}
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
										{{ $t('mansion.maintenance.assign') }}
									</KButton>
									<KButton size="sm" variant="secondary">
										{{ $t('mansion.maintenance.update') }}
									</KButton>
									<KButton size="sm" variant="ghost">
										{{ $t('mansion.maintenance.view') }}
									</KButton>
								</div>
							</template>
						</KCard>
					</div>
				</section>

				<!-- Facility Bookings -->
				<section v-if="activeSection === 'bookings'" class="section">
					<SectionHeader 
						:title="$t('mansion.bookings.title')"
						:subtitle="`Week of ${currentWeek}`"
						icon="📅"
					>
						<template #actions>
							<KButton variant="ghost" icon="◀" @click="previousWeek" />
							<KButton variant="ghost" icon="▶" @click="nextWeek" />
							<KButton variant="primary" icon="➕">
								{{ $t('mansion.bookings.add') }}
							</KButton>
						</template>
					</SectionHeader>
			
					<KCard elevated no-padding>
						<div class="bookings-table">
							<table>
								<thead>
									<tr>
										<th>{{ $t('mansion.bookings.facility') }}</th>
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
											<span v-else class="available">{{ $t('mansion.bookings.available') }}</span>
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
						:title="$t('mansion.announcements.title')"
						icon="📢"
					>
						<template #actions>
							<KButton variant="primary" icon="➕" @click="showAnnouncementModal = true">
								{{ $t('mansion.announcements.create') }}
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
								<span>{{ $t('mansion.announcements.posted') }}: {{ announcement.date }}</span>
								<span>{{ $t('mansion.announcements.views') }}: {{ announcement.views }}</span>
							</div>
							<template #footer>
								<div class="announcement-actions">
									<KButton size="sm" variant="secondary">
										{{ $t('common.edit') }}
									</KButton>
									<KButton size="sm" variant="danger">
										{{ $t('common.delete') }}
									</KButton>
								</div>
							</template>
						</KCard>
					</div>
				</section>

				<!-- Documents -->
				<section v-if="activeSection === 'documents'" class="section">
					<SectionHeader 
						:title="$t('mansion.documents.title')"
						icon="📄"
						searchable
						search-placeholder="Search documents..."
					>
						<template #actions>
							<KButton variant="primary" icon="⬆️">
								{{ $t('mansion.documents.upload') }}
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
										{{ $t('mansion.documents.download') }}
									</KButton>
									<KButton size="sm" variant="ghost">
										{{ $t('common.delete') }}
									</KButton>
								</div>
							</template>
						</KCard>
					</div>
				</section>

				<!-- Financial -->
				<section v-if="activeSection === 'financial'" class="section">
					<SectionHeader 
						:title="$t('mansion.financial.title')"
						icon="💰"
					>
						<template #actions>
							<KButton variant="secondary" icon="📥">
								{{ $t('mansion.financial.export') }}
							</KButton>
						</template>
					</SectionHeader>
			
					<div class="financial-stats">
						<StatCard
							icon="💵"
							:label="$t('mansion.financial.collected')"
							:value="9500000"
							format="currency"
							variant="success"
							:trend="{ text: '95% collection rate', positive: true }"
						/>
						<StatCard
							icon="💸"
							:label="$t('mansion.financial.pending')"
							:value="500000"
							format="currency"
							variant="warning"
							subtext="6 units pending"
						/>
						<StatCard
							icon="📊"
							:label="$t('mansion.financial.expenses')"
							:value="3200000"
							format="currency"
							variant="secondary"
						/>
					</div>

					<KCard 
						:title="$t('mansion.financial.breakdown')"
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
						:title="$t('mansion.reports.title')"
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
									{{ $t('mansion.reports.generate') }}
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
									{{ $t('mansion.reports.generate') }}
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
									{{ $t('mansion.reports.generate') }}
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
									{{ $t('mansion.reports.generate') }}
								</KButton>
							</template>
						</KCard>
					</div>
				</section>

				<!-- Services Management -->
				<section v-if="activeSection === 'services'" class="section">
					<SectionHeader 
						:title="$t('mansion.services.title')"
						icon="🛎️"
					>
						<template #actions>
							<KButton variant="primary" icon="➕">
								{{ $t('mansion.services.add') }}
							</KButton>
						</template>
					</SectionHeader>
			
					<div class="services-grid">
						<KCard
							icon="🧹"
							:title="$t('dashboard.services.cleaning')"
							:badge="{ text: 'ACTIVE', variant: 'success' }"
							outlined
						>
							<div class="service-details">
								<p><strong>{{ $t('dashboard.services.price') }}:</strong> ¥3,000/hour</p>
								<p><strong>{{ $t('dashboard.services.availability') }}:</strong> Mon-Sat, 9AM-6PM</p>
								<p><strong>Provider:</strong> CleanPro Services Inc.</p>
								<p><strong>Bookings this month:</strong> 42</p>
							</div>
							<template #footer>
								<div class="service-actions">
									<KButton size="sm" variant="secondary" icon="✏️">
										{{ $t('common.edit') }}
									</KButton>
									<KButton size="sm" variant="ghost">
										{{ $t('mansion.services.viewBookings') }}
									</KButton>
								</div>
							</template>
						</KCard>
				
						<KCard
							icon="🚲"
							:title="$t('dashboard.services.bikeRental')"
							:badge="{ text: 'ACTIVE', variant: 'success' }"
							outlined
						>
							<div class="service-details">
								<p><strong>{{ $t('dashboard.services.price') }}:</strong> ¥500/day</p>
								<p><strong>{{ $t('dashboard.services.availability') }}:</strong> 24/7</p>
								<p><strong>Available bikes:</strong> 15/20</p>
								<p><strong>Monthly rentals:</strong> 28</p>
							</div>
							<template #footer>
								<div class="service-actions">
									<KButton size="sm" variant="secondary" icon="✏️">
										{{ $t('common.edit') }}
									</KButton>
									<KButton size="sm" variant="ghost">
										{{ $t('mansion.services.manageInventory') }}
									</KButton>
								</div>
							</template>
						</KCard>
				
						<KCard
							icon="🛏️"
							:title="$t('dashboard.services.futonRental')"
							:badge="{ text: 'ACTIVE', variant: 'success' }"
							outlined
						>
							<div class="service-details">
								<p><strong>{{ $t('dashboard.services.price') }}:</strong> ¥1,000/week</p>
								<p><strong>{{ $t('dashboard.services.availability') }}:</strong> On request</p>
								<p><strong>Available sets:</strong> 8/10</p>
								<p><strong>Current rentals:</strong> 2</p>
							</div>
							<template #footer>
								<div class="service-actions">
									<KButton size="sm" variant="secondary" icon="✏️">
										{{ $t('common.edit') }}
									</KButton>
									<KButton size="sm" variant="ghost">
										{{ $t('mansion.services.manageInventory') }}
									</KButton>
								</div>
							</template>
						</KCard>
				
						<KCard
							icon="💐"
							:title="$t('dashboard.services.flowerDelivery')"
							:badge="{ text: 'ACTIVE', variant: 'success' }"
							outlined
						>
							<div class="service-details">
								<p><strong>{{ $t('dashboard.services.price') }}:</strong> From ¥2,000</p>
								<p><strong>{{ $t('dashboard.services.availability') }}:</strong> Daily orders</p>
								<p><strong>Partner:</strong> Sakura Flowers</p>
								<p><strong>Orders this month:</strong> 15</p>
							</div>
							<template #footer>
								<div class="service-actions">
									<KButton size="sm" variant="secondary" icon="✏️">
										{{ $t('common.edit') }}
									</KButton>
									<KButton size="sm" variant="ghost">
										{{ $t('mansion.services.viewOrders') }}
									</KButton>
								</div>
							</template>
						</KCard>
					</div>
				</section>

				<!-- Settings -->
				<section v-if="activeSection === 'settings'" class="section">
					<SectionHeader 
						:title="$t('mansion.settings.title')"
						icon="⚙️"
					/>
			
					<div class="settings-grid">
						<KCard 
							:title="$t('mansion.settings.building')"
							icon="🏢"
							outlined
						>
							<div class="setting-item">
								<label>{{ $t('mansion.settings.name') }}</label>
								<input v-model="buildingSettings.name" type="text" class="setting-input">
							</div>
							<div class="setting-item">
								<label>{{ $t('mansion.settings.address') }}</label>
								<input v-model="buildingSettings.address" type="text" class="setting-input">
							</div>
							<div class="setting-item">
								<label>{{ $t('mansion.settings.units') }}</label>
								<input v-model="buildingSettings.totalUnits" type="number" class="setting-input">
							</div>
							<template #footer>
								<KButton variant="primary" block>
									{{ $t('common.save') }}
								</KButton>
							</template>
						</KCard>

						<KCard 
							:title="$t('mansion.settings.facilities')"
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
									{{ $t('mansion.settings.updateFacilities') }}
								</KButton>
							</template>
						</KCard>

						<KCard 
							:title="$t('mansion.settings.notifications')"
							icon="🔔"
							outlined
						>
							<div class="setting-item">
								<label>
									<input v-model="notificationSettings.emailAlerts" type="checkbox">
									{{ $t('mansion.settings.emailAlerts') }}
								</label>
							</div>
							<div class="setting-item">
								<label>
									<input v-model="notificationSettings.dailyDigest" type="checkbox">
									{{ $t('mansion.settings.dailyDigest') }}
								</label>
							</div>
							<div class="setting-item">
								<label>
									<input v-model="notificationSettings.paymentReminders" type="checkbox">
									{{ $t('mansion.settings.paymentReminders') }}
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
								<h3>{{ $t('mansion.residents.edit') }}</h3>
								<button class="modal-close" @click="showEditModal = false">✕</button>
							</div>
							<form class="modal-body" @submit.prevent="saveResident">
								<div class="form-group">
									<label>{{ $t('mansion.residents.name') }}</label>
									<input v-model="editingResident.name" type="text" required>
								</div>
								<div class="form-group">
									<label>{{ $t('mansion.residents.unit') }}</label>
									<input v-model="editingResident.unit" type="text" required>
								</div>
								<div class="form-group">
									<label>{{ $t('mansion.residents.email') }}</label>
									<input v-model="editingResident.email" type="email" required>
								</div>
								<div class="form-group">
									<label>{{ $t('mansion.residents.phone') }}</label>
									<input v-model="editingResident.phone" type="tel" required>
								</div>
								<div class="modal-actions">
									<KButton type="button" variant="secondary" @click="showEditModal = false">
										{{ $t('common.cancel') }}
									</KButton>
									<KButton type="submit" variant="primary">
										{{ $t('common.save') }}
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
								<h3>{{ $t('mansion.announcements.new') }}</h3>
								<button class="modal-close" @click="showAnnouncementModal = false">✕</button>
							</div>
							<form class="modal-body" @submit.prevent="createAnnouncement">
								<div class="form-group">
									<label>{{ $t('mansion.announcements.title') }}</label>
									<input v-model="newAnnouncement.title" type="text" required>
								</div>
								<div class="form-group">
									<label>{{ $t('mansion.announcements.category') }}</label>
									<select v-model="newAnnouncement.category" required>
										<option value="general">{{ $t('mansion.announcements.general') }}</option>
										<option value="maintenance">{{ $t('mansion.announcements.maintenance') }}</option>
										<option value="event">{{ $t('mansion.announcements.event') }}</option>
										<option value="urgent">{{ $t('mansion.announcements.urgent') }}</option>
									</select>
								</div>
								<div class="form-group">
									<label>{{ $t('mansion.announcements.content') }}</label>
									<textarea v-model="newAnnouncement.content" rows="5" required />
								</div>
								<div class="modal-actions">
									<KButton type="button" variant="secondary" @click="showAnnouncementModal = false">
										{{ $t('common.cancel') }}
									</KButton>
									<KButton type="submit" variant="primary">
										{{ $t('mansion.announcements.post') }}
									</KButton>
								</div>
							</form>
						</div>
					</div>
				</transition>
			</main>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getCurrentInstance } from 'vue'

import KButton from '../components/core/KButton.vue'
import KCard from '../components/core/KCard.vue'
import SectionHeader from '../components/dashboard/SectionHeader.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import KagiLogo from '../components/KagiLogo.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
// Stores
import * as store from '../store'

const instance = getCurrentInstance()
const router = instance.proxy.$router

// Computed properties for store
const user = computed( () => store.user.value )

// Building Information
const buildingName = ref( 'Sakura Tower' )

// Navigation
const activeSection = ref( 'overview' )
const showMobileMenu = ref( false )

// Menu items for sidebar
const menuItems = ref( [
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
] )

const navigateToSection = ( section ) => {
	activeSection.value = section
}

const handleLogout = async () => {
	await store.logout()
	router.push( '/login' )
}

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

.dashboard
	min-height 100vh
	display flex
	flex-direction column
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	box-sizing border-box

// Global box-sizing fix
*, *::before, *::after
	box-sizing border-box

.header
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	box-shadow 0 4px 20px rgba(255, 193, 7, 0.15)
	position sticky
	top 0
	z-index 100

.header-content
	max-width 1400px
	margin 0 auto
	padding 1rem 2rem
	display flex
	justify-content space-between
	align-items center

.header-left
	display flex
	align-items center
	gap 1rem
	
	h1
		font-size 1.5rem
		color #333
		margin 0

.header-right
	display flex
	align-items center
	gap 1rem

.user-badge
	padding 0.5rem 1rem
	background #FFC107
	color white
	border-radius 50px
	font-size 0.9rem
	font-weight 600

.user-menu-btn
	display flex
	align-items center
	gap 0.5rem
	padding 0.6rem 1.2rem
	background white
	color #333
	border 2px solid rgba(255, 193, 7, 0.3)
	border-radius 50px
	cursor pointer
	transition all 0.3s ease
	box-shadow 0 2px 10px rgba(255, 193, 7, 0.1)
	font-size 0.95rem
	
	.user-email
		font-weight 500
		max-width 200px
		overflow hidden
		text-overflow ellipsis
		white-space nowrap
		
		@media (max-width: 480px)
			max-width 120px
			font-size 0.9rem
	
	.menu-arrow
		font-size 0.7rem
		transition transform 0.3s ease
	
	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		border-color #FFC107
		box-shadow 0 4px 15px rgba(255, 193, 7, 0.25)
	
	&.active
		.menu-arrow
			transform rotate(180deg)

// Mobile Settings Menu
.mobile-settings-menu
	position fixed
	top 0
	right 0
	width 280px
	height 100vh
	background white
	box-shadow -2px 0 10px rgba(0, 0, 0, 0.15)
	z-index 1000
	display flex
	flex-direction column

.mobile-menu-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-bottom 2px solid #FFC107
	
	h3
		margin 0
		color #333

.close-menu-btn
	background none
	border none
	font-size 1.5rem
	color #666
	cursor pointer
	padding 0
	width 30px
	height 30px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	transition all 0.2s ease
	
	&:hover
		background rgba(0, 0, 0, 0.1)
		color #333

.mobile-menu-content
	flex 1
	padding 1.5rem
	display flex
	flex-direction column
	gap 1.5rem

.mobile-user-info
	background #f9f9f9
	padding 1rem
	border-radius 10px
	
	.user-email
		font-weight 600
		color #333
		margin-bottom 0.5rem
		word-break break-all
	
	.user-role
		font-size 0.9rem
		color #666
		text-transform capitalize

.mobile-lang-section
	padding 1rem 0
	border-top 1px solid #e0e0e0
	border-bottom 1px solid #e0e0e0

.mobile-logout-btn
	width 100%
	padding 1rem
	background white
	color #666
	border 2px solid #e0e0e0
	border-radius 50px
	font-size 1rem
	font-weight 500
	cursor pointer
	transition all 0.3s ease
	margin-top auto
	
	&:hover
		background #f5f5f5
		border-color #999
		color #333

// Slide animation for mobile menu
.slide-enter-active, .slide-leave-active
	transition transform 0.3s ease

.slide-enter-from, .slide-leave-to
	transform translateX(100%)

.dashboard-content
	display flex
	flex 1
	max-width 1400px
	margin 0 auto
	width 100%
	gap 2rem
	padding 2rem
	
	@media (max-width: 768px)
		padding 1rem
		gap 1rem
	
	@media (max-width: 550px)
		padding 0.5rem
		gap 0.5rem

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

// Mobile menu - hidden on desktop
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

// Mobile navigation items
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

.main-content
	flex 1
	background white
	border-radius 20px
	padding 2rem
	box-shadow 0 8px 25px rgba(255, 193, 7, 0.08)
	border 1px solid rgba(255, 193, 7, 0.15)
	overflow-x hidden
	
	@media (max-width: 768px)
		padding 1.5rem
		border-radius 15px
	
	@media (max-width: 550px)
		padding 1rem
		border-radius 10px

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

// Actions grid - Quick Actions buttons
.actions-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
	gap 1rem
	
	// Make KCard components look like clickable buttons
	:deep(.k-card)
		background white
		border 2px solid rgba(255, 193, 7, 0.2)
		border-radius 15px
		padding 1.5rem
		cursor pointer
		transition all 0.3s ease
		box-shadow 0 2px 8px rgba(0, 0, 0, 0.05)
		text-align center
		
		&:hover
			background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
			border-color #FFC107
			transform translateY(-3px)
			box-shadow 0 6px 20px rgba(255, 193, 7, 0.25)
		
		.k-card-header
			padding 0
			border-bottom none
			
			.k-card-icon
				font-size 2rem
				margin-bottom 0.5rem
			
			.k-card-title
				font-size 1rem
				font-weight 600
				color #333

// Residents grid
.residents-grid, .services-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
	gap 1.5rem
	
	// Style KCard components in residents/services grid
	:deep(.k-card)
		background white
		border 2px solid rgba(255, 193, 7, 0.15)
		border-radius 15px
		padding 1.5rem
		box-shadow 0 3px 10px rgba(0, 0, 0, 0.08)
		transition all 0.3s ease
		
		&:hover
			border-color rgba(255, 193, 7, 0.3)
			box-shadow 0 5px 15px rgba(255, 193, 7, 0.15)
			transform translateY(-2px)
		
		.k-card-header
			padding 0 0 1rem 0
			border-bottom 1px solid #f0f0f0
			margin-bottom 1rem
			
			.k-card-title
				font-size 1.1rem
				font-weight 600
				color #333
		
		.k-card-footer
			padding-top 1rem
			margin-top 1rem
			border-top 1px solid #f0f0f0

.resident-details, .service-details
	p
		margin 0.5rem 0
		color #666
		font-size 0.95rem

.resident-actions, .service-actions
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
	
	// Style KCard components in maintenance list
	:deep(.k-card)
		background white
		border 2px solid rgba(255, 193, 7, 0.15)
		border-radius 15px
		padding 1.5rem
		box-shadow 0 3px 10px rgba(0, 0, 0, 0.08)
		transition all 0.3s ease
		
		&:hover
			border-color rgba(255, 193, 7, 0.3)
			box-shadow 0 5px 15px rgba(255, 193, 7, 0.15)
			transform translateY(-2px)
		
		.k-card-header
			padding 0
			border-bottom none
			
			.k-card-title
				font-size 1.05rem
				font-weight 600
				color #333
		
		.k-card-footer
			padding-top 1rem
			margin-top 1rem
			border-top 1px solid #f0f0f0

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
	
	// Style KCard components in announcements list
	:deep(.k-card)
		background white
		border 2px solid rgba(255, 193, 7, 0.15)
		border-radius 15px
		padding 1.5rem
		box-shadow 0 3px 10px rgba(0, 0, 0, 0.08)
		transition all 0.3s ease
		
		&:hover
			border-color rgba(255, 193, 7, 0.3)
			box-shadow 0 5px 15px rgba(255, 193, 7, 0.15)
			transform translateY(-2px)
		
		.k-card-header
			padding 0 0 1rem 0
			border-bottom 1px solid #f0f0f0
			margin-bottom 1rem
			
			.k-card-title
				font-size 1.1rem
				font-weight 600
				color #333
		
		.k-card-footer
			padding-top 1rem
			margin-top 1rem
			border-top 1px solid #f0f0f0

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
	
	// Style KCard components in documents grid
	:deep(.k-card)
		background white
		border 2px solid rgba(255, 193, 7, 0.15)
		border-radius 15px
		padding 1.5rem
		box-shadow 0 3px 10px rgba(0, 0, 0, 0.08)
		transition all 0.3s ease
		
		&:hover
			border-color rgba(255, 193, 7, 0.3)
			box-shadow 0 5px 15px rgba(255, 193, 7, 0.15)
			transform translateY(-2px)
		
		.k-card-header
			padding 0 0 1rem 0
			border-bottom 1px solid #f0f0f0
			margin-bottom 1rem
			
			.k-card-icon
				font-size 1.5rem
				margin-bottom 0.5rem
			
			.k-card-title
				font-size 1.05rem
				font-weight 600
				color #333
		
		.k-card-footer
			padding-top 1rem
			margin-top 1rem
			border-top 1px solid #f0f0f0

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
	
	// Style KCard components in reports grid
	:deep(.k-card)
		background white
		border 2px solid rgba(255, 193, 7, 0.15)
		border-radius 15px
		padding 1.5rem
		box-shadow 0 3px 10px rgba(0, 0, 0, 0.08)
		transition all 0.3s ease
		cursor pointer
		
		&:hover
			border-color rgba(255, 193, 7, 0.3)
			box-shadow 0 5px 15px rgba(255, 193, 7, 0.15)
			transform translateY(-2px)
			background linear-gradient(135deg, #FFFBF0 0%, #FFF9E6 100%)
		
		.k-card-header
			padding 0
			border-bottom none
			text-align center
			
			.k-card-icon
				font-size 2.5rem
				margin-bottom 0.75rem
			
			.k-card-title
				font-size 1.1rem
				font-weight 600
				color #333
				margin-bottom 0.5rem
		
		.k-card-body
			text-align center
			color #666
			font-size 0.95rem

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