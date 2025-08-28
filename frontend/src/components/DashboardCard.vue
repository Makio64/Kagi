<template>
	<div 
		class="dashboard-card" 
		:class="{ clickable: clickable || to, active }"
		@click="handleClick"
	>
		<div v-if="icon" class="card-icon">{{ icon }}</div>
		<div v-if="image" class="card-image">
			<div class="image-placeholder">
				<span class="placeholder-icon">{{ image }}</span>
			</div>
		</div>
		<div class="card-content">
			<h3 v-if="title">{{ title }}</h3>
			<p v-if="description" class="card-description">{{ description }}</p>
			<div v-if="info" class="card-info">{{ info }}</div>
			<slot></slot>
		</div>
		<div v-if="actions || $slots.actions" class="card-actions">
			<slot name="actions">
				<button 
					v-for="action in actions" 
					:key="action.text"
					:class="['action-btn', action.class]"
					@click.stop="action.handler"
				>
					{{ action.text }}
				</button>
			</slot>
		</div>
		<div v-if="badge" class="card-badge" :class="badge.class">
			{{ badge.text }}
		</div>
	</div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const props = defineProps({
	icon: String,
	image: String,
	title: String,
	description: String,
	info: String,
	to: String,
	clickable: Boolean,
	active: Boolean,
	actions: Array,
	badge: Object
})

const emit = defineEmits(['click'])
const instance = getCurrentInstance()

const handleClick = () => {
	if (props.to) {
		instance?.proxy.$router.push(props.to)
	} else if (props.clickable) {
		emit('click')
	}
}
</script>

<style lang="stylus" scoped>
.dashboard-card
	background #f9f9f9
	border-radius 12px
	padding 1.5rem
	transition all 0.3s ease
	position relative
	display flex
	flex-direction column
	height 100%
	
	&.clickable
		cursor pointer
		
		&:hover
			transform translateY(-4px)
			box-shadow 0 8px 20px rgba(0, 0, 0, 0.12)
			background #fff
	
	&.active
		background #FFF9C4
		border 2px solid #FFC107

.card-icon
	font-size 3rem
	margin-bottom 1rem
	text-align center

.card-image
	margin -1.5rem -1.5rem 1rem -1.5rem
	border-radius 12px 12px 0 0
	overflow hidden

	.image-placeholder
		width 100%
		height 200px
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		display flex
		align-items center
		justify-content center

		.placeholder-icon
			font-size 4rem

.card-content
	flex 1
	
	h3
		color #333
		margin 0 0 0.75rem 0
		font-size 1.2rem
		font-weight 600
	
	.card-description
		color #666
		line-height 1.6
		margin 0 0 1rem 0
		font-size 0.95rem
	
	.card-info
		color #777
		font-size 0.9rem
		margin 0.5rem 0

.card-actions
	margin-top auto
	padding-top 1rem
	display flex
	gap 0.75rem
	flex-wrap wrap

.action-btn
	flex 1
	min-width 100px
	padding 0.65rem 1rem
	border none
	border-radius 8px
	font-weight 600
	cursor pointer
	transition all 0.2s ease
	font-size 0.95rem
	text-align center
	
	// Default style
	background #FFC107
	color #333
	
	&:hover
		background #FFB300
		transform translateY(-1px)
	
	// Style variants
	&.primary
		background #2196F3
		color white
		
		&:hover
			background #1976D2
	
	&.booking
		background white
		color #333
		border 2px solid #FFC107
		box-shadow 0 2px 8px rgba(255, 193, 7, 0.15)
		
		&:hover
			background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
			transform translateY(-2px)
			box-shadow 0 4px 12px rgba(255, 193, 7, 0.25)
			border-color #FFB300
	
	&.success
		background white
		color #4CAF50
		border 2px solid #4CAF50
		box-shadow 0 2px 8px rgba(76, 175, 80, 0.15)
		
		&:hover
			background linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)
			transform translateY(-2px)
			box-shadow 0 4px 12px rgba(76, 175, 80, 0.25)
			border-color #45A049
	
	&.danger
		background white
		color #F44336
		border 2px solid #F44336
		box-shadow 0 2px 8px rgba(244, 67, 54, 0.15)
		
		&:hover
			background linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)
			transform translateY(-2px)
			box-shadow 0 4px 12px rgba(244, 67, 54, 0.25)
			border-color #D32F2F
	
	&.secondary
		background #e0e0e0
		color #333
		
		&:hover
			background #d0d0d0

.card-badge
	position absolute
	top 1rem
	right 1rem
	padding 0.35rem 0.75rem
	border-radius 20px
	font-size 0.85rem
	font-weight 600
	
	&.success
		background #E8F5E9
		color #2E7D32
	
	&.warning
		background #FFF3E0
		color #F57C00
	
	&.danger
		background #FFEBEE
		color #C62828
	
	&.info
		background #E3F2FD
		color #1565C0

@media (max-width: 768px)
	.dashboard-card
		padding 1rem
		
		.card-icon
			font-size 2.5rem
		
		.card-image .image-placeholder
			height 150px
		
		.card-actions
			flex-direction column
			
			.action-btn
				width 100%
</style>