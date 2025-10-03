<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">💳 {{ $t('dashboard.menu.bills') }}</h2>
		</div>

		<div class="bills-container">
			<div class="bills-list">
				<div
					v-for="bill in mockBills"
					:key="bill.id"
					:class="['bill-item', bill.status]"
				>
					<div class="bill-status-indicator" />
					<div class="bill-content">
						<div class="bill-main">
							<div class="bill-info">
								<h3 class="bill-title">{{ bill.title }}</h3>
								<span class="bill-total">¥{{ bill.total.toLocaleString() }}</span>
							</div>
							<div class="bill-meta">
								<span class="bill-date">
									<span v-if="bill.status === 'paid'">{{ $t('dashboard.bills.paidDate') }}: {{ bill.paidDate }}</span>
									<span v-else class="due">{{ $t('dashboard.bills.dueDate') }}: {{ bill.dueDate }}</span>
								</span>
								<span :class="['status-badge', bill.status]">
									{{ bill.status === 'paid' ? '✓ Paid' : 'Unpaid' }}
								</span>
							</div>
						</div>
						<button v-if="bill.status !== 'paid'" class="pay-btn-small">
							{{ $t('dashboard.bills.payNow') }}
						</button>
						<button v-else class="details-btn-small">
							{{ $t('dashboard.bills.details') }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: 'BillsSection',
	data() {
		return {
			// Mock bills data - in the future this will come from API
			mockBills: [
				{
					id: 1,
					title: 'Management Fee',
					period: '2025/01',
					status: 'unpaid',
					total: 35000,
					dueDate: '2025/01/31',
					paidDate: null
				},
				{
					id: 2,
					title: 'Gym Booking',
					period: '2024/12',
					status: 'paid',
					total: 5000,
					dueDate: '2024/12/31',
					paidDate: '2024/12/15'
				},
				{
					id: 3,
					title: 'Party Room Rental',
					period: '2024/11',
					status: 'paid',
					total: 12000,
					dueDate: '2024/11/30',
					paidDate: '2024/11/18'
				},
				{
					id: 4,
					title: 'Flower Delivery Service',
					period: '2024/10',
					status: 'paid',
					total: 3500,
					dueDate: '2024/10/31',
					paidDate: '2024/10/20'
				}
			]
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

.bills-container
	padding 0 2rem 3rem 2rem
	max-width 700px
	margin 0 auto

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem

	.bills-container
		padding 0 1rem 2rem 1rem

.bills-list
	background white
	border-radius 12px
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	overflow hidden

.bill-item
	position relative
	display flex
	border-bottom 1px solid #f0f0f0
	transition all 0.2s ease

	&:last-child
		border-bottom none

	&:hover
		background #fafbfc

.bill-status-indicator
	width 4px
	background #e0e0e0

.bill-item.unpaid .bill-status-indicator
	background #FFC107

.bill-item.paid .bill-status-indicator
	background #4CAF50

.bill-content
	flex 1
	display flex
	align-items center
	justify-content space-between
	gap 1rem
	padding 1rem 1.5rem

.bill-main
	flex 1

.bill-info
	display flex
	align-items baseline
	gap 1rem
	margin-bottom 0.5rem

.bill-title
	margin 0
	font-size 0.95rem
	font-weight 600
	color #333

.bill-total
	font-size 1.1rem
	font-weight 700
	color #1976D2

.bill-meta
	display flex
	align-items center
	gap 1rem
	font-size 0.85rem

.bill-date
	color #666

	.due
		color #E65100
		font-weight 500

.status-badge
	padding 0.25rem 0.6rem
	border-radius 4px
	font-size 0.75rem
	font-weight 500

	&.paid
		background #E8F5E9
		color #2E7D32

	&.unpaid
		background #FFF3E0
		color #E65100

.pay-btn-small
	padding 0.5rem 1.25rem
	background #1976D2
	color white
	border none
	border-radius 6px
	font-size 0.85rem
	font-weight 500
	cursor pointer
	transition all 0.2s ease
	white-space nowrap

	&:hover
		background #1565C0

.details-btn-small
	padding 0.5rem 1.25rem
	background transparent
	color #1976D2
	border 1px solid #e0e0e0
	border-radius 6px
	font-size 0.85rem
	font-weight 500
	cursor pointer
	transition all 0.2s ease
	white-space nowrap

	&:hover
		background #f5f5f5
		border-color #1976D2

@media (max-width: 768px)
	.bill-content
		flex-direction column
		align-items stretch
		gap 0.75rem

	.bill-info
		flex-direction column
		gap 0.25rem

	.bill-meta
		flex-direction column
		align-items flex-start
		gap 0.5rem

	.pay-btn-small, .details-btn-small
		width 100%
</style>
