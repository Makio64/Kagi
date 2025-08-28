<template>
	<div class="home">
		<div class="language-switcher-container">
			<LanguageSwitcher />
		</div>
		<header class="hero">
			<div class="hero-content">
				<div class="logo-container">
					<KagiLogo :size="120" />
				</div>
				<h1 class="title">{{ $t('app.name') }}</h1>
				<p class="subtitle">{{ $t('home.hero.subtitle') }}</p>
				<p class="description">{{ $t('home.hero.description') }}</p>
				<div class="cta-buttons">
					<button @click="$router.push('/login')" class="btn btn-primary">
						{{ $t('home.hero.getStarted') }}
					</button>
					<button @click="scrollToFeatures" class="btn btn-secondary">
						{{ $t('home.hero.learnMore') }}
					</button>
				</div>
			</div>
		</header>

		<section ref="featuresSection" class="features">
			<div class="container">
				<h2 class="section-title">{{ $t('home.features.title') }}</h2>
				<div class="features-grid">
					<div class="feature-card">
						<div class="feature-icon">📱</div>
						<h3>{{ $t('home.features.communication.title') }}</h3>
						<p>{{ $t('home.features.communication.description') }}</p>
					</div>
					<div class="feature-card">
						<div class="feature-icon">📄</div>
						<h3>{{ $t('home.features.documents.title') }}</h3>
						<p>{{ $t('home.features.documents.description') }}</p>
					</div>
					<div class="feature-card">
						<div class="feature-icon">📅</div>
						<h3>{{ $t('home.features.booking.title') }}</h3>
						<p>{{ $t('home.features.booking.description') }}</p>
					</div>
					<div class="feature-card">
						<div class="feature-icon">🔧</div>
						<h3>{{ $t('home.features.maintenance.title') }}</h3>
						<p>{{ $t('home.features.maintenance.description') }}</p>
					</div>
					<div class="feature-card">
						<div class="feature-icon">📢</div>
						<h3>{{ $t('home.features.events.title') }}</h3>
						<p>{{ $t('home.features.events.description') }}</p>
					</div>
					<div class="feature-card">
						<div class="feature-icon">💳</div>
						<h3>{{ $t('home.features.bills.title') }}</h3>
						<p>{{ $t('home.features.bills.description') }}</p>
					</div>
				</div>
			</div>
		</section>

		<section class="how-it-works">
			<div class="container">
				<h2 class="section-title">{{ $t('home.howItWorks.title') }}</h2>
				<div class="steps">
					<div class="step">
						<div class="step-number">1</div>
						<h3>{{ $t('home.howItWorks.step1.title') }}</h3>
						<p>{{ $t('home.howItWorks.step1.description') }}</p>
					</div>
					<div class="step">
						<div class="step-number">2</div>
						<h3>{{ $t('home.howItWorks.step2.title') }}</h3>
						<p>{{ $t('home.howItWorks.step2.description') }}</p>
					</div>
					<div class="step">
						<div class="step-number">3</div>
						<h3>{{ $t('home.howItWorks.step3.title') }}</h3>
						<p>{{ $t('home.howItWorks.step3.description') }}</p>
					</div>
				</div>
			</div>
		</section>

		<section class="benefits">
			<div class="container">
				<h2 class="section-title">{{ $t('home.benefits.title') }}</h2>
				<div class="benefits-grid">
					<div class="benefit">
						<h3>{{ $t('home.benefits.forManagement.title') }}</h3>
						<ul>
							<li>{{ $t('home.benefits.forManagement.item1') }}</li>
							<li>{{ $t('home.benefits.forManagement.item2') }}</li>
							<li>{{ $t('home.benefits.forManagement.item3') }}</li>
							<li>{{ $t('home.benefits.forManagement.item4') }}</li>
						</ul>
					</div>
					<div class="benefit">
						<h3>{{ $t('home.benefits.forResidents.title') }}</h3>
						<ul>
							<li>{{ $t('home.benefits.forResidents.item1') }}</li>
							<li>{{ $t('home.benefits.forResidents.item2') }}</li>
							<li>{{ $t('home.benefits.forResidents.item3') }}</li>
							<li>{{ $t('home.benefits.forResidents.item4') }}</li>
						</ul>
					</div>
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
					<p>{{ $t('home.footer.copyright') }}</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
import KagiLogo from '../components/KagiLogo.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

export default {
	components: {
		KagiLogo,
		LanguageSwitcher
	},
	setup() {
		const featuresSection = ref(null)

		const scrollToFeatures = () => {
			featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
		}

		return {
			featuresSection,
			scrollToFeatures
		}
	}
}
</script>

<style lang="stylus" scoped>
.home
	min-height 100vh
	background linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)
	position relative

.language-switcher-container
	position fixed
	top 20px
	right 20px
	z-index 100

.hero
	min-height 100vh
	display flex
	align-items center
	justify-content center
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	padding 2rem

.hero-content
	text-align center
	max-width 800px

.logo-container
	animation float 3s ease-in-out infinite
	margin-bottom 2rem

@keyframes float
	0%, 100%
		transform translateY(0)
	50%
		transform translateY(-10px)

.title
	font-size 4rem
	font-weight bold
	color #333
	margin 1rem 0
	letter-spacing 0.05em

.subtitle
	font-size 1.5rem
	color #666
	margin 0.5rem 0

.description
	font-size 1.2rem
	color #777
	margin 1rem 0 2rem

.cta-buttons
	display flex
	gap 1rem
	justify-content center
	flex-wrap wrap

.btn
	padding 1rem 2rem
	font-size 1.1rem
	border none
	border-radius 50px
	cursor pointer
	transition all 0.3s ease
	font-weight 500

.btn-primary
	background #FFC107
	color #333
	box-shadow 0 4px 15px rgba(255, 193, 7, 0.3)

	&:hover
		background #FFB300
		transform translateY(-2px)
		box-shadow 0 6px 20px rgba(255, 193, 7, 0.4)

.btn-secondary
	background white
	color #333
	border 2px solid #FFC107

	&:hover
		background #FFC107
		color #333
		transform translateY(-2px)

.container
	max-width 1200px
	margin 0 auto
	padding 0 2rem

.section-title
	font-size 2.5rem
	text-align center
	margin 3rem 0
	color #333

.features
	padding 5rem 0
	background white

.features-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(300px, 1fr))
	gap 2rem
	margin-top 3rem

.feature-card
	background #fff
	padding 2rem
	border-radius 15px
	box-shadow 0 5px 15px rgba(0,0,0,0.08)
	transition all 0.3s ease
	text-align center

	&:hover
		transform translateY(-5px)
		box-shadow 0 10px 25px rgba(0,0,0,0.15)

.feature-icon
	font-size 3rem
	margin-bottom 1rem

.feature-card h3
	font-size 1.3rem
	margin 1rem 0
	color #333

.feature-card p
	color #666
	line-height 1.6

.how-it-works
	padding 5rem 0
	background #FFFDE7

.steps
	display flex
	justify-content space-around
	flex-wrap wrap
	gap 2rem
	margin-top 3rem

.step
	text-align center
	flex 1
	min-width 250px

.step-number
	width 60px
	height 60px
	background #FFC107
	color #333
	border-radius 50%
	display flex
	align-items center
	justify-content center
	font-size 1.5rem
	font-weight bold
	margin 0 auto 1rem

.step h3
	font-size 1.3rem
	margin 1rem 0
	color #333

.step p
	color #666

.benefits
	padding 5rem 0
	background white

.benefits-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(400px, 1fr))
	gap 3rem
	margin-top 3rem

.benefit
	background #f9f9f9
	padding 2.5rem
	border-radius 15px
	box-shadow 0 5px 15px rgba(0,0,0,0.08)

.benefit h3
	font-size 1.5rem
	margin-bottom 1.5rem
	color #333
	border-bottom 3px solid #FFC107
	padding-bottom 0.5rem

.benefit ul
	list-style none
	padding 0

.benefit li
	padding 0.75rem 0
	color #666
	position relative
	padding-left 2rem

	&:before
		content "✓"
		position absolute
		left 0
		color #FFC107
		font-weight bold
		font-size 1.2rem

.footer
	background #333
	color white
	padding 3rem 0
	text-align center

.footer-content
	display flex
	flex-direction column
	align-items center
	gap 1rem

.footer-logo
	display flex
	align-items center
	gap 0.5rem
	font-size 1.5rem
	font-weight bold

.key-logo-small
	width 40px
	height 40px

@media (max-width: 768px)
	.title
		font-size 2.5rem
	
	.subtitle
		font-size 1.2rem
	
	.features-grid
		grid-template-columns 1fr
	
	.benefits-grid
		grid-template-columns 1fr
</style>