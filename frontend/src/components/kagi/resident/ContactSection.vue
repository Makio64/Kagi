<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">
				<Icon name="communication" :size="30" color="#FFC107" />
				{{ $t('dashboard.menu.contact') }}
			</h2>
		</div>

		<div class="contact-layout">
			<!-- Chat Container -->
			<div class="chat-container">
				<!-- Chat Messages (Messenger Style - scroll from bottom) -->
				<div ref="chatMessages" class="chat-messages">
					<div
						v-for="msg in currentMessages"
						:key="msg.id"
						:class="['message', msg.sender]"
					>
						<div class="message-content">
							<div class="message-header">
								<span class="sender-name">{{ msg.sender === 'user' ? $t('common.you') : $t('emergency.buildingManager') }}</span>
								<span class="message-time">{{ msg.time }}</span>
							</div>
							<p>{{ msg.text }}</p>
						</div>
					</div>
				</div>

				<!-- Input Area at Bottom (Fixed) -->
				<div class="chat-input-container">
					<!-- Chat Input Form -->
					<form class="chat-input-form" @submit.prevent="sendMessage">
						<input
							v-model="messageInput"
							type="text"
							:placeholder="$t('ai.inputPlaceholder')"
							class="chat-input"
							required
						>
						<button type="submit" class="send-button">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path d="M2 10L18 2L10 18L9 11L2 10Z" fill="currentColor" />
							</svg>
						</button>
					</form>

					<!-- Previous Conversations Button -->
					<button
						v-if="!showConversations && conversations.length > 0"
						class="previous-conversations-btn"
						@click="showConversations = true"
					>
						{{ $t('contact.history') }} ({{ conversations.length }})
					</button>
				</div>

				<!-- Previous Conversations Modal -->
				<transition name="modal-fade">
					<div v-if="showConversations" class="conversations-modal-overlay" @click="showConversations = false">
						<div class="conversations-modal" @click.stop>
							<div class="modal-header">
								<h3>{{ $t('contact.history') }}</h3>
								<button class="close-btn" @click="showConversations = false">✕</button>
							</div>
							<div class="conversations-list">
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
						</div>
					</div>
				</transition>
			</div>

			<!-- Contact Information (desktop: right side, mobile: below chat) -->
			<div class="contact-info-container">
				<h3>{{ $t('dashboard.contact.title') }}</h3>

				<div class="contact-card">
					<div class="contact-icon">📞</div>
					<div class="contact-details">
						<h4>{{ $t('dashboard.profile.phone') }}</h4>
						<p class="contact-value">03-1234-5678</p>
						<p class="contact-note">{{ $t('contact.officeHoursWeekdays') }}</p>
					</div>
				</div>

				<div class="contact-card">
					<div class="contact-icon">📧</div>
					<div class="contact-details">
						<h4>{{ $t('dashboard.profile.email') }}</h4>
						<p class="contact-value">management@building.com</p>
						<p class="contact-note">{{ $t('contact.responseTime') }}</p>
					</div>
				</div>

				<div class="contact-card">
					<div class="contact-icon">🏢</div>
					<div class="contact-details">
						<h4>{{ $t('contact.officeHours') }}</h4>
						<p class="contact-value">{{ $t('contact.weekdays') }}</p>
						<p class="contact-note">{{ $t('contact.officeTime') }}</p>
						<p class="contact-note">{{ $t('contact.closedWeekends') }}</p>
					</div>
				</div>

				<div class="contact-card emergency">
					<div class="contact-icon">🚨</div>
					<div class="contact-details">
						<h4>{{ $t('dashboard.profile.emergencyContact') }}</h4>
						<p class="contact-value">080-9999-9999</p>
						<p class="contact-note">{{ $t('contact.emergencyLine') }}</p>
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
			showConversations: false,
			currentMessages: [],
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
			if ( !this.messageInput.trim() ) return

			const newMessage = {
				id: Date.now(),
				sender: 'user',
				text: this.messageInput,
				time: new Date().toLocaleTimeString( 'en-US', { hour: 'numeric', minute: '2-digit' } )
			}

			// Add message to current conversation
			this.currentMessages.push( newMessage )

			// Scroll to bottom
			this.$nextTick( () => {
				this.scrollToBottom()
			} )

			// Save to conversation history
			if ( this.currentMessages.length === 1 ) {
				const newConversation = {
					id: Date.now(),
					title: this.messageInput.substring( 0, 50 ) + ( this.messageInput.length > 50 ? '...' : '' ),
					lastMessage: this.messageInput,
					date: new Date().toLocaleDateString( 'en-US', { month: 'short', day: 'numeric', year: 'numeric' } ),
					messages: [...this.currentMessages]
				}
				this.conversations.unshift( newConversation )
			}

			// Clear input
			this.messageInput = ''

			// Mock management response
			setTimeout( () => {
				const managementMessage = {
					id: Date.now(),
					sender: 'management',
					text: this.$t( 'contact.autoReply' ),
					time: new Date().toLocaleTimeString( 'en-US', { hour: 'numeric', minute: '2-digit' } )
				}
				this.currentMessages.push( managementMessage )
				this.$nextTick( () => {
					this.scrollToBottom()
				} )
			}, 1000 )
		},
		openConversation( id ) {
			const conversation = this.conversations.find( c => c.id === id )
			if ( conversation ) {
				this.currentMessages = [...conversation.messages]
				this.showConversations = false
				this.$nextTick( () => {
					this.scrollToBottom()
				} )
			}
		},
		scrollToBottom() {
			const container = this.$refs.chatMessages
			if ( container ) {
				container.scrollTop = container.scrollHeight
			}
		}
	}
}
</script>

<style lang="stylus" scoped>
.section
	padding 0

.section-header
	padding 2rem 2rem 1rem 2rem

.section-title
	margin 0
	font-size 1.75rem
	font-weight 600
	color #333
	display flex
	align-items center
	gap 0.5rem
	justify-content center


.contact-layout
	display grid
	grid-template-columns 1fr 350px
	gap 2rem
	padding 0 2rem 2rem 2rem
	height auto

	@media (max-width: 900px)
		grid-template-columns 1fr
		height auto
		padding 0 1rem 1rem 1rem

.chat-container
	display flex
	flex-direction column
	background white
	border-radius 12px
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	overflow hidden
	height 100%
	max-height calc(100vh - 200px)
	@media (max-width: 900px)
		max-height 500px
		height auto

.chat-messages
	flex 1
	overflow-y auto
	padding 1rem
	display flex
	flex-direction column
	gap 1rem

.message
	display flex
	align-items flex-start
	max-width 70%

	&.user
		align-self flex-end
		.message-content
			background #FFC107
			color #333

	&.management
		align-self flex-start
		.message-content
			background #f5f5f5
			color #333

.message-content
	padding 0.75rem 1rem
	border-radius 12px
	word-wrap break-word

.message-header
	display flex
	justify-content space-between
	align-items center
	margin-bottom 0.25rem
	gap 1rem

.sender-name
	font-size 0.75rem
	font-weight 600
	opacity 0.8

.message-time
	font-size 0.7rem
	opacity 0.6

.message-content p
	margin 0
	font-size 0.9rem
	line-height 1.4

.chat-input-container
	border-top 1px solid #f0f0f0
	padding 1rem
	background white

.previous-conversations-btn
	width 100%
	padding 0.75rem
	background #f5f5f5
	border 1px solid #e0e0e0
	border-radius 8px
	color #666
	font-size 0.9rem
	font-weight 500
	cursor pointer
	margin-top 0.75rem
	transition all 0.2s ease

	&:hover
		background #e8e8e8
		border-color #1976D2
		color #1976D2

.chat-input-form
	display flex
	gap 0.5rem

.chat-input
	flex 1
	padding 0.75rem 1rem
	border 1px solid #e0e0e0
	border-radius 24px
	font-size 0.95rem
	outline none

	&:focus
		border-color #1976D2

.send-button
	padding 0.75rem 1rem
	background #1976D2
	color white
	border none
	border-radius 24px
	cursor pointer
	display flex
	align-items center
	justify-content center
	transition all 0.2s ease

	&:hover
		background #1565C0

// Conversations Modal
.conversations-modal-overlay
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

.conversations-modal
	background white
	border-radius 16px
	max-width 600px
	width 100%
	max-height 80vh
	display flex
	flex-direction column
	box-shadow 0 20px 60px rgba(0, 0, 0, 0.3)

.modal-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 1px solid #f0f0f0

	h3
		margin 0
		font-size 1.25rem
		color #333

.close-btn
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

.conversations-list
	flex 1
	overflow-y auto
	padding 1rem

.conversation-item
	padding 1rem
	border-radius 8px
	cursor pointer
	transition all 0.2s ease
	border 1px solid #f0f0f0
	margin-bottom 0.75rem

	&:hover
		background #f9f9f9
		border-color #1976D2

.conversation-preview
	h4
		margin 0 0 0.5rem 0
		font-size 0.95rem
		color #333
		font-weight 600

	.last-message
		margin 0 0 0.5rem 0
		color #666
		font-size 0.85rem
		display -webkit-box
		-webkit-line-clamp 2
		-webkit-box-orient vertical
		overflow hidden

	.conversation-date
		font-size 0.75rem
		color #999

.contact-info-container
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	height fit-content

	@media (max-width: 900px)
		margin-top 1.5rem

	h3
		margin 0 0 1.5rem 0
		font-size 1.1rem
		color #333
		font-weight 600

.contact-card
	display flex
	gap 1rem
	padding 1rem
	background #f9f9f9
	border-radius 8px
	margin-bottom 1rem

	&.emergency
		background #FFF3E0
		border 1px solid #FFB300

	&:last-child
		margin-bottom 0

.contact-icon
	font-size 2rem
	flex-shrink 0

.contact-details
	flex 1

	h4
		margin 0 0 0.5rem 0
		font-size 0.95rem
		color #333
		font-weight 600

	.contact-value
		margin 0 0 0.25rem 0
		font-size 1rem
		color #1976D2
		font-weight 600

	.contact-note
		margin 0
		font-size 0.8rem
		color #666
		line-height 1.4

.modal-fade-enter-active, .modal-fade-leave-active
	transition all 0.3s ease

.modal-fade-enter-from, .modal-fade-leave-to
	opacity 0

.modal-fade-enter-from .conversations-modal,
.modal-fade-leave-to .conversations-modal
	transform scale(0.9)
</style>
