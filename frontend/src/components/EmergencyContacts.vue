<template>
	<div class="emergency-contacts">
		<div class="contacts-header">
			<button class="back-btn" @click="$emit('close')">
				← {{ $t('common.back') }}
			</button>
			<h2>⚠️ {{ $t('dashboard.contact.emergency.title') }}</h2>
		</div>

		<div class="contacts-content">
			<div class="alert-banner">
				<span class="alert-icon">🚨</span>
				<p>{{ $t('emergency.instructions') }}</p>
			</div>

			<div class="contacts-grid">
				<div class="contact-card urgent">
					<div class="contact-icon">🚒</div>
					<h3>{{ $t('emergency.fire') }}</h3>
					<a href="tel:119" class="phone-number">119</a>
					<p class="contact-note">{{ $t('emergency.fireNote') }}</p>
				</div>

				<div class="contact-card urgent">
					<div class="contact-icon">👮</div>
					<h3>{{ $t('emergency.police') }}</h3>
					<a href="tel:110" class="phone-number">110</a>
					<p class="contact-note">{{ $t('emergency.policeNote') }}</p>
				</div>

				<div class="contact-card">
					<div class="contact-icon">🏢</div>
					<h3>{{ $t('emergency.buildingManager') }}</h3>
					<a href="tel:03-1234-5678" class="phone-number">03-1234-5678</a>
					<p class="contact-note">{{ $t('emergency.managerHours') }}</p>
					<p class="contact-note emergency">{{ $t('emergency.managerEmergency') }}</p>
				</div>

				<div class="contact-card">
					<div class="contact-icon">🔧</div>
					<h3>{{ $t('emergency.maintenance') }}</h3>
					<a href="tel:0120-123-456" class="phone-number">0120-123-456</a>
					<p class="contact-note">{{ $t('emergency.maintenanceNote') }}</p>
				</div>

				<div class="contact-card">
					<div class="contact-icon">🔒</div>
					<h3>{{ $t('emergency.locksmith') }}</h3>
					<a href="tel:0120-987-654" class="phone-number">0120-987-654</a>
					<p class="contact-note">{{ $t('emergency.locksmithNote') }}</p>
				</div>

				<div class="contact-card">
					<div class="contact-icon">⚡</div>
					<h3>{{ $t('emergency.utilities') }}</h3>
					<div class="utility-list">
						<div class="utility-item">
							<span>{{ $t('emergency.electricity') }}:</span>
							<a href="tel:0120-111-222">0120-111-222</a>
						</div>
						<div class="utility-item">
							<span>{{ $t('emergency.gas') }}:</span>
							<a href="tel:0120-333-444">0120-333-444</a>
						</div>
						<div class="utility-item">
							<span>{{ $t('emergency.water') }}:</span>
							<a href="tel:0120-555-666">0120-555-666</a>
						</div>
					</div>
				</div>
			</div>

			<div class="emergency-tips">
				<h3>{{ $t('emergency.tips') }}</h3>
				<ul>
					<li>{{ $t('emergency.tip1') }}</li>
					<li>{{ $t('emergency.tip2') }}</li>
					<li>{{ $t('emergency.tip3') }}</li>
					<li>{{ $t('emergency.tip4') }}</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
defineEmits( ['close'] )
</script>

<style lang="stylus" scoped>
.emergency-contacts
	background white
	border-radius 20px
	height 100%
	max-height 90vh
	display flex
	flex-direction column
	overflow hidden

.contacts-header
	display flex
	align-items center
	gap 1rem
	padding 1.5rem 2rem
	background linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)
	border-bottom 2px solid #FF9800
	flex-shrink 0

	h2
		flex 1
		margin 0
		color #333
		font-size 1.5rem
		text-align center

.back-btn
	padding 0.6rem 1.25rem
	background white
	color #333
	border 2px solid #FF9800
	border-radius 50px
	cursor pointer
	font-size 0.9rem
	font-weight 500
	transition all 0.2s ease

	&:hover
		background linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)
		transform translateY(-1px)

.alert-banner
	background linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)
	border 2px solid #F44336
	border-radius 15px
	padding 1.5rem
	margin-bottom 2rem
	display flex
	align-items center
	gap 1rem

	.alert-icon
		font-size 2rem
		animation pulse 1.5s ease-in-out infinite

	p
		margin 0
		color #C62828
		font-weight 500
		font-size 1.05rem

@keyframes pulse
	0%, 100%
		transform scale(1)
	50%
		transform scale(1.1)

.contacts-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(280px, 1fr))
	gap 1.5rem

.contact-card
	background white
	border 2px solid rgba(255, 193, 7, 0.2)
	border-radius 15px
	padding 1.5rem
	transition all 0.3s ease

	&:hover
		transform translateY(-3px)
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.15)

	&.urgent
		border-color #F44336
		background linear-gradient(135deg, #FFF 0%, #FFEBEE 100%)

		.phone-number
			color #F44336
			font-size 1.8rem

	.contact-icon
		font-size 2.5rem
		margin-bottom 1rem

	h3
		color #333
		margin 0.5rem 0
		font-size 1.1rem

	.phone-number
		display block
		color #FFC107
		font-size 1.5rem
		font-weight 600
		text-decoration none
		margin 0.5rem 0
		transition color 0.2s ease

		&:hover
			color #FFB300

	.contact-note
		color #666
		font-size 0.9rem
		margin 0.25rem 0

		&.emergency
			color #F44336
			font-weight 500

.utility-list
	margin-top 0.75rem

	.utility-item
		display flex
		justify-content space-between
		padding 0.5rem 0
		border-bottom 1px solid #f0f0f0

		&:last-child
			border-bottom none

		span
			color #666
			font-size 0.9rem

		a
			color #FFC107
			text-decoration none
			font-weight 500

			&:hover
				color #FFB300

.contacts-content
	flex 1
	overflow-y auto
	padding 2rem

	@media (max-width: 768px)
		padding 1rem

.emergency-tips
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	padding 2rem
	margin-top 2rem
	border-radius 15px

	h3
		color #333
		margin-bottom 1rem

	ul
		margin 0
		padding-left 1.5rem

		li
			color #666
			margin-bottom 0.75rem
			line-height 1.5
</style>