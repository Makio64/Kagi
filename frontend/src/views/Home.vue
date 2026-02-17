<template>
	<div class="home">
		<div class="language-switcher-container">
			<LanguageSwitcher variant="compact" />
		</div>

		<header class="hero">
			<div class="hero-background">
				<div class="blob blob-1" />
				<div class="blob blob-2" />
			</div>

			<div class="hero-content container">
				<div class="logo-container">
					<KagiLogo :size="160" />
				</div>
				<h1 class="title">{{ $t('app.name') }}</h1>
				<p class="subtitle">{{ $t('home.hero.subtitle') }}</p>
				<p class="description">{{ $t('home.hero.description') }}</p>
				<div class="cta-buttons">
					<button class="btn btn-primary" @click="$router.push('/login')">
						{{ $t('home.hero.getStarted') }}
						<Icon name="arrow_right" :size="20" class="btn-icon" />
					</button>
					<button class="btn btn-secondary" @click="scrollToFeatures">
						{{ $t('home.hero.learnMore') }}
					</button>
				</div>
			</div>
		</header>

		<section ref="featuresSection" class="section-why">
			<div class="container">
				<h2 class="section-title">{{ $t('home.resident.why.title') }}</h2>
				<div class="why-grid">
					<div class="why-card">
						<div class="icon-box">
							<Icon name="communication" :size="40" />
						</div>
						<h3>{{ $t('home.resident.why.convenience.title') }}</h3>
						<p>{{ $t('home.resident.why.convenience.desc') }}</p>
					</div>
					<div class="why-card">
						<div class="icon-box">
							<Icon name="event" :size="40" />
						</div>
						<h3>{{ $t('home.resident.why.community.title') }}</h3>
						<p>{{ $t('home.resident.why.community.desc') }}</p>
					</div>
					<div class="why-card">
						<div class="icon-box">
							<Icon name="maintenance" :size="40" />
						</div>
						<h3>{{ $t('home.resident.why.support.title') }}</h3>
						<p>{{ $t('home.resident.why.support.desc') }}</p>
					</div>
				</div>
			</div>
		</section>

		<section class="section-how">
			<div class="container">
				<h2 class="section-title">{{ $t('home.resident.how.title') }}</h2>
				<div class="steps-modern">
					<div class="step-modern">
						<div class="step-number">01</div>
						<h3>{{ $t('home.resident.how.step1.title') }}</h3>
						<p>{{ $t('home.resident.how.step1.desc') }}</p>
					</div>
					<div class="step-modern">
						<div class="step-number">02</div>
						<h3>{{ $t('home.resident.how.step2.title') }}</h3>
						<p>{{ $t('home.resident.how.step2.desc') }}</p>
					</div>
					<div class="step-modern">
						<div class="step-number">03</div>
						<h3>{{ $t('home.resident.how.step3.title') }}</h3>
						<p>{{ $t('home.resident.how.step3.desc') }}</p>
					</div>
				</div>
			</div>
		</section>

		<section class="section-cta">
			<div class="container">
				<div class="cta-box glass-card">
					<h2>{{ $t('home.resident.cta.title') }}</h2>
					<p>{{ $t('home.resident.cta.subtitle') }}</p>
					<button class="btn btn-primary btn-large">
						{{ $t('home.resident.cta.button') }}
					</button>
				</div>
			</div>
		</section>

		<footer class="footer">
			<div class="container">
				<div class="footer-content">
					<div class="footer-logo">
						<KagiLogo :size="40" />
						<span>{{ $t('app.name') }}</span>
					</div>
					<p class="footer-description">{{ $t('home.hero.description') }}</p>
					<p class="footer-copyright">{{ $t('home.footer.copyright') }}</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
import Icon from '@/components/Icon.vue'

export default {
	name: 'Home',
	components: {
		Icon
	},
	methods: {
		scrollToFeatures() {
			this.$refs.featuresSection?.scrollIntoView( { behavior: 'smooth' } )
		}
	}
}
</script>

<style lang="stylus" scoped>
.home
	min-height 100vh
	background var(--color-primary-50)
	position relative
	overflow-x hidden

.language-switcher-container
	position fixed
	top calc(20px + var(--sait, 0px))
	right calc(20px + var(--sair, 0px))
	z-index var(--z-fixed)

.hero
	min-height 100vh
	display flex
	align-items center
	justify-content center
	position relative
	padding 2rem
	padding-top calc(2rem + var(--sait, 0px))
	overflow hidden

.hero-background
	position absolute
	top 0
	left 0
	width 100%
	height 100%
	z-index 0
	pointer-events none

	.blob
		position absolute
		border-radius 50%
		filter blur(60px)
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

.hero-content
	text-align center
	max-width 800px
	position relative
	z-index 1

.logo-container
	animation float 6s ease-in-out infinite
	margin-bottom var(--space-8)

@keyframes float
	0%, 100%
		transform translateY(0)
	50%
		transform translateY(-20px)

.title
	font-size var(--text-display)
	font-weight var(--font-bold)
	color var(--color-gray-900)
	margin var(--space-4) 0
	letter-spacing -0.02em
	line-height var(--leading-tight)

.subtitle
	font-size var(--text-xl)
	color var(--color-gray-700)
	margin var(--space-2) 0
	font-weight var(--font-medium)

.description
	font-size var(--text-lg)
	color var(--color-gray-600)
	margin var(--space-4) 0 var(--space-8)
	max-width 600px
	margin-left auto
	margin-right auto

.cta-buttons
	display flex
	gap var(--space-4)
	justify-content center
	flex-wrap wrap

.btn
	padding var(--space-3) var(--space-6)
	font-size var(--text-lg)
	border none
	border-radius var(--radius-full)
	cursor pointer
	transition all var(--transition-base)
	font-weight var(--font-semibold)
	display inline-flex
	align-items center
	justify-content center
	gap var(--space-2)

.btn-primary
	background var(--color-primary-500)
	color var(--color-gray-900)
	box-shadow var(--shadow-primary)

	&:hover
		background var(--color-primary-400)
		transform translateY(-2px)
		box-shadow var(--shadow-primary-lg)

.btn-secondary
	background rgba(255, 255, 255, 0.5)
	color var(--color-gray-900)
	border 2px solid var(--color-primary-500)
	backdrop-filter blur(10px)

	&:hover
		background var(--color-primary-500)
		transform translateY(-2px)

.container
	max-width var(--container-7xl)
	margin 0 auto
	padding 0 var(--space-4)

.section-title
	font-size var(--text-3xl)
	text-align center
	margin-bottom var(--space-12)
	color var(--color-gray-900)
	font-weight var(--font-bold)

// --- New Sections Styles ---

.section-why
	padding var(--space-20) 0
	background white
	position relative
	z-index 1

.why-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(300px, 1fr))
	gap var(--space-8)

.why-card
	padding var(--space-8)
	border-radius var(--radius-2xl)
	background var(--color-gray-50)
	transition all var(--transition-base)
	text-align left

	&:hover
		transform translateY(-5px)
		background white
		box-shadow var(--shadow-lg)

.icon-box
	width 60px
	height 60px
	background var(--color-primary-100)
	color var(--color-primary-600)
	border-radius var(--radius-xl)
	display flex
	align-items center
	justify-content center
	margin-bottom var(--space-6)

.why-card h3
	font-size var(--text-xl)
	font-weight var(--font-bold)
	margin-bottom var(--space-3)
	color var(--color-gray-900)

.why-card p
	color var(--color-gray-600)
	line-height var(--leading-relaxed)
	font-size var(--text-lg)

.section-how
	padding var(--space-20) 0
	background var(--color-primary-50)

.steps-modern
	display grid
	grid-template-columns repeat(auto-fit, minmax(250px, 1fr))
	gap var(--space-8)
	counter-reset step

.step-modern
	position relative
	padding-left var(--space-4)
	border-left 2px solid var(--color-primary-200)

.step-number
	font-size var(--text-3xl)
	font-weight var(--font-bold)
	color var(--color-primary-500)
	opacity 0.5
	margin-bottom var(--space-2)
	font-family monospace

.step-modern h3
	font-size var(--text-xl)
	font-weight var(--font-bold)
	margin-bottom var(--space-2)

.step-modern p
	color var(--color-gray-600)
	line-height var(--leading-relaxed)

.section-cta
	padding var(--space-20) 0
	text-align center

.cta-box
	padding var(--space-12)
	max-width 800px
	margin 0 auto

	h2
		font-size var(--text-3xl)
		margin-bottom var(--space-4)

	p
		font-size var(--text-xl)
		color var(--color-gray-700)
		margin-bottom var(--space-8)

.btn-large
	padding var(--space-4) var(--space-8)
	font-size var(--text-xl)

.glass-card
	background rgba(255, 255, 255, 0.7)
	backdrop-filter blur(20px)
	-webkit-backdrop-filter blur(20px)
	border 1px solid rgba(255, 255, 255, 0.5)
	border-radius var(--radius-xl)
	box-shadow var(--shadow-lg)

.footer
	background linear-gradient(to top, var(--color-gray-900), var(--color-gray-800))
	color var(--color-gray-300)
	padding var(--space-8) 0
	border-top 1px solid rgba(255, 255, 255, 0.05)

.footer-content
	display flex
	align-items center
	justify-content space-between
	gap var(--space-6)

	@media (max-width: 640px)
		flex-direction column
		text-align center

.footer-logo
	display flex
	align-items center
	gap var(--space-2)
	font-size var(--text-lg)
	font-weight var(--font-semibold)
	color white
	opacity 0.9

.footer-description
	font-size var(--text-sm)
	color var(--color-gray-500)
	flex 1
	text-align center

	@media (max-width: 640px)
		order 3

.footer-copyright
	font-size var(--text-sm)
	color var(--color-gray-500)

@media (max-width: 768px)
	.title
		font-size 2.5rem

	.section-why, .section-how, .section-cta
		padding var(--space-12) 0
</style>
