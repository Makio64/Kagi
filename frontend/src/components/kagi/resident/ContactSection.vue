<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">📱 {{ $t('dashboard.menu.contact') }}</h2>
		</div>

		<div class="contact-layout">
			<!-- Chat Container -->
			<div class="chat-container">
				<!-- Input Area at Top -->
				<form @submit.prevent="sendMessage" class="chat-input-form">
					<input
						v-model="messageInput"
						type="text"
						placeholder="Ask your question..."
						class="chat-input"
						required
					/>
					<button type="submit" class="send-button">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path d="M2 10L18 2L10 18L9 11L2 10Z" fill="currentColor" />
						</svg>
					</button>
				</form>

				<!-- Previous Conversations List -->
				<div v-if="!activeConversation" class="conversations-list">
					<h3>Previous Conversations</h3>
					<div
						v-for="conv in conversations"
						:key="conv.id"
						class="conversation-item"
						@click="openConversation(conv.id)"
					>
						<div class="conversation-preview">
							<h4>{{ conv.title }}</h4>
							<p class="last-message">{{ conv.lastMessage }}</p>
							<span class="conversation-date">{{ conv.date }}</span>
						</div>
					</div>
				</div>

				<!-- Active Conversation -->
				<div v-else class="conversation-view">
					<div class="conversation-header">
						<button class="back-button" @click="closeConversation">
							← Back
						</button>
						<h3>{{ activeConversation.title }}</h3>
					</div>
					<div class="conversation-history">
						<div
							v-for="msg in activeConversation.messages"
							:key="msg.id"
							:class="['message', msg.sender]"
						>
							<div class="message-content">
								<div class="message-header">
									<span class="sender-name">{{ msg.sender === 'user' ? 'You' : 'Management' }}</span>
									<span class="message-time">{{ msg.time }}</span>
								</div>
								<p>{{ msg.text }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Contact Information -->
			<div class="contact-info-container">
				<h3>Contact Information</h3>

				<div class="contact-card">
					<div class="contact-icon">📞</div>
					<div class="contact-details">
						<h4>Phone</h4>
						<p class="contact-value">03-1234-5678</p>
						<p class="contact-note">Mon-Fri: 9:00 AM - 6:00 PM</p>
					</div>
				</div>

				<div class="contact-card">
					<div class="contact-icon">📧</div>
					<div class="contact-details">
						<h4>Email</h4>
						<p class="contact-value">management@building.com</p>
						<p class="contact-note">Response within 24 hours</p>
					</div>
				</div>

				<div class="contact-card">
					<div class="contact-icon">🏢</div>
					<div class="contact-details">
						<h4>Office Hours</h4>
						<p class="contact-value">Monday - Friday</p>
						<p class="contact-note">9:00 AM - 6:00 PM</p>
						<p class="contact-note">Closed on weekends & holidays</p>
					</div>
				</div>

				<div class="contact-card emergency">
					<div class="contact-icon">🚨</div>
					<div class="contact-details">
						<h4>Emergency Contact</h4>
						<p class="contact-value">080-9999-9999</p>
						<p class="contact-note">24/7 Emergency Line</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: 'ContactSection',
	data() {
		return {
			messageInput: '',
			activeConversation: null,
			conversations: [
				{
					id: 1,
					title: 'Parking Rules Question',
					lastMessage: 'Yes, visitor overnight parking is allowed...',
					date: 'Jan 15, 2025',
					messages: [
						{
							id: 1,
							sender: 'user',
							text: 'Hello, I would like to know about the parking rules.',
							time: '10:30 AM'
						},
						{
							id: 2,
							sender: 'management',
							text: 'Hello! The parking rules are available in the Documents section. Each unit has assigned parking spaces. Would you like more specific information?',
							time: '10:32 AM'
						},
						{
							id: 3,
							sender: 'user',
							text: 'Can visitors park overnight?',
							time: '10:35 AM'
						},
						{
							id: 4,
							sender: 'management',
							text: 'Yes, visitor overnight parking is allowed with prior approval from management. Please contact us at least 24 hours in advance.',
							time: '10:37 AM'
						}
					]
				},
				{
					id: 2,
					title: 'Gym Booking Inquiry',
					lastMessage: 'The gym is available from 6 AM to 10 PM...',
					date: 'Jan 12, 2025',
					messages: [
						{
							id: 1,
							sender: 'user',
							text: 'What are the gym hours?',
							time: '2:15 PM'
						},
						{
							id: 2,
							sender: 'management',
							text: 'The gym is available from 6 AM to 10 PM daily. Booking is required for peak hours (6-9 AM and 6-9 PM).',
							time: '2:18 PM'
						}
					]
				},
				{
					id: 3,
					title: 'Party Room Availability',
					lastMessage: 'Yes, the party room is available on that date...',
					date: 'Jan 10, 2025',
					messages: [
						{
							id: 1,
							sender: 'user',
							text: 'Is the party room available on January 25th?',
							time: '11:20 AM'
						},
						{
							id: 2,
							sender: 'management',
							text: 'Yes, the party room is available on that date. Would you like to make a reservation?',
							time: '11:25 AM'
						}
					]
				}
			]
		}
	},
	methods: {
		sendMessage() {
			if (!this.messageInput.trim()) return

			// Create new conversation from the question
			const newConversation = {
				id: Date.now(),
				title: this.messageInput.substring(0, 50) + (this.messageInput.length > 50 ? '...' : ''),
				lastMessage: this.messageInput,
				date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
				messages: [
					{
						id: Date.now(),
						sender: 'user',
						text: this.messageInput,
						time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
					}
				]
			}

			// Add to conversations list
			this.conversations.unshift(newConversation)

			// Open the new conversation
			this.activeConversation = newConversation

			// Clear input
			this.messageInput = ''

			// Mock management response after 1 second
			setTimeout(() => {
				const managementMessage = {
					id: Date.now(),
					sender: 'management',
					text: 'Thank you for your message. We will get back to you shortly.',
					time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
				}
				this.activeConversation.messages.push(managementMessage)
			}, 1000)
		},
		openConversation(id) {
			this.activeConversation = this.conversations.find(c => c.id === id)
		},
		closeConversation() {
			this.activeConversation = null
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

.contact-layout
	display grid
	grid-template-columns 2fr 1fr
	gap 2rem
	padding 0 2rem 3rem 2rem

.chat-container
	background white
	border-radius 12px
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	display flex
	flex-direction column
	overflow hidden

.conversations-list
	flex 1
	overflow-y auto
	padding 1.5rem

	h3
		margin 0 0 1rem 0
		font-size 1.25rem
		color #333

.conversation-item
	padding 1rem
	border 1px solid #e0e0e0
	border-radius 8px
	margin-bottom 0.75rem
	cursor pointer
	transition all 0.2s ease

	&:hover
		background #f9fafb
		border-color #1976D2

.conversation-preview
	h4
		margin 0 0 0.25rem 0
		font-size 1rem
		color #333
		font-weight 600

	.last-message
		margin 0 0 0.25rem 0
		color #666
		font-size 0.9rem
		white-space nowrap
		overflow hidden
		text-overflow ellipsis

	.conversation-date
		font-size 0.8rem
		color #999

.conversation-view
	flex 1
	display flex
	flex-direction column
	overflow hidden

.conversation-header
	padding 1rem 1.5rem
	border-bottom 1px solid #e0e0e0
	display flex
	align-items center
	gap 1rem

	h3
		margin 0
		font-size 1.1rem
		color #333

.back-button
	background transparent
	border 1px solid #e0e0e0
	border-radius 6px
	padding 0.5rem 1rem
	cursor pointer
	color #666
	font-size 0.9rem
	transition all 0.2s ease

	&:hover
		background #f9fafb
		border-color #1976D2
		color #1976D2

.conversation-history
	flex 1
	overflow-y auto
	padding 1.5rem
	display flex
	flex-direction column
	gap 1rem

.message
	display flex
	&.user
		justify-content flex-end
		.message-content
			background #1976D2
			color white
			border-radius 12px 12px 0 12px
			.sender-name
				color rgba(255,255,255,0.9)
			.message-time
				color rgba(255,255,255,0.7)
	&.management
		justify-content flex-start
		.message-content
			background #f5f5f5
			color #333
			border-radius 12px 12px 12px 0
			.sender-name
				color #666
			.message-time
				color #999

.message-content
	max-width 70%
	padding 0.75rem 1rem
	p
		margin 0.25rem 0 0 0
		line-height 1.5
		font-size 0.95rem

.message-header
	display flex
	justify-content space-between
	align-items center
	gap 1rem
	margin-bottom 0.25rem
	font-size 0.75rem

.sender-name
	font-weight 600

.message-time
	font-size 0.7rem

.chat-input-form
	display flex
	gap 0.75rem
	padding 1.5rem
	border-bottom 1px solid #e0e0e0
	background white

.chat-input
	flex 1
	padding 0.75rem 1rem
	border 1px solid #e0e0e0
	border-radius 24px
	font-size 0.95rem
	font-family inherit
	transition border-color 0.2s
	&:focus
		outline none
		border-color #1976D2

.send-button
	width 44px
	height 44px
	display flex
	align-items center
	justify-content center
	background #1976D2
	color white
	border none
	border-radius 50%
	cursor pointer
	transition all 0.2s ease
	&:hover
		background #1565C0
		transform scale(1.05)

.contact-info-container
	h3
		margin 0 0 1rem 0
		font-size 1.25rem
		color #333

.contact-card
	background white
	border-radius 12px
	padding 1.25rem
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	margin-bottom 1rem
	display flex
	gap 1rem
	transition all 0.2s ease

	&:hover
		box-shadow 0 4px 12px rgba(0,0,0,0.12)

	&.emergency
		background linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%)
		border-left 4px solid #FF9800

		.contact-icon
			background #FF9800
			color white

.contact-icon
	width 50px
	height 50px
	min-width 50px
	display flex
	align-items center
	justify-content center
	background linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)
	border-radius 10px
	font-size 1.5rem

.contact-details
	flex 1

	h4
		margin 0 0 0.25rem 0
		font-size 1rem
		color #333
		font-weight 600

.contact-value
	margin 0 0 0.25rem 0
	color #1976D2
	font-weight 500
	font-size 1.05rem

.contact-note
	margin 0.25rem 0 0 0
	color #888
	font-size 0.85rem

@media (max-width: 1024px)
	.contact-layout
		grid-template-columns 1fr

	.contact-info-container
		.contact-card
			display flex
			gap 1rem

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem

	.contact-layout
		padding 0 1rem 2rem 1rem
</style>
