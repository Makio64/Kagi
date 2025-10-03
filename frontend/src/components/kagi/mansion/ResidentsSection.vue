<template>
	<div class="residents-section">
		<div class="residents-grid">
			<KCard
				v-for="resident in residents"
				:key="resident.id"
				hoverable
				clickable
				@click="$emit('edit', resident)"
			>
				<div class="resident-card">
					<div class="resident-header">
						<h4>{{ resident.name }}</h4>
						<StatusBadge :status="resident.status" />
					</div>
					<div class="resident-info">
						<div class="info-item">
							<span class="label">Unit:</span>
							<span class="value">{{ resident.unit }}</span>
						</div>
						<div class="info-item">
							<span class="label">Email:</span>
							<span class="value">{{ resident.email }}</span>
						</div>
						<div class="info-item">
							<span class="label">Phone:</span>
							<span class="value">{{ resident.phone }}</span>
						</div>
						<div class="info-item">
							<span class="label">Move-in:</span>
							<span class="value">{{ resident.moveInDate }}</span>
						</div>
					</div>
					<div class="resident-actions">
						<KButton size="small" variant="secondary" @click.stop="$emit('message', resident)">
							📧 Message
						</KButton>
						<KButton size="small" @click.stop="$emit('edit', resident)">
							✏️ Edit
						</KButton>
					</div>
				</div>
			</KCard>
		</div>
		<KButton class="add-resident-btn" @click="$emit('add')">
			➕ Add New Resident
		</KButton>
	</div>
</template>
<script>
export default {
	name: 'ResidentsSection',
	props: {
		residents: {
			type: Array,
			required: true
		}
	},
	emits: ['edit', 'message', 'add']
}
</script>
<style lang="stylus" scoped>
.residents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap 1.5rem
	margin-bottom 2rem
.resident-card
	h4
		margin 0 0 1rem 0
		color #333
.resident-header
	display flex
	justify-content space-between
	align-items center
	margin-bottom 1rem
.resident-info
	margin-bottom 1rem
.info-item
	display flex
	justify-content space-between
	padding 0.25rem 0
	font-size 0.9rem
	.label
		color #666
	.value
		font-weight 500
		color #333
.resident-actions
	display flex
	gap 0.5rem
	padding-top 1rem
	border-top 1px solid #f0f0f0
.add-resident-btn
	width 100%
	max-width 300px
</style>