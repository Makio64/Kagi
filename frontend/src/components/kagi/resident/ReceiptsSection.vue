<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">
				<Icon name="receipt" :size="30" color="#FFC107" />
				{{ $t('dashboard.menu.receipts') }}
			</h2>
		</div>

		<div class="receipts-container">
			<div class="receipts-list">
				<div
					v-for="receipt in mockReceipts"
					:key="receipt.id"
					class="receipt-item"
				>
					<div class="receipt-content">
						<div class="receipt-main">
							<div class="receipt-info">
								<h3 class="receipt-title">{{ receipt.title }}</h3>
								<span class="receipt-total">¥{{ receipt.total.toLocaleString() }}</span>
							</div>
							<div class="receipt-meta">
								<span class="receipt-date">
									{{ $t('dashboard.receipts.paidDate') }}: {{ receipt.paidDate }}
								</span>
							</div>
						</div>
						<button class="details-btn-small" @click="openReceipt(receipt)">
							{{ $t('dashboard.receipts.details') }} →
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Receipt Modal -->
		<transition name="modal-fade">
			<div v-if="selectedReceipt" class="receipt-modal-overlay" @click="closeReceipt">
				<div class="receipt-modal" @click.stop>
					<button class="close-modal-btn" @click="closeReceipt">✕</button>
					<div class="receipt-header">
						<h2>{{ selectedReceipt.title }}</h2>
						<span class="receipt-number">{{ $t('bills.reference') }} #{{ selectedReceipt.id }}</span>
					</div>
					<div class="receipt-details">
						<div class="detail-row">
							<span class="detail-label">{{ $t('dashboard.receipts.date') }}:</span>
							<span class="detail-value">{{ selectedReceipt.paidDate }}</span>
						</div>
						<div class="detail-row">
							<span class="detail-label">{{ $t('dashboard.receipts.period') }}:</span>
							<span class="detail-value">{{ selectedReceipt.period }}</span>
						</div>
						<div class="detail-row total">
							<span class="detail-label">{{ $t('dashboard.receipts.total') }}:</span>
							<span class="detail-value">¥{{ selectedReceipt.total.toLocaleString() }}</span>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</section>
</template>

<script>
export default {
	name: 'ReceiptsSection',
	data() {
		return {
			selectedReceipt: null,
			mockReceipts: [
				{
					id: 1,
					title: this.$t( 'dashboard.bills.managementFee' ),
					period: '2025/01',
					total: 35000,
					paidDate: '2025/01/15'
				},
				{
					id: 2,
					title: this.$t( 'dashboard.booking.gym' ),
					period: '2024/12',
					total: 5000,
					paidDate: '2024/12/15'
				},
				{
					id: 3,
					title: this.$t( 'dashboard.booking.partyRoom' ),
					period: '2024/11',
					total: 12000,
					paidDate: '2024/11/18'
				},
				{
					id: 4,
					title: this.$t( 'dashboard.services.flowerDelivery' ),
					period: '2024/10',
					total: 3500,
					paidDate: '2024/10/20'
				}
			]
		}
	},
	methods: {
		openReceipt( receipt ) {
			this.selectedReceipt = receipt
		},
		closeReceipt() {
			this.selectedReceipt = null
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


.receipts-container
	padding 0 2rem 3rem 2rem
	max-width 700px
	margin 0 auto

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem

	.receipts-container
		padding 0 1rem 2rem 1rem

.receipts-list
	background white
	border-radius 12px
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	overflow hidden

.receipt-item
	position relative
	display flex
	border-bottom 1px solid #f0f0f0
	transition all 0.2s ease

	&:last-child
		border-bottom none

	&:hover
		background #fafbfc

.receipt-content
	flex 1
	display flex
	align-items center
	justify-content space-between
	gap 1rem
	padding 1rem 1.5rem

.receipt-main
	flex 1

.receipt-info
	display flex
	align-items baseline
	gap 1rem
	margin-bottom 0.5rem

.receipt-title
	margin 0
	font-size 0.95rem
	font-weight 600
	color #333

.receipt-total
	font-size 1.1rem
	font-weight 700
	color #4CAF50

.receipt-meta
	display flex
	align-items center
	gap 1rem
	font-size 0.85rem

.receipt-date
	color #666

.details-btn-small
	padding 0.5rem 1.25rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	border none
	border-radius 25px
	font-size 0.85rem
	font-weight 600
	cursor pointer
	transition all 0.25s ease
	white-space nowrap
	box-shadow 0 3px 10px rgba(255, 193, 7, 0.25)

	&:hover
		background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
		transform translateY(-2px)
		box-shadow 0 5px 15px rgba(255, 193, 7, 0.35)

// Receipt Modal
.receipt-modal-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	display flex
	align-items center
	justify-content center
	z-index 10000
	padding 1rem

.receipt-modal
	background white
	border-radius 16px
	max-width 500px
	width 100%
	padding 2rem
	position relative
	box-shadow 0 20px 60px rgba(0, 0, 0, 0.3)

.close-modal-btn
	position absolute
	top 1rem
	right 1rem
	background transparent
	border none
	font-size 1.5rem
	color #666
	cursor pointer
	width 32px
	height 32px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	transition all 0.2s ease

	&:hover
		background #f5f5f5
		color #333

.receipt-header
	margin-bottom 1.5rem
	padding-bottom 1rem
	border-bottom 2px solid #f0f0f0

	h2
		margin 0 0 0.5rem 0
		font-size 1.5rem
		color #333

	.receipt-number
		color #666
		font-size 0.9rem

.receipt-details
	.detail-row
		display flex
		justify-content space-between
		padding 0.75rem 0
		border-bottom 1px solid #f5f5f5

		&:last-child
			border-bottom none

		&.total
			margin-top 1rem
			padding-top 1rem
			border-top 2px solid #f0f0f0
			border-bottom none

			.detail-label, .detail-value
				font-size 1.2rem
				font-weight 700

	.detail-label
		color #666
		font-weight 500

	.detail-value
		color #333
		font-weight 600

		.total &
			color #4CAF50

.modal-fade-enter-active, .modal-fade-leave-active
	transition all 0.3s ease

.modal-fade-enter-from, .modal-fade-leave-to
	opacity 0

.modal-fade-enter-from .receipt-modal,
.modal-fade-leave-to .receipt-modal
	transform scale(0.9)

@media (max-width: 768px)
	.receipt-content
		flex-direction column
		align-items stretch
		gap 0.75rem

	.receipt-info
		flex-direction column
		gap 0.25rem

	.receipt-meta
		flex-direction column
		align-items flex-start
		gap 0.5rem

	.details-btn-small
		width 100%
</style>
