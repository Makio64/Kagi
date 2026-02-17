<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">
				<Icon name="maintenance" :size="30" color="#FFC107" />
				{{ $t('dashboard.menu.maintenance') }}
			</h2>
		</div>
		<!-- Category Selection -->
		<div v-if="!selectedCategory" class="maintenance-categories">
			<h3>{{ $t('dashboard.maintenance.selectCategory') }}</h3>
			<div class="category-grid">
				<button
					v-for="category in categories"
					:key="category.id"
					class="category-card"
					@click="selectCategory(category.id)"
				>
					<span class="category-icon">{{ category.icon }}</span>
					<h4>{{ $t(`dashboard.maintenance.${category.id}`) }}</h4>
					<p>{{ $t(category.descriptionKey) }}</p>
				</button>
			</div>
		</div>
		<!-- Request Form -->
		<div v-else class="maintenance-form-container">
			<button class="back-btn" @click="selectedCategory = null">
				← {{ $t('common.back') }}
			</button>
			<div class="selected-category">
				<span class="category-icon">{{ getCategoryIcon(selectedCategory) }}</span>
				<h3>{{ $t(`dashboard.maintenance.${selectedCategory}`) }}</h3>
			</div>
			<form @submit.prevent="submitRequest">
				<div class="form-group">
					<label>{{ $t('dashboard.maintenance.title') }}</label>
					<input
						v-model="form.title"
						type="text"
						:placeholder="$t('dashboard.maintenance.titlePlaceholder')"
						required
					>
				</div>
				<div class="form-group">
					<label>{{ $t('dashboard.maintenance.description') }}</label>
					<textarea
						v-model="form.description"
						rows="6"
						:placeholder="$t('dashboard.maintenance.descriptionPlaceholder')"
						required
					/>
				</div>
				<div class="form-actions">
					<button type="submit" class="submit-btn">
						{{ $t('dashboard.maintenance.submit') }}
					</button>
				</div>
			</form>
			<!-- Success Message -->
			<transition name="fade">
				<div v-if="showSuccess" class="success-message">
					<span class="success-icon">✓</span>
					<div>
						<h4>{{ $t('dashboard.maintenance.success.title') }}</h4>
						<p>{{ $t('dashboard.maintenance.success.description') }}</p>
					</div>
				</div>
			</transition>
		</div>
	</section>
</template>
<script>
import { getCategoryIcon, getCategoryName, maintenanceCategories } from '../../../utils/maintenanceUtils'
export default {
	name: 'MaintenanceSection',
	data() {
		return {
			selectedCategory: null,
			form: {
				title: '',
				description: ''
			},
			showSuccess: false,
			categories: maintenanceCategories
		}
	},
	methods: {
		selectCategory( categoryId ) {
			this.selectedCategory = categoryId
		},
		getCategoryIcon( category ) {
			return getCategoryIcon( category )
		},
		getCategoryName( category ) {
			return getCategoryName( category )
		},
		submitRequest() {
			const request = {
				category: this.selectedCategory,
				...this.form
			}
			console.log( 'Maintenance request:', request )
			// Show success message
			this.showSuccess = true
			// Reset form after delay
			setTimeout( () => {
				this.selectedCategory = null
				this.form.title = ''
				this.form.description = ''
				this.showSuccess = false
			}, 3000 )
		},
		cancelRequest() {
			this.selectedCategory = null
			this.form.title = ''
			this.form.description = ''
		}
	}
}
</script>
<style lang="stylus" scoped>
.section
	padding 0

.section-header
	padding 2rem 2rem 2rem 2rem

.section-title
	margin 0
	font-size 1.75rem
	font-weight 600
	color #333
	display flex
	align-items center
	gap 0.5rem
	justify-content center

.maintenance-categories
	padding 0 2rem 3rem 2rem

	h3
		font-size 1.25rem
		color #333
		margin-bottom 1.5rem

.category-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
	gap 1rem
	@media (max-width: 768px)
		grid-template-columns repeat(auto-fill, minmax(150px, 1fr))

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem

	.maintenance-categories
		padding 0 1rem 2rem 1rem

.category-card
	background white
	border 2px solid #e0e0e0
	border-radius 12px
	padding 1.5rem
	cursor pointer
	transition all 0.2s ease
	text-align center
	&:hover
		border-color #FFC107
		transform translateY(-2px)
		box-shadow 0 4px 12px rgba(0, 0, 0, 0.1)
	.category-icon
		font-size 2.5rem
		display block
		margin-bottom 0.75rem
	h4
		font-size 1.1rem
		color #333
		margin-bottom 0.5rem
	p
		font-size 0.85rem
		color #666
		line-height 1.4
.maintenance-form-container
	max-width 600px
.back-btn
	background none
	border none
	color #666
	font-size 0.95rem
	cursor pointer
	padding 0.5rem 0
	margin-bottom 1.5rem
	transition color 0.2s ease
	&:hover
		color #FFC107
.selected-category
	display flex
	align-items center
	gap 1rem
	padding 1rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-radius 12px
	margin-bottom 2rem
	.category-icon
		font-size 2rem
	h3
		font-size 1.25rem
		color #333
		margin 0
.form-group
	margin-bottom 1.5rem
	label
		display block
		font-size 0.9rem
		color #555
		margin-bottom 0.5rem
		font-weight 500
	input,
	textarea
		width 100%
		padding 0.75rem
		border 1px solid #ddd
		border-radius 8px
		font-size 0.95rem
		font-family inherit
		transition border-color 0.2s ease
		&:focus
			outline none
			border-color #FFC107
	textarea
		resize vertical
		min-height 120px
.form-actions
	display flex
	gap 1rem
	justify-content flex-end
	@media (max-width: 480px)
		flex-direction column-reverse
.submit-btn
	padding 0.875rem 2rem
	border none
	border-radius 8px
	font-size 1rem
	font-weight 600
	cursor pointer
	transition all 0.2s ease
	width 100%
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	&:hover
		transform translateY(-1px)
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)
.success-message
	display flex
	align-items center
	gap 1rem
	padding 1.25rem
	background #E8F5E9
	border-radius 12px
	margin-top 2rem
	.success-icon
		font-size 2rem
		color #4CAF50
		background white
		width 50px
		height 50px
		border-radius 50%
		display flex
		align-items center
		justify-content center
		flex-shrink 0
	h4
		font-size 1.1rem
		color #2E7D32
		margin-bottom 0.25rem
	p
		font-size 0.9rem
		color #558B2F
		margin 0
// Animations
@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)
.fade-enter-active,
.fade-leave-active
	transition opacity 0.3s ease
.fade-enter-from,
.fade-leave-to
	opacity 0
</style>
