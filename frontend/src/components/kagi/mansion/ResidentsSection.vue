<template>
	<div class="residents-section">
		<SectionHeader
			:title="$t('mansion.residents.title') || 'Residents'"
			icon="👥"
		>
			<template #actions>
				<KButton variant="primary" icon="➕" @click="$emit('add')">
					{{ $t('mansion.residents.invite') || 'Invite Resident' }}
				</KButton>
			</template>
		</SectionHeader>

		<div v-if="loading" class="loading-state">
			<p>{{ $t('common.loading') || 'Loading...' }}</p>
		</div>

		<div v-else-if="residents.length === 0" class="empty-state">
			<p>{{ $t('mansion.residents.empty') || 'No residents yet.' }}</p>
			<KButton variant="primary" @click="$emit('add')">
				{{ $t('mansion.residents.invite') || 'Invite First Resident' }}
			</KButton>
		</div>

		<div v-else class="residents-grid">
			<KCard
				v-for="resident in residents"
				:key="resident.id"
				hoverable
				clickable
				@click="$emit('edit', resident)"
			>
				<div class="resident-card">
					<div class="resident-header">
						<h4>{{ resident.name || resident.email }}</h4>
						<StatusBadge :status="resident.status || 'active'" />
					</div>
					<div class="resident-info">
						<div class="info-item">
							<span class="label">{{ $t('mansion.residents.unit') || 'Unit' }}:</span>
							<span class="value">{{ resident.unit || '-' }}</span>
						</div>
						<div class="info-item">
							<span class="label">{{ $t('mansion.residents.email') || 'Email' }}:</span>
							<span class="value">{{ resident.email }}</span>
						</div>
						<div v-if="resident.phone" class="info-item">
							<span class="label">{{ $t('mansion.residents.phone') || 'Phone' }}:</span>
							<span class="value">{{ resident.phone }}</span>
						</div>
					</div>
					<div class="resident-actions">
						<KButton size="small" variant="secondary" @click.stop="$emit('message', resident)">
							📧 {{ $t('common.message') || 'Message' }}
						</KButton>
						<KButton size="small" @click.stop="$emit('edit', resident)">
							✏️ {{ $t('common.edit') || 'Edit' }}
						</KButton>
					</div>
				</div>
			</KCard>
		</div>
	</div>
</template>
<script>
export default {
	name: 'ResidentsSection',
	props: {
		residents: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	emits: ['edit', 'message', 'add']
}
</script>
<style lang="stylus" scoped>
.residents-section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.loading-state, .empty-state
	text-align center
	padding 3rem
	color #666
	p
		margin-bottom 1rem

.residents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap 1.5rem

.resident-card
	h4
		margin 0
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
</style>