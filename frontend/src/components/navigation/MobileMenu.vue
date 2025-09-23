<template>
	<div>
		<!-- Mobile Bottom Navigation -->
		<nav class="mobile-nav">
			<button
				v-for="item in menuItems"
				:key="item.id"
				:class="['nav-item-mobile', { active: activeSection === item.id }]"
				@click="$emit('navigate', item.id)"
			>
				<div class="nav-icon-circle">
					<span class="nav-icon">{{ item.icon }}</span>
				</div>
				<span class="nav-label-mobile">{{ item.label }}</span>
			</button>
		</nav>

		<!-- Mobile Side Menu -->
		<transition name="slide-left">
			<div v-if="isMenuOpen" class="mobile-side-menu-overlay" @click="closeMenu">
				<div class="mobile-side-menu" @click.stop>
					<div class="side-menu-header">
						<div class="user-profile-section">
							<div class="user-avatar">
								<span>{{ userInitial }}</span>
							</div>
							<div class="user-info">
								<div class="user-name">{{ userName }}</div>
								<div class="user-email">{{ userEmail }}</div>
							</div>
						</div>
					</div>

					<div class="language-selector">
						<LanguageSwitcher />
					</div>

					<nav class="side-menu-nav">
						<button
							v-for="item in menuItems"
							:key="item.id"
							:class="['side-menu-item', { active: activeSection === item.id }]"
							@click="handleNavigation(item.id)"
						>
							<span class="menu-icon">{{ item.icon }}</span>
							<span class="menu-label">{{ item.label }}</span>
						</button>
					</nav>

					<div class="side-menu-actions">
						<button class="side-menu-item" @click="handleProfile">
							<span class="menu-icon">👤</span>
							<span class="menu-label">{{ $t('dashboard.profile.myProfile') }}</span>
						</button>
						<button class="side-menu-item logout-item" @click="$emit('logout')">
							<span class="menu-icon">🚪</span>
							<span class="menu-label">{{ $t('nav.logout') }}</span>
						</button>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
import * as store from '../../store'

export default {
	name: 'MobileMenu',
	props: {
		activeSection: {
			type: String,
			required: true
		},
		userEmail: {
			type: String,
			default: ''
		}
	},
	emits: ['navigate', 'logout'],
	computed: {
		isMenuOpen: {
			get() {
				return store.isMenuOpen.value
			},
			set( val ) {
				store.isMenuOpen.value = val
			}
		},
		menuItems() {
			return [
				{ id: 'events', icon: '📢', label: this.$t( 'dashboard.menu.events' ) },
				{ id: 'services', icon: '🛎️', label: this.$t( 'dashboard.services.title' ) },
				{ id: 'booking', icon: '📅', label: this.$t( 'dashboard.menu.booking' ) },
				{ id: 'maintenance', icon: '🔧', label: this.$t( 'dashboard.menu.maintenance' ) },
				{ id: 'bills', icon: '💳', label: this.$t( 'dashboard.menu.bills' ) },
				{ id: 'contact', icon: '📱', label: this.$t( 'dashboard.menu.contact' ) },
				{ id: 'documents', icon: '📄', label: this.$t( 'dashboard.menu.documents' ) }
			]
		},
		userInitial() {
			return this.userEmail?.charAt( 0 )?.toUpperCase() || 'U'
		},
		userName() {
			const user = store.user.value
			return user?.profile?.name || this.userEmail?.split( '@' )[0] || 'User'
		}
	},
	methods: {
		handleNavigation( sectionId ) {
			this.$emit( 'navigate', sectionId )
			this.isMenuOpen = false
		},
		handleProfile() {
			this.$emit( 'navigate', 'profile' )
			this.isMenuOpen = false
		},
		closeMenu() {
			this.isMenuOpen = false
		}
	}
}
</script>

<style lang="stylus" scoped>
// Mobile Bottom Navigation
.mobile-nav
	display none

	@media (max-width: 768px)
		display flex
		justify-content space-around
		position fixed
		bottom 0
		left 0
		right 0
		background white
		box-shadow 0 -2px 10px rgba(0, 0, 0, 0.1)
		padding 0.5rem 0
		z-index 1000

.nav-item-mobile
	display flex
	flex-direction column
	align-items center
	gap 0.25rem
	background transparent
	border none
	padding 0.5rem
	cursor pointer
	transition all 0.2s ease
	flex 1

	&.active
		.nav-icon-circle
			background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
			color white

		.nav-label-mobile
			color #FFC107
			font-weight 600

.nav-icon-circle
	width 48px
	height 48px
	background #f5f5f5
	border-radius 50%
	display flex
	align-items center
	justify-content center
	transition all 0.2s ease

	.nav-icon
		font-size 1.25rem

.nav-label-mobile
	font-size 10px
	color #666
	text-align center

// Mobile Side Menu
.mobile-side-menu-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	z-index 2000

.mobile-side-menu
	position absolute
	top 0
	left 0
	bottom 0
	width 280px
	background white
	overflow-y auto

	@media (max-width: 400px)
		width 85%

.side-menu-header
	padding 1.5rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)

.user-profile-section
	display flex
	align-items center
	gap 1rem

.user-avatar
	width 50px
	height 50px
	background white
	border-radius 50%
	display flex
	align-items center
	justify-content center
	font-size 1.25rem
	font-weight bold
	color #FFC107

.user-info
	flex 1
	color white

	.user-name
		font-size 1.1rem
		font-weight 600
		margin-bottom 0.25rem

	.user-email
		font-size 0.85rem
		opacity 0.9

.language-selector
	padding 1rem 1.5rem
	border-bottom 1px solid #eee

.side-menu-nav
	padding 1rem

.side-menu-item
	display flex
	align-items center
	gap 1rem
	width 100%
	padding 1rem
	background transparent
	border none
	border-radius 8px
	cursor pointer
	transition all 0.2s ease
	margin-bottom 0.5rem

	&:hover
		background #f8f8f8

	&.active
		background #FFF9C4
		font-weight 600

	.menu-icon
		font-size 1.25rem
		width 30px
		text-align center

	.menu-label
		flex 1
		text-align left
		color #333
		font-size 0.95rem

.side-menu-actions
	padding 1rem
	border-top 1px solid #eee
	margin-top auto

	.logout-item
		background #fee
		color #d32f2f

		&:hover
			background #fdd

// Transitions
.slide-left-enter-active,
.slide-left-leave-active
	transition all 0.3s ease

.slide-left-enter-from,
.slide-left-leave-to
	.mobile-side-menu
		transform translateX(-100%)

	opacity 0
</style>