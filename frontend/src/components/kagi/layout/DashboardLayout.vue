<template>
	<div class="dashboard-layout">
		<div class="dashboard-background">
			<div class="blob blob-1" />
			<div class="blob blob-2" />
		</div>
		<!-- Header -->
		<header class="dashboard-header glass-card">
			<div class="header-content">
				<div class="header-left" @click="handleLogoClick">
					<KagiLogo :size="48" :class="['logo']" color="#333333" />
					<h1 v-if="userProfile.residenceName" class="residence-name">{{ userProfile.residenceName }}</h1>
					<h1 v-else>{{ title }}</h1>
				</div>
				<div class="header-right">
					<span v-if="userRole && userRole !== 'resident'" class="user-badge">{{ userRole }}</span>
					<button class="user-menu-btn" @click="showMobileMenu = !showMobileMenu">
						<span class="user-email desktop-only">{{ userProfile.userEmail }}</span>
						<span class="user-email mobile-only">{{ $t('common.profile') }}</span>
						<span class="menu-arrow">▼</span>
					</button>
				</div>
			</div>
		</header>
		<!-- Mobile Settings Menu -->
		<transition name="slide">
			<div v-if="showMobileMenu" class="mobile-settings-menu glass-card">
				<div class="mobile-menu-header">
					<h3>{{ $t('common.settings') }}</h3>
					<button class="close-menu-btn" @click="showMobileMenu = false">✕</button>
				</div>
				<div class="mobile-menu-content">
					<div class="mobile-user-info">
						<div v-if="userProfile.residenceName" class="user-info-item mansion-name">{{ userProfile.residenceName }}</div>
						<div v-if="userProfile.userName" class="user-info-item user-name">{{ userProfile.userName }}</div>
						<div v-if="userProfile.roomNumber" class="user-info-item">
							<span class="label">{{ $t('dashboard.profile.apartment') }}:</span> {{ userProfile.roomNumber }}
						</div>
						<div v-if="userProfile.userPhone" class="user-info-item">
							{{ userProfile.userPhone }}
						</div>
						<div class="user-info-item">
							{{ userProfile.userEmail }}
						</div>
						<button class="edit-profile-btn" @click="handleEditProfile">
							{{ $t('common.edit') }}
						</button>
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
		<!-- Main Content Area -->
		<div class="dashboard-content">
			<!-- Sidebar Navigation -->
			<aside class="dashboard-sidebar glass-card">
				<nav class="nav-menu">
					<button
						v-for="item in menuItems"
						:key="item.id"
						:class="['nav-item', { active: activeSection === item.id }]"
						@click="handleNavigation(item.id)"
					>
						<span class="nav-icon"><Icon :name="item.icon" :size="24" /></span>
						<span class="nav-label">{{ item.label }}</span>
					</button>
				</nav>
				<!-- Mobile menu with circular icons -->
				<nav class="nav-menu-mobile glass-card">
					<ButtonFX
						v-for="item in mobileMenuItems"
						:key="item.id"
						@click="handleNavigation(item.id)"
					>
						<button
							:class="['nav-item-mobile', { active: activeSection === item.id }]"
						>
							<div class="nav-icon-circle">
								<span class="nav-icon"><Icon :name="item.icon" :size="24" /></span>
							</div>
							<span class="nav-label-mobile">{{ item.label }}</span>
						</button>
					</ButtonFX>
				</nav>
			</aside>
			<!-- Main Content -->
			<main class="dashboard-main">
				<slot />
			</main>
		</div>
	</div>
</template>
<script>
import * as store from '../../../store'
import Icon from '../../Icon.vue'

export default {
	name: 'DashboardLayout',
	components: { Icon },
	emits: ['navigate', 'logout', 'logo-click', 'edit-profile'],
	props: {
		// Layout config
		title: { type: String, default: 'Kagi' },
		// Navigation
		menuItems: { type: Array, required: true }, // Expected format: [{ id: string, icon: string, label: string }]
		activeSection: { type: String, required: true }
	},
	data() {
		return {
			showMobileMenu: false
		}
	},
	computed: {
		userProfile() {
			return store.userProfile.value
		},
		userRole() {
			return store.userRole.value
		},
		mobileMenuItems() {
			// Filter out documents, bills, and maintenance from mobile menu
			const hiddenOnMobile = ['documents', 'bills', 'maintenance']
			return this.menuItems.filter( item => !hiddenOnMobile.includes( item.id ) )
		}
	},
	methods: {
		handleNavigation( sectionId ) {
			// Scroll #app to top instantly
			document.querySelector( '#app' ).scrollTop = 0
			this.$emit( 'navigate', sectionId )
			this.showMobileMenu = false
		},
		handleLogout() {
			this.$emit( 'logout' )
		},
		handleLogoClick() {
			this.$emit( 'logo-click' )
		},
		handleEditProfile() {
			this.showMobileMenu = false
			this.$emit( 'edit-profile' )
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens-modern.styl'

.dashboard-layout
	min-height 100vh
	background var(--surface-base)
	display flex
	flex-direction column
	position relative
	overflow-x hidden

.dashboard-background
	position fixed
	top 0
	left 0
	width 100%
	height 100%
	z-index 0
	pointer-events none

	.blob
		position absolute
		border-radius 50%
		filter blur(80px)
		opacity 0.6

	.blob-1
		top -10%
		right -10%
		width 600px
		height 600px
		background var(--color-primary-200)
		animation float 8s ease-in-out infinite

	.blob-2
		bottom -10%
		left -10%
		width 500px
		height 500px
		background var(--color-primary-300)
		animation float 10s ease-in-out infinite reverse

@keyframes float
	0%
		transform translate(0, 0)
	50%
		transform translate(20px, 20px)
	100%
		transform translate(0, 0)

.glass-card
	background rgba(255, 255, 255, 0.7)
	backdrop-filter blur(20px)
	-webkit-backdrop-filter blur(20px)
	border 1px solid rgba(255, 255, 255, 0.5)
	box-shadow var(--shadow-lg)

// Header
.dashboard-header
	position sticky
	top 0
	z-index 100
	padding-top var(--sait, 0px)
	border-bottom 1px solid rgba(255, 255, 255, 0.5)
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.04)

.header-content
	display flex
	justify-content space-between
	align-items center
	padding var(--space-4) var(--space-8)
	max-width 1600px
	margin 0 auto
	@media (max-width: 768px)
		padding var(--space-4)

.header-left
	display flex
	align-items center
	gap var(--space-4)
	cursor pointer
	.logo
		@media (max-width: 640px)
			width 40px
			height 40px
	h1
		margin 0
		font-size var(--text-xl)
		font-weight var(--font-semibold)
		color var(--color-gray-900)
		&:not(.residence-name)
			@media (max-width: 640px)
				display none
	.residence-name
		margin 0
		font-size var(--text-xl)
		font-weight var(--font-semibold)
		color var(--color-gray-900)
		@media (max-width: 640px)
			font-size var(--text-lg)

.header-right
	display flex
	align-items center
	gap var(--space-4)

.user-badge
	padding var(--space-1) var(--space-3)
	background var(--color-primary-500)
	color var(--color-gray-900)
	border-radius var(--radius-full)
	font-size var(--text-sm)
	font-weight var(--font-semibold)
	@media (max-width: 768px)
		display none

.user-menu-btn
	display flex
	align-items center
	gap var(--space-2)
	padding var(--space-2) var(--space-4)
	background rgba(255, 255, 255, 0.5)
	border 1px solid rgba(255, 255, 255, 0.5)
	border-radius var(--radius-full)
	cursor pointer
	transition all var(--transition-base)
	&:hover
		background white
		border-color var(--color-primary-500)
	.user-email
		font-size var(--text-sm)
		color var(--color-gray-900)
		font-weight var(--font-medium)
	.desktop-only
		@media (max-width: 640px)
			display none
	.mobile-only
		display none
		@media (max-width: 640px)
			display inline
	.menu-arrow
		color var(--color-gray-500)
		font-size var(--text-xs)

// Mobile Settings Menu
.mobile-settings-menu
	position fixed
	top 0
	right 0
	width 300px
	height 100vh
	z-index 200
	overflow-y auto
	@media (max-width: 640px)
		width 100%

.mobile-menu-header
	display flex
	justify-content space-between
	align-items center
	padding var(--space-6)
	padding-top "calc(%s + %s)" % (var(--space-6) var(--sait, 0px))
	border-bottom 1px solid rgba(0,0,0,0.05)
	h3
		margin 0
		font-size var(--text-lg)
		color var(--color-gray-900)

.close-menu-btn
	background none
	border none
	font-size var(--text-xl)
	color var(--color-gray-500)
	cursor pointer
	padding 0
	width 32px
	height 32px
	display flex
	align-items center
	justify-content center
	border-radius var(--radius-full)
	transition all var(--transition-base)
	&:hover
		background rgba(0,0,0,0.05)
		color var(--color-gray-900)

.mobile-menu-content
	padding var(--space-6)

.mobile-user-info
	padding var(--space-4)
	background rgba(255,255,255,0.5)
	border-radius var(--radius-lg)
	margin-bottom var(--space-6)
	display flex
	flex-direction column
	gap var(--space-2)
	.user-info-item
		font-size var(--text-sm)
		color var(--color-gray-700)
		line-height 1.5
		&.mansion-name
			font-size var(--text-base)
			font-weight var(--font-semibold)
			color var(--color-primary-600)
		&.user-name
			font-size var(--text-base)
			font-weight var(--font-medium)
			color var(--color-gray-900)
		.label
			color var(--color-gray-500)
			font-weight var(--font-normal)
	.edit-profile-btn
		margin-top var(--space-2)
		padding var(--space-2) var(--space-4)
		background var(--color-primary-500)
		color var(--color-gray-900)
		border none
		border-radius var(--radius-md)
		font-size var(--text-sm)
		font-weight var(--font-medium)
		cursor pointer
		transition all var(--transition-base)
		&:hover
			background var(--color-primary-400)

.mobile-lang-section
	padding var(--space-4) 0
	border-top 1px solid rgba(0,0,0,0.05)
	border-bottom 1px solid rgba(0,0,0,0.05)
	margin-bottom var(--space-6)

.mobile-logout-btn
	width 100%
	padding var(--space-3)
	background var(--color-red-500)
	color white
	border none
	border-radius var(--radius-md)
	font-size var(--text-base)
	font-weight var(--font-medium)
	cursor pointer
	transition all var(--transition-base)
	&:hover
		background var(--color-red-600)

// Main Content Area
.dashboard-content
	display flex
	flex 1
	max-width 1600px
	margin 0 auto
	width 100%
	padding var(--space-8)
	gap var(--space-8)
	position relative
	z-index 1
	@media (max-width: 1024px)
		padding var(--space-4)
		gap var(--space-4)
	@media (max-width: 640px)
		padding 0

// Sidebar
.dashboard-sidebar
	width 280px
	flex-shrink 0
	border-radius var(--radius-xl)
	padding var(--space-4)
	height fit-content
	position sticky
	top 100px
	@media (max-width: 1024px)
		width auto
		position fixed
		bottom 0
		left 0
		right 0
		top auto
		border-radius 0
		background rgba(255, 255, 255, 0.9)
		backdrop-filter blur(20px)
		box-shadow 0 -4px 20px rgba(0, 0, 0, 0.1)
		z-index 90
		padding var(--space-2)
		padding-bottom "calc(%s + %s)" % (var(--space-2) var(--saib, 0px))

.nav-menu
	display flex
	flex-direction column
	gap var(--space-2)
	@media (max-width: 1024px)
		display none

.nav-item
	display flex
	align-items center
	gap var(--space-4)
	width 100%
	padding var(--space-3) var(--space-4)
	background transparent
	border none
	border-radius var(--radius-lg)
	cursor pointer
	transition all var(--transition-base)
	color var(--color-gray-600)
	&:hover
		background rgba(255, 255, 255, 0.5)
		color var(--color-primary-600)
		transform translateX(4px)
	&.active
		background var(--color-primary-100)
		color var(--color-primary-700)
		font-weight var(--font-semibold)
	.nav-icon
		display flex
		align-items center
		justify-content center
		width 24px
		height 24px
	.nav-label
		font-size var(--text-base)
		font-weight inherit

// Mobile Navigation
.nav-menu-mobile
	display none
	@media (max-width: 1024px)
		display flex
		justify-content space-around
		padding var(--space-1) 0
		background transparent
		box-shadow none

.nav-item-mobile
	display flex
	flex-direction column
	align-items center
	gap var(--space-1)
	background transparent
	border none
	padding var(--space-1)
	cursor pointer
	transition all var(--transition-base)
	flex 1
	&.active
		.nav-icon-circle
			background var(--color-primary-500)
			color var(--color-gray-900)
			transform translateY(-4px)
			box-shadow var(--shadow-md)
		.nav-label-mobile
			color var(--color-primary-600)
			font-weight var(--font-semibold)

.nav-icon-circle
	width 44px
	height 44px
	background rgba(0,0,0,0.05)
	border-radius var(--radius-full)
	display flex
	align-items center
	justify-content center
	transition all var(--transition-base)
	color var(--color-gray-600)

.nav-label-mobile
	font-size 10px
	color var(--color-gray-500)
	text-align center
	font-weight var(--font-medium)

// Main Content
.dashboard-main
	flex 1
	min-width 0
	background rgba(255, 255, 255, 0.8)
	backdrop-filter blur(10px)
	border-radius var(--radius-xl)
	padding var(--space-8)
	box-shadow var(--shadow-sm)
	border 1px solid rgba(255, 255, 255, 0.5)
	@media (max-width: 1024px)
		padding var(--space-6)
		margin-bottom 100px // Space for mobile nav
	@media (max-width: 640px)
		padding var(--space-4)
		border-radius 0
		background transparent
		box-shadow none
		border none

// Transitions
.slide-enter-active, .slide-leave-active
	transition transform 0.3s ease

.slide-enter-from, .slide-leave-to
	transform translateX(100%)
</style>
