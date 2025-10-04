<template>
	<div class="dashboard-layout">
		<!-- Header -->
		<header class="dashboard-header">
			<div class="header-content">
				<div class="header-left" @click="handleLogoClick">
					<KagiLogo :size="40" />
					<h1>{{ title }}</h1>
				</div>
				<div class="header-right">
					<span v-if="userRole" class="user-badge">{{ userRole }}</span>
					<button class="user-menu-btn" @click="showMobileMenu = !showMobileMenu">
						<span class="user-email">{{ userEmail }}</span>
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
						<div class="user-email">{{ userEmail }}</div>
						<div class="user-role">{{ userRole }}</div>
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
			<aside class="dashboard-sidebar">
				<nav class="nav-menu">
					<button
						v-for="item in menuItems"
						:key="item.id"
						:class="['nav-item', { active: activeSection === item.id }]"
						@click="handleNavigation(item.id)"
					>
						<span class="nav-icon">{{ item.icon }}</span>
						<span class="nav-label">{{ item.label }}</span>
					</button>
				</nav>
				<!-- Mobile menu with circular icons -->
				<nav class="nav-menu-mobile">
					<button
						v-for="item in mobileMenuItems"
						:key="item.id"
						:class="['nav-item-mobile', { active: activeSection === item.id }]"
						@click="handleNavigation(item.id)"
					>
						<div class="nav-icon-circle">
							<span class="nav-icon">{{ item.icon }}</span>
						</div>
						<span class="nav-label-mobile">{{ item.label }}</span>
					</button>
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
export default {
	name: 'DashboardLayout',
	emits: ['navigate', 'logout', 'logo-click'],
	props: {
		// Layout config
		title: {
			type: String,
			default: 'Kagi'
		},
		userEmail: String,
		userRole: String,
		// Navigation
		menuItems: {
			type: Array,
			required: true
			// Expected format: [{ id: string, icon: string, label: string }]
		},
		activeSection: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			showMobileMenu: false
		}
	},
	computed: {
		mobileMenuItems() {
			// Filter out documents, bills, and maintenance from mobile menu
			const hiddenOnMobile = ['documents', 'bills', 'maintenance']
			return this.menuItems.filter(item => !hiddenOnMobile.includes(item.id))
		}
	},
	methods: {
		handleNavigation( sectionId ) {
			this.$emit( 'navigate', sectionId )
			this.showMobileMenu = false
		},
		handleLogout() {
			this.$emit( 'logout' )
		},
		handleLogoClick() {
			this.$emit( 'logo-click' )
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'
.dashboard-layout
	min-height 100vh
	background $gradient-subtle
	display flex
	flex-direction column
// Header
.dashboard-header
	background $gradient-light
	box-shadow $shadow-md
	position sticky
	top 0
	z-index $z-sticky
	padding-top var(--sait, 0px)
.header-content
	display flex
	justify-content space-between
	align-items center
	padding $spacing-md $spacing-xl
	max-width 1600px
	margin 0 auto
	@media (max-width: $breakpoint-md)
		padding $spacing-md
.header-left
	display flex
	align-items center
	gap $spacing-md
	cursor pointer
	h1
		margin 0
		font-size $font-xl
		font-weight $font-semibold
		color $color-text
		@media (max-width: $breakpoint-sm)
			display none
.header-right
	display flex
	align-items center
	gap $spacing-md
.user-badge
	padding $spacing-xs $spacing-md
	background $color-primary
	color white
	border-radius $radius-pill
	font-size $font-sm
	font-weight $font-semibold
	@media (max-width: $breakpoint-md)
		display none
.user-menu-btn
	display flex
	align-items center
	gap $spacing-sm
	padding $spacing-sm $spacing-md
	background white
	border 1px solid $color-border
	border-radius $radius-pill
	cursor pointer
	transition $transition-base
	&:hover
		background $color-background-light
		border-color $color-primary
	.user-email
		font-size $font-sm
		color $color-text
		@media (max-width: $breakpoint-sm)
			display none
	.menu-arrow
		color $color-text-secondary
		font-size $font-xs
// Mobile Settings Menu
.mobile-settings-menu
	position fixed
	top 0
	right 0
	width 300px
	height 100vh
	background white
	box-shadow -2px 0 10px rgba(0, 0, 0, 0.15)
	z-index $z-modal
	overflow-y auto
	@media (max-width: $breakpoint-sm)
		width 100%
.mobile-menu-header
	display flex
	justify-content space-between
	align-items center
	padding $spacing-lg
	background $gradient-light
	h3
		margin 0
		font-size $font-lg
		color $color-text
.close-menu-btn
	background none
	border none
	font-size $font-xl
	color $color-text-secondary
	cursor pointer
	padding 0
	width 30px
	height 30px
	display flex
	align-items center
	justify-content center
	border-radius $radius-round
	transition $transition-base
	&:hover
		background $color-background-light
		color $color-text
.mobile-menu-content
	padding $spacing-lg
.mobile-user-info
	padding $spacing-md
	background $color-background-light
	border-radius $radius-md
	margin-bottom $spacing-lg
	.user-email
		font-size $font-base
		color $color-text
		font-weight $font-medium
	.user-role
		font-size $font-sm
		color $color-text-secondary
		margin-top $spacing-xs
.mobile-lang-section
	padding $spacing-md 0
	border-top 1px solid $color-border
	border-bottom 1px solid $color-border
	margin-bottom $spacing-lg
.mobile-logout-btn
	width 100%
	padding $spacing-md
	background $color-danger
	color white
	border none
	border-radius $radius-md
	font-size $font-base
	font-weight $font-medium
	cursor pointer
	transition $transition-base
	&:hover
		background darken($color-danger, 10%)
// Main Content Area
.dashboard-content
	display flex
	flex 1
	max-width 1440px
	margin 0 auto
	width 100%
	padding $spacing-lg
	gap $spacing-lg
	@media (max-width: $breakpoint-md)
		padding $spacing-md
		gap $spacing-md
	@media (max-width: 550px)
		padding 0
// Sidebar
.dashboard-sidebar
	width 260px
	flex-shrink 0
	@media (max-width: $breakpoint-md)
		width auto
		position fixed
		bottom 0
		left 0
		right 0
		background white
		box-shadow 0 -2px 10px rgba(0, 0, 0, 0.1)
		z-index $z-fixed
		padding $spacing-sm
.nav-menu
	background white
	border-radius $radius-lg
	padding $spacing-md
	box-shadow $shadow-sm
	@media (max-width: $breakpoint-md)
		display none
.nav-item
	display flex
	align-items center
	gap $spacing-md
	width 100%
	padding $spacing-md
	background transparent
	border none
	border-radius $radius-md
	cursor pointer
	transition $transition-base
	margin-bottom $spacing-xs
	&:last-child
		margin-bottom 0
	&:hover
		background $color-background-light
	&.active
		background $gradient-light
		border-left 3px solid $color-primary
	.nav-icon
		font-size $font-xl
		width 24px
		text-align center
	.nav-label
		font-size $font-base
		color $color-text
		font-weight $font-medium
// Mobile Navigation
.nav-menu-mobile
	display none
	@media (max-width: $breakpoint-md)
		display flex
		justify-content space-around
		padding $spacing-xs 0
.nav-item-mobile
	display flex
	flex-direction column
	align-items center
	gap $spacing-xs
	background transparent
	border none
	padding $spacing-xs
	cursor pointer
	transition $transition-base
	flex 1
	&.active
		.nav-icon-circle
			background $gradient-primary
			color white
		.nav-label-mobile
			color $color-primary
			font-weight $font-semibold
.nav-icon-circle
	width 48px
	height 48px
	background $color-background-light
	border-radius $radius-round
	display flex
	align-items center
	justify-content center
	transition $transition-base
	.nav-icon
		font-size $font-xl
.nav-label-mobile
	font-size 10px
	color $color-text-secondary
	text-align center
// Main Content
.dashboard-main
	flex 1
	min-width 0
	background white
	border-radius $radius-lg
	padding $spacing-xl
	box-shadow $shadow-sm
	@media (max-width: $breakpoint-md)
		padding $spacing-lg
		padding-top "calc(%s + 1rem)" % $spacing-lg
		padding-bottom "calc(%s + 1rem)" % $spacing-lg
		margin-bottom 80px // Space for mobile nav
	@media (max-width: 768px)
		padding 0
		padding-top 1.5rem
		padding-bottom 1.5rem
		border-radius 0
// Transitions
.slide-enter-active, .slide-leave-active
	transition transform 0.3s ease
.slide-enter-from
	transform translateX(100%)
.slide-leave-to
	transform translateX(100%)
</style>