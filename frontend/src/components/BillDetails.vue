<template>
	<div class="bill-details">
		<div class="details-header">
			<button class="back-btn" @click="$emit('close')">
				← {{ $t('common.back') || 'Back' }}
			</button>
			<h2>💳 {{ $t('dashboard.bills.details') || 'Bill Details' }}</h2>
		</div>

		<div class="details-content">
			<!-- Bill Summary Card -->
			<div class="bill-summary-card">
				<div class="bill-type">
					<span class="bill-icon">{{ bill.icon }}</span>
					<h3>{{ bill.title }}</h3>
				</div>
				
				<div class="amount-section">
					<div class="amount-label">{{ $t('bills.totalAmount') || 'Total Amount' }}</div>
					<div class="amount-value">{{ bill.amount }}</div>
				</div>

				<div class="status-badge" :class="bill.status">
					{{ bill.status === 'paid' ? ($t('dashboard.bills.paid') || '✓ Paid') : ($t('bills.unpaid') || 'Unpaid') }}
				</div>
			</div>

			<!-- Billing Information -->
			<div class="info-section">
				<h3>📋 {{ $t('bills.billingInfo') || 'Billing Information' }}</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="label">{{ $t('bills.billNumber') || 'Bill Number' }}:</span>
						<span class="value">{{ bill.billNumber || '#2024-12-001' }}</span>
					</div>
					<div class="info-item">
						<span class="label">{{ $t('bills.issueDate') || 'Issue Date' }}:</span>
						<span class="value">{{ bill.issueDate || '2024/12/01' }}</span>
					</div>
					<div class="info-item">
						<span class="label">{{ $t('bills.dueDate') || 'Due Date' }}:</span>
						<span class="value" :class="{ 'text-red': !bill.paid }">{{ bill.dueDate || '2024/12/31' }}</span>
					</div>
					<div class="info-item">
						<span class="label">{{ $t('bills.period') || 'Billing Period' }}:</span>
						<span class="value">{{ bill.period || 'December 2024' }}</span>
					</div>
				</div>
			</div>

			<!-- Breakdown -->
			<div class="breakdown-section">
				<h3>💰 {{ $t('bills.breakdown') || 'Cost Breakdown' }}</h3>
				<div class="breakdown-list">
					<div v-for="item in breakdown" :key="item.name" class="breakdown-item">
						<span class="item-name">{{ item.name }}</span>
						<span class="item-amount">{{ item.amount }}</span>
					</div>
					<div class="breakdown-total">
						<span class="total-label">{{ $t('bills.total') || 'Total' }}</span>
						<span class="total-amount">{{ bill.amount }}</span>
					</div>
				</div>
			</div>

			<!-- Payment Methods -->
			<div v-if="!bill.paid" class="payment-section">
				<h3>💳 {{ $t('bills.paymentMethod') || 'Payment Method' }}</h3>
				<div class="payment-methods">
					<button 
						v-for="method in paymentMethods" 
						:key="method.id"
						:class="['payment-method', { selected: selectedMethod === method.id }]"
						@click="selectedMethod = method.id"
					>
						<span class="method-icon">{{ method.icon }}</span>
						<span class="method-name">{{ method.name }}</span>
					</button>
				</div>

				<div v-if="selectedMethod === 'bank'" class="bank-info">
					<h4>{{ $t('bills.bankTransferInfo') || 'Bank Transfer Information' }}</h4>
					<div class="bank-details">
						<div class="bank-item">
							<span class="label">{{ $t('bills.bankName') || 'Bank' }}:</span>
							<span class="value">Mizuho Bank</span>
						</div>
						<div class="bank-item">
							<span class="label">{{ $t('bills.branchName') || 'Branch' }}:</span>
							<span class="value">Shibuya Branch (246)</span>
						</div>
						<div class="bank-item">
							<span class="label">{{ $t('bills.accountNumber') || 'Account' }}:</span>
							<span class="value">1234567</span>
						</div>
						<div class="bank-item">
							<span class="label">{{ $t('bills.accountName') || 'Name' }}:</span>
							<span class="value">Building Management Co.</span>
						</div>
					</div>
				</div>

				<button class="pay-now-btn" @click="processPayment">
					{{ processingPayment ? ($t('bills.processing') || 'Processing...') : ($t('dashboard.bills.payNow') || 'Pay Now') }}
				</button>
			</div>

			<!-- Payment History -->
			<div v-if="bill.paid" class="history-section">
				<h3>📜 {{ $t('bills.paymentHistory') || 'Payment History' }}</h3>
				<div class="history-item success">
					<span class="history-icon">✅</span>
					<div class="history-details">
						<div class="history-date">{{ bill.paidDate || '2024/11/30' }}</div>
						<div class="history-method">{{ $t('bills.paidVia') || 'Paid via' }} {{ bill.paymentMethod || 'Credit Card' }}</div>
						<div class="history-reference">{{ $t('bills.reference') || 'Ref' }}: {{ bill.reference || 'TXN-2024-11-30-001' }}</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="actions-section">
				<button class="download-btn">
					📥 {{ $t('bills.downloadReceipt') || 'Download Receipt' }}
				</button>
				<button v-if="!bill.paid" class="reminder-btn">
					🔔 {{ $t('bills.setReminder') || 'Set Payment Reminder' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps( {
	bill: {
		type: Object,
		default: () => ( {
			id: 1,
			icon: '🏢',
			title: 'Management Fee',
			amount: '¥25,000',
			billNumber: '#2024-12-001',
			issueDate: '2024/12/01',
			dueDate: '2024/12/31',
			period: 'December 2024',
			status: 'unpaid',
			paid: false
		} )
	}
} )

const emit = defineEmits( ['close', 'payment'] )

const selectedMethod = ref( 'credit' )
const processingPayment = ref( false )

const breakdown = computed( () => [
	{ name: 'Basic Management Fee', amount: '¥15,000' },
	{ name: 'Common Area Maintenance', amount: '¥5,000' },
	{ name: 'Security Services', amount: '¥3,000' },
	{ name: 'Utilities (Common Areas)', amount: '¥2,000' }
] )

const paymentMethods = [
	{ id: 'credit', icon: '💳', name: 'Credit Card' },
	{ id: 'bank', icon: '🏦', name: 'Bank Transfer' },
	{ id: 'konbini', icon: '🏪', name: 'Convenience Store' },
	{ id: 'auto', icon: '🔄', name: 'Auto-pay Setup' }
]

const processPayment = async () => {
	processingPayment.value = true
	// Simulate payment processing
	await new Promise( resolve => setTimeout( resolve, 2000 ) )
	processingPayment.value = false
	emit( 'payment', { method: selectedMethod.value, billId: props.bill.id } )
}
</script>

<style lang="stylus" scoped>
.bill-details
	background white
	border-radius 20px
	height 100%
	max-height 90vh
	display flex
	flex-direction column
	overflow hidden

.details-header
	display flex
	align-items center
	gap 1rem
	padding 1.5rem 2rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-bottom 2px solid #FFC107
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
	border 2px solid #FFC107
	border-radius 50px
	cursor pointer
	font-size 0.9rem
	font-weight 500
	transition all 0.2s ease

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateY(-1px)

.details-content
	flex 1
	overflow-y auto
	padding 2rem

	@media (max-width: 768px)
		padding 1rem

.bill-summary-card
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-radius 15px
	padding 2rem
	margin-bottom 2rem
	position relative

.bill-type
	display flex
	align-items center
	gap 1rem
	margin-bottom 1.5rem

	.bill-icon
		font-size 2.5rem

	h3
		margin 0
		color #333
		font-size 1.3rem

.amount-section
	text-align center
	margin 1.5rem 0

	.amount-label
		color #666
		font-size 0.9rem
		margin-bottom 0.5rem

	.amount-value
		font-size 2.5rem
		font-weight bold
		color #FF9800

.status-badge
	position absolute
	top 1.5rem
	right 1.5rem
	padding 0.5rem 1rem
	border-radius 20px
	font-size 0.9rem
	font-weight 500

	&.paid
		background #4CAF50
		color white

	&.unpaid
		background #FF5722
		color white

.info-section, .breakdown-section, .payment-section, .history-section
	background white
	border 2px solid #FFE082
	border-radius 15px
	padding 1.5rem
	margin-bottom 1.5rem

	h3
		margin 0 0 1rem 0
		color #333
		font-size 1.1rem

.info-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
	gap 1rem

.info-item
	display flex
	flex-direction column
	gap 0.25rem

	.label
		color #666
		font-size 0.9rem

	.value
		color #333
		font-weight 500

	.text-red
		color #F44336

.breakdown-list
	.breakdown-item
		display flex
		justify-content space-between
		padding 0.75rem 0
		border-bottom 1px solid #f0f0f0

		.item-name
			color #666

		.item-amount
			font-weight 500
			color #333

	.breakdown-total
		display flex
		justify-content space-between
		padding 1rem 0
		border-top 2px solid #FFC107
		margin-top 0.5rem

		.total-label
			font-weight 600
			color #333

		.total-amount
			font-size 1.3rem
			font-weight bold
			color #FF9800

.payment-methods
	display grid
	grid-template-columns repeat(auto-fit, minmax(150px, 1fr))
	gap 1rem
	margin-bottom 1.5rem

.payment-method
	padding 1rem
	background white
	border 2px solid #e0e0e0
	border-radius 10px
	cursor pointer
	transition all 0.2s ease
	display flex
	flex-direction column
	align-items center
	gap 0.5rem

	&:hover
		border-color #FFC107
		transform translateY(-2px)

	&.selected
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		border-color #FF9800

	.method-icon
		font-size 1.5rem

	.method-name
		font-size 0.9rem
		color #666

.bank-info
	background #f9f9f9
	padding 1rem
	border-radius 10px
	margin-bottom 1.5rem

	h4
		margin 0 0 1rem 0
		color #666
		font-size 1rem

.bank-details
	.bank-item
		display flex
		justify-content space-between
		padding 0.5rem 0
		border-bottom 1px solid #e0e0e0

		&:last-child
			border-bottom none

		.label
			color #666
			font-size 0.9rem

		.value
			font-family monospace
			color #333
			font-weight 500

.pay-now-btn
	width 100%
	padding 1rem
	background linear-gradient(135deg, #FF9800 0%, #FFB300 100%)
	color white
	border none
	border-radius 50px
	font-size 1.1rem
	font-weight 600
	cursor pointer
	transition all 0.2s ease

	&:hover
		transform translateY(-2px)
		box-shadow 0 8px 20px rgba(255, 152, 0, 0.3)

.history-item
	display flex
	align-items start
	gap 1rem
	padding 1rem
	background #f9f9f9
	border-radius 10px

	&.success
		background linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)

	.history-icon
		font-size 1.5rem

	.history-details
		flex 1

		.history-date
			font-weight 600
			color #333
			margin-bottom 0.25rem

		.history-method, .history-reference
			font-size 0.9rem
			color #666

.actions-section
	display flex
	gap 1rem
	margin-top 2rem

	@media (max-width: 768px)
		flex-direction column

.download-btn, .reminder-btn
	flex 1
	padding 0.75rem
	background white
	color #333
	border 2px solid #FFC107
	border-radius 50px
	cursor pointer
	font-size 0.95rem
	font-weight 500
	transition all 0.2s ease

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateY(-1px)
</style>