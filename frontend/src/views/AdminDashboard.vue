<template>
	<div class="admin-dashboard">
		<header class="header">
			<div class="header-content">
				<div class="header-left" style="cursor: pointer;" @click="navigateToSection('overview')">
					<KagiLogo :size="40" />
					<h1>Kagi Admin</h1>
				</div>
				<div class="header-right">
					<span class="admin-badge">{{ $t('admin.role') || 'Administrator' }}</span>
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
			</aside>

			<main class="main-content">
				<!-- Overview Section -->
				<section v-if="activeSection === 'overview'" class="section">
					<div class="section-header">
						<h2 class="section-title">📊 {{ $t('admin.overview.title') || 'Management Overview' }}</h2>
					</div>
					
					<!-- Statistics Cards -->
					<div class="stats-grid">
						<div class="stat-card">
							<span class="stat-icon">🏢</span>
							<div class="stat-content">
								<h3>{{ $t('admin.stats.buildings') || 'Buildings' }}</h3>
								<p class="stat-value">12</p>
								<span class="stat-change positive">+2 this month</span>
							</div>
						</div>
						<div class="stat-card">
							<span class="stat-icon">👥</span>
							<div class="stat-content">
								<h3>{{ $t('admin.stats.residents') || 'Total Residents' }}</h3>
								<p class="stat-value">1,248</p>
								<span class="stat-change positive">+48 this month</span>
							</div>
						</div>
						<div class="stat-card">
							<span class="stat-icon">🔧</span>
							<div class="stat-content">
								<h3>{{ $t('admin.stats.maintenance') || 'Open Requests' }}</h3>
								<p class="stat-value">23</p>
								<span class="stat-change negative">8 urgent</span>
							</div>
						</div>
						<div class="stat-card">
							<span class="stat-icon">💰</span>
							<div class="stat-content">
								<h3>{{ $t('admin.stats.revenue') || 'Monthly Revenue' }}</h3>
								<p class="stat-value">¥12.5M</p>
								<span class="stat-change positive">+12%</span>
							</div>
						</div>
					</div>

					<!-- Recent Activities -->
					<div class="activity-section">
						<h3>🔔 {{ $t('admin.recentActivity') || 'Recent Activity' }}</h3>
						<div class="activity-list">
							<div class="activity-item">
								<span class="activity-icon">🔧</span>
								<div class="activity-content">
									<p>New maintenance request from Unit 502</p>
									<span class="activity-time">5 minutes ago</span>
								</div>
							</div>
							<div class="activity-item">
								<span class="activity-icon">📅</span>
								<div class="activity-content">
									<p>Party Room booked for Dec 25</p>
									<span class="activity-time">1 hour ago</span>
								</div>
							</div>
							<div class="activity-item">
								<span class="activity-icon">💳</span>
								<div class="activity-content">
									<p>15 residents paid management fees</p>
									<span class="activity-time">Today</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- Buildings Management -->
				<section v-if="activeSection === 'buildings'" class="section">
					<div class="section-header">
						<h2 class="section-title">🏢 {{ $t('admin.buildings.title') || 'Buildings Management' }}</h2>
						<button class="add-btn">+ {{ $t('admin.buildings.add') || 'Add Building' }}</button>
					</div>
					
					<div class="buildings-list">
						<div v-for="building in buildings" :key="building.id" class="building-card">
							<div class="building-header">
								<h3>{{ building.name }}</h3>
								<span class="building-status" :class="building.status">{{ building.status }}</span>
							</div>
							<div class="building-info">
								<p><strong>{{ $t('admin.buildings.address') || 'Address' }}:</strong> {{ building.address }}</p>
								<p><strong>{{ $t('admin.buildings.units') || 'Units' }}:</strong> {{ building.units }}</p>
								<p><strong>{{ $t('admin.buildings.occupancy') || 'Occupancy' }}:</strong> {{ building.occupancy }}%</p>
							</div>
							<div class="building-actions">
								<button class="action-btn">{{ $t('common.edit') || 'Edit' }}</button>
								<button class="action-btn">{{ $t('admin.buildings.manage') || 'Manage' }}</button>
								<button class="action-btn danger">{{ $t('common.delete') || 'Delete' }}</button>
							</div>
						</div>
					</div>
				</section>

				<!-- Users Management -->
				<section v-if="activeSection === 'users'" class="section">
					<div class="section-header">
						<h2 class="section-title">👥 {{ $t('admin.users.title') || 'Users Management' }}</h2>
						<div class="header-actions">
							<input type="search" placeholder="Search users..." class="search-input">
							<button class="add-btn">+ {{ $t('admin.users.invite') || 'Invite User' }}</button>
						</div>
					</div>
					
					<div class="users-table">
						<table>
							<thead>
								<tr>
									<th>{{ $t('admin.users.name') || 'Name' }}</th>
									<th>{{ $t('admin.users.email') || 'Email' }}</th>
									<th>{{ $t('admin.users.role') || 'Role' }}</th>
									<th>{{ $t('admin.users.building') || 'Building' }}</th>
									<th>{{ $t('admin.users.status') || 'Status' }}</th>
									<th>{{ $t('admin.users.actions') || 'Actions' }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="user in users" :key="user.id">
									<td>{{ user.name }}</td>
									<td>{{ user.email }}</td>
									<td><span class="role-badge" :class="user.role">{{ user.role }}</span></td>
									<td>{{ user.building }}</td>
									<td><span class="status-badge" :class="user.status">{{ user.status }}</span></td>
									<td>
										<button class="table-action">✏️</button>
										<button class="table-action">🗑️</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>

				<!-- Maintenance Overview -->
				<section v-if="activeSection === 'maintenance'" class="section">
					<div class="section-header">
						<h2 class="section-title">🔧 {{ $t('admin.maintenance.title') || 'Maintenance Overview' }}</h2>
					</div>
					
					<div class="maintenance-stats">
						<div class="status-card urgent">
							<h4>{{ $t('admin.maintenance.urgent') || 'Urgent' }}</h4>
							<p class="count">8</p>
						</div>
						<div class="status-card pending">
							<h4>{{ $t('admin.maintenance.pending') || 'Pending' }}</h4>
							<p class="count">15</p>
						</div>
						<div class="status-card in-progress">
							<h4>{{ $t('admin.maintenance.inProgress') || 'In Progress' }}</h4>
							<p class="count">12</p>
						</div>
						<div class="status-card completed">
							<h4>{{ $t('admin.maintenance.completed') || 'Completed' }}</h4>
							<p class="count">142</p>
						</div>
					</div>

					<div class="requests-list">
						<h3>{{ $t('admin.maintenance.recent') || 'Recent Requests' }}</h3>
						<div v-for="request in maintenanceRequests" :key="request.id" class="request-card">
							<div class="request-header">
								<span class="priority" :class="request.priority">{{ request.priority }}</span>
								<h4>{{ request.title }}</h4>
								<span class="request-time">{{ request.time }}</span>
							</div>
							<p>{{ request.description }}</p>
							<div class="request-footer">
								<span class="request-unit">Unit {{ request.unit }}</span>
								<button class="assign-btn">{{ $t('admin.maintenance.assign') || 'Assign' }}</button>
							</div>
						</div>
					</div>
				</section>

				<!-- Financial Reports -->
				<section v-if="activeSection === 'financial'" class="section">
					<div class="section-header">
						<h2 class="section-title">💰 {{ $t('admin.financial.title') || 'Financial Reports' }}</h2>
						<button class="export-btn">📥 {{ $t('admin.financial.export') || 'Export Report' }}</button>
					</div>
					
					<div class="financial-summary">
						<div class="summary-card">
							<h3>{{ $t('admin.financial.revenue') || 'Total Revenue' }}</h3>
							<p class="amount">¥152,340,000</p>
							<span class="period">This Year</span>
						</div>
						<div class="summary-card">
							<h3>{{ $t('admin.financial.expenses') || 'Total Expenses' }}</h3>
							<p class="amount">¥98,200,000</p>
							<span class="period">This Year</span>
						</div>
						<div class="summary-card profit">
							<h3>{{ $t('admin.financial.profit') || 'Net Profit' }}</h3>
							<p class="amount">¥54,140,000</p>
							<span class="period">This Year</span>
						</div>
					</div>

					<div class="payment-status">
						<h3>{{ $t('admin.financial.paymentStatus') || 'Payment Status by Building' }}</h3>
						<div class="payment-grid">
							<div v-for="building in buildingPayments" :key="building.id" class="payment-card">
								<h4>{{ building.name }}</h4>
								<div class="payment-bar">
									<div class="payment-progress" :style="`width: ${building.percentage}%`" />
								</div>
								<p>{{ building.percentage }}% collected ({{ building.collected }}/{{ building.total }})</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Settings -->
				<section v-if="activeSection === 'settings'" class="section">
					<div class="section-header">
						<h2 class="section-title">⚙️ {{ $t('admin.settings.title') || 'System Settings' }}</h2>
					</div>
					
					<div class="settings-sections">
						<div class="settings-card">
							<h3>🔔 {{ $t('admin.settings.notifications') || 'Notification Settings' }}</h3>
							<div class="setting-item">
								<label>
									<input type="checkbox" checked>
									{{ $t('admin.settings.emailNotifications') || 'Email notifications for urgent requests' }}
								</label>
							</div>
							<div class="setting-item">
								<label>
									<input type="checkbox" checked>
									{{ $t('admin.settings.dailyReports') || 'Daily summary reports' }}
								</label>
							</div>
						</div>

						<div class="settings-card">
							<h3>🔐 {{ $t('admin.settings.security') || 'Security Settings' }}</h3>
							<div class="setting-item">
								<label>{{ $t('admin.settings.twoFactor') || 'Two-factor authentication' }}</label>
								<button class="setting-btn">{{ $t('admin.settings.enable') || 'Enable' }}</button>
							</div>
							<div class="setting-item">
								<label>{{ $t('admin.settings.sessionTimeout') || 'Session timeout' }}</label>
								<select>
									<option>30 minutes</option>
									<option>1 hour</option>
									<option>2 hours</option>
								</select>
							</div>
						</div>

						<div class="settings-card">
							<h3>🎨 {{ $t('admin.settings.appearance') || 'Appearance' }}</h3>
							<div class="setting-item">
								<label>{{ $t('common.language') || 'Language' }}</label>
								<LanguageSwitcher />
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getCurrentInstance } from 'vue'

import KagiLogo from '../components/KagiLogo.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const instance = getCurrentInstance()
const router = instance.proxy.$router

const activeSection = ref( 'overview' )
const showMobileMenu = ref( false )

const menuItems = computed( () => [
	{ id: 'overview', icon: '📊', label: instance.proxy.$t( 'admin.menu.overview' ) || 'Overview' },
	{ id: 'buildings', icon: '🏢', label: instance.proxy.$t( 'admin.menu.buildings' ) || 'Buildings' },
	{ id: 'users', icon: '👥', label: instance.proxy.$t( 'admin.menu.users' ) || 'Users' },
	{ id: 'maintenance', icon: '🔧', label: instance.proxy.$t( 'admin.menu.maintenance' ) || 'Maintenance' },
	{ id: 'financial', icon: '💰', label: instance.proxy.$t( 'admin.menu.financial' ) || 'Financial' },
	{ id: 'settings', icon: '⚙️', label: instance.proxy.$t( 'admin.menu.settings' ) || 'Settings' }
] )

// Sample data
const buildings = ref( [
	{ id: 1, name: 'Sakura Tower', address: 'Shibuya, Tokyo', units: 120, occupancy: 95, status: 'active' },
	{ id: 2, name: 'Maple Heights', address: 'Shinjuku, Tokyo', units: 80, occupancy: 88, status: 'active' },
	{ id: 3, name: 'Ocean View', address: 'Minato, Tokyo', units: 200, occupancy: 92, status: 'active' }
] )

const users = ref( [
	{ id: 1, name: 'Tanaka Yuki', email: 'tanaka@example.com', role: 'resident', building: 'Sakura Tower', status: 'active' },
	{ id: 2, name: 'Sato Kenji', email: 'sato@example.com', role: 'mansion_admin', building: 'Maple Heights', status: 'active' },
	{ id: 3, name: 'Yamada Hana', email: 'yamada@example.com', role: 'resident', building: 'Ocean View', status: 'active' }
] )

const maintenanceRequests = ref( [
	{ id: 1, title: 'Water leak in bathroom', description: 'Urgent: Water dripping from ceiling', unit: '502', priority: 'urgent', time: '10 min ago' },
	{ id: 2, title: 'AC not working', description: 'Air conditioning unit making strange noise', unit: '301', priority: 'high', time: '1 hour ago' },
	{ id: 3, title: 'Door lock issue', description: 'Key card reader not responding', unit: '105', priority: 'medium', time: '3 hours ago' }
] )

const buildingPayments = ref( [
	{ id: 1, name: 'Sakura Tower', percentage: 92, collected: '110', total: '120' },
	{ id: 2, name: 'Maple Heights', percentage: 85, collected: '68', total: '80' },
	{ id: 3, name: 'Ocean View', percentage: 78, collected: '156', total: '200' }
] )

const navigateToSection = ( section ) => {
	activeSection.value = section
	showMobileMenu.value = false
}

const logout = async () => {
	await authStore.logout()
	router.push( '/' )
}
</script>

<style lang="stylus" scoped>
// Base dashboard styles
.admin-dashboard
	min-height 100vh
	display flex
	flex-direction column
	background #f5f5f5

.header
	background white
	box-shadow 0 2px 4px rgba(0, 0, 0, 0.08)
	position sticky
	top 0
	z-index 100

.header-content
	display flex
	justify-content space-between
	align-items center
	padding 1rem 2rem
	max-width 1400px
	margin 0 auto

.header-left
	display flex
	align-items center
	gap 1rem

	h1
		margin 0
		color #333
		font-size 1.5rem

.header-right
	display flex
	align-items center
	gap 1rem

.user-menu-btn
	display flex
	align-items center
	gap 0.5rem
	padding 0.5rem 1rem
	background transparent
	border 1px solid #e0e0e0
	border-radius 50px
	cursor pointer
	transition all 0.2s ease

	&:hover
		background #f5f5f5

	.user-email
		color #666

	.menu-arrow
		color #999
		font-size 0.8rem

.mobile-settings-menu
	position fixed
	top 0
	right 0
	width 300px
	height 100vh
	background white
	box-shadow -4px 0 20px rgba(0, 0, 0, 0.1)
	z-index 200
	transition transform 0.3s ease

.mobile-menu-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 1px solid #e0e0e0

	h3
		margin 0
		color #333

.close-menu-btn
	background none
	border none
	font-size 1.5rem
	cursor pointer
	color #999

.mobile-menu-content
	padding 1.5rem

.mobile-user-info
	margin-bottom 1.5rem
	padding-bottom 1.5rem
	border-bottom 1px solid #e0e0e0

	.user-email
		font-weight 600
		color #333
		margin-bottom 0.25rem

	.user-role
		color #666
		font-size 0.9rem

.mobile-lang-section
	margin-bottom 1.5rem

.mobile-logout-btn
	width 100%
	padding 0.75rem
	background #FF5252
	color white
	border none
	border-radius 50px
	cursor pointer
	font-weight 500
	transition all 0.2s ease

	&:hover
		background #FF6B6B

.dashboard-content
	display flex
	flex 1
	max-width 1400px
	width 100%
	margin 0 auto

.sidebar
	width 240px
	background white
	border-right 1px solid #e0e0e0
	padding 1rem 0

.nav-menu
	display flex
	flex-direction column

.nav-item
	display flex
	align-items center
	gap 0.75rem
	padding 0.75rem 1.5rem
	background transparent
	border none
	cursor pointer
	transition all 0.2s ease
	color #666
	font-size 0.95rem

	&:hover
		background rgba(255, 193, 7, 0.05)
		color #333

	&.active
		background linear-gradient(90deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)
		color #FF9800
		border-left 3px solid #FFC107
		padding-left calc(1.5rem - 3px)

	.nav-icon
		font-size 1.2rem

	.nav-label
		font-weight 500

.main-content
	flex 1
	padding 2rem
	overflow-y auto

.section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.section-header
	display flex
	justify-content space-between
	align-items center
	margin-bottom 2rem

	.section-title
		margin 0
		color #333
		font-size 1.8rem
		display flex
		align-items center
		gap 0.75rem

		.section-icon
			font-size 1.5rem

// Additional admin-specific styles
.admin-badge
	background linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%)
	color white
	padding 0.25rem 0.75rem
	border-radius 20px
	font-size 0.85rem
	font-weight 600
	margin-right 1rem

.stats-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(250px, 1fr))
	gap 1.5rem
	margin-bottom 2rem

.stat-card
	background white
	border-radius 15px
	padding 1.5rem
	display flex
	gap 1rem
	align-items center
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.05)
	border 1px solid #f0f0f0

	.stat-icon
		font-size 2.5rem

	.stat-content
		flex 1

		h3
			margin 0 0 0.5rem 0
			color #666
			font-size 0.9rem

		.stat-value
			margin 0
			font-size 1.8rem
			font-weight bold
			color #333

		.stat-change
			font-size 0.85rem
			
			&.positive
				color #4CAF50

			&.negative
				color #F44336

.activity-section
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082

	h3
		margin 0 0 1rem 0
		color #333

.activity-list
	display flex
	flex-direction column
	gap 1rem

.activity-item
	display flex
	gap 1rem
	padding 1rem
	background #f9f9f9
	border-radius 10px

	.activity-icon
		font-size 1.5rem

	.activity-content
		flex 1

		p
			margin 0 0 0.25rem 0
			color #333

		.activity-time
			color #999
			font-size 0.85rem

.buildings-list
	display grid
	grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
	gap 1.5rem

.building-card
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082

	.building-header
		display flex
		justify-content space-between
		align-items center
		margin-bottom 1rem

		h3
			margin 0
			color #333

		.building-status
			padding 0.25rem 0.75rem
			border-radius 20px
			font-size 0.85rem
			
			&.active
				background #E8F5E9
				color #4CAF50

	.building-info
		p
			margin 0.5rem 0
			color #666
			font-size 0.95rem

	.building-actions
		display flex
		gap 0.5rem
		margin-top 1rem

		.action-btn
			padding 0.5rem 1rem
			background white
			border 1px solid #e0e0e0
			border-radius 8px
			cursor pointer
			font-size 0.85rem

			&:hover
				background #f5f5f5

			&.danger
				color #F44336
				border-color #F44336

.header-actions
	display flex
	gap 1rem
	align-items center

.search-input
	padding 0.6rem 1rem
	border 2px solid #e0e0e0
	border-radius 50px
	min-width 200px

.add-btn, .export-btn
	padding 0.6rem 1.25rem
	background linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)
	color white
	border none
	border-radius 50px
	cursor pointer
	font-weight 500

	&:hover
		transform translateY(-1px)
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)

.users-table
	background white
	border-radius 15px
	overflow hidden
	border 2px solid #FFE082

	table
		width 100%
		border-collapse collapse

		th
			background #FFF9C4
			padding 1rem
			text-align left
			color #333
			font-weight 600

		td
			padding 1rem
			border-bottom 1px solid #f0f0f0

		tbody tr:hover
			background #f9f9f9

	.role-badge, .status-badge
		padding 0.25rem 0.5rem
		border-radius 12px
		font-size 0.85rem

		&.resident
			background #E3F2FD
			color #2196F3

		&.mansion_admin
			background #FFF3E0
			color #FF9800

		&.active
			background #E8F5E9
			color #4CAF50

	.table-action
		background none
		border none
		cursor pointer
		font-size 1.2rem
		padding 0.25rem
		margin 0 0.25rem

		&:hover
			opacity 0.7

.maintenance-stats
	display grid
	grid-template-columns repeat(4, 1fr)
	gap 1rem
	margin-bottom 2rem

.status-card
	background white
	border-radius 15px
	padding 1.5rem
	text-align center
	border 2px solid #e0e0e0

	h4
		margin 0 0 0.5rem 0
		color #666
		font-size 0.9rem

	.count
		margin 0
		font-size 2rem
		font-weight bold

	&.urgent
		border-color #F44336
		.count
			color #F44336

	&.pending
		border-color #FF9800
		.count
			color #FF9800

	&.in-progress
		border-color #2196F3
		.count
			color #2196F3

	&.completed
		border-color #4CAF50
		.count
			color #4CAF50

.requests-list
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082

	h3
		margin 0 0 1rem 0
		color #333

.request-card
	padding 1rem
	background #f9f9f9
	border-radius 10px
	margin-bottom 1rem

	.request-header
		display flex
		align-items center
		gap 1rem
		margin-bottom 0.5rem

		.priority
			padding 0.25rem 0.5rem
			border-radius 12px
			font-size 0.75rem
			font-weight 600

			&.urgent
				background #FFEBEE
				color #F44336

			&.high
				background #FFF3E0
				color #FF9800

			&.medium
				background #E3F2FD
				color #2196F3

		h4
			flex 1
			margin 0
			color #333

		.request-time
			color #999
			font-size 0.85rem

	p
		margin 0.5rem 0
		color #666

	.request-footer
		display flex
		justify-content space-between
		align-items center
		margin-top 1rem

		.request-unit
			color #999
			font-size 0.9rem

		.assign-btn
			padding 0.4rem 1rem
			background white
			border 2px solid #FFC107
			border-radius 20px
			cursor pointer
			font-size 0.85rem

			&:hover
				background #FFF9C4

.financial-summary
	display grid
	grid-template-columns repeat(3, 1fr)
	gap 1.5rem
	margin-bottom 2rem

.summary-card
	background white
	border-radius 15px
	padding 2rem
	text-align center
	border 2px solid #FFE082

	h3
		margin 0 0 1rem 0
		color #666
		font-size 1rem

	.amount
		margin 0 0 0.5rem 0
		font-size 1.8rem
		font-weight bold
		color #333

	.period
		color #999
		font-size 0.9rem

	&.profit
		background linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)
		border-color #4CAF50

		.amount
			color #4CAF50

.payment-status
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082

	h3
		margin 0 0 1.5rem 0
		color #333

.payment-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap 1.5rem

.payment-card
	h4
		margin 0 0 0.75rem 0
		color #333

	.payment-bar
		height 20px
		background #f0f0f0
		border-radius 10px
		overflow hidden
		margin-bottom 0.5rem

		.payment-progress
			height 100%
			background linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)
			border-radius 10px
			transition width 0.3s ease

	p
		margin 0
		color #666
		font-size 0.9rem

.settings-sections
	display grid
	gap 1.5rem

.settings-card
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082

	h3
		margin 0 0 1rem 0
		color #333

.setting-item
	display flex
	justify-content space-between
	align-items center
	padding 1rem 0
	border-bottom 1px solid #f0f0f0

	&:last-child
		border-bottom none

	label
		color #666

	.setting-btn
		padding 0.5rem 1rem
		background white
		border 2px solid #FFC107
		border-radius 20px
		cursor pointer

		&:hover
			background #FFF9C4

	select
		padding 0.5rem
		border 1px solid #e0e0e0
		border-radius 8px
</style>