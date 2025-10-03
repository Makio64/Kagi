<template>
	<div class="dashboard-container">
		<!-- Header -->
		<DashboardHeader
			:title="headerTitle"
			:user-badge="userBadge"
			:user-email="userEmail"
			:user-role="userRole"
			:show-language-switcher="showLanguageSwitcher"
			@logout="$emit('logout')"
		>
			<template v-if="$slots.headerLeft" #left>
				<slot name="headerLeft" />
			</template>
		</DashboardHeader>

		<!-- Main Content Area -->
		<div class="dashboard-content">
			<!-- Sidebar Navigation -->
			<DashboardSidebar
				:menu-items="menuItems"
				:active-section="activeSection"
				@navigate="$emit('navigate', $event)"
			/>

			<!-- Main Content -->
			<main class="main-content">
				<slot />
			</main>
		</div>
	</div>
</template>

<script>
export default {
	name: 'DashboardContainer',
	props: {
		headerTitle: {
			type: String,
			default: 'Dashboard'
		},
		userBadge: {
			type: String,
			required: true
		},
		userEmail: {
			type: String,
			required: true
		},
		userRole: {
			type: String,
			required: true
		},
		showLanguageSwitcher: {
			type: Boolean,
			default: true
		},
		menuItems: {
			type: Array,
			required: true
		},
		activeSection: {
			type: String,
			required: true
		}
	},
	emits: ['logout', 'navigate']
}
</script>

<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'

.dashboard-container
	min-height 100vh
	display flex
	flex-direction column
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	box-sizing border-box

*, *::before, *::after
	box-sizing border-box

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
		flex-direction column

	@media (max-width: 550px)
		padding 0
		gap 0.5rem

.main-content
	flex 1
	background white
	border-radius 20px
	padding 2rem
	box-shadow 0 8px 25px rgba(255, 193, 7, 0.08)
	border 1px solid rgba(255, 193, 7, 0.15)
	overflow-x hidden
	min-height calc(100vh - 200px)

	@media (max-width: 768px)
		padding 1.5rem
		border-radius 15px
		min-height auto

	@media (max-width: 550px)
		padding 1rem
		border-radius 10px
</style>
