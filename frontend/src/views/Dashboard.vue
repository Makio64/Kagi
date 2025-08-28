<template>
	<div class="dashboard">
		<header class="header">
			<div class="header-content">
				<div class="header-left" style="cursor: pointer;" @click="navigateToSection('home')">
					<KagiLogo :size="40" />
					<h1>Kagi</h1>
				</div>
				<div class="header-right">
					<button class="user-menu-btn" @click="showMobileMenu = !showMobileMenu">
						<span class="user-email">{{ authStore.user?.email }}</span>
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
						<div class="user-email">{{ authStore.user?.email }}</div>
						<div class="user-role">{{ authStore.user?.role }}</div>
					</div>
					<div class="mobile-lang-section">
						<LanguageSwitcher />
					</div>
					<button class="mobile-logout-btn" @click="logout">
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
				<!-- Home Section -->
				<section v-if="activeSection === 'home'" class="section">
					<div class="home-welcome">
						<h2 class="welcome-title">{{ $t('dashboard.welcome') }}</h2>
						<p class="welcome-subtitle">{{ $t('dashboard.welcomeSubtitle') }}</p>
					</div>
					<div class="services-grid">
						<button
							v-for="item in menuItems.filter(m => m.id !== 'home')"
							:key="item.id"
							class="service-card"
							@click="navigateToSection(item.id)"
						>
							<div class="service-icon">{{ item.icon }}</div>
							<h3 class="service-name">{{ item.label }}</h3>
							<p class="service-description">{{ getServiceDescription(item.id) }}</p>
						</button>
					</div>
				</section>

				<!-- Contact Section -->
				<section v-if="activeSection === 'contact'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">📱</span> {{ $t('dashboard.contact.title') }}</h2>
					</div>
					<div class="cards-grid">
						<DashboardCard
							icon="🤖"
							:title="$t('dashboard.contact.ai.title')"
							:description="$t('dashboard.contact.ai.description')"
							clickable
							:actions="[{ text: $t('dashboard.contact.ai.button'), class: 'booking', handler: startAIChat }]"
							@click="startAIChat"
						/>
						<DashboardCard
							icon="👤"
							:title="$t('dashboard.contact.manager.title')"
							:description="$t('dashboard.contact.manager.description')"
							clickable
							:actions="[{ text: $t('dashboard.contact.manager.button'), class: 'booking', handler: contactManager }]"
							@click="contactManager"
						/>
						<DashboardCard
							icon="⚠️"
							:title="$t('dashboard.contact.emergency.title')"
							:description="$t('dashboard.contact.emergency.description')"
							clickable
							:actions="[{ text: $t('dashboard.contact.emergency.button'), class: 'danger', handler: viewEmergency }]"
							:badge="{ text: 'URGENT', class: 'danger' }"
							@click="viewEmergency"
						/>
					</div>
				</section>

				<!-- Documents Section -->
				<section v-if="activeSection === 'documents'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">📄</span> {{ $t('dashboard.documents.title') }}</h2>
					</div>
					<div class="cards-grid">
						<DashboardCard
							icon="📋"
							:title="$t('dashboard.documents.managementRules')"
							:info="`${$t('dashboard.documents.lastUpdated')}: 2024/01`"
							clickable
							:actions="[{ text: $t('dashboard.documents.view'), class: 'booking', handler: () => viewDocument('management') }]"
							@click="viewDocument('management')"
						/>
						<DashboardCard
							icon="🏢"
							:title="$t('dashboard.documents.facilityRules')"
							:info="`${$t('dashboard.documents.lastUpdated')}: 2024/03`"
							clickable
							:actions="[{ text: $t('dashboard.documents.view'), class: 'booking', handler: () => viewDocument('facility') }]"
							@click="viewDocument('facility')"
						/>
						<DashboardCard
							icon="🚗"
							:title="$t('dashboard.documents.parkingRules')"
							:info="`${$t('dashboard.documents.lastUpdated')}: 2023/12`"
							clickable
							:actions="[{ text: $t('dashboard.documents.view'), class: 'booking', handler: () => viewDocument('parking') }]"
							@click="viewDocument('parking')"
						/>
					</div>
				</section>

				<!-- Booking Section -->
				<section v-if="activeSection === 'booking'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">📅</span> {{ $t('dashboard.booking.title') }}</h2>
					</div>
					<div class="cards-grid">
						<DashboardCard
							image="🎉"
							:title="$t('dashboard.booking.partyRoom')"
							:info="`${$t('dashboard.booking.capacity')}: 20 ${$t('dashboard.booking.people')} | ${$t('dashboard.booking.price')}: ¥2,000${$t('dashboard.booking.perHour')}`"
							clickable
							:actions="[{ text: $t('dashboard.booking.book'), class: 'booking', handler: () => bookFacility('party') }]"
							@click="bookFacility('party')"
						/>
						<DashboardCard
							image="🛏️"
							:title="$t('dashboard.booking.guestRoom')"
							:info="`${$t('dashboard.booking.capacity')}: 2 ${$t('dashboard.booking.people')} | ${$t('dashboard.booking.price')}: ¥5,000${$t('dashboard.booking.perNight')}`"
							clickable
							:actions="[{ text: $t('dashboard.booking.book'), class: 'booking', handler: () => bookFacility('guest') }]"
							@click="bookFacility('guest')"
						/>
						<DashboardCard
							image="💪"
							:title="$t('dashboard.booking.gym')"
							:info="`${$t('dashboard.booking.capacity')}: 10 ${$t('dashboard.booking.people')} | ${$t('dashboard.booking.price')}: ${$t('dashboard.booking.free')}`"
							clickable
							:actions="[{ text: $t('dashboard.booking.book'), class: 'booking', handler: () => bookFacility('gym') }]"
							@click="bookFacility('gym')"
						/>
					</div>
				</section>

				<!-- Maintenance Section -->
				<section v-if="activeSection === 'maintenance'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">🔧</span> {{ $t('dashboard.maintenance.title') }}</h2>
					</div>

					<!-- Category Selection -->
					<div v-if="!selectedMaintenanceCategory" class="cards-grid">
						<DashboardCard
							icon="🚿"
							:title="$t('dashboard.maintenance.plumbing')"
							description="Leaks, clogs, water pressure issues"
							clickable
							@click="selectMaintenanceCategory('plumbing')"
						/>
						<DashboardCard
							icon="⚡"
							:title="$t('dashboard.maintenance.electrical')"
							description="Power outlets, lighting, circuit issues"
							clickable
							@click="selectMaintenanceCategory('electrical')"
						/>
						<DashboardCard
							icon="❄️"
							:title="$t('dashboard.maintenance.aircon')"
							description="Temperature, noise, maintenance"
							clickable
							@click="selectMaintenanceCategory('aircon')"
						/>
						<DashboardCard
							icon="🔨"
							:title="$t('dashboard.maintenance.other')"
							description="Other maintenance issues"
							clickable
							@click="selectMaintenanceCategory('other')"
						/>
					</div>

					<!-- Maintenance Form -->
					<div v-else class="maintenance-form-container">
						<button class="back-btn" @click="selectedMaintenanceCategory = null">
							← Back to categories
						</button>
						<div class="maintenance-form">
							<form @submit.prevent="submitMaintenance">
								<div class="selected-category">
									<span class="category-icon">{{ getCategoryIcon(selectedMaintenanceCategory) }}</span>
									<h3>{{ getCategoryName(selectedMaintenanceCategory) }}</h3>
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.maintenance.subject') }}</label>
									<input v-model="maintenanceForm.title" type="text" :placeholder="$t('dashboard.maintenance.subjectPlaceholder')">
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.maintenance.details') }}</label>
									<textarea v-model="maintenanceForm.description" rows="4" :placeholder="$t('dashboard.maintenance.detailsPlaceholder')" />
								</div>
								<button type="submit" class="submit-btn">{{ $t('dashboard.maintenance.submit') }}</button>
							</form>
						</div>
					</div>
				</section>

				<!-- Events Section -->
				<section v-if="activeSection === 'events'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">📢</span> {{ $t('dashboard.events.title') }}</h2>
					</div>
					<div class="events-list">
						<div class="event-card">
							<div class="event-date">
								<div class="date-month">12</div>
								<div class="date-day">25</div>
							</div>
							<div class="event-content">
								<h3>{{ $t('dashboard.events.christmasParty.title') }}</h3>
								<p>{{ $t('dashboard.events.christmasParty.description') }}</p>
							</div>
						</div>
						<div class="event-card">
							<div class="event-date">
								<div class="date-month">01</div>
								<div class="date-day">10</div>
							</div>
							<div class="event-content">
								<h3>{{ $t('dashboard.events.fireDrill.title') }}</h3>
								<p>{{ $t('dashboard.events.fireDrill.description') }}</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Bills Section -->
				<section v-if="activeSection === 'bills'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">💳</span> {{ $t('dashboard.bills.title') }}</h2>
					</div>
					<div class="bills-list">
						<div class="bill-card">
							<div class="bill-header">
								<h3>{{ $t('dashboard.bills.managementFee') }}</h3>
								<span class="bill-amount">¥25,000</span>
							</div>
							<p>{{ $t('dashboard.bills.dueDate') }}: 2024/12/31</p>
							<div class="bill-actions">
								<button class="details-btn">{{ $t('dashboard.bills.details') }}</button>
								<button class="pay-btn-primary">{{ $t('dashboard.bills.payNow') }}</button>
							</div>
						</div>
						<div class="bill-card paid">
							<div class="bill-header">
								<h3>{{ $t('dashboard.bills.repairFund') }}</h3>
								<span class="bill-amount">¥10,000</span>
							</div>
							<p>{{ $t('dashboard.bills.paidDate') }}: 2024/11/30</p>
							<div class="bill-status">{{ $t('dashboard.bills.paid') }}</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getCurrentInstance } from 'vue'

import DashboardCard from '../components/DashboardCard.vue'
import KagiLogo from '../components/KagiLogo.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { useAuthStore } from '../stores/auth'

// Accept route-params as prop (passed by TinyRouter)
const props = defineProps( {
	routeParams: {
		type: Object,
		default: () => ( {} )
	}
} )

const authStore = useAuthStore()
const instance = getCurrentInstance()
const router = instance.proxy.$router

// Use computed to make activeSection reactive to route params
const activeSection = computed( () => {
	return props.routeParams?.section || 'home'
} )

// Mobile menu state
const showMobileMenu = ref( false )

const menuItems = computed( () => [
	// { id: 'home', icon: '🏠', label: instance.proxy.$t( 'nav.home' ) },
	{ id: 'contact', icon: '📱', label: instance.proxy.$t( 'dashboard.menu.contact' ) },
	{ id: 'documents', icon: '📄', label: instance.proxy.$t( 'dashboard.menu.documents' ) },
	{ id: 'booking', icon: '📅', label: instance.proxy.$t( 'dashboard.menu.booking' ) },
	{ id: 'maintenance', icon: '🔧', label: instance.proxy.$t( 'dashboard.menu.maintenance' ) },
	{ id: 'events', icon: '📢', label: instance.proxy.$t( 'dashboard.menu.events' ) },
	{ id: 'bills', icon: '💳', label: instance.proxy.$t( 'dashboard.menu.bills' ) }
] )

const maintenanceForm = reactive( {
	category: '',
	title: '',
	description: ''
} )

const selectedMaintenanceCategory = ref( null )

const logout = async () => {
	await authStore.logout()
	router.push( '/' )
}

const submitMaintenance = () => {
	maintenanceForm.category = selectedMaintenanceCategory.value
	console.log( 'Maintenance request:', maintenanceForm )
	// API call would go here
	alert( instance.proxy.$t( 'dashboard.maintenance.submit' ) )
	// Reset form
	selectedMaintenanceCategory.value = null
	maintenanceForm.title = ''
	maintenanceForm.description = ''
}

// Contact actions
const startAIChat = () => {
	console.log( 'Starting AI chat...' )
	// Implement AI chat
}

const contactManager = () => {
	console.log( 'Contacting manager...' )
	// Implement manager contact
}

const viewEmergency = () => {
	console.log( 'Viewing emergency contacts...' )
	// Show emergency contacts
}

// Document actions
const viewDocument = ( type ) => {
	console.log( 'Viewing document:', type )
	// Implement document viewer
}

// Booking actions
const bookFacility = ( facility ) => {
	console.log( 'Booking facility:', facility )
	// Implement booking
}

// Maintenance helpers
const selectMaintenanceCategory = ( category ) => {
	selectedMaintenanceCategory.value = category
}

const getCategoryIcon = ( category ) => {
	const icons = {
		plumbing: '🚿',
		electrical: '⚡',
		aircon: '❄️',
		other: '🔨'
	}
	return icons[category] || '🔧'
}

const getCategoryName = ( category ) => {
	return instance.proxy.$t( `dashboard.maintenance.${category}` )
}

// Navigation helper
const navigateToSection = ( section ) => {
	if ( section === 'home' ) {
		router.push( '/dashboard' )
	} else {
		router.push( `/dashboard/${section}` )
	}
}

const getServiceDescription = ( serviceId ) => {
	const descriptions = {
		contact: instance.proxy.$t( 'home.features.communication.description' ),
		documents: instance.proxy.$t( 'home.features.documents.description' ),
		booking: instance.proxy.$t( 'home.features.booking.description' ),
		maintenance: instance.proxy.$t( 'home.features.maintenance.description' ),
		events: instance.proxy.$t( 'home.features.events.description' ),
		bills: instance.proxy.$t( 'home.features.bills.description' )
	}
	return descriptions[serviceId] || ''
}

// Check authentication on mount
onMounted( () => {
	if ( !authStore.isAuthenticated ) {
		router.push( '/login' )
	}
} )

// Toggle mobile menu when clicking user button
watch( showMobileMenu, ( newVal ) => {
	const userBtn = document.querySelector( '.user-menu-btn' )
	if ( userBtn ) {
		if ( newVal ) {
			userBtn.classList.add( 'active' )
		} else {
			userBtn.classList.remove( 'active' )
		}
	}
} )
</script>

<style lang="stylus" scoped>
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
		gap 0.3rem

	&:hover
		.nav-icon-circle
			background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
			transform scale(1.08)
			border-color #FFC107

	&.active
		.nav-icon-circle
			background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
			border-color #FFC107
			box-shadow 0 4px 15px rgba(255, 193, 7, 0.4)

		.nav-label-mobile
			color #333
			font-weight 600

.nav-icon-circle
	width 50px
	height 50px
	border-radius 50%
	background white
	border 2px solid rgba(255, 193, 7, 0.3)
	display flex
	align-items center
	justify-content center
	transition all 0.2s ease
	box-shadow 0 3px 12px rgba(255, 193, 7, 0.1)

	@media (max-width: 550px)
		width 45px
		height 45px
		border-width 1.5px

	.nav-icon
		font-size 1.5rem

		@media (max-width: 550px)
			font-size 1.3rem

.nav-label-mobile
	font-size 0.7rem
	color #666
	text-align center
	white-space nowrap
	transition color 0.2s ease
	max-width 70px
	overflow hidden
	text-overflow ellipsis

	@media (max-width: 550px)
		font-size 0.65rem
		max-width 60px

.main-content
	flex 1
	background white
	border-radius 20px
	padding 2rem
	// box-shadow 0 8px 25px rgba(255, 193, 7, 0.08)
	// border 1px solid rgba(255, 193, 7, 0.1)

.section-header
	background linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)
	margin -2rem -2rem 2rem -2rem
	padding 1.5rem 2rem
	border-radius 20px 20px 0 0

	@media (max-width: 768px)
		margin -1rem -1rem 1.5rem -1rem
		padding 1.2rem 1rem

	@media (max-width: 550px)
		margin -0.75rem -0.75rem 1rem -0.75rem
		padding 1rem 0.75rem

.section-title
	font-size 1.8rem
	margin 0
	color #333
	font-weight 700
	display flex
	align-items center
	gap 0.5rem

	.section-icon
		// background white
		border-radius 50%
		width 45px
		height 45px
		display inline-flex
		align-items center
		justify-content center
		// box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)

	@media (max-width: 550px)
		font-size 1.5rem
		.section-icon
			width 40px
			height 40px

// Home section styles
.home-welcome
	text-align center
	margin-bottom 3rem

	.welcome-title
		font-size 2rem
		color #333
		margin-bottom 0.5rem
		font-weight 600

	.welcome-subtitle
		color #666
		font-size 1.1rem

.services-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
	gap 1.5rem
	margin-bottom 2rem

	@media (max-width: 768px)
		grid-template-columns repeat(auto-fill, minmax(150px, 1fr))
		gap 1rem

.service-card
	background white
	border 2px solid rgba(255, 193, 7, 0.2)
	border-radius 20px
	padding 2rem 1.5rem
	text-align center
	cursor pointer
	transition all 0.3s ease
	box-shadow 0 4px 12px rgba(255, 193, 7, 0.08)

	&:hover
		transform translateY(-5px)
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.2)
		border-color #FFC107
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

	.service-icon
		font-size 3rem
		margin-bottom 1rem
		background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
		-webkit-background-clip text
		-webkit-text-fill-color transparent
		background-clip text

	.service-name
		font-size 1.2rem
		color #333
		margin-bottom 0.5rem
		font-weight 600

	.service-description
		font-size 0.85rem
		color #666
		line-height 1.4

// Generic card grid
.cards-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(280px, 1fr))
	gap 1.5rem
	width 100%

	@media (max-width: 768px)
		grid-template-columns 1fr
		gap 1rem

.contact-card
	background #f9f9f9
	padding 2rem
	border-radius 10px
	text-align center

	h3
		margin-bottom 1rem
		color #333

	p
		color #666
		margin-bottom 1.5rem

	&.emergency
		background #FFF3E0
		border 2px solid #FF6F00

.action-btn
	padding 0.85rem 2rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	border none
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.3s ease
	box-shadow 0 4px 15px rgba(255, 193, 7, 0.25)

	&:hover
		background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
		transform translateY(-2px)
		box-shadow 0 6px 20px rgba(255, 193, 7, 0.35)

	&.emergency-btn
		background linear-gradient(135deg, #FF6F00 0%, #FF5722 100%)
		color white

		&:hover
			background linear-gradient(135deg, #FF5722 0%, #F4511E 100%)
			box-shadow 0 6px 20px rgba(255, 87, 34, 0.35)

// Documents Section
.documents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(250px, 1fr))
	gap 1.5rem

.document-card
	background #f9f9f9
	padding 2rem
	border-radius 10px
	text-align center
	transition all 0.3s ease

	&:hover
		transform translateY(-5px)
		box-shadow 0 10px 20px rgba(0,0,0,0.1)

	.doc-icon
		font-size 3rem
		margin-bottom 1rem

	h3
		color #333
		margin-bottom 0.5rem

	p
		color #666
		font-size 0.9rem
		margin-bottom 1rem

.view-btn
	padding 0.6rem 1.75rem
	background white
	color #333
	border 2px solid #FFC107
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.3s ease
	box-shadow 0 2px 8px rgba(255, 193, 7, 0.15)

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateY(-2px)
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.25)
		border-color #FFB300

// Booking Section
.booking-facilities
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap 2rem

.facility-card
	border-radius 10px
	overflow hidden
	box-shadow 0 5px 15px rgba(0,0,0,0.1)
	transition all 0.3s ease

	&:hover
		transform translateY(-5px)
		box-shadow 0 10px 25px rgba(0,0,0,0.15)

	.facility-image
		width 100%
		height 200px
		object-fit cover

	.facility-image-placeholder
		width 100%
		height 200px
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		display flex
		align-items center
		justify-content center

		.placeholder-icon
			font-size 4rem

	h3
		padding 1rem 1rem 0.5rem
		color #333

	.facility-info
		padding 0 1rem
		color #666
		font-size 0.9rem

.book-btn
	width calc(100% - 2rem)
	margin 1rem
	padding 0.85rem
	background white
	color #333
	border 2px solid #FFC107
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.3s ease
	box-shadow 0 3px 12px rgba(255, 193, 7, 0.15)

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateY(-2px)
		box-shadow 0 5px 18px rgba(255, 193, 7, 0.25)
		border-color #FFB300

// Maintenance Form
.maintenance-form-container
	max-width 600px
	margin 0 auto

.back-btn
	margin-bottom 1rem
	padding 0.6rem 1.25rem
	background white
	color #666
	border 2px solid rgba(255, 193, 7, 0.3)
	border-radius 50px
	cursor pointer
	font-size 0.9rem
	transition all 0.2s ease
	font-weight 500
	box-shadow 0 2px 8px rgba(255, 193, 7, 0.1)

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateX(-3px)
		border-color #FFC107
		color #333
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.2)

.selected-category
	display flex
	align-items center
	gap 1rem
	margin-bottom 1.5rem
	padding 1rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-radius 10px

	.category-icon
		font-size 2rem

	h3
		margin 0
		color #333

.maintenance-form
	max-width 100%
	padding 1.5rem
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	border-radius 20px
	border 1px solid rgba(255, 193, 7, 0.1)
	box-shadow 0 4px 15px rgba(255, 193, 7, 0.08)

	.form-group
		margin-bottom 1.5rem

		label
			display block
			font-weight 600
			color #333
			margin-bottom 0.5rem

		input, select, textarea
			width 100%
			max-width 100%
			padding 0.75rem
			border 2px solid rgba(255, 193, 7, 0.2)
			border-radius 12px
			font-size 1rem
			transition all 0.3s ease
			box-sizing border-box
			background rgba(255, 255, 255, 0.8)

			&:focus
				outline none
				border-color #FFC107
				box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)
				background white

.submit-btn
	padding 1rem 3rem
	background linear-gradient(135deg, #4CAF50 0%, #45A049 100%)
	color white
	border none
	border-radius 50px
	font-size 1.1rem
	font-weight 600
	cursor pointer
	transition all 0.3s ease
	box-shadow 0 4px 15px rgba(76, 175, 80, 0.25)

	&:hover
		background linear-gradient(135deg, #45A049 0%, #388E3C 100%)
		transform translateY(-2px)
		box-shadow 0 6px 20px rgba(76, 175, 80, 0.35)

// Events Section
.events-list
	display flex
	flex-direction column
	gap 1.5rem

.event-card
	display flex
	gap 2rem
	padding 1.5rem
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	border-radius 15px
	transition all 0.3s ease
	border 1px solid rgba(255, 193, 7, 0.1)

	&:hover
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.15)
		transform translateY(-2px)
		border-color rgba(255, 193, 7, 0.25)

	.event-date
		text-align center
		background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
		border-radius 15px
		padding 1rem
		min-width 80px
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.2)

		.date-month
			font-size 0.9rem
			color #333

		.date-day
			font-size 2rem
			font-weight bold
			color #333

	.event-content
		flex 1

		h3
			color #333
			margin-bottom 0.5rem

		p
			color #666
			line-height 1.6

// Bills Section
.bills-list
	display flex
	flex-direction column
	gap 1.5rem

.bill-card
	padding 1.5rem
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	border-radius 15px
	transition all 0.3s ease
	border 1px solid rgba(255, 193, 7, 0.1)

	&:hover
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.15)
		transform translateY(-2px)
		border-color rgba(255, 193, 7, 0.25)

	&.paid
		background linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)
		border-color rgba(76, 175, 80, 0.2)

	.bill-header
		display flex
		justify-content space-between
		align-items center
		margin-bottom 1rem

		h3
			color #333

		.bill-amount
			font-size 1.5rem
			font-weight bold
			color #333

	p
		color #666
		margin-bottom 1rem

	.bill-actions
		display flex
		gap 1rem

	.bill-status
		color #4CAF50
		font-weight 600

.details-btn
	padding 0.6rem 1.5rem
	background white
	color #666
	border 2px solid #e0e0e0
	border-radius 50px
	cursor pointer
	font-weight 500
	transition all 0.3s ease
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.05)

	&:hover
		background #f5f5f5
		border-color #999
		color #333
		transform translateY(-1px)
		box-shadow 0 3px 10px rgba(0, 0, 0, 0.1)

.pay-btn-primary
	padding 0.6rem 1.75rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	border none
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.3s ease
	box-shadow 0 4px 15px rgba(255, 193, 7, 0.25)

	&:hover
		background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
		transform translateY(-2px)
		box-shadow 0 6px 20px rgba(255, 193, 7, 0.35)

@media (max-width: 768px)
	.dashboard-content
		flex-direction column

	.sidebar
		width 100%
		position static
	.header-content
		flex-direction row
		justify-content space-between
		padding 1rem

	.main-content
		padding 1rem

@media (max-width: 550px)
	.header-content
		padding 0.75rem

	.main-content
		padding 0.75rem

	.section-title
		font-size 1.5rem
		margin-bottom 1rem

	.maintenance-form-container
		padding 0

	.maintenance-form
		padding 1rem
</style>
