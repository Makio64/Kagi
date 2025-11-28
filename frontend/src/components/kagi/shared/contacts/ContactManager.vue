<template>
	<div class="contact-manager">
		<div class="manager-header">
			<button class="back-btn" @click="$emit('close')">
				← {{ $t('common.back') }}
			</button>
			<h2>{{ $t('dashboard.contact.manager.title') }}</h2>
		</div>
		<div class="contact-tabs">
			<button
				:class="['tab', { active: activeTab === 'message' }]"
				@click="activeTab = 'message'"
			>
				✉️ {{ $t('contact.sendMessage') }}
			</button>
			<button
				:class="['tab', { active: activeTab === 'ai' }]"
				@click="activeTab = 'ai'"
			>
				🤖 {{ $t('contact.aiAssistant') }}
			</button>
			<button
				:class="['tab', { active: activeTab === 'history' }]"
				@click="activeTab = 'history'"
			>
				📋 {{ $t('contact.history') }}
			</button>
		</div>
		<!-- Send Message Tab -->
		<div v-if="activeTab === 'message'" class="tab-content">
			<form class="message-form" @submit.prevent="sendMessage">
				<div class="form-group">
					<label>{{ $t('contact.subject') }}</label>
					<input
						v-model="messageForm.subject"
						type="text"
						:placeholder="$t('contact.subjectPlaceholder')"
						required
					>
				</div>
				<div class="form-group">
					<label>{{ $t('contact.category') }}</label>
					<select v-model="messageForm.category" required>
						<option value="">{{ $t('contact.selectCategory') }}</option>
						<option value="general">{{ $t('contact.general') }}</option>
						<option value="maintenance">{{ $t('contact.maintenance') }}</option>
						<option value="complaint">{{ $t('contact.complaint') }}</option>
						<option value="suggestion">{{ $t('contact.suggestion') }}</option>
					</select>
				</div>
				<div class="form-group">
					<label>{{ $t('contact.message') }}</label>
					<textarea
						v-model="messageForm.message"
						rows="8"
						:placeholder="$t('contact.messagePlaceholder')"
						required
					/>
				</div>
				<div class="form-actions">
					<button type="submit" class="submit-btn" :disabled="sending">
						<span v-if="sending">{{ $t('contact.sending') }}</span>
						<span v-else>{{ $t('contact.send') }}</span>
					</button>
				</div>
			</form>
			<div v-if="messageSent" class="success-message">
				<div class="success-icon">✅</div>
				<h3>{{ $t('contact.success.title') }}</h3>
				<p>{{ $t('contact.success.description') }}</p>
			</div>
		</div>
		<!-- AI Assistant Tab -->
		<div v-if="activeTab === 'ai'" class="tab-content">
			<div class="ai-chat">
				<div class="chat-intro">
					<div class="ai-avatar">🤖</div>
					<h3>{{ $t('ai.welcome') }}</h3>
					<p>{{ $t('ai.description') }}</p>
				</div>
				<div ref="chatContainer" class="chat-messages">
					<div v-for="msg in chatMessages" :key="msg.id" :class="['message', msg.type]">
						<div class="message-bubble">
							<div v-if="msg.type === 'ai'" class="message-avatar">🤖</div>
							<div class="message-content">{{ msg.text }}</div>
						</div>
						<div class="message-time">{{ formatTime(msg.timestamp) }}</div>
					</div>
					<div v-if="aiTyping" class="message ai typing">
						<div class="message-bubble">
							<div class="message-avatar">🤖</div>
							<div class="typing-indicator">
								<span />
								<span />
								<span />
							</div>
						</div>
					</div>
				</div>
				<form class="chat-input" @submit.prevent="sendAIMessage">
					<input
						v-model="aiInput"
						type="text"
						:placeholder="$t('ai.inputPlaceholder')"
						:disabled="aiTyping"
					>
					<button type="submit" :disabled="!aiInput.trim() || aiTyping">
						<span>{{ $t('ai.send') }}</span>
					</button>
				</form>
			</div>
		</div>
		<!-- Message History Tab -->
		<div v-if="activeTab === 'history'" class="tab-content">
			<div class="history-list">
				<div v-for="item in messageHistory" :key="item.id" class="history-item">
					<div class="history-header">
						<span class="history-subject">{{ item.subject }}</span>
						<span class="history-date">{{ formatDate(item.date) }}</span>
					</div>
					<div class="history-preview">{{ item.preview }}</div>
					<div class="history-status" :class="item.status">
						<span v-if="item.status === 'responded'">✓ {{ $t('contact.responded') }}</span>
						<span v-else-if="item.status === 'pending'">⏳ {{ $t('contact.pending') }}</span>
						<span v-else>📋 {{ $t('contact.closed') }}</span>
					</div>
				</div>
				<div v-if="messageHistory.length === 0" class="no-history">
					<p>{{ $t('contact.noHistory') }}</p>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	name: 'ContactManager',
	emits: ['close'],
	data() {
		return {
			activeTab: 'message',
			sending: false,
			messageSent: false,
			aiTyping: false,
			messageForm: {
				subject: '',
				category: '',
				message: ''
			},
			aiInput: '',
			chatMessages: [
				{
					id: 1,
					type: 'ai',
					text: 'Hello! I\'m your AI building assistant. I can help you with questions about building rules, facility bookings, maintenance procedures, and more. What would you like to know?',
					timestamp: new Date()
				}
			],
			messageHistory: [
				{
					id: 1,
					subject: 'Gym access hours inquiry',
					preview: 'I wanted to know if the gym hours could be extended...',
					date: new Date( '2024-01-15' ),
					status: 'responded'
				},
				{
					id: 2,
					subject: 'Noise complaint - Unit 405',
					preview: 'There has been excessive noise coming from unit 405...',
					date: new Date( '2024-01-10' ),
					status: 'closed'
				}
			]
		}
	},
	methods: {
		async sendMessage() {
			this.sending = true
			// Simulate API call
			await new Promise( resolve => setTimeout( resolve, 1500 ) )
			this.sending = false
			this.messageSent = true
			// Reset form
			this.messageForm = {
				subject: '',
				category: '',
				message: ''
			}
			// Hide success message after 5 seconds
			setTimeout( () => {
				this.messageSent = false
			}, 5000 )
		},
		async sendAIMessage() {
			if ( !this.aiInput.trim() || this.aiTyping ) return
			const userMessage = {
				id: Date.now(),
				type: 'user',
				text: this.aiInput,
				timestamp: new Date()
			}
			this.chatMessages.push( userMessage )
			const question = this.aiInput
			this.aiInput = ''
			this.aiTyping = true
			// Scroll to bottom
			await this.$nextTick()
			if ( this.$refs.chatContainer ) {
				this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight
			}
			// Simulate AI response
			await new Promise( resolve => setTimeout( resolve, 1500 ) )
			const aiResponse = {
				id: Date.now() + 1,
				type: 'ai',
				text: this.getAIResponse( question ),
				timestamp: new Date()
			}
			this.chatMessages.push( aiResponse )
			this.aiTyping = false
			// Scroll to bottom
			await this.$nextTick()
			if ( this.$refs.chatContainer ) {
				this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight
			}
		},
		getAIResponse( question ) {
			// Simple mock responses
			const lowercaseQ = question.toLowerCase()
			if ( lowercaseQ.includes( 'gym' ) || lowercaseQ.includes( 'fitness' ) ) {
				return 'The fitness gym is open daily from 6:00 AM to 10:00 PM. It\'s located on the 2nd floor. You can book time slots through the Facility Booking section in your dashboard. The gym is free to use for all residents.'
			} else if ( lowercaseQ.includes( 'parking' ) ) {
				return 'Parking spaces are assigned to each unit. Guest parking is available on B1 level for up to 24 hours. For long-term guest parking, please contact the building manager. Monthly parking fees are included in your management fee.'
			} else if ( lowercaseQ.includes( 'noise' ) || lowercaseQ.includes( 'quiet' ) ) {
				return 'Quiet hours are from 10:00 PM to 7:00 AM. During these hours, please keep noise to a minimum. If you experience noise issues, you can file a complaint through the Contact Manager or speak directly with building management.'
			} else if ( lowercaseQ.includes( 'maintenance' ) ) {
				return 'For maintenance requests, please use the Maintenance section in your dashboard. Emergency maintenance is available 24/7 by calling 0120-123-456. Regular maintenance requests are typically addressed within 48 hours.'
			} else {
				return 'I can help you with various building-related inquiries including facilities, rules, maintenance, and general information. Could you please be more specific about what you\'d like to know?'
			}
		},
		formatTime( date ) {
			return new Intl.DateTimeFormat( 'en-US', {
				hour: '2-digit',
				minute: '2-digit'
			} ).format( date )
		},
		formatDate( date ) {
			return new Intl.DateTimeFormat( 'en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			} ).format( date )
		}
	}
}
</script>
<style lang="stylus" scoped>
.contact-manager
	background white
	border-radius 20px
	overflow hidden
	display flex
	flex-direction column
	height 100%
.manager-header
	display flex
	align-items center
	gap 1rem
	padding 1.5rem 2rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-bottom 2px solid #FFC107
	h2
		flex 1
		margin 0
		color #333
		font-size 1.5rem
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
.contact-tabs
	display flex
	background #f5f5f5
	border-bottom 1px solid #e0e0e0
	.tab
		flex 1
		padding 1rem
		border none
		background transparent
		cursor pointer
		font-size 0.95rem
		color #666
		transition all 0.3s ease
		border-bottom 3px solid transparent
		&.active
			background white
			color #333
			border-bottom-color #FFC107
			font-weight 600
		&:hover:not(.active)
			background #efefef
.tab-content
	flex 1
	padding 2rem
	overflow-y auto
.message-form
	max-width 600px
	margin 0 auto
.form-group
	margin-bottom 1.5rem
	label
		display block
		font-weight 600
		color #333
		margin-bottom 0.5rem
	input, select, textarea
		width 100%
		padding 0.75rem
		border 2px solid rgba(255, 193, 7, 0.2)
		border-radius 12px
		font-size 1rem
		transition all 0.3s ease
		background rgba(255, 255, 255, 0.8)
		&:focus
			outline none
			border-color #FFC107
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)
			background white
.form-actions
	display flex
	justify-content center
	margin-top 2rem
.submit-btn
	padding 1rem 3rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	border none
	border-radius 50px
	font-size 1.1rem
	font-weight 600
	cursor pointer
	transition all 0.3s ease
	box-shadow 0 4px 15px rgba(255, 193, 7, 0.25)
	&:hover:not(:disabled)
		background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
		transform translateY(-2px)
		box-shadow 0 6px 20px rgba(255, 193, 7, 0.35)
	&:disabled
		opacity 0.6
		cursor not-allowed
.success-message
	text-align center
	padding 3rem 2rem
	background linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)
	border-radius 15px
	margin-top 2rem
	.success-icon
		font-size 3rem
		margin-bottom 1rem
	h3
		color #2E7D32
		margin-bottom 0.5rem
	p
		color #558B2F
// AI Chat styles
.ai-chat
	display flex
	flex-direction column
	height 100%
	max-height 600px
.chat-intro
	text-align center
	padding 2rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-radius 15px
	margin-bottom 2rem
	.ai-avatar
		font-size 3rem
		margin-bottom 1rem
	h3
		color #333
		margin-bottom 0.5rem
	p
		color #666
.chat-messages
	flex 1
	overflow-y auto
	padding 1rem
	display flex
	flex-direction column
	gap 1rem
	min-height 100px
	max-height 400px
.message
	display flex
	flex-direction column
	&.user
		align-items flex-end
		.message-bubble
			background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
			color #333
			flex-direction row-reverse
	&.ai
		align-items flex-start
		.message-bubble
			background #f9f9f9
			border 1px solid #e0e0e0
	.message-bubble
		display flex
		align-items flex-start
		gap 0.75rem
		max-width 70%
		padding 1rem
		border-radius 15px
	.message-avatar
		font-size 1.5rem
	.message-content
		flex 1
	.message-time
		font-size 0.75rem
		color #999
		margin-top 0.25rem
.typing-indicator
	display flex
	gap 0.3rem
	span
		width 8px
		height 8px
		background #999
		border-radius 50%
		animation typing 1.4s infinite
		&:nth-child(2)
			animation-delay 0.2s
		&:nth-child(3)
			animation-delay 0.4s
@keyframes typing
	0%, 60%, 100%
		opacity 0.3
	30%
		opacity 1
.chat-input
	display flex
	gap 0.5rem
	padding 1rem
	border-top 1px solid #e0e0e0
	input
		flex 1
		padding 0.75rem
		border 2px solid rgba(255, 193, 7, 0.2)
		border-radius 50px
		font-size 1rem
		&:focus
			outline none
			border-color #FFC107
	button
		padding 0.75rem 1.5rem
		background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
		color #333
		border none
		border-radius 50px
		font-weight 600
		cursor pointer
		transition all 0.2s ease
		&:hover:not(:disabled)
			transform translateY(-1px)
			box-shadow 0 4px 12px rgba(255, 193, 7, 0.25)
		&:disabled
			opacity 0.5
			cursor not-allowed
// History styles
.history-list
	display flex
	flex-direction column
	gap 1rem
.history-item
	background #f9f9f9
	border-radius 12px
	padding 1.5rem
	transition all 0.2s ease
	&:hover
		transform translateY(-2px)
		box-shadow 0 4px 12px rgba(0, 0, 0, 0.1)
.history-header
	display flex
	justify-content space-between
	margin-bottom 0.5rem
	.history-subject
		font-weight 600
		color #333
	.history-date
		color #999
		font-size 0.9rem
.history-preview
	color #666
	margin-bottom 0.75rem
	line-height 1.5
.history-status
	display inline-block
	padding 0.25rem 0.75rem
	border-radius 20px
	font-size 0.85rem
	font-weight 500
	&.responded
		background #E8F5E9
		color #2E7D32
	&.pending
		background #FFF3E0
		color #F57C00
	&.closed
		background #f0f0f0
		color #666
.no-history
	text-align center
	padding 3rem
	color #999
</style>
