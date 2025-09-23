<template>
	<div class="dashboard">
		<header class="header">
			<div class="header-content">
				<div class="header-left" style="cursor: pointer;" @click="navigateToSection('home')">
					<KagiLogo :size="40" />
					<h1>Dresser Tower</h1>
				</div>
				<div class="header-right">
					<button class="user-menu-btn desktop-only" @click="showMobileMenu = !showMobileMenu">
						<span class="user-email">{{ user?.email }}</span>
						<span class="menu-arrow">▼</span>
					</button>
					<BurgerButton class="mobile-burger" />
				</div>
			</div>
		</header>

		<!-- Mobile Side Menu -->
		<transition name="slide-left">
			<div v-if="isMenuOpen" class="mobile-side-menu-overlay" @click="isMenuOpen = false">
				<div class="mobile-side-menu" @click.stop>
					<div class="side-menu-header">
						<div class="user-profile-section">
							<div class="user-avatar">
								<span>{{ user?.email?.charAt(0)?.toUpperCase() || 'U' }}</span>
							</div>
							<div class="user-info">
								<div class="user-name">{{ user?.profile?.name || user?.email?.split('@')[0] }}</div>
								<div class="user-email">{{ user?.email }}</div>
							</div>
						</div>
					</div>

					<div class="language-selector">
						<LanguageSwitcher />
					</div>

					<nav class="side-menu-nav">
						<button
							v-for="item in menuItems"
							:key="item.id"
							:class="['side-menu-item', { active: activeSection === item.id }]"
							@click="navigateToSection(item.id); isMenuOpen = false"
						>
							<span class="menu-icon">{{ item.icon }}</span>
							<span class="menu-label">{{ item.label }}</span>
						</button>
					</nav>

					<div class="side-menu-actions">
						<button class="side-menu-item" @click="navigateToSection('profile'); isMenuOpen = false">
							<span class="menu-icon">👤</span>
							<span class="menu-label">{{ $t('dashboard.profile.myProfile') || 'My Profile' }}</span>
						</button>
						<button class="side-menu-item logout-item" @click="logout">
							<span class="menu-icon">🚪</span>
							<span class="menu-label">{{ $t('nav.logout') }}</span>
						</button>
					</div>
				</div>
			</div>
		</transition>

		<!-- Desktop Settings Menu -->
		<transition name="slide">
			<div v-if="showMobileMenu" class="mobile-settings-menu">
				<div class="mobile-menu-header">
					<h3>{{ $t('common.settings') }}</h3>
					<button class="close-menu-btn" @click="showMobileMenu = false">✕</button>
				</div>
				<div class="mobile-menu-content">
					<div class="mobile-user-info">
						<div class="user-email">{{ user?.email }}</div>
						<div class="user-role">{{ user?.role }}</div>
					</div>
					<button class="profile-btn" @click="navigateToSection('profile'); showMobileMenu = false">
						{{ $t('dashboard.profile.title') || 'Profile' }}
					</button>
					<div class="mobile-lang-section">
						<LanguageSwitcher />
					</div>
					<button class="mobile-logout-btn" @click="logout">
						{{ $t('nav.logout') }}
					</button>
				</div>
			</div>
		</transition>

		<div class="dashboard-content">
			<aside class="sidebar">
				<nav class="nav-menu">
					<button
						v-for="item in menuItems"
						:key="item.id"
						:class="['nav-item', { active: activeSection === item.id }]"
						@click="navigateToSection(item.id)"
					>
						<span class="nav-icon">{{ item.icon }}</span>
						<span class="nav-label">{{ item.label }}</span>
					</button>
				</nav>

			</aside>

			<main class="main-content">
				<!-- Home Section -->
				<section v-if="activeSection === 'home'" class="section">
					<div class="home-welcome">
						<h2 class="welcome-title">{{ $t('dashboard.welcome') }}</h2>
						<p class="welcome-subtitle">{{ $t('dashboard.welcomeSubtitle') }}</p>
					</div>
					<div class="services-grid">
						<button
							v-for="item in menuItems.filter(m => m.id !== 'home')"
							:key="item.id"
							class="service-card"
							@click="navigateToSection(item.id)"
						>
							<div class="service-icon">{{ item.icon }}</div>
							<h3 class="service-name">{{ item.label }}</h3>
							<p class="service-description">{{ getServiceDescription(item.id) }}</p>
						</button>
					</div>
				</section>

				<!-- Contact Section -->
				<section v-if="activeSection === 'contact'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">📱</span> {{ $t('dashboard.contact.title') }}</h2>
					</div>
					<div class="cards-grid">
						<DashboardCard
							icon="👤"
							:title="$t('dashboard.contact.manager.title')"
							:description="$t('dashboard.contact.manager.description')"
							clickable
							:actions="[{ text: $t('dashboard.contact.manager.button'), class: 'booking', handler: contactManager }]"
							@click="contactManager"
						/>
						<DashboardCard
							icon="⚠️"
							:title="$t('dashboard.contact.emergency.title')"
							:description="$t('dashboard.contact.emergency.description')"
							clickable
							:actions="[{ text: $t('dashboard.contact.emergency.button'), class: 'danger', handler: viewEmergency }]"
							:badge="{ text: 'URGENT', class: 'danger' }"
							@click="viewEmergency"
						/>
					</div>
				</section>

				<!-- Documents Section -->
				<section v-if="activeSection === 'documents' && !props.routeParams?.documentId" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">📄</span> {{ $t('dashboard.documents.title') }}</h2>
					</div>
					<div class="cards-grid">
						<DashboardCard
							icon="📋"
							:title="$t('dashboard.documents.managementRules')"
							:info="`${$t('dashboard.documents.lastUpdated')}: 2024/01`"
							clickable
							:actions="[{ text: $t('dashboard.documents.view'), class: 'booking', handler: () => viewDocument('management') }]"
							@click="viewDocument('management')"
						/>
						<DashboardCard
							icon="🏢"
							:title="$t('dashboard.documents.facilityRules')"
							:info="`${$t('dashboard.documents.lastUpdated')}: 2024/03`"
							clickable
							:actions="[{ text: $t('dashboard.documents.view'), class: 'booking', handler: () => viewDocument('facility') }]"
							@click="viewDocument('facility')"
						/>
						<DashboardCard
							icon="🚗"
							:title="$t('dashboard.documents.parkingRules')"
							:info="`${$t('dashboard.documents.lastUpdated')}: 2023/12`"
							clickable
							:actions="[{ text: $t('dashboard.documents.view'), class: 'booking', handler: () => viewDocument('parking') }]"
							@click="viewDocument('parking')"
						/>
					</div>
				</section>

				<!-- Document Viewer -->
				<section v-if="activeSection === 'documents' && props.routeParams?.documentId" class="section document-viewer-section">
					<DocumentViewer
						:title="getCurrentDocumentTitle()"
						:content="getCurrentDocumentContent()"
						:last-updated="getCurrentDocumentDate()"
						:document-id="props.routeParams?.documentId"
						:is-admin="user?.role === 'admin'"
						@close="router.push('/dashboard/documents')"
						@save="saveDocument"
					/>
				</section>

				<!-- Booking Section -->
				<section v-if="activeSection === 'booking' && !selectedFacility" class="section booking-section-modern">
					<div class="section-header-modern">
						<div class="header-content">
							<h2 class="section-title-modern">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="section-icon-svg">
									<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
									<path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
									<rect x="8" y="14" width="2" height="2" fill="currentColor" />
									<rect x="12" y="14" width="2" height="2" fill="currentColor" />
								</svg>
								{{ $t('dashboard.booking.title') || 'Facility Booking' }}
							</h2>
						</div>
					</div>

					<div class="booking-two-column-layout">
						<!-- Left Column: Available Facilities -->
						<div class="facilities-column">
							<h3 class="column-title">{{ $t('booking.availableFacilities') || 'Available Facilities' }}</h3>
							<div class="facilities-list">
								<!-- Party Room -->
								<div class="facility-card-with-image" @click="bookFacility('party')">
									<div class="facility-image party">
										<span class="facility-badge">🎉</span>
									</div>
									<div class="facility-content">
										<h4>{{ $t('dashboard.booking.partyRoom') || 'Party Room' }}</h4>
										<p class="facility-desc">Perfect for celebrations and gatherings</p>
										<div class="facility-meta">
											<span>👥 Up to 20 people</span>
											<span>💴 ¥10,000/half-day</span>
										</div>
										<button class="book-btn-yellow">Book Now →</button>
									</div>
								</div>

								<!-- Guest Room -->
								<div class="facility-card-with-image" @click="bookFacility('guest')">
									<div class="facility-image guest">
										<span class="facility-badge">🛏️</span>
									</div>
									<div class="facility-content">
										<h4>{{ $t('dashboard.booking.guestRoom') || 'Guest Room' }}</h4>
										<p class="facility-desc">Comfortable accommodation for your visitors</p>
										<div class="facility-meta">
											<span>👥 Up to 2 guests</span>
											<span>💴 ¥5,000/night</span>
										</div>
										<button class="book-btn-yellow">Book Now →</button>
									</div>
								</div>

								<!-- Fitness Gym -->
								<div class="facility-card-with-image" @click="bookFacility('gym')">
									<div class="facility-image gym">
										<span class="facility-badge">💪</span>
									</div>
									<div class="facility-content">
										<h4>{{ $t('dashboard.booking.gym') || 'Fitness Gym' }}</h4>
										<p class="facility-desc">Stay fit with modern equipment and amenities</p>
										<div class="facility-meta">
											<span>👥 10 people max</span>
											<span>✨ Free for residents</span>
										</div>
										<button class="book-btn-yellow">Book Now →</button>
									</div>
								</div>
							</div>
						</div>

						<!-- Right Column: Current Bookings -->
						<div class="bookings-column">
							<div class="bookings-header">
								<h3 class="column-title">
									{{ $t('booking.yourBookings') || 'Your Current Bookings' }}
									<span v-if="userBookings && userBookings.length > 0" class="booking-count">({{ userBookings.length }})</span>
								</h3>
								<div v-if="userBookings && userBookings.length > 0" class="booking-filters">
									<button
										v-for="filter in ['all', 'upcoming', 'past']"
										:key="filter"
										:class="['filter-btn-modern', { active: activeFilter === filter }]"
										@click="activeFilter = filter"
									>
										{{ $t(`booking.filter.${filter}`) || filter.charAt(0).toUpperCase() + filter.slice(1) }}
									</button>
								</div>
							</div>

							<!-- Empty State -->
							<div v-if="!userBookings || userBookings.length === 0" class="empty-state-modern">
								<div class="empty-illustration">
									<svg width="120" height="120" viewBox="0 0 120 120" fill="none">
										<circle cx="60" cy="60" r="50" fill="#F3F4F6" />
										<rect x="40" y="40" width="40" height="40" rx="4" fill="white" stroke="#E5E7EB" stroke-width="2" />
										<path d="M50 35V45M70 35V45M40 55H80" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" />
										<circle cx="55" cy="65" r="2" fill="#9CA3AF" />
										<circle cx="65" cy="65" r="2" fill="#9CA3AF" />
									</svg>
								</div>
								<h3>{{ $t('booking.noBookings') || 'No bookings yet' }}</h3>
								<p>{{ $t('booking.noBookingsDesc') || 'Start by booking one of our available facilities below' }}</p>
							</div>

							<!-- Bookings Grid -->
							<div v-else-if="filteredBookings.length > 0" class="bookings-grid-modern">
								<div v-for="booking in filteredBookings" :key="booking.id" class="booking-card-modern-v2">
									<div class="card-status-bar" :class="getBookingCountdown(booking.date).class" />
									<div class="card-content">
										<div class="card-header-v2">
											<div class="facility-info-v2">
												<span class="facility-icon-v2">{{ booking.icon }}</span>
												<span class="facility-name-v2">{{ booking.facility }}</span>
											</div>
											<span :class="['countdown-badge', getBookingCountdown(booking.date).class]">
												{{ getBookingCountdown(booking.date).text }}
											</span>
										</div>

										<div class="booking-details-v2">
											<div class="detail-row-v2">
												<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="detail-icon">
													<rect x="2" y="3" width="12" height="10" rx="2" stroke="#6B7280" stroke-width="1.5" />
													<path d="M5 1V4M11 1V4M2 6H14" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" />
												</svg>
												<span>{{ booking.month }} {{ booking.day }}, 2024</span>
											</div>
											<div class="detail-row-v2">
												<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="detail-icon">
													<circle cx="8" cy="8" r="6" stroke="#6B7280" stroke-width="1.5" />
													<path d="M8 5V8L10 10" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" />
												</svg>
												<span>{{ booking.time }}</span>
											</div>
											<div class="detail-row-v2">
												<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="detail-icon">
													<path d="M8 2L2 7V14H6V10H10V14H14V7L8 2Z" stroke="#6B7280" stroke-width="1.5" stroke-linejoin="round" />
												</svg>
												<span>{{ booking.purpose || 'Personal use' }}</span>
											</div>
										</div>

									</div>
								</div>
							</div>
							<!-- Empty State for filtered results -->
							<div v-else class="empty-state-modern">
								<div class="empty-illustration">
									<svg width="120" height="120" viewBox="0 0 120 120" fill="none">
										<circle cx="60" cy="60" r="50" fill="#FFF9C4" />
										<rect x="40" y="40" width="40" height="40" rx="4" fill="white" stroke="#FFC107" stroke-width="2" />
										<path d="M50 35V45M70 35V45M40 55H80" stroke="#FFB300" stroke-width="2" stroke-linecap="round" />
										<circle cx="55" cy="65" r="2" fill="#FFB300" />
										<circle cx="65" cy="65" r="2" fill="#FFB300" />
									</svg>
								</div>
								<h3>{{ activeFilter === 'upcoming' ? $t('booking.noUpcomingBookings') || 'No upcoming bookings' : activeFilter === 'past' ? $t('booking.noPastBookings') || 'No past bookings' : $t('booking.noBookings') || 'No bookings yet' }}</h3>
								<p>{{ activeFilter === 'upcoming' ? $t('booking.noUpcomingBookingsDesc') || 'Book a facility to see it here' : activeFilter === 'past' ? $t('booking.noPastBookingsDesc') || 'Your completed bookings will appear here' : $t('booking.noBookingsDesc') || 'Start by booking one of our available facilities' }}</p>
							</div>
						</div> <!-- End bookings column -->
					</div> <!-- End two-column layout -->
				</section>

				<!-- Facility Booking -->
				<section v-if="activeSection === 'booking' && selectedFacility" class="section">
					<FacilityBooking
						:facility="selectedFacility"
						@close="selectedFacility = null"
					/>
				</section>

				<!-- Maintenance Section -->
				<section v-if="activeSection === 'maintenance'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">🔧</span> {{ $t('dashboard.maintenance.title') }}</h2>
					</div>

					<!-- Category Selection -->
					<div v-if="!selectedMaintenanceCategory" class="cards-grid">
						<DashboardCard
							icon="🚿"
							:title="$t('dashboard.maintenance.plumbing')"
							description="Leaks, clogs, water pressure issues"
							clickable
							@click="selectMaintenanceCategory('plumbing')"
						/>
						<DashboardCard
							icon="⚡"
							:title="$t('dashboard.maintenance.electrical')"
							description="Power outlets, lighting, circuit issues"
							clickable
							@click="selectMaintenanceCategory('electrical')"
						/>
						<DashboardCard
							icon="❄️"
							:title="$t('dashboard.maintenance.aircon')"
							description="Temperature, noise, maintenance"
							clickable
							@click="selectMaintenanceCategory('aircon')"
						/>
						<DashboardCard
							icon="🔨"
							:title="$t('dashboard.maintenance.other')"
							description="Other maintenance issues"
							clickable
							@click="selectMaintenanceCategory('other')"
						/>
					</div>

					<!-- Maintenance Form -->
					<div v-else class="maintenance-form-container">
						<button class="back-btn" @click="selectedMaintenanceCategory = null">
							← Back to categories
						</button>
						<div v-if="showMaintenanceSuccess" class="success-message">
							<div class="success-icon">✅</div>
							<h3>{{ $t('maintenance.success.title') || 'Request Submitted Successfully!' }}</h3>
							<p>{{ $t('maintenance.success.description') || 'Thank you for your maintenance request. We\'ll get back to you as soon as possible, typically within 24-48 hours.' }}</p>
						</div>
						<div v-else class="maintenance-form">
							<form @submit.prevent="submitMaintenance">
								<div class="selected-category">
									<span class="category-icon">{{ getCategoryIcon(selectedMaintenanceCategory) }}</span>
									<h3>{{ getCategoryName(selectedMaintenanceCategory) }}</h3>
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.maintenance.subject') }}</label>
									<input v-model="maintenanceForm.title" type="text" :placeholder="$t('dashboard.maintenance.subjectPlaceholder')">
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.maintenance.details') }}</label>
									<textarea v-model="maintenanceForm.description" rows="4" :placeholder="$t('dashboard.maintenance.detailsPlaceholder')" />
								</div>
								<button type="submit" class="submit-btn-primary">{{ $t('dashboard.maintenance.submit') }}</button>
							</form>
						</div>
					</div>
				</section>

				<!-- Events Section -->
				<section v-if="activeSection === 'events' && !selectedEvent" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">📢</span> {{ $t('dashboard.events.title') }}</h2>
					</div>
					<div class="events-list">
						<div class="event-card clickable" @click="viewEventDetails('christmas')">
							<div class="event-date">
								<div class="date-month">{{ getShortMonth(12) }}</div>
								<div class="date-day">25</div>
							</div>
							<div class="event-content">
								<h3>{{ $t('dashboard.events.christmasParty.title') }}</h3>
								<p>{{ $t('dashboard.events.christmasParty.description') }}</p>
							</div>
							<span class="event-arrow">→</span>
						</div>
						<div class="event-card clickable" @click="viewEventDetails('drill')">
							<div class="event-date">
								<div class="date-month">{{ getShortMonth(1) }}</div>
								<div class="date-day">10</div>
							</div>
							<div class="event-content">
								<h3>{{ $t('dashboard.events.fireDrill.title') }}</h3>
								<p>{{ $t('dashboard.events.fireDrill.description') }}</p>
							</div>
							<span class="event-arrow">→</span>
						</div>
					</div>
				</section>

				<!-- Event Details -->
				<section v-if="activeSection === 'events' && selectedEvent" class="section">
					<EventDetails
						:event="selectedEvent"
						@close="selectedEvent = null"
					/>
				</section>

				<!-- Bills Section -->
				<section v-if="activeSection === 'bills' && !selectedBill" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">💳</span> {{ $t('dashboard.bills.title') }}</h2>
					</div>
					<div class="bills-list">
						<div class="bill-card">
							<div class="bill-header">
								<h3>{{ $t('dashboard.bills.managementFee') }}</h3>
								<span class="bill-amount">¥25,000</span>
							</div>
							<p>{{ $t('dashboard.bills.dueDate') }}: 2024/12/31</p>
							<div class="bill-actions">
								<button class="details-btn" @click="viewBillDetails('management')">{{ $t('dashboard.bills.details') }}</button>
								<button class="pay-btn-primary" @click="viewBillDetails('management')">{{ $t('dashboard.bills.payNow') }}</button>
							</div>
						</div>
						<div class="bill-card paid">
							<div class="bill-header">
								<h3>{{ $t('dashboard.bills.repairFund') }}</h3>
								<span class="bill-amount">¥10,000</span>
							</div>
							<p>{{ $t('dashboard.bills.paidDate') }}: 2024/11/30</p>
							<div class="bill-status">{{ $t('dashboard.bills.paid') }}</div>
							<button class="details-btn full-width" @click="viewBillDetails('repair')">{{ $t('dashboard.bills.details') }}</button>
						</div>
					</div>
				</section>

				<!-- Bill Details -->
				<section v-if="activeSection === 'bills' && selectedBill" class="section">
					<BillDetails
						:bill="selectedBill"
						@close="selectedBill = null"
						@payment="handlePayment"
					/>
				</section>

				<!-- Services Section -->
				<section v-if="activeSection === 'services'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">🛎️</span> {{ $t('dashboard.services.title') }}</h2>
					</div>
					<div class="cards-grid">
						<DashboardCard
							icon="🧹"
							:title="$t('dashboard.services.cleaning')"
							:description="$t('dashboard.services.cleaning.description')"
							:info="$t('dashboard.services.price') + ': ¥3,000/hour'"
							clickable
							:actions="[{ text: $t('dashboard.services.book'), class: 'booking', handler: () => bookService('cleaning') }]"
							@click="bookService('cleaning')"
						/>
						<DashboardCard
							icon="🚲"
							:title="$t('dashboard.services.bikeRental')"
							:description="$t('dashboard.services.bikeRental.description')"
							:info="$t('dashboard.services.price') + ': ¥500/day'"
							clickable
							:actions="[{ text: $t('dashboard.services.howTo'), class: 'booking', handler: () => viewServiceDetails('bike') }]"
							@click="viewServiceDetails('bike')"
						/>
						<DashboardCard
							icon="🛏️"
							:title="$t('dashboard.services.futonRental')"
							:description="$t('dashboard.services.futonRental.description')"
							:info="$t('dashboard.services.price') + ': ¥1,000/week'"
							clickable
							:actions="[{ text: $t('dashboard.services.howTo'), class: 'booking', handler: () => viewServiceDetails('futon') }]"
							@click="viewServiceDetails('futon')"
						/>
						<DashboardCard
							icon="💐"
							:title="$t('dashboard.services.flowerDelivery')"
							:description="$t('dashboard.services.flowerDelivery.description')"
							:info="$t('dashboard.services.price') + ': From ¥2,000'"
							clickable
							:actions="[{ text: $t('dashboard.services.book'), class: 'booking', handler: () => bookService('flowers') }]"
							@click="bookService('flowers')"
						/>
					</div>
				</section>

				<!-- Profile Section -->
				<section v-if="activeSection === 'profile'" class="section">
					<div class="section-header">
						<h2 class="section-title"><span class="section-icon">👤</span> {{ $t('dashboard.profile.myProfile') || 'My Profile' }}</h2>
					</div>
					<div class="profile-container">
						<div class="profile-card">
							<h3>{{ $t('dashboard.profile.personalInfo') || 'Personal Information' }}</h3>
							<form @submit.prevent="saveProfile">
								<div class="form-group">
									<label>{{ $t('dashboard.profile.name') || 'Full Name' }}</label>
									<input v-model="profileForm.name" type="text" required>
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.profile.email') || 'Email' }}</label>
									<input v-model="profileForm.email" type="email" disabled>
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.profile.phone') || 'Phone Number' }}</label>
									<input v-model="profileForm.phone" type="tel">
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.profile.unit') || 'Unit Number' }}</label>
									<input v-model="profileForm.unit" type="text" disabled>
								</div>
								<button type="submit" class="save-btn">
									{{ $t('common.save') || 'Save Changes' }}
								</button>
							</form>
						</div>

						<div class="profile-card">
							<h3>{{ $t('dashboard.profile.emergencyContact') || 'Emergency Contact' }}</h3>
							<form @submit.prevent="saveEmergencyContact">
								<div class="form-group">
									<label>{{ $t('dashboard.profile.emergencyName') || 'Contact Name' }}</label>
									<input v-model="emergencyForm.name" type="text">
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.profile.emergencyPhone') || 'Contact Phone' }}</label>
									<input v-model="emergencyForm.phone" type="tel">
								</div>
								<div class="form-group">
									<label>{{ $t('dashboard.profile.relationship') || 'Relationship' }}</label>
									<input v-model="emergencyForm.relationship" type="text">
								</div>
								<button type="submit" class="save-btn">
									{{ $t('common.save') || 'Save Changes' }}
								</button>
							</form>
						</div>

						<div class="profile-card">
							<h3>{{ $t('dashboard.profile.preferences') || 'Preferences' }}</h3>
							<div class="preference-item">
								<label>
									<input v-model="preferences.emailNotifications" type="checkbox">
									{{ $t('dashboard.profile.emailNotifications') || 'Email Notifications' }}
								</label>
							</div>
							<div class="preference-item">
								<label>
									<input v-model="preferences.smsNotifications" type="checkbox">
									{{ $t('dashboard.profile.smsNotifications') || 'SMS Notifications' }}
								</label>
							</div>
							<button class="save-btn" @click="savePreferences">
								{{ $t('common.save') || 'Save Preferences' }}
							</button>
						</div>
					</div>
				</section>
			</main>
		</div>

		<!-- Emergency Contacts Modal -->
		<Teleport to="body">
			<div v-if="showEmergency" class="modal-overlay" @click.self="showEmergency = false">
				<div class="modal-content">
					<EmergencyContacts @close="showEmergency = false" />
				</div>
			</div>
		</Teleport>

		<!-- Contact Manager Modal -->
		<Teleport to="body">
			<div v-if="showContactManager" class="modal-overlay" @click.self="showContactManager = false">
				<div class="modal-content">
					<ContactManager @close="showContactManager = false" />
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getCurrentInstance } from 'vue'

import BillDetails from '../components/BillDetails.vue'
import ContactManager from '../components/ContactManager.vue'
import DashboardCard from '../components/DashboardCard.vue'
import DocumentViewer from '../components/DocumentViewer.vue'
import EmergencyContacts from '../components/EmergencyContacts.vue'
import EventDetails from '../components/EventDetails.vue'
import FacilityBooking from '../components/FacilityBooking.vue'
import KagiLogo from '../components/KagiLogo.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import BurgerButton from '../components/ui/BurgerButton.vue'
import * as store from '../store'

// Accept route-params as prop (passed by TinyRouter)
const props = defineProps( {
	routeParams: {
		type: Object,
		default: () => ( {} )
	}
} )

const instance = getCurrentInstance()
const router = instance.proxy.$router

// Computed properties for store values
const user = computed( () => store.user.value )
const isAuthenticated = computed( () => store.isAuthenticated.value )
const isMenuOpen = computed( {
	get: () => store.isMenuOpen.value,
	set: ( val ) => { store.isMenuOpen.value = val }
} )

// Use computed to make activeSection reactive to route params
const activeSection = computed( () => {
	return props.routeParams?.section || 'home'
} )

// Mobile menu state
const showMobileMenu = ref( false )

// Profile form data
const profileForm = reactive( {
	name: user.value?.profile?.name || '',
	email: user.value?.email || '',
	phone: user.value?.profile?.phone || '',
	unit: user.value?.profile?.unit || ''
} )

const emergencyForm = reactive( {
	name: '',
	phone: '',
	relationship: ''
} )

const preferences = reactive( {
	emailNotifications: true,
	smsNotifications: false
} )

const menuItems = computed( () => [
	// { id: 'home', icon: '🏠', label: instance.proxy.$t( 'nav.home' ) },
	{ id: 'contact', icon: '📱', label: instance.proxy.$t( 'dashboard.menu.contact' ) },
	{ id: 'documents', icon: '📄', label: instance.proxy.$t( 'dashboard.menu.documents' ) },
	{ id: 'booking', icon: '📅', label: instance.proxy.$t( 'dashboard.menu.booking' ) },
	{ id: 'maintenance', icon: '🔧', label: instance.proxy.$t( 'dashboard.menu.maintenance' ) },
	{ id: 'events', icon: '📢', label: instance.proxy.$t( 'dashboard.menu.events' ) },
	{ id: 'bills', icon: '💳', label: instance.proxy.$t( 'dashboard.menu.bills' ) },
	{ id: 'services', icon: '🛎️', label: instance.proxy.$t( 'dashboard.services.title' ) }
] )

const maintenanceForm = reactive( {
	category: '',
	title: '',
	description: ''
} )

const selectedMaintenanceCategory = ref( null )
const showMaintenanceSuccess = ref( false )
const showDocumentViewer = ref( false )
const currentDocument = ref( null )
const showEmergency = ref( false )
const showContactManager = ref( false )
const selectedBill = ref( null )
const selectedEvent = ref( null )
const selectedFacility = ref( null )
const activeFilter = ref( 'all' )

// Sample user bookings data
const userBookings = ref( [
	{
		id: 1,
		facility: 'Party Room',
		facilityId: 'party',
		icon: '🎉',
		month: 'DEC',
		day: '25',
		date: new Date( 2024, 11, 25, 14, 0 ), // December 25, 2024
		time: '14:00 - 16:00',
		duration: '2 hours',
		purpose: 'Birthday celebration',
		reference: 'BK20241225'
	},
	{
		id: 2,
		facility: 'Fitness Gym',
		facilityId: 'gym',
		icon: '💪',
		month: 'DEC',
		day: '23',
		date: new Date( 2024, 11, 23, 9, 0 ), // December 23, 2024
		time: '09:00 - 10:00',
		duration: '1 hour',
		purpose: 'Morning workout',
		reference: 'BK20241223'
	},
	{
		id: 3,
		facility: 'Guest Room',
		facilityId: 'guest',
		icon: '🛏️',
		month: 'DEC',
		day: '24',
		date: new Date( 2024, 11, 24, 15, 0 ), // December 24, 2024 check-in
		endDate: new Date( 2024, 11, 26, 11, 0 ), // December 26, 2024 check-out
		time: 'Check-in 3PM',
		duration: '2 nights',
		purpose: 'Family visit',
		reference: 'BK20241224'
	}
] )

// Filtered bookings based on active filter
const filteredBookings = computed( () => {
	const filter = activeFilter.value
	if ( filter === 'all' ) return userBookings.value

	const now = new Date()
	now.setHours( 0, 0, 0, 0 )

	return userBookings.value.filter( booking => {
		const bookingDate = new Date( booking.date )
		bookingDate.setHours( 0, 0, 0, 0 )
		const diffTime = bookingDate - now

		if ( filter === 'upcoming' ) {
			return diffTime >= 0
		} else if ( filter === 'past' ) {
			return diffTime < 0
		}
		return true
	} )
} )

// Calculate countdown for bookings
const getBookingCountdown = ( bookingDate ) => {
	const now = new Date()
	const booking = new Date( bookingDate )

	// Reset time parts for accurate day comparison
	now.setHours( 0, 0, 0, 0 )
	booking.setHours( 0, 0, 0, 0 )

	const diffTime = booking - now
	const diffDays = Math.ceil( diffTime / ( 1000 * 60 * 60 * 24 ) )

	if ( diffDays < 0 ) return { text: 'Past', class: 'past' }
	if ( diffDays === 0 ) return { text: 'Today', class: 'today' }
	if ( diffDays === 1 ) return { text: 'Tomorrow', class: 'tomorrow' }
	if ( diffDays <= 7 ) return { text: `In ${diffDays} days`, class: 'upcoming' }
	return { text: `In ${diffDays} days`, class: 'future' }
}

const logout = async () => {
	await store.logout()
	router.push( '/' )
}

const saveProfile = () => {
	// Save profile data
	console.log( 'Saving profile:', profileForm )
	alert( instance.proxy.$t( 'dashboard.profile.saved' ) || 'Profile saved successfully!' )
}

const saveEmergencyContact = () => {
	// Save emergency contact
	console.log( 'Saving emergency contact:', emergencyForm )
	alert( instance.proxy.$t( 'dashboard.profile.emergencySaved' ) || 'Emergency contact saved successfully!' )
}

const savePreferences = () => {
	// Save preferences
	console.log( 'Saving preferences:', preferences )
	alert( instance.proxy.$t( 'dashboard.profile.preferencesSaved' ) || 'Preferences saved successfully!' )
}

const submitMaintenance = () => {
	maintenanceForm.category = selectedMaintenanceCategory.value
	console.log( 'Maintenance request:', maintenanceForm )
	// Show success message
	showMaintenanceSuccess.value = true
	// Reset form after a short delay to show success
	setTimeout( () => {
		selectedMaintenanceCategory.value = null
		maintenanceForm.title = ''
		maintenanceForm.description = ''
		showMaintenanceSuccess.value = false
	}, 3000 )
}

// Contact actions
const contactManager = () => {
	showContactManager.value = true
}

const viewEmergency = () => {
	showEmergency.value = true
}

const viewBillDetails = ( billType ) => {
	const bills = {
		management: {
			id: 1,
			icon: '🏢',
			title: instance.proxy.$t( 'dashboard.bills.managementFee' ),
			amount: '¥25,000',
			billNumber: '#2024-12-001',
			issueDate: '2024/12/01',
			dueDate: '2024/12/31',
			period: 'December 2024',
			status: 'unpaid',
			paid: false
		},
		repair: {
			id: 2,
			icon: '🔧',
			title: instance.proxy.$t( 'dashboard.bills.repairFund' ),
			amount: '¥10,000',
			billNumber: '#2024-11-001',
			issueDate: '2024/11/01',
			dueDate: '2024/11/30',
			paidDate: '2024/11/30',
			period: 'November 2024',
			status: 'paid',
			paid: true,
			paymentMethod: 'Credit Card',
			reference: 'TXN-2024-11-30-001'
		}
	}
	selectedBill.value = bills[billType]
}

const handlePayment = ( paymentData ) => {
	// Handle payment
	console.log( 'Payment processed:', paymentData )
	selectedBill.value = null
	// Show success message
	alert( instance.proxy.$t( 'bills.paymentSuccess' ) || 'Payment successful!' )
}

const cancelBooking = ( bookingId ) => {
	if ( confirm( instance.proxy.$t( 'booking.confirmCancel' ) || 'Are you sure you want to cancel this booking?' ) ) {
		userBookings.value = userBookings.value.filter( b => b.id !== bookingId )
		// Show success message
		alert( instance.proxy.$t( 'booking.cancelSuccess' ) || 'Booking cancelled successfully!' )
	}
}

const viewBookingDetails = ( bookingId ) => {
	// In a real app, this would open a modal with full booking details
	const booking = userBookings.value.find( b => b.id === bookingId )
	if ( booking ) {
		alert( `Booking Details:\nFacility: ${booking.facility}\nDate: ${booking.month} ${booking.day}\nTime: ${booking.time}\nPurpose: ${booking.purpose}` )
	}
}

const rebookFacility = ( booking ) => {
	// Navigate to booking section with the same facility
	const facilityId = booking.facilityId
	bookFacility( facilityId )
}

const bookService = ( serviceType ) => {
	// Handle service booking
	console.log( 'Booking service:', serviceType )
	// In a real app, this would open a booking form or redirect to booking page
	alert( `${instance.proxy.$t( 'dashboard.services.book' )}: ${serviceType}` )
}

const viewServiceDetails = ( serviceType ) => {
	// Show service details and how-to information
	console.log( 'Viewing service details:', serviceType )
	// In a real app, this would open a modal or navigate to a details page
	const howToMessages = {
		bike: 'To rent a bike:\n1. Go to the management office\n2. Show your resident ID\n3. Fill out the rental form\n4. Pay the rental fee\n5. Receive bike key and lock',
		futon: 'To rent a futon:\n1. Call the management office 2 days in advance\n2. Specify the rental period\n3. Futon will be delivered to your door\n4. Payment upon delivery'
	}
	alert( howToMessages[serviceType] || 'Contact management office for details' )
}

const viewEventDetails = ( eventType ) => {
	const events = {
		christmas: {
			id: 1,
			title: instance.proxy.$t( 'dashboard.events.christmasParty.title' ) || 'Christmas Party',
			subtitle: 'Annual building celebration',
			month: 'DEC',
			day: '25',
			time: '6:00 PM - 10:00 PM',
			location: '1st Floor Lobby',
			attendees: '50-70 residents',
			fee: 'Free',
			description: instance.proxy.$t( 'dashboard.events.christmasParty.description' ) || 'Join us for our annual Christmas celebration!',
			agenda: [
				'6:00 PM - Welcome and opening remarks',
				'6:30 PM - Dinner buffet opens',
				'7:30 PM - Christmas carol singing',
				'8:00 PM - Gift exchange (optional)',
				'9:00 PM - Dancing and socializing'
			],
			notes: [
				'Children are welcome',
				'Bring a wrapped gift (¥1000 value) for gift exchange',
				'Vegetarian and halal options available'
			],
			organizer: 'Building Management Committee',
			organizerRole: 'Event Coordination Team',
			past: false
		},
		drill: {
			id: 2,
			title: instance.proxy.$t( 'dashboard.events.fireDrill.title' ) || 'Fire Drill',
			subtitle: 'Mandatory safety exercise',
			month: 'JAN',
			day: '10',
			time: '10:00 AM - 11:00 AM',
			location: 'All Areas',
			attendees: 'All residents (mandatory)',
			fee: 'N/A',
			description: instance.proxy.$t( 'dashboard.events.fireDrill.description' ) || 'Annual fire drill. All residents must participate.',
			agenda: [
				'10:00 AM - Alarm will sound',
				'10:05 AM - Evacuation begins',
				'10:20 AM - Roll call at assembly point',
				'10:40 AM - Safety briefing',
				'11:00 AM - Return to units'
			],
			notes: [
				'This is a mandatory drill',
				'Please evacuate via stairs only',
				'Assembly point: Front parking area',
				'Bring your emergency kit if you have one'
			],
			organizer: 'Building Safety Committee',
			organizerRole: 'Fire Safety Team',
			past: false
		}
	}
	selectedEvent.value = events[eventType]
}

// Document actions
const viewDocument = ( type ) => {
	const titleMap = {
		management: 'Management-Rules',
		facility: 'Facility-Rules',
		parking: 'Parking-Rules'
	}
	router.push( `/dashboard/documents/${titleMap[type]}` )
}

const getCurrentDocumentTitle = () => {
	const id = props.routeParams?.documentId
	const titleMap = {
		'Management-Rules': instance.proxy.$t( 'dashboard.documents.managementRules' ),
		'Facility-Rules': instance.proxy.$t( 'dashboard.documents.facilityRules' ),
		'Parking-Rules': instance.proxy.$t( 'dashboard.documents.parkingRules' )
	}
	return titleMap[id] || id
}

const getCurrentDocumentContent = () => {
	const id = props.routeParams?.documentId
	const typeMap = {
		'Management-Rules': 'management',
		'Facility-Rules': 'facility',
		'Parking-Rules': 'parking'
	}
	return getDocumentContent( typeMap[id] || 'management' )
}

const getCurrentDocumentDate = () => {
	const id = props.routeParams?.documentId
	const typeMap = {
		'Management-Rules': 'management',
		'Facility-Rules': 'facility',
		'Parking-Rules': 'parking'
	}
	return getDocumentDate( typeMap[id] || 'management' )
}

const getDocumentContent = ( type ) => {
	// Friendly, polite markdown content
	const contents = {
		management: `# Building Management Rules and Guidelines

Welcome to our community! These management rules help ensure a comfortable and harmonious living environment for all residents. We appreciate your cooperation in maintaining our wonderful building.

![Building Exterior](/img/docs/placeholder.svg)

## Article 1: General Provisions

### 1.1 Purpose
These rules are established to promote the health, safety, comfort, and general welfare of all residents. We strive to create a pleasant community where everyone can enjoy their home peacefully.

### 1.2 Applicability
These rules apply to all residents, their family members, guests, and any visitors to the property. We kindly ask that you share these guidelines with your guests to ensure everyone's comfort.

### 1.3 Amendments
Rules may be updated periodically based on resident feedback and changing needs. We'll always notify you well in advance of any changes, and your input is always welcome.

## Article 2: Common Areas

### 2.1 General Use
Our common areas are for everyone to enjoy! Please help us keep them clean and welcoming:
- **Cleanliness**: Please dispose of trash properly and clean up after yourself
- **Respect**: Be mindful of others using the space
- **Hours**: Common areas are available from 6:00 AM to 11:00 PM daily

### 2.2 Lobby and Hallways
The lobby is the first impression of our home. Please:
- Keep noise levels moderate, especially during evening hours
- Don't leave personal belongings in hallways (for safety reasons)
- Use designated areas for deliveries and packages

### 2.3 Elevators
To ensure smooth operation for everyone:
- Please allow exiting passengers to leave first
- Hold the door for others when safe to do so
- Contact management if you notice any issues

## Article 3: Quiet Hours

We value everyone's right to peaceful enjoyment of their home:
- **Weekdays**: 10:00 PM to 7:00 AM
- **Weekends**: 11:00 PM to 8:00 AM

During these hours, please:
- Keep TV and music at moderate volumes
- Avoid using washing machines or vacuum cleaners
- Walk softly if you have hardwood floors

## Article 4: Pets

We love our furry friends! If you have pets, please:
- Register them with the management office
- Keep dogs on leashes in all common areas
- Clean up after your pets immediately
- Ensure pets don't disturb neighbors with excessive noise

## Article 5: Renovations and Modifications

Want to personalize your space? We understand! Please:
- Submit renovation plans to management for approval
- Schedule work during permitted hours (9:00 AM - 5:00 PM weekdays)
- Use licensed contractors for major work
- Notify neighbors of planned work in advance

## Article 6: Safety and Security

Your safety is our priority:
- Don't prop open security doors
- Report suspicious activity immediately
- Familiarize yourself with emergency exits
- Keep your contact information updated with management

## Article 7: Waste Disposal

Help us maintain a clean environment:
- **Burnable waste**: Tuesdays and Fridays
- **Non-burnable waste**: 1st and 3rd Wednesdays
- **Recyclables**: Every Thursday
- **Large items**: Please schedule with management

## Article 8: Community Spirit

We encourage a friendly, supportive community:
- Greet your neighbors when you see them
- Participate in building events when possible
- Consider joining the residents' committee
- Share concerns or suggestions with management

---

*Thank you for taking the time to read these guidelines. If you have any questions or suggestions, please don't hesitate to contact the management office. Together, we can make our building a wonderful place to call home!*`,

		facility: `# Facility Usage Guidelines

Welcome! Our building offers wonderful facilities for all residents to enjoy. These guidelines help ensure everyone has a pleasant experience.

## Fitness Gym

### Hours of Operation
- **Daily**: 6:00 AM to 10:00 PM
- **Holidays**: 8:00 AM to 8:00 PM

### General Guidelines

#### Getting Started
Welcome to our fully-equipped fitness center! Whether you're a fitness enthusiast or just starting your wellness journey, we're here to support you:

- **First-time users**: Please attend a brief orientation (available daily at 10 AM and 6 PM)
- **Access**: Use your resident key card for entry
- **Guest policy**: Residents may bring one guest (guest fee: ¥500)

#### Equipment Use
We have a variety of equipment for your fitness needs:
- **Cardio machines**: Treadmills, ellipticals, and stationary bikes
- **Weight training**: Free weights and resistance machines
- **Stretching area**: Yoga mats and foam rollers available

Please help us maintain our equipment:
- Wipe down equipment after each use (sanitizing stations available)
- Return weights to their designated spots
- Report any equipment issues immediately

#### Gym Etiquette
Let's create a comfortable environment for everyone:
- **Time limits**: 30 minutes on cardio equipment during peak hours (6-8 AM, 6-8 PM)
- **Noise**: Please use headphones and avoid dropping weights
- **Attire**: Clean athletic wear and closed-toe shoes required
- **Towels**: Bring your own or rent from reception (¥100)

#### Safety First
- Warm up before exercising
- Stay hydrated (water fountains available)
- If you feel unwell, stop exercising immediately
- Emergency button located near the entrance

## Party Room

### Making Your Celebration Special

Our party room is perfect for birthdays, anniversaries, and gatherings!

#### Booking Information
- **Capacity**: Up to 20 guests comfortably
- **Hours**: 10:00 AM to 10:00 PM
- **Rate**: ¥2,000 per hour (minimum 2 hours)
- **Booking**: Reserve up to 3 months in advance

#### Room Features
- Fully equipped kitchen with refrigerator and microwave
- Tables and chairs for 20 people
- Audio system with Bluetooth connectivity
- Projector and screen for presentations
- Child-friendly with safety locks

#### Reservation Process
1. Check availability on the booking calendar
2. Submit reservation form at least 48 hours in advance
3. Pay deposit (¥5,000, refundable after inspection)
4. Receive confirmation and access code

#### Usage Guidelines
We want your event to be memorable:
- **Setup/Cleanup**: Included in your booking time
- **Decorations**: Welcome! Please use removable adhesives only
- **Catering**: Outside catering is permitted
- **Alcohol**: Allowed for guests 20 years and older

#### After Your Event
- Please leave the room as you found it
- Dispose of garbage in designated areas
- Turn off all appliances and lights
- Return the key by 10:30 PM

## Guest Rooms

### Your Home Away from Home

Perfect for visiting family and friends!

#### Room Details
- **Available**: 2 guest suites
- **Capacity**: Up to 2 guests per room
- **Rate**: ¥5,000 per night
- **Maximum stay**: 7 consecutive nights

#### Amenities Included
- Queen-size bed with fresh linens
- Private bathroom with towels
- Mini-refrigerator and electric kettle
- Wi-Fi access
- Air conditioning and heating

#### Booking Policy
- Residents may book up to 2 weeks per month
- Reservations accepted up to 2 months in advance
- Check-in: 3:00 PM / Check-out: 11:00 AM
- Cancellation: 24 hours notice required

#### House Rules for Guests
Please inform your guests:
- Register at the management office upon arrival
- Respect building quiet hours
- No smoking in rooms
- No additional overnight guests

## Rooftop Garden

### Your Urban Oasis

Enjoy stunning city views and fresh air!

#### Access Hours
- **Spring/Summer**: 6:00 AM to 9:00 PM
- **Fall/Winter**: 7:00 AM to 7:00 PM
- **Closed during severe weather**

#### Garden Features
- Seating areas with umbrellas
- BBQ grills (reservation required)
- Children's play area
- Herb and vegetable garden (communal)

#### BBQ Area Reservations
- **Time slots**: 11:00 AM - 2:00 PM or 5:00 PM - 8:00 PM
- **Fee**: ¥1,000 per session
- **Includes**: Grill, basic utensils, and cleaning supplies
- Please bring your own charcoal

#### Garden Guidelines
- Children must be supervised at all times
- Please water plants if you harvest herbs
- Keep noise moderate after 8:00 PM
- No glass containers for safety

## Kids' Playroom

### A Safe Space for Little Ones

#### Hours
- **Daily**: 9:00 AM to 7:00 PM
- **Age range**: 0-10 years old

#### Safety Rules
- Adult supervision required at all times
- Maximum 10 children at once
- Please remove shoes
- Clean up toys after playing

#### Available Toys and Equipment
- Age-appropriate toys and books
- Soft play area for toddlers
- Art supplies (please supervise)
- Hand sanitizer stations

---

*We hope you enjoy these wonderful facilities! For bookings or questions, please visit the management office or call extension 100. Thank you for helping us maintain these spaces for everyone's enjoyment!*`,

		parking: `# Parking Regulations and Guidelines

Thank you for helping us maintain a safe and organized parking environment for all residents.

## General Parking Policies

### Overview
Our parking facilities are designed to accommodate all residents safely and efficiently. Your cooperation helps ensure smooth access for everyone, including emergency vehicles.

### Parking Assignments

#### Resident Parking
Each unit is allocated parking based on the following:
- **Studio/1-bedroom**: 1 parking space
- **2-bedroom**: 1 parking space (additional available upon request)
- **3-bedroom+**: 2 parking spaces

#### Space Assignment Process
1. Parking spaces are assigned by management
2. Your assigned space number is on your lease agreement
3. Space transfers require management approval
4. Please display your parking permit at all times

### Parking Levels Guide

#### B2 Level - Resident Parking
- Reserved for residents only
- 24/7 access with key card
- Direct elevator access to all floors
- Electric vehicle charging stations available (Spaces B2-01 to B2-10)

#### B1 Level - Mixed Use
- Resident overflow parking
- Visitor parking (limited hours)
- Motorcycle and bicycle parking area
- Loading zone for deliveries

#### Ground Level
- Handicapped parking spaces (with valid permit)
- 15-minute temporary parking for loading/unloading
- Emergency vehicle access - keep clear at all times

## Vehicle Registration

### Required Information
Please register all vehicles with management:
- Vehicle make, model, and color
- License plate number
- Proof of insurance
- Driver's license copy

### Parking Permits
- Permits must be displayed on rearview mirror
- Replacement permits: ¥1,000
- Temporary permits available for rental cars
- Update management when changing vehicles

## Guest and Visitor Parking

### Visitor Policy
We welcome your guests! Please note:
- **Hours**: 8:00 AM to 11:00 PM daily
- **Duration**: Maximum 24 hours
- **Location**: B1 level, marked visitor spaces only
- **Registration**: Required at management office

### Overnight Guest Parking
- Must be pre-approved by management
- Maximum 3 consecutive nights
- Fee: ¥1,000 per night
- Guest pass required

### Contractor and Delivery Vehicles
- Use loading zones only
- Maximum 2 hours parking
- Must display contractor permit
- Schedule large deliveries with management

## Parking Rules and Etiquette

### Do's
✓ Park within designated lines
✓ Lock your vehicle
✓ Report suspicious activity
✓ Keep your space clean
✓ Respect handicapped spaces
✓ Follow directional arrows

### Don'ts
✗ Don't block other vehicles
✗ Don't park in unassigned spaces
✗ Don't store items in parking areas
✗ Don't perform major vehicle repairs
✗ Don't idle engines unnecessarily
✗ Don't use parking for commercial purposes

## Special Parking Areas

### Electric Vehicle Charging
- 10 charging stations available
- First-come, first-served basis
- Maximum 4 hours charging time
- Move vehicle promptly after charging
- Monthly unlimited charging pass: ¥3,000

### Motorcycle Parking
- Designated area in B1 level
- Must be registered with management
- Monthly fee: ¥3,000
- Secure your motorcycle properly

### Bicycle Parking
- Free for residents
- Registration required (security measure)
- Use designated racks only
- Remove abandoned bicycles monthly

### Car Wash Area
- Located on B1 level
- Hours: 8:00 AM to 6:00 PM
- Please clean up after use
- No commercial washing

## Safety and Security

### Security Features
- 24-hour CCTV monitoring
- Emergency call boxes on each level
- Adequate lighting throughout
- Regular security patrols
- Automatic gate system

### Safety Guidelines
- Drive slowly (5 km/h maximum)
- Watch for pedestrians
- Report accidents immediately
- Keep valuables out of sight
- Report suspicious persons or vehicles

### Emergency Procedures
- Emergency exits clearly marked
- Fire extinguishers on each level
- In case of fire, evacuate immediately
- Assembly point: Front courtyard
- Emergency contact: Extension 911

## Violations and Enforcement

### Common Violations
We prefer friendly reminders, but repeated violations may result in:

#### Warning Stage
- 1st violation: Friendly reminder
- 2nd violation: Written warning
- 3rd violation: Meeting with management

#### Penalties
- Unauthorized parking: ¥5,000 fine
- Blocking emergency routes: Immediate towing
- Abandoned vehicles: Removed after 30 days notice

### Towing Policy
Vehicles may be towed if:
- Blocking emergency access
- Parked in handicapped space without permit
- Abandoned for over 30 days
- Repeated violations

**Towing cost**: Owner's responsibility (approximately ¥20,000)

## Maintenance and Cleaning

### Scheduled Maintenance
- Monthly cleaning: First Sunday
- Line repainting: Annually in April
- Light inspection: Quarterly
- Notice given 1 week in advance

### During Maintenance
- Temporary parking arrangements available
- Follow posted signs
- Remove vehicles if requested
- Maintenance hours: 9:00 AM to 5:00 PM

## Additional Services

### Valet Parking
- Available for elderly or disabled residents
- Prior arrangement required
- No additional fee
- Contact management for details

### Car Sharing Program
- 2 shared vehicles available
- Hourly or daily rental
- Residents get priority booking
- Details at management office

## Contact and Support

### Management Office Hours
- Monday-Friday: 9:00 AM to 6:00 PM
- Saturday: 9:00 AM to 1:00 PM
- Emergency: 24/7 hotline

### How to Reach Us
- Office: Extension 100
- Emergency: Extension 911
- Email: parking@buildingmanagement.jp
- Suggestion box in lobby

---

*Your cooperation makes our parking facilities safe and convenient for everyone. If you have suggestions for improving our parking system, we'd love to hear from you. Thank you for being a considerate member of our community!*

**Remember**: A well-organized parking area reflects our community's commitment to harmony and mutual respect.`
	}
	return contents[type] || ''
}

const getDocumentDate = ( type ) => {
	const dates = {
		management: '2024/01',
		facility: '2024/03',
		parking: '2023/12'
	}
	return dates[type] || '2024/01'
}

const saveDocument = ( data ) => {
	console.log( 'Saving document:', data )
	// API call would go here
	// For now, just update the local content
	if ( currentDocument.value ) {
		currentDocument.value.content = data.content
	}
	showDocumentViewer.value = false
}

// Booking actions
const bookFacility = ( facilityType ) => {
	const facilities = {
		party: {
			id: 'party',
			name: instance.proxy.$t( 'dashboard.booking.partyRoom' ) || 'Party Room',
			icon: '🎉',
			description: 'Perfect for celebrations and gatherings with friends and family',
			capacity: '20 people',
			maxCapacity: 20,
			price: '¥10,000/half-day',
			priceValue: 10000,
			amenities: 'Kitchen, Audio system, Projector',
			bookingType: 'half-day'
		},
		guest: {
			id: 'guest',
			name: instance.proxy.$t( 'dashboard.booking.guestRoom' ) || 'Guest Room',
			icon: '🛏️',
			description: 'Comfortable accommodation for your visiting guests',
			capacity: '2 people',
			maxCapacity: 2,
			price: '¥5,000/night',
			priceValue: 5000,
			amenities: 'Bed, Bathroom, Mini-fridge',
			bookingType: 'full-day'
		},
		gym: {
			id: 'gym',
			name: instance.proxy.$t( 'dashboard.booking.gym' ) || 'Fitness Gym',
			icon: '💪',
			description: 'Fully equipped gym for your fitness needs',
			capacity: '10 people',
			maxCapacity: 10,
			price: 'Free',
			priceValue: 0,
			amenities: 'Cardio machines, Weights, Yoga area',
			bookingType: 'hourly'
		}
	}
	selectedFacility.value = facilities[facilityType]
}

// Maintenance helpers
const selectMaintenanceCategory = ( category ) => {
	selectedMaintenanceCategory.value = category
}

const getCategoryIcon = ( category ) => {
	const icons = {
		plumbing: '🚿',
		electrical: '⚡',
		aircon: '❄️',
		other: '🔨'
	}
	return icons[category] || '🔧'
}

const getCategoryName = ( category ) => {
	return instance.proxy.$t( `dashboard.maintenance.${category}` )
}

// Navigation helper
const navigateToSection = ( section ) => {
	if ( section === 'home' ) {
		router.push( '/dashboard' )
	} else {
		router.push( `/dashboard/${section}` )
	}
}

const getServiceDescription = ( serviceId ) => {
	const descriptions = {
		contact: instance.proxy.$t( 'home.features.communication.description' ),
		documents: instance.proxy.$t( 'home.features.documents.description' ),
		booking: instance.proxy.$t( 'home.features.booking.description' ),
		maintenance: instance.proxy.$t( 'home.features.maintenance.description' ),
		events: instance.proxy.$t( 'home.features.events.description' ),
		bills: instance.proxy.$t( 'home.features.bills.description' ),
		services: 'Cleaning, bike rental, futon rental, and more convenient services'
	}
	return descriptions[serviceId] || ''
}

const getShortMonth = ( monthNumber ) => {
	const months = {
		en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
		fr: ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'],
		ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
	}
	const lang = localStorage.getItem( 'kagi_language' ) || 'en'
	return months[lang][monthNumber - 1] || months.en[monthNumber - 1]
}

// Check authentication on mount
onMounted( () => {
	if ( !isAuthenticated.value ) {
		router.push( '/login' )
	}
} )

// Toggle mobile menu when clicking user button
watch( showMobileMenu, ( newVal ) => {
	const userBtn = document.querySelector( '.user-menu-btn' )
	if ( userBtn ) {
		if ( newVal ) {
			userBtn.classList.add( 'active' )
		} else {
			userBtn.classList.remove( 'active' )
		}
	}
} )
</script>

<style lang="stylus" scoped>
.dashboard
	min-height 100vh
	display flex
	flex-direction column
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	box-sizing border-box

// Global box-sizing fix
*, *::before, *::after
	box-sizing border-box

.header
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	box-shadow 0 4px 20px rgba(255, 193, 7, 0.15)
	position sticky
	top 0
	z-index 100

.header-content
	max-width 1400px
	margin 0 auto
	padding 1rem 2rem
	display flex
	justify-content space-between
	align-items center

.header-left
	display flex
	align-items center
	gap 1rem

	h1
		font-size 1.5rem
		color #333
		margin 0

.header-right
	display flex
	align-items center

.user-menu-btn
	display flex
	align-items center
	gap 0.5rem
	padding 0.6rem 1.2rem
	background white
	color #333
	border 2px solid rgba(255, 193, 7, 0.3)
	border-radius 50px
	cursor pointer
	transition all 0.3s ease
	box-shadow 0 2px 10px rgba(255, 193, 7, 0.1)
	font-size 0.95rem

	.user-email
		font-weight 500
		max-width 200px
		overflow hidden
		text-overflow ellipsis
		white-space nowrap

		@media (max-width: 480px)
			max-width 120px
			font-size 0.9rem

	.menu-arrow
		font-size 0.7rem
		transition transform 0.3s ease

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		border-color #FFC107
		box-shadow 0 4px 15px rgba(255, 193, 7, 0.25)

	&.active
		.menu-arrow
			transform rotate(180deg)


// Mobile Settings Menu
.mobile-settings-menu
	position fixed
	top 0
	right 0
	width 280px
	height 100vh
	background white
	box-shadow -2px 0 10px rgba(0, 0, 0, 0.15)
	z-index 1000
	display flex
	flex-direction column

	.profile-btn
		width 100%
		padding 0.75rem
		background #FFC107
		color #333
		border none
		border-radius 10px
		font-weight 600
		cursor pointer
		margin 1rem 0
		transition all 0.3s ease

		&:hover
			background #FFB300
			transform translateY(-2px)

.mobile-menu-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-bottom 2px solid #FFC107

	h3
		margin 0
		color #333

.close-menu-btn
	background none
	border none
	font-size 1.5rem
	color #666
	cursor pointer
	padding 0
	width 30px
	height 30px
	display flex
	align-items center
	justify-content center
	border-radius 50%
	transition all 0.2s ease

	&:hover
		background rgba(0, 0, 0, 0.1)
		color #333

.mobile-menu-content
	flex 1
	padding 1.5rem
	display flex
	flex-direction column
	gap 1.5rem

.mobile-user-info
	background #f9f9f9
	padding 1rem
	border-radius 10px

	.user-email
		font-weight 600
		color #333
		margin-bottom 0.5rem
		word-break break-all

	.user-role
		font-size 0.9rem
		color #666
		text-transform capitalize

.mobile-lang-section
	padding 1rem 0
	border-top 1px solid #e0e0e0
	border-bottom 1px solid #e0e0e0

.mobile-logout-btn
	width 100%
	padding 1rem
	background white
	color #666
	border 2px solid #e0e0e0
	border-radius 50px
	font-size 1rem
	font-weight 500
	cursor pointer
	transition all 0.3s ease
	margin-top auto

	&:hover
		background #f5f5f5
		border-color #999
		color #333

// Slide animation for mobile menu (from right)
.slide-enter-active, .slide-leave-active
	transition transform 0.3s ease

.slide-enter-from, .slide-leave-to
	transform translateX(100%)

// Slide from left animation for side menu
.slide-left-enter-active .mobile-side-menu,
.slide-left-leave-active .mobile-side-menu
	transition transform 0.3s ease

.slide-left-enter-from .mobile-side-menu,
.slide-left-leave-to .mobile-side-menu
	transform translateX(-100%)

.slide-left-enter-active,
.slide-left-leave-active
	transition opacity 0.3s ease

.slide-left-enter-from,
.slide-left-leave-to
	opacity 0

.dashboard-content
	display flex
	flex 1
	max-width 1400px
	margin 0 auto
	width 100%
	gap 2rem
	padding 2rem

	@media (max-width: 768px)
		padding 1rem
		gap 1rem

	@media (max-width: 550px)
		padding 0.5rem
		gap 0.5rem

.sidebar
	width 250px
	background white
	border-radius 20px
	padding 1.5rem
	box-shadow 0 8px 25px rgba(255, 193, 7, 0.08)
	height fit-content
	position sticky
	top 100px
	border 1px solid rgba(255, 193, 7, 0.15)

	@media (max-width: 768px)
		display none

.nav-menu
	display flex
	flex-direction column
	gap 0.5rem

	@media (max-width: 768px)
		display none

// Mobile menu - hidden on desktop
// Mobile burger button styling
.mobile-burger
	display none !important

	@media (max-width: 768px)
		display block !important
		position relative !important
		top auto !important
		right auto !important

	:deep(span)
		background-color #333 !important

	&:hover :deep(span)
		background-color #FFC107 !important

// Mobile side menu
.mobile-side-menu-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	z-index 999
	display flex

.mobile-side-menu
	position relative
	width 280px
	height 100vh
	background white
	box-shadow 2px 0 10px rgba(0, 0, 0, 0.15)
	display flex
	flex-direction column
	overflow-y auto

	.side-menu-header
		padding 1.5rem
		background white
		border-bottom 1px solid #e0e0e0

		.user-profile-section
			display flex
			gap 1rem
			align-items center

			.user-avatar
				width 50px
				height 50px
				background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
				border-radius 50%
				display flex
				align-items center
				justify-content center
				font-size 1.5rem
				font-weight bold
				color white

			.user-info
				.user-name
					font-weight 600
					color #333
					margin-bottom 0.25rem

				.user-email
					font-size 0.85rem
					color #666

	.language-selector
		padding 0.75rem 1.5rem
		background rgba(255, 193, 7, 0.05)
		border-bottom 1px solid rgba(255, 193, 7, 0.1)

	.side-menu-nav
		padding 1rem
		flex 1

	.side-menu-item
		display flex
		align-items center
		gap 0.75rem
		padding 0.85rem 1rem
		margin 0.25rem 0.5rem
		background none
		border none
		border-radius 12px
		width calc(100% - 1rem)
		text-align left
		cursor pointer
		transition all 0.2s ease
		color #333

		&:hover
			background rgba(255, 193, 7, 0.1)

		&.active
			background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
			color white
			font-weight 600
			box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)

			.menu-icon
				color white

		.menu-icon
			width 28px
			font-size 1.3rem
			text-align center

		.menu-label
			flex 1
			font-size 0.95rem

	.side-menu-actions
		padding 1rem 0
		border-top 1px solid #e0e0e0

		.logout-item
			color #d32f2f

			&:hover
				background rgba(211, 47, 47, 0.1)

			.menu-icon
				color #d32f2f

.desktop-only
	@media (max-width: 768px)
		display none
		scrollbar-width thin

		&::-webkit-scrollbar
			height 4px

		&::-webkit-scrollbar-track
			background #f0f0f0
			border-radius 2px

		&::-webkit-scrollbar-thumb
			background #ccc
			border-radius 2px

	@media (max-width: 550px)
		gap 0.4rem

.nav-item
	display flex
	align-items center
	gap 1rem
	padding 1rem
	background transparent
	border none
	border-radius 15px
	cursor pointer
	transition all 0.3s ease
	text-align left
	text-decoration none
	color #666
	width 100%
	font-size 0.95rem
	font-family inherit

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		color #333
		transform translateX(5px)

	&.active
		background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
		color white
		font-weight 600
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.3)

	.nav-icon
		font-size 1.2rem

	.nav-label
		font-size 0.95rem

// Mobile navigation items
.nav-item-mobile
	display flex
	flex-direction column
	align-items center
	gap 0.5rem
	padding 0.5rem
	background transparent
	border none
	cursor pointer
	transition all 0.2s ease
	min-width 70px
	flex-shrink 0

	@media (max-width: 550px)
		min-width 60px
		padding 0.25rem
		gap 0.3rem

	&:hover
		.nav-icon-circle
			background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
			transform scale(1.08)
			border-color #FFC107

	&.active
		.nav-icon-circle
			background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
			border-color #FFC107
			box-shadow 0 4px 15px rgba(255, 193, 7, 0.4)

		.nav-label-mobile
			color #333
			font-weight 600

.nav-icon-circle
	width 50px
	height 50px
	border-radius 50%
	background white
	border 2px solid rgba(255, 193, 7, 0.3)
	display flex
	align-items center
	justify-content center
	transition all 0.2s ease
	box-shadow 0 3px 12px rgba(255, 193, 7, 0.1)

	@media (max-width: 550px)
		width 45px
		height 45px
		border-width 1.5px

	.nav-icon
		font-size 1.5rem

		@media (max-width: 550px)
			font-size 1.3rem

.nav-label-mobile
	font-size 0.7rem
	color #666
	text-align center
	white-space nowrap
	transition color 0.2s ease
	max-width 70px
	overflow hidden
	text-overflow ellipsis

	@media (max-width: 550px)
		font-size 0.65rem
		max-width 60px

.main-content
	flex 1
	background white
	border-radius 20px
	padding 2rem
	// box-shadow 0 8px 25px rgba(255, 193, 7, 0.08)
	// border 1px solid rgba(255, 193, 7, 0.1)

	// Special case for document viewer - remove padding
	.document-viewer-section
		margin -2rem

		@media (max-width: 768px)
			margin -1rem

		@media (max-width: 550px)
			margin -0.75rem

		.document-viewer
			border-radius 20px

.section-header
	background linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)
	margin -2rem -2rem 2rem -2rem
	padding 1.5rem 2rem
	border-radius 20px 20px 0 0

	@media (max-width: 768px)
		margin -1rem -1rem 1.5rem -1rem
		padding 1.2rem 1rem

	@media (max-width: 550px)
		margin -0.75rem -0.75rem 1rem -0.75rem
		padding 1rem 0.75rem

.section-title
	font-size 1.8rem
	margin 0
	color #333
	font-weight 700
	display flex
	align-items center
	gap 0.5rem

	.section-icon
		// background white
		border-radius 50%
		width 45px
		height 45px
		display inline-flex
		align-items center
		justify-content center
		// box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)

	@media (max-width: 768px)
		margin-bottom 0 !important

	@media (max-width: 550px)
		font-size 1.5rem
		margin-bottom 0 !important
		.section-icon
			width 40px
			height 40px

// Home section styles
.home-welcome
	text-align center
	margin-bottom 3rem

	.welcome-title
		font-size 2rem
		color #333
		margin-bottom 0.5rem
		font-weight 600

		@media (max-width: 768px)
			font-size 1.5rem

		@media (max-width: 550px)
			font-size 1.25rem

	.welcome-subtitle
		color #666
		font-size 1.1rem

		@media (max-width: 768px)
			font-size 0.95rem

		@media (max-width: 550px)
			font-size 0.85rem

.services-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
	gap 1.5rem
	margin-bottom 2rem

	@media (max-width: 768px)
		grid-template-columns repeat(auto-fill, minmax(150px, 1fr))
		gap 1rem

	@media (max-width: 550px)
		grid-template-columns repeat(auto-fill, minmax(140px, 1fr))
		gap 0.75rem

.service-card
	background white
	border 2px solid rgba(255, 193, 7, 0.2)
	border-radius 20px
	padding 2rem 1.5rem
	text-align center
	cursor pointer
	transition all 0.3s ease
	box-shadow 0 4px 12px rgba(255, 193, 7, 0.08)

	@media (max-width: 768px)
		padding 1.5rem 1rem

	@media (max-width: 550px)
		padding 1.25rem 0.75rem

	&:hover
		transform translateY(-5px)
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.2)
		border-color #FFC107
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

	.service-icon
		font-size 3rem
		margin-bottom 1rem
		background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
		-webkit-background-clip text
		-webkit-text-fill-color transparent
		background-clip text

		@media (max-width: 768px)
			font-size 2.5rem
			margin-bottom 0.75rem

		@media (max-width: 550px)
			font-size 2rem
			margin-bottom 0.5rem

	.service-name
		font-size 1.2rem
		color #333
		margin-bottom 0.5rem
		font-weight 600

		@media (max-width: 768px)
			font-size 1.1rem
			margin-bottom 0

		@media (max-width: 550px)
			font-size 1rem

	.service-description
		font-size 0.85rem
		color #666
		line-height 1.4

		@media (max-width: 768px)
			display none

// Generic card grid
.cards-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(280px, 1fr))
	gap 1.5rem
	width 100%

	@media (max-width: 768px)
		grid-template-columns 1fr
		gap 1rem

.subsection-title
	font-size 1.2rem
	font-weight 600
	color #333
	margin 2rem 0 1rem
	padding-bottom 0.5rem
	border-bottom 2px solid #FFC107

.current-bookings-section
	margin-bottom 3rem

.bookings-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(280px, 1fr))
	gap 1rem
	margin-bottom 2rem

	@media (min-width: 1200px)
		grid-template-columns repeat(3, 1fr)

	@media (max-width: 768px)
		grid-template-columns 1fr

// Ultra compact booking card
.booking-card-compact
	background white
	border 1px solid #e5e7eb
	border-radius 12px
	overflow hidden
	transition all 0.2s ease
	display flex
	flex-direction column

	&:hover
		box-shadow 0 4px 12px rgba(0, 0, 0, 0.08)
		transform translateY(-2px)
		border-color #FFC107

	.card-header
		display flex
		justify-content space-between
		align-items center
		padding 0.75rem
		background #fafafa
		border-bottom 1px solid #f0f0f0

		.booking-icon-small
			width 32px
			height 32px
			background linear-gradient(135deg, #FFF9C4 0%, #FFE082 100%)
			border-radius 8px
			display flex
			align-items center
			justify-content center
			font-size 1.2rem

		.booking-badge
			padding 0.2rem 0.6rem
			border-radius 12px
			font-size 0.7rem
			font-weight 600
			text-transform uppercase

			&.today
				background #ff5722
				color white

			&.tomorrow
				background #ff9800
				color white

			&.upcoming
				background #ffc107
				color #795548

			&.future
				background #e3f2fd
				color #1976d2

			&.past
				background #f5f5f5
				color #9e9e9e

	.card-body
		padding 1rem
		flex 1

		h4
			margin 0 0 0.75rem 0
			font-size 1.1rem
			font-weight 600
			color #1a1a1a

		.booking-info
			display flex
			flex-direction column
			gap 0.5rem
			margin-bottom 0.75rem

			.info-row
				display flex
				align-items center
				gap 0.5rem
				color #6b7280
				font-size 0.85rem

				svg
					flex-shrink 0
					color #9ca3af

		.booking-ref-small
			font-size 0.7rem
			color #9ca3af
			font-family monospace

	.card-footer
		padding 0.75rem
		background #fafafa
		border-top 1px solid #f0f0f0
		display flex
		gap 0.5rem

		.compact-action
			flex 1
			padding 0.5rem
			background white
			border 1px solid #e5e7eb
			border-radius 6px
			font-size 0.8rem
			color #374151
			cursor pointer
			transition all 0.2s ease
			display flex
			align-items center
			justify-content center
			gap 0.3rem

			&:hover
				background #f9fafb
				border-color #3b82f6
				color #3b82f6

			&.cancel
				flex 0 0 auto
				width 32px
				padding 0

				&:hover
					border-color #ef4444
					color #ef4444
					background #fef2f2

			svg
				flex-shrink 0

// Keep old styles for backward compatibility
.bookings-list
	display flex
	flex-direction column
	gap 0.75rem
	margin-bottom 2rem

.booking-card-modern
	display flex
	align-items center
	justify-content space-between
	padding 1rem
	background white
	border 1px solid #e5e7eb
	border-radius 12px
	transition all 0.2s ease
	position relative
	overflow hidden

	&:hover
		border-color #FFC107
		box-shadow 0 2px 8px rgba(255, 193, 7, 0.15)
		transform translateX(4px)

	.booking-main
		display flex
		align-items center
		gap 1rem
		flex 1

	.booking-icon
		width 42px
		height 42px
		background linear-gradient(135deg, #FFF9C4 0%, #FFE082 100%)
		border-radius 10px
		display flex
		align-items center
		justify-content center
		font-size 1.5rem
		flex-shrink 0

	.booking-details
		flex 1
		min-width 0

		.booking-header
			display flex
			align-items center
			gap 1rem
			margin-bottom 0.5rem

			h4
				margin 0
				font-size 1rem
				font-weight 600
				color #1a1a1a
				white-space nowrap
				overflow hidden
				text-overflow ellipsis

		.booking-meta
			display flex
			align-items center
			gap 1rem
			margin-bottom 0.25rem

			.meta-item
				display flex
				align-items center
				gap 0.3rem
				color #6b7280
				font-size 0.85rem

				svg
					color #9ca3af
					flex-shrink 0

		.booking-ref
			font-size 0.75rem
			color #9ca3af
			font-family monospace

	.booking-countdown
		padding 0.25rem 0.75rem
		border-radius 20px
		font-size 0.75rem
		font-weight 600
		white-space nowrap

		&.today
			background #ff5722
			color white

		&.tomorrow
			background #ff9800
			color white

		&.upcoming
			background #ffc107
			color #795548

		&.future
			background #e3f2fd
			color #1976d2

		&.past
			background #f5f5f5
			color #9e9e9e

	.booking-actions
		display flex
		gap 0.5rem
		padding-left 1rem
		border-left 1px solid #f0f0f0

		.action-btn
			width 36px
			height 36px
			border-radius 8px
			background white
			border 1px solid #e5e7eb
			display flex
			align-items center
			justify-content center
			cursor pointer
			transition all 0.2s ease
			color #6b7280

			&:hover
				background #f9fafb
				border-color #3b82f6
				color #3b82f6

			&.cancel:hover
				border-color #ef4444
				color #ef4444
				background #fef2f2

			svg
				width 16px
				height 16px

// Mobile responsive adjustments
@media (max-width: 768px)
	.booking-card-modern
		flex-direction column
		align-items flex-start
		gap 0.75rem

		.booking-main
			width 100%

		.booking-actions
			width 100%
			justify-content flex-end
			padding-left 0
			padding-top 0.75rem
			border-left none
			border-top 1px solid #f0f0f0

// Old booking card styles (kept for backward compatibility)
.booking-card-mini
	display flex
	align-items center
	gap 1rem
	padding 1rem
	background white
	border 2px solid #FFE082
	border-radius 12px
	transition all 0.3s ease

	&:hover
		transform translateY(-2px)
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.2)

.booking-date-badge
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	border-radius 10px
	padding 0.75rem
	text-align center
	min-width 60px
	color white

	.month
		display block
		font-size 0.75rem
		font-weight 600
		opacity 0.9

	.day
		display block
		font-size 1.5rem
		font-weight bold
		line-height 1

.booking-info
	flex 1

	h4
		margin 0 0 0.25rem 0
		color #333
		font-size 1.1rem
		font-weight 600

	.booking-time
		margin 0 0 0.25rem 0
		color #666
		font-size 0.9rem

	.booking-purpose
		margin 0
		color #999
		font-size 0.85rem
		font-style italic

.booking-actions
	display flex
	gap 0.5rem

	.view-details-btn, .cancel-booking-btn
		padding 0.5rem 1rem
		border-radius 8px
		font-size 0.85rem
		font-weight 500
		cursor pointer
		transition all 0.2s ease

	.view-details-btn
		background white
		color #333
		border 2px solid #e0e0e0

		&:hover
			background #f9f9f9
			border-color #FFC107

	.cancel-booking-btn
		background white
		color #F44336
		border 2px solid #FFCDD2

		&:hover
			background #FFEBEE

.contact-card
	background #f9f9f9
	padding 2rem
	border-radius 10px
	text-align center

	h3
		margin-bottom 1rem
		color #333

	p
		color #666
		margin-bottom 1.5rem

	&.emergency
		background #FFF3E0
		border 2px solid #FF6F00

.action-btn
	padding 0.85rem 2rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	border none
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.3s ease
	box-shadow 0 4px 15px rgba(255, 193, 7, 0.25)

	&:hover
		background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
		transform translateY(-2px)
		box-shadow 0 6px 20px rgba(255, 193, 7, 0.35)

	&.emergency-btn
		background linear-gradient(135deg, #FF6F00 0%, #FF5722 100%)
		color white

		&:hover
			background linear-gradient(135deg, #FF5722 0%, #F4511E 100%)
			box-shadow 0 6px 20px rgba(255, 87, 34, 0.35)

// Documents Section
.documents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(250px, 1fr))
	gap 1.5rem

.document-card
	background #f9f9f9
	padding 2rem
	border-radius 10px
	text-align center
	transition all 0.3s ease

	&:hover
		transform translateY(-5px)
		box-shadow 0 10px 20px rgba(0,0,0,0.1)

	.doc-icon
		font-size 3rem
		margin-bottom 1rem

	h3
		color #333
		margin-bottom 0.5rem

	p
		color #666
		font-size 0.9rem
		margin-bottom 1rem

.view-btn
	padding 0.6rem 1.75rem
	background white
	color #333
	border 2px solid #FFC107
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.3s ease
	box-shadow 0 2px 8px rgba(255, 193, 7, 0.15)

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateY(-2px)
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.25)
		border-color #FFB300

// Booking Section
.booking-facilities
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap 2rem

.facility-card
	border-radius 10px
	overflow hidden
	box-shadow 0 5px 15px rgba(0,0,0,0.1)
	transition all 0.3s ease

	&:hover
		transform translateY(-5px)
		box-shadow 0 10px 25px rgba(0,0,0,0.15)

	.facility-image
		width 100%
		height 200px
		object-fit cover

	.facility-image-placeholder
		width 100%
		height 200px
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		display flex
		align-items center
		justify-content center

		.placeholder-icon
			font-size 4rem

	h3
		padding 1rem 1rem 0.5rem
		color #333

	.facility-info
		padding 0 1rem
		color #666
		font-size 0.9rem

.book-btn
	width calc(100% - 2rem)
	margin 1rem
	padding 0.85rem
	background white
	color #333
	border 2px solid #FFC107
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.3s ease
	box-shadow 0 3px 12px rgba(255, 193, 7, 0.15)

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateY(-2px)
		box-shadow 0 5px 18px rgba(255, 193, 7, 0.25)
		border-color #FFB300

// Maintenance Form
.maintenance-form-container
	max-width 600px
	margin 0 auto

.back-btn
	margin-bottom 1rem
	padding 0.6rem 1.25rem
	background white
	color #666
	border 2px solid rgba(255, 193, 7, 0.3)
	border-radius 50px
	cursor pointer
	font-size 0.9rem
	transition all 0.2s ease
	font-weight 500
	box-shadow 0 2px 8px rgba(255, 193, 7, 0.1)

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateX(-3px)
		border-color #FFC107
		color #333
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.2)

.selected-category
	display flex
	align-items center
	gap 1rem
	margin-bottom 1.5rem
	padding 1rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-radius 10px

	.category-icon
		font-size 2rem

	h3
		margin 0
		color #333

.maintenance-form
	max-width 100%
	padding 1.5rem
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	border-radius 20px
	border 1px solid rgba(255, 193, 7, 0.1)
	box-shadow 0 4px 15px rgba(255, 193, 7, 0.08)

	.form-group
		margin-bottom 1.5rem

		label
			display block
			font-weight 600
			color #333
			margin-bottom 0.5rem

		input, select, textarea
			width 100%
			max-width 100%
			padding 0.75rem
			border 2px solid rgba(255, 193, 7, 0.2)
			border-radius 12px
			font-size 1rem
			transition all 0.3s ease
			box-sizing border-box
			background rgba(255, 255, 255, 0.8)

			&:focus
				outline none
				border-color #FFC107
				box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)
				background white

.submit-btn-primary
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

	&:hover
		background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
		transform translateY(-2px)
		box-shadow 0 6px 20px rgba(255, 193, 7, 0.35)

.success-message
	text-align center
	padding 2rem
	background linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)
	border-radius 15px
	margin-bottom 2rem

	.success-icon
		font-size 3rem
		margin-bottom 1rem

	h3
		color #2E7D32
		margin-bottom 0.5rem
		font-size 1.3rem

	p
		color #558B2F
		line-height 1.5

// Events Section
.events-list
	display flex
	flex-direction column
	gap 1.5rem

.event-card
	display flex
	gap 2rem
	padding 1.5rem
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	border-radius 15px
	transition all 0.3s ease
	border 1px solid rgba(255, 193, 7, 0.1)
	position relative

	@media (max-width: 768px)
		gap 1.25rem
		padding 1.25rem
		padding-right 3rem // Space for arrow

	@media (max-width: 550px)
		gap 1rem
		padding 1rem
		padding-right 2.5rem // Space for arrow

	&.clickable
		cursor pointer

		&:hover
			transform translateY(-2px)
			box-shadow 0 8px 20px rgba(255, 193, 7, 0.15)
			border-color #FFC107
			background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

	.event-arrow
		position absolute
		right 1.5rem
		top 50%
		transform translateY(-50%)
		color #FFC107
		font-size 1.5rem
		font-weight bold

		@media (max-width: 768px)
			right 1rem
			font-size 1.25rem

		@media (max-width: 550px)
			right 0.75rem
			font-size 1.1rem

	&:hover
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.15)
		transform translateY(-2px)
		border-color rgba(255, 193, 7, 0.25)

	.event-date
		text-align center
		background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
		border-radius 15px
		padding 1rem
		min-width 80px
		box-shadow 0 4px 12px rgba(255, 193, 7, 0.2)
		flex-shrink 0

		@media (max-width: 768px)
			padding 0.85rem
			min-width 70px

		@media (max-width: 550px)
			padding 0.75rem 0.65rem
			min-width 60px
			border-radius 12px

		.date-month
			font-size 0.9rem
			color #333
			font-weight 600

			@media (max-width: 768px)
				font-size 0.8rem

			@media (max-width: 550px)
				font-size 0.7rem

		.date-day
			font-size 2rem
			font-weight bold
			color #333

			@media (max-width: 768px)
				font-size 1.75rem

			@media (max-width: 550px)
				font-size 1.5rem

	.event-content
		flex 1
		min-width 0 // Prevent text overflow
		padding-right 1rem // Space from arrow

		h3
			color #333
			margin-bottom 0.5rem
			overflow hidden
			text-overflow ellipsis

			@media (max-width: 768px)
				font-size 1.05rem

			@media (max-width: 550px)
				font-size 0.95rem

		p
			color #666
			line-height 1.6
			overflow hidden
			text-overflow ellipsis

			@media (max-width: 768px)
				font-size 0.9rem
				line-height 1.5

			@media (max-width: 550px)
				font-size 0.85rem
				line-height 1.4

// Bills Section
.bills-list
	display flex
	flex-direction column
	gap 1.5rem

// Profile Section
.profile-container
	display grid
	grid-template-columns repeat(auto-fit, minmax(350px, 1fr))
	gap 1.5rem

	@media (max-width: 768px)
		grid-template-columns 1fr

.profile-card
	background white
	padding 1.5rem
	border-radius 15px
	border 2px solid rgba(255, 193, 7, 0.15)

	h3
		color #333
		margin-bottom 1.5rem
		font-size 1.2rem

	.form-group
		margin-bottom 1.25rem

		label
			display block
			color #666
			font-size 0.9rem
			margin-bottom 0.5rem
			font-weight 500

		input[type="text"],
		input[type="email"],
		input[type="tel"]
			width 100%
			padding 0.75rem
			border 2px solid #e0e0e0
			border-radius 8px
			font-size 1rem
			transition all 0.3s ease

			&:focus
				outline none
				border-color #FFC107
				box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

			&:disabled
				background #f5f5f5
				cursor not-allowed

	.save-btn
		width 100%
		padding 0.75rem
		background #FFC107
		color #333
		border none
		border-radius 10px
		font-size 1rem
		font-weight 600
		cursor pointer
		transition all 0.3s ease

		&:hover
			background #FFB300
			transform translateY(-2px)
			box-shadow 0 5px 15px rgba(255, 193, 7, 0.3)

	.preference-item
		margin-bottom 1rem

		label
			display flex
			align-items center
			cursor pointer

			input[type="checkbox"]
				margin-right 0.75rem
				width 20px
				height 20px
				cursor pointer

.bill-card
	padding 1.5rem
	background linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
	border-radius 15px
	transition all 0.3s ease
	border 1px solid rgba(255, 193, 7, 0.1)

	&:hover
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.15)
		transform translateY(-2px)
		border-color rgba(255, 193, 7, 0.25)

	&.paid
		background linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)
		border-color rgba(76, 175, 80, 0.2)

	.bill-header
		display flex
		justify-content space-between
		align-items center
		margin-bottom 1rem

		h3
			color #333

		.bill-amount
			font-size 1.5rem
			font-weight bold
			color #333

	p
		color #666
		margin-bottom 1rem

	.bill-actions
		display flex
		gap 1rem

	.bill-status
		color #4CAF50
		font-weight 600

.details-btn
	padding 0.6rem 1.5rem
	background white
	color #666
	border 2px solid #e0e0e0
	border-radius 50px
	cursor pointer
	font-weight 500
	transition all 0.3s ease
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.05)

	&.full-width
		width 100%
		margin-top 1rem

	&:hover
		background #f5f5f5
		border-color #999
		color #333
		transform translateY(-1px)
		box-shadow 0 3px 10px rgba(0, 0, 0, 0.1)

.pay-btn-primary
	padding 0.6rem 1.75rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	border none
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.3s ease
	box-shadow 0 4px 15px rgba(255, 193, 7, 0.25)

	&:hover
		background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
		transform translateY(-2px)
		box-shadow 0 6px 20px rgba(255, 193, 7, 0.35)

@media (max-width: 768px)
	.dashboard-content
		flex-direction column

	.sidebar
		width 100%
		position static
	.header-content
		flex-direction row
		justify-content space-between
		padding 1rem

	.main-content
		padding 1rem

@media (max-width: 550px)
	.header-content
		padding 0.75rem

	.main-content
		padding 0.75rem

	.section-title
		font-size 1.5rem
		margin-bottom 1rem

	.maintenance-form-container
		padding 0

	.maintenance-form
		padding 1rem

// Modal styles
.modal-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	z-index 9999
	display flex
	align-items center
	justify-content center
	padding 1rem

.modal-content
	width 90%
	max-width 900px
	max-height 90vh
	overflow hidden
	display flex
	flex-direction column
	animation slideIn 0.3s ease-out

	@media (max-width: 768px)
		width 95%
		max-height 95vh

@keyframes slideIn
	from
		opacity 0
		transform translateY(-20px)
	to
		opacity 1
		transform translateY(0)

// Modern Booking Styles
.booking-section-modern
	padding 0

.section-header-modern
	margin-bottom 1.5rem
	padding 0 1.5rem

	.header-content
		border-bottom 1px solid #f0f0f0
		padding-bottom 1rem

	.section-title-modern
		font-size 1.5rem
		font-weight 600
		color #1a1a1a
		display flex
		align-items center
		gap 0.5rem
		margin 0

		.section-icon-svg
			width 24px
			height 24px
			color #6b46c1

// Two-column layout
.booking-two-column-layout
	display grid
	grid-template-columns 3fr 2fr
	gap 2rem
	padding 0 1.5rem

	@media (max-width: 968px)
		grid-template-columns 1fr
		gap 2rem

.facilities-column, .bookings-column
	min-height 400px

	.column-title
		font-size 1.1rem
		font-weight 600
		color #1a1a1a
		margin-bottom 1rem
		padding-bottom 0.75rem
		border-bottom 2px solid #f0f0f0

		.booking-count
			color #6b7280
			font-weight 400
			margin-left 0.25rem
			font-size 0.9rem

// Facility cards with images
.facilities-list
	display flex
	flex-direction column
	gap 1rem

.facility-card-with-image
	display flex
	gap 1.25rem
	padding 1.25rem
	background white
	border 1px solid #e5e7eb
	border-radius 16px
	cursor pointer
	transition all 0.3s ease
	overflow hidden

	&:hover
		background #fafafa
		border-color #d1d5db
		transform translateY(-2px)
		box-shadow 0 4px 12px rgba(0, 0, 0, 0.08)

	.facility-image
		width 120px
		height 120px
		flex-shrink 0
		border-radius 12px
		display flex
		align-items center
		justify-content center
		position relative
		overflow hidden

		&.party
			background linear-gradient(135deg, #ec4899 0%, #f472b6 100%)

		&.guest
			background linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)

		&.gym
			background linear-gradient(135deg, #10b981 0%, #34d399 100%)

		.facility-badge
			font-size 3rem
			filter drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))

	.facility-content
		flex 1
		display flex
		flex-direction column
		justify-content center

		h4
			font-size 1.25rem
			font-weight 700
			color #1a1a1a
			margin 0 0 0.5rem 0

		.facility-desc
			font-size 0.95rem
			color #6b7280
			margin 0 0 0.75rem 0
			line-height 1.4

		.facility-meta
			display flex
			gap 1rem
			margin-bottom 1rem

			span
				font-size 0.85rem
				color #4b5563

		.book-btn-primary
			padding 0.6rem 1.5rem
			background linear-gradient(135deg, #1a1a1a 0%, #333 100%)
			color white
			border none
			border-radius 10px
			font-size 0.9rem
			font-weight 600
			cursor pointer
			transition all 0.2s ease
			width fit-content

			&:hover
				background linear-gradient(135deg, #333 0%, #555 100%)
				transform translateX(2px)

		.book-btn-yellow
			padding 0.65rem 1.6rem
			background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
			color #333
			border none
			border-radius 25px
			font-size 0.95rem
			font-weight 600
			cursor pointer
			transition all 0.25s ease
			width fit-content
			box-shadow 0 3px 10px rgba(255, 193, 7, 0.25)

			&:hover
				background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
				transform translateY(-2px) translateX(2px)
				box-shadow 0 5px 15px rgba(255, 193, 7, 0.35)

.bookings-header
	display flex
	justify-content space-between
	align-items center
	margin-bottom 1rem
	flex-wrap wrap
	gap 0.5rem

.booking-filters
	display flex
	gap 0.5rem
	padding 0.25rem
	background #f8f9fa
	border-radius 12px
	width fit-content

.filter-btn-modern
	padding 0.5rem 1.25rem
	background transparent
	border none
	border-radius 8px
	font-size 0.9rem
	font-weight 500
	color #666
	cursor pointer
	transition all 0.2s ease

	&:hover
		background white
		color #333
		box-shadow 0 1px 3px rgba(0, 0, 0, 0.1)

	&.active
		background white
		color #1a1a1a
		box-shadow 0 1px 3px rgba(0, 0, 0, 0.1)

.empty-state-modern
	text-align center
	padding 3rem 2rem
	background linear-gradient(135deg, #FFFEF7 0%, #FFF9F0 100%)
	border-radius 12px
	margin-bottom 2rem
	border 1px solid rgba(255, 193, 7, 0.1)

	.empty-illustration
		margin-bottom 1.5rem

		svg
			width 120px
			height 120px
			opacity 0.9

	h3
		font-size 1.25rem
		font-weight 600
		color #333
		margin-bottom 0.75rem

	p
		color #666
		font-size 0.95rem
		margin-bottom 0

.bookings-grid-modern
	display flex
	flex-direction column
	gap 1rem

.booking-card-modern-v2
	background white
	border-radius 10px
	overflow hidden
	border 1px solid #e5e7eb
	transition all 0.2s ease

	&:hover
		border-color #d1d5db
		box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)

.card-status-bar
	height 3px
	background #e5e7eb

	&.today
		background #10b981

	&.tomorrow
		background #3b82f6

	&.upcoming
		background #6b46c1

	&.past
		background #9ca3af

.card-content
	padding 0.75rem 1rem

.card-header-v2
	display flex
	justify-content space-between
	align-items center
	margin-bottom 0.5rem

	.facility-info-v2
		display flex
		align-items center
		gap 0.5rem

		.facility-icon-v2
			font-size 1.25rem

		.facility-name-v2
			font-size 0.95rem
			font-weight 600
			color #1a1a1a

	.countdown-badge
		padding 0.15rem 0.5rem
		background #f3f4f6
		border-radius 12px
		font-size 0.75rem
		font-weight 500

		&.today
			background #d1fae5
			color #065f46

		&.tomorrow
			background #dbeafe
			color #1e40af

		&.upcoming
			background #e9d5ff
			color #581c87

		&.past
			background #f3f4f6
			color #6b7280

.booking-details-v2
	display flex
	flex-direction column
	gap 0.35rem

	.detail-row-v2
		display flex
		align-items center
		gap 0.35rem
		font-size 0.8rem
		color #6b7280

		svg
			display none

.card-footer-v2
	display flex
	justify-content space-between
	align-items center
	padding-top 1rem
	border-top 1px solid #f3f4f6

	.reference-code
		font-size 0.85rem
		color #9ca3af
		font-family monospace

	.action-buttons
		display flex
		gap 0.5rem

.action-btn-v2
	padding 0.5rem 0.75rem
	background white
	border 1px solid #e5e7eb
	border-radius 8px
	font-size 0.85rem
	font-weight 500
	color #4b5563
	cursor pointer
	transition all 0.2s ease
	display flex
	align-items center
	gap 0.4rem

	svg
		width 14px
		height 14px

	&:hover
		background #f9fafb
		border-color #d1d5db
		color #1f2937

	&.rebook
		&:hover
			background #f3f4f6
			color #6b46c1
			border-color #6b46c1

	&.cancel
		&:hover
			background #fee2e2
			color #dc2626
			border-color #dc2626

.available-facilities-modern
	padding 0 1.5rem
	margin-top 2rem

	.section-subtitle-modern
		font-size 1.25rem
		font-weight 600
		color #1a1a1a
		margin-bottom 1.5rem

	.facilities-grid-modern
		display grid
		grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
		gap 1.5rem

.facility-card-modern
	position relative
	background white
	border-radius 16px
	overflow hidden
	cursor pointer
	transition all 0.3s ease
	box-shadow 0 2px 12px rgba(0, 0, 0, 0.06)

	&:hover
		transform translateY(-4px)
		box-shadow 0 8px 24px rgba(0, 0, 0, 0.12)

		.facility-gradient
			opacity 0.9

.facility-gradient
	position absolute
	top 0
	left 0
	right 0
	height 120px
	opacity 0.8
	transition opacity 0.3s ease

	&.party
		background linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)

	&.guest
		background linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)

	&.gym
		background linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)

.facility-content
	position relative
	padding 1.5rem

.facility-header
	display flex
	justify-content space-between
	align-items flex-start
	margin-bottom 4rem

	.facility-icon-large
		font-size 2.5rem
		filter drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))

	.availability-badge
		padding 0.35rem 0.75rem
		background white
		border-radius 20px
		font-size 0.75rem
		font-weight 500
		display flex
		align-items center
		gap 0.35rem

		svg
			width 10px
			height 10px

		&.success
			color #059669

		&.limited
			color #d97706

.facility-title
	font-size 1.25rem
	font-weight 600
	color #1a1a1a
	margin-bottom 0.5rem

.facility-description
	color #6b7280
	font-size 0.9rem
	margin-bottom 1rem

.facility-features
	display flex
	gap 1rem
	margin-bottom 1.25rem

	.feature
		display flex
		align-items center
		gap 0.35rem
		font-size 0.85rem
		color #4b5563

		svg
			width 14px
			height 14px
			opacity 0.6

.facility-footer
	display flex
	justify-content space-between
	align-items center

	.price
		font-size 0.9rem
		font-weight 600
		color #1a1a1a

		&.free
			color #10b981

	.book-btn-modern
		padding 0.5rem 1rem
		background #1a1a1a
		color white
		border none
		border-radius 8px
		font-size 0.85rem
		font-weight 500
		cursor pointer
		transition all 0.2s ease
		display flex
		align-items center
		gap 0.5rem

		svg
			width 14px
			height 14px
			transition transform 0.2s ease

		&:hover
			background #333
			transform translateY(-1px)

			svg
				transform translateX(2px)

@media (max-width: 768px)
	.bookings-grid-modern
		grid-template-columns 1fr

	.facilities-grid-modern
		grid-template-columns 1fr

	.booking-filters
		width 100%
		overflow-x auto

		&::-webkit-scrollbar
			display none
</style>
