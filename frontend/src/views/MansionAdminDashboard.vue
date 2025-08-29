<template>
	<div class="mansion-admin-dashboard">
		<header class="header">
			<div class="header-content">
				<div class="header-left" style="cursor: pointer;" @click="navigateToSection('overview')">
					<KagiLogo :size="40" />
					<h1>{{ buildingName }}</h1>
				</div>
				<div class="header-right">
					<span class="admin-badge">{{ $t('mansion.role') || 'Mansion Admin' }}</span>
					<button class="user-menu-btn" @click="showMobileMenu = !showMobileMenu">
						<span class="user-email">{{ authStore.user?.email }}</span>
						<span class="menu-arrow">▼</span>
					</button>
				</div>
			</div>
		</header>

		<!-- Mobile Settings Menu -->
		<transition name="slide">
			<div v-if="showMobileMenu" class="mobile-settings-menu">
				<div class="mobile-menu-header">
					<h3>{{ $t('common.settings') }}</h3>
					<button class="close-menu-btn" @click="showMobileMenu = false">✕</button>
				</div>
				<div class="mobile-menu-content">
					<div class="mobile-user-info">
						<div class="user-email">{{ authStore.user?.email }}</div>
						<div class="user-role">{{ authStore.user?.role }}</div>
					</div>
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
				<!-- Overview Section -->
				<section v-if="activeSection === 'overview'" class="section">
					<div class="section-header">
						<h2 class="section-title">📊 {{ $t('mansion.overview.title') || 'Building Overview' }}</h2>
					</div>
					
					<!-- Building Stats - Improved design -->
					<div class="overview-container">
						<div class="stats-row">
							<div class="stat-box primary">
								<div class="stat-header">
									<span class="stat-icon">🏠</span>
									<h3>{{ $t('mansion.stats.units') || 'Total Units' }}</h3>
								</div>
								<div class="stat-body">
									<div class="stat-main">
										<span class="stat-number">120</span>
										<span class="stat-label">total</span>
									</div>
									<div class="stat-detail">
										<div class="detail-item">
											<span class="detail-value">114</span>
											<span class="detail-label">Occupied</span>
										</div>
										<div class="detail-item">
											<span class="detail-value">6</span>
											<span class="detail-label">Available</span>
										</div>
									</div>
									<div class="stat-progress">
										<div class="progress-bar" style="width: 95%" />
									</div>
								</div>
							</div>
							
							<div class="stat-box secondary">
								<div class="stat-header">
									<span class="stat-icon">👥</span>
									<h3>{{ $t('mansion.stats.residents') || 'Residents' }}</h3>
								</div>
								<div class="stat-body">
									<div class="stat-main">
										<span class="stat-number">342</span>
										<span class="stat-label">residents</span>
									</div>
									<div class="stat-trend positive">
										<span class="trend-icon">↑</span>
										<span>+5 this month</span>
									</div>
								</div>
							</div>
						</div>
						
						<div class="stats-row">
							<div class="stat-box warning">
								<div class="stat-header">
									<span class="stat-icon">🔧</span>
									<h3>{{ $t('mansion.stats.requests') || 'Maintenance' }}</h3>
								</div>
								<div class="stat-body">
									<div class="stat-main">
										<span class="stat-number">8</span>
										<span class="stat-label">open</span>
									</div>
									<div class="stat-badges">
										<span class="badge urgent">2 urgent</span>
										<span class="badge pending">4 pending</span>
										<span class="badge progress">2 in progress</span>
									</div>
								</div>
							</div>
							
							<div class="stat-box info">
								<div class="stat-header">
									<span class="stat-icon">📅</span>
									<h3>{{ $t('mansion.stats.bookings') || 'Today\'s Bookings' }}</h3>
								</div>
								<div class="stat-body">
									<div class="stat-main">
										<span class="stat-number">3</span>
										<span class="stat-label">bookings</span>
									</div>
									<div class="booking-preview">
										<div class="booking-item">Party Room - 14:00</div>
										<div class="booking-item">Gym - 18:00</div>
										<div class="booking-item">Meeting Room - 19:00</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Quick Actions -->
					<div class="quick-actions">
						<h3>⚡ {{ $t('mansion.quickActions') || 'Quick Actions' }}</h3>
						<div class="actions-grid">
							<button class="action-card" @click="navigateToSection('announcements')">
								<span class="action-icon">📢</span>
								<span>{{ $t('mansion.actions.announcement') || 'Send Announcement' }}</span>
							</button>
							<button class="action-card" @click="navigateToSection('documents')">
								<span class="action-icon">📄</span>
								<span>{{ $t('mansion.actions.updateDocs') || 'Update Documents' }}</span>
							</button>
							<button class="action-card" @click="navigateToSection('maintenance')">
								<span class="action-icon">🔧</span>
								<span>{{ $t('mansion.actions.maintenance') || 'View Maintenance' }}</span>
							</button>
							<button class="action-card" @click="navigateToSection('reports')">
								<span class="action-icon">📊</span>
								<span>{{ $t('mansion.actions.reports') || 'Generate Reports' }}</span>
							</button>
						</div>
					</div>
				</section>

				<!-- Resident Edit Modal -->
				<div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
					<div class="modal-content">
						<div class="modal-header">
							<h3>Edit Resident Information</h3>
							<button class="modal-close" @click="showEditModal = false">✕</button>
						</div>
						<div class="modal-body">
							<form @submit.prevent="saveResident">
								<div class="form-group">
									<label>Name</label>
									<input v-model="editingResident.name" type="text" required>
								</div>
								<div class="form-group">
									<label>Unit</label>
									<input v-model="editingResident.unit" type="text" required>
								</div>
								<div class="form-group">
									<label>Email</label>
									<input v-model="editingResident.email" type="email" required>
								</div>
								<div class="form-group">
									<label>Phone</label>
									<input v-model="editingResident.phone" type="tel" required>
								</div>
								<div class="form-actions">
									<button type="button" class="btn-secondary" @click="showEditModal = false">Cancel</button>
									<button type="submit" class="btn-primary">Save Changes</button>
								</div>
							</form>
						</div>
					</div>
				</div>

				<!-- Contact Resident Modal -->
				<div v-if="showContactModal" class="modal-overlay" @click.self="showContactModal = false">
					<div class="modal-content">
						<div class="modal-header">
							<h3>Contact {{ contactingResident?.name }}</h3>
							<button class="modal-close" @click="showContactModal = false">✕</button>
						</div>
						<div class="modal-body">
							<form @submit.prevent="sendMessage">
								<div class="form-group">
									<label>Subject</label>
									<input v-model="message.subject" type="text" required>
								</div>
								<div class="form-group">
									<label>Message</label>
									<textarea v-model="message.content" rows="6" required />
								</div>
								<div class="form-group">
									<label>
										<input v-model="message.sendEmail" type="checkbox">
										Also send as email
									</label>
								</div>
								<div class="form-actions">
									<button type="button" class="btn-secondary" @click="showContactModal = false">Cancel</button>
									<button type="submit" class="btn-primary">Send Message</button>
								</div>
							</form>
						</div>
					</div>
				</div>

				<!-- Resident History Modal -->
				<div v-if="showHistoryModal" class="modal-overlay" @click.self="showHistoryModal = false">
					<div class="modal-content large">
						<div class="modal-header">
							<h3>{{ viewingResident?.name }} - History</h3>
							<button class="modal-close" @click="showHistoryModal = false">✕</button>
						</div>
						<div class="modal-body">
							<div class="history-tabs">
								<button :class="['tab', { active: historyTab === 'payments' }]" @click="historyTab = 'payments'">Payments</button>
								<button :class="['tab', { active: historyTab === 'maintenance' }]" @click="historyTab = 'maintenance'">Maintenance</button>
								<button :class="['tab', { active: historyTab === 'bookings' }]" @click="historyTab = 'bookings'">Bookings</button>
								<button :class="['tab', { active: historyTab === 'violations' }]" @click="historyTab = 'violations'">Violations</button>
							</div>
							<div class="history-content">
								<div v-if="historyTab === 'payments'" class="history-list">
									<div v-for="item in paymentHistory" :key="item.id" class="history-item">
										<span class="date">{{ item.date }}</span>
										<span class="description">{{ item.description }}</span>
										<span class="amount">¥{{ item.amount }}</span>
										<span :class="['status', item.status]">{{ item.status }}</span>
									</div>
								</div>
								<div v-else-if="historyTab === 'maintenance'" class="history-list">
									<div v-for="item in maintenanceHistory" :key="item.id" class="history-item">
										<span class="date">{{ item.date }}</span>
										<span class="description">{{ item.issue }}</span>
										<span :class="['status', item.status]">{{ item.status }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Residents Management -->
				<section v-if="activeSection === 'residents'" class="section">
					<div class="section-header">
						<h2 class="section-title">👥 {{ $t('mansion.residents.title') || 'Residents Management' }}</h2>
						<div class="header-actions">
							<input v-model="searchQuery" type="search" :placeholder="$t('mansion.residents.search') || 'Search residents...'" class="search-input">
							<button class="add-btn">+ {{ $t('mansion.residents.add') || 'Add Resident' }}</button>
						</div>
					</div>
					
					<div class="residents-grid">
						<div v-for="resident in filteredResidents" :key="resident.id" class="resident-card">
							<div class="resident-header">
								<div class="resident-info">
									<h4>{{ resident.name }}</h4>
									<p>Unit {{ resident.unit }}</p>
								</div>
								<span class="resident-status" :class="resident.status">{{ resident.status }}</span>
							</div>
							<div class="resident-details">
								<p><span>📧</span> {{ resident.email }}</p>
								<p><span>📱</span> {{ resident.phone }}</p>
								<p><span>📅</span> Move-in: {{ resident.moveIn }}</p>
							</div>
							<div class="resident-actions">
								<button class="action-btn" @click="editResident(resident)">{{ $t('common.edit') || 'Edit' }}</button>
								<button class="action-btn" @click="contactResident(resident)">{{ $t('mansion.residents.contact') || 'Contact' }}</button>
								<button class="action-btn" @click="viewHistory(resident)">{{ $t('mansion.residents.history') || 'History' }}</button>
							</div>
						</div>
					</div>
				</section>

				<!-- Maintenance Management - Improved Design -->
				<section v-if="activeSection === 'maintenance'" class="section">
					<div class="section-header">
						<h2 class="section-title">🔧 {{ $t('mansion.maintenance.title') || 'Maintenance Requests' }}</h2>
						<div class="header-controls">
							<div class="filter-tabs">
								<button :class="['filter-tab', { active: maintenanceFilter === 'all' }]" @click="maintenanceFilter = 'all'">
									All <span class="count">12</span>
								</button>
								<button :class="['filter-tab', { active: maintenanceFilter === 'urgent' }]" @click="maintenanceFilter = 'urgent'">
									Urgent <span class="count urgent">2</span>
								</button>
								<button :class="['filter-tab', { active: maintenanceFilter === 'pending' }]" @click="maintenanceFilter = 'pending'">
									Pending <span class="count">6</span>
								</button>
								<button :class="['filter-tab', { active: maintenanceFilter === 'in_progress' }]" @click="maintenanceFilter = 'in_progress'">
									In Progress <span class="count">3</span>
								</button>
								<button :class="['filter-tab', { active: maintenanceFilter === 'completed' }]" @click="maintenanceFilter = 'completed'">
									Completed <span class="count">1</span>
								</button>
							</div>
						</div>
					</div>
					
					<div class="maintenance-grid">
						<div v-for="request in filteredMaintenance" :key="request.id" class="maintenance-item">
							<div class="item-header">
								<div class="item-priority" :class="request.priority">
									<span class="priority-icon">{{ request.priority === 'urgent' ? '🚨' : request.priority === 'high' ? '⚠️' : '📝' }}</span>
								</div>
								<div class="item-info">
									<h4>{{ request.title }}</h4>
									<div class="item-meta">
										<span class="meta-item">Unit {{ request.unit }}</span>
										<span class="meta-item">{{ request.resident }}</span>
										<span class="meta-item">{{ request.date }}</span>
									</div>
								</div>
								<div class="item-status" :class="request.status">
									{{ request.status.replace('_', ' ') }}
								</div>
							</div>
							<div class="item-body">
								<p class="item-description">{{ request.description }}</p>
								<div class="item-tags">
									<span class="tag">{{ request.category }}</span>
									<span v-if="request.assignee" class="tag assigned">Assigned to: {{ request.assignee }}</span>
								</div>
							</div>
							<div class="item-actions">
								<button class="btn-action primary">{{ $t('mansion.maintenance.assign') || 'Assign' }}</button>
								<button class="btn-action">{{ $t('mansion.maintenance.update') || 'Update' }}</button>
								<button class="btn-action">{{ $t('mansion.maintenance.contact') || 'Contact' }}</button>
							</div>
						</div>
					</div>
				</section>

				<!-- Facility Bookings -->
				<section v-if="activeSection === 'bookings'" class="section">
					<div class="section-header">
						<h2 class="section-title">📅 {{ $t('mansion.bookings.title') || 'Facility Bookings' }}</h2>
						<button class="add-btn">+ {{ $t('mansion.bookings.block') || 'Block Time Slot' }}</button>
					</div>
					
					<div class="booking-calendar">
						<div class="calendar-controls">
							<button @click="changeWeek(-1)">‹</button>
							<span class="week-display">{{ currentWeek }}</span>
							<button @click="changeWeek(1)">›</button>
						</div>
						
						<div class="bookings-table">
							<div class="table-header">
								<div class="facility-col">{{ $t('mansion.bookings.facility') || 'Facility' }}</div>
								<div v-for="day in weekDays" :key="day" class="day-col">{{ day }}</div>
							</div>
							<div v-for="facility in facilities" :key="facility.id" class="facility-row">
								<div class="facility-name">{{ facility.name }}</div>
								<div v-for="day in weekDays" :key="day" class="booking-cell">
									<div v-if="getBooking(facility.id, day)" class="booking-block">
										<span class="booking-time">{{ getBooking(facility.id, day).time }}</span>
										<span class="booking-user">{{ getBooking(facility.id, day).user }}</span>
									</div>
									<span v-else class="available">{{ $t('mansion.bookings.available') || 'Available' }}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Upcoming Bookings List - Improved Design -->
					<div class="upcoming-bookings">
						<h3>{{ $t('mansion.bookings.upcoming') || 'Upcoming Bookings' }}</h3>
						<div class="bookings-timeline">
							<div v-for="booking in upcomingBookings" :key="booking.id" class="timeline-item">
								<div class="timeline-date">
									<div class="date-box">
										<span class="date-month">{{ booking.month }}</span>
										<span class="date-day">{{ booking.day }}</span>
									</div>
								</div>
								<div class="timeline-content">
									<div class="booking-card">
										<div class="booking-header">
											<h4>{{ booking.facility }}</h4>
											<span class="booking-time">{{ booking.time }}</span>
										</div>
										<div class="booking-info">
											<div class="info-row">
												<span class="label">Resident:</span>
												<span class="value">{{ booking.user }}</span>
											</div>
											<div class="info-row">
												<span class="label">Purpose:</span>
												<span class="value">{{ booking.purpose }}</span>
											</div>
										</div>
										<div class="booking-footer">
											<button class="btn-sm">{{ $t('mansion.bookings.modify') || 'Modify' }}</button>
											<button class="btn-sm danger">{{ $t('common.cancel') || 'Cancel' }}</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- Documents Management - Improved Design -->
				<section v-if="activeSection === 'documents'" class="section">
					<div class="section-header">
						<h2 class="section-title">📄 {{ $t('mansion.documents.title') || 'Documents Management' }}</h2>
						<div class="header-actions">
							<input v-model="docSearchQuery" type="search" placeholder="Search documents..." class="search-input">
							<button class="add-btn" @click="createNewDocument">
								<span class="btn-icon">+</span>
								<span>Create Document</span>
							</button>
						</div>
					</div>
					
					<!-- Document Editor Panel -->
					<transition name="slide-up">
						<div v-if="editingDocument" class="document-editor-panel">
							<div class="editor-container">
								<div class="editor-header">
									<div class="editor-title-section">
										<input v-model="editingDocument.title" class="doc-title-input" placeholder="Document Title">
										<select v-model="editingDocument.category" class="doc-category-select">
											<option value="rules">Building Rules</option>
											<option value="guides">Guides</option>
											<option value="forms">Forms</option>
											<option value="notices">Notices</option>
										</select>
									</div>
									<div class="editor-view-controls">
										<div class="view-toggle">
											<button :class="['view-btn', { active: editorMode === 'edit' }]" @click="editorMode = 'edit'">
												<span class="view-icon">✏️</span>
												<span class="view-label">Edit</span>
											</button>
											<button :class="['view-btn', { active: editorMode === 'split' }]" @click="editorMode = 'split'">
												<span class="view-icon">📑</span>
												<span class="view-label">Split</span>
											</button>
											<button :class="['view-btn', { active: editorMode === 'preview' }]" @click="editorMode = 'preview'">
												<span class="view-icon">👁️</span>
												<span class="view-label">Preview</span>
											</button>
										</div>
										<div class="editor-actions">
											<button class="btn-save" @click="saveDocument">
												<span class="btn-icon">💾</span>
												Save
											</button>
											<button class="btn-cancel" @click="cancelEdit">Cancel</button>
										</div>
									</div>
								</div>
								
								<div class="editor-workspace" :class="editorMode">
									<div v-if="editorMode !== 'preview'" class="editor-panel">
										<div class="formatting-toolbar">
											<div class="toolbar-group">
												<button class="format-btn" title="Heading 1" @click="insertMarkdown('# ', '')">
													<span class="format-icon">H1</span>
												</button>
												<button class="format-btn" title="Heading 2" @click="insertMarkdown('## ', '')">
													<span class="format-icon">H2</span>
												</button>
												<button class="format-btn" title="Heading 3" @click="insertMarkdown('### ', '')">
													<span class="format-icon">H3</span>
												</button>
											</div>
											<div class="toolbar-separator" />
											<div class="toolbar-group">
												<button class="format-btn" title="Bold" @click="insertMarkdown('**', '**')">
													<span class="format-icon bold">B</span>
												</button>
												<button class="format-btn" title="Italic" @click="insertMarkdown('*', '*')">
													<span class="format-icon italic">I</span>
												</button>
												<button class="format-btn" title="Strikethrough" @click="insertMarkdown('~~', '~~')">
													<span class="format-icon strike">S</span>
												</button>
											</div>
											<div class="toolbar-separator" />
											<div class="toolbar-group">
												<button class="format-btn" title="Bullet List" @click="insertMarkdown('- ', '')">
													<span class="format-icon">•</span>
												</button>
												<button class="format-btn" title="Numbered List" @click="insertMarkdown('1. ', '')">
													<span class="format-icon">1.</span>
												</button>
												<button class="format-btn" title="Checklist" @click="insertMarkdown('- [ ] ', '')">
													<span class="format-icon">☐</span>
												</button>
											</div>
											<div class="toolbar-separator" />
											<div class="toolbar-group">
												<button class="format-btn" title="Link" @click="insertMarkdown('[', '](url)')">
													<span class="format-icon">🔗</span>
												</button>
												<button class="format-btn" title="Quote" @click="insertMarkdown('> ', '')">
													<span class="format-icon">"</span>
												</button>
												<button class="format-btn" title="Code Block" @click="insertMarkdown('```\n', '\n```')">
													<span class="format-icon">&lt;/&gt;</span>
												</button>
											</div>
										</div>
										<div class="editor-content">
											<div class="line-numbers">
												<div v-for="n in lineCount" :key="n" class="line-number">{{ n }}</div>
											</div>
											<textarea 
												ref="editorTextarea" 
												v-model="editingDocument.content"
												class="markdown-textarea"
												placeholder="Start writing your document in Markdown format...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item"
												@scroll="syncScroll"
											/>
										</div>
									</div>
									
									<div v-if="editorMode !== 'edit'" class="preview-panel">
										<div class="preview-header">
											<span class="preview-label">📖 Preview</span>
										</div>
										<div ref="previewContent" class="preview-content">
											<div class="markdown-rendered" v-html="renderedMarkdown" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</transition>
					
					<!-- Documents Grid - Improved -->
					<div v-if="!editingDocument" class="documents-showcase">
						<!-- Category Tabs -->
						<div class="category-tabs">
							<button 
								v-for="cat in documentCategories" 
								:key="cat.id"
								:class="['category-tab', { active: docCategory === cat.id }]" 
								@click="docCategory = cat.id"
							>
								<span class="tab-icon">{{ cat.icon }}</span>
								<span class="tab-label">{{ cat.label }}</span>
								<span class="tab-count">{{ getCategoryCount(cat.id) }}</span>
							</button>
						</div>
						
						<!-- Documents Grid -->
						<div class="documents-masonry">
							<transition-group name="doc-list">
								<div v-for="doc in filteredSearchDocuments" :key="doc.id" class="document-tile">
									<div class="tile-header">
										<div class="tile-icon-wrapper">
											<span class="tile-icon">{{ doc.icon }}</span>
										</div>
										<div class="tile-info">
											<h4 class="tile-title">{{ doc.title }}</h4>
											<div class="tile-meta">
												<span class="meta-category">{{ doc.category }}</span>
												<span class="meta-separator">•</span>
												<span class="meta-date">{{ formatDate(doc.lastUpdated) }}</span>
											</div>
										</div>
									</div>
									
									<p class="tile-description">{{ doc.description }}</p>
									
									<div v-if="doc.content" class="tile-preview">
										<div class="preview-text">{{ getPreviewText(doc.content) }}</div>
									</div>
									
									<div class="tile-footer">
										<div class="tile-stats">
											<span class="stat-item">
												<span class="stat-icon">📝</span>
												{{ getWordCount(doc.content) }} words
											</span>
											<span class="stat-item">
												<span class="stat-icon">👁️</span>
												{{ doc.views || 0 }} views
											</span>
										</div>
										<div class="tile-actions">
											<button class="tile-btn edit" title="Edit" @click="editDocument(doc)">
												<span class="btn-icon">✏️</span>
											</button>
											<button class="tile-btn view" title="View" @click="previewDocument(doc)">
												<span class="btn-icon">👁️</span>
											</button>
											<button class="tile-btn share" title="Share" @click="shareDocument(doc)">
												<span class="btn-icon">📤</span>
											</button>
											<button class="tile-btn delete" title="Delete" @click="deleteDocument(doc)">
												<span class="btn-icon">🗑️</span>
											</button>
										</div>
									</div>
								</div>
							</transition-group>
						</div>
						
						<!-- Empty State -->
						<div v-if="filteredSearchDocuments.length === 0" class="empty-state">
							<div class="empty-icon">📄</div>
							<h3>No documents found</h3>
							<p>{{ docSearchQuery ? 'Try adjusting your search terms' : 'Create your first document to get started' }}</p>
							<button class="btn-primary" @click="createNewDocument">Create Document</button>
						</div>
					</div>
				</section>

				<!-- Announcements -->
				<section v-if="activeSection === 'announcements'" class="section">
					<div class="section-header">
						<h2 class="section-title">📢 {{ $t('mansion.announcements.title') || 'Announcements' }}</h2>
					</div>
					
					<div class="announcement-composer">
						<h3>{{ $t('mansion.announcements.new') || 'Create New Announcement' }}</h3>
						<form @submit.prevent="sendAnnouncement">
							<div class="form-group">
								<label>{{ $t('mansion.announcements.subject') || 'Subject' }}</label>
								<input v-model="announcement.subject" type="text" required>
							</div>
							<div class="form-group">
								<label>{{ $t('mansion.announcements.category') || 'Category' }}</label>
								<select v-model="announcement.category" required>
									<option value="general">{{ $t('mansion.announcements.general') || 'General' }}</option>
									<option value="maintenance">{{ $t('mansion.announcements.maintenance') || 'Maintenance' }}</option>
									<option value="event">{{ $t('mansion.announcements.event') || 'Event' }}</option>
									<option value="emergency">{{ $t('mansion.announcements.emergency') || 'Emergency' }}</option>
								</select>
							</div>
							<div class="form-group">
								<label>{{ $t('mansion.announcements.message') || 'Message' }}</label>
								<textarea v-model="announcement.message" rows="5" required />
							</div>
							<div class="form-group">
								<label>
									<input v-model="announcement.sendEmail" type="checkbox">
									{{ $t('mansion.announcements.sendEmail') || 'Also send as email to all residents' }}
								</label>
							</div>
							<button type="submit" class="send-btn">
								{{ $t('mansion.announcements.send') || 'Send Announcement' }}
							</button>
						</form>
					</div>

					<!-- Past Announcements - Improved Design like Residents -->
					<div class="past-announcements">
						<h3>{{ $t('mansion.announcements.past') || 'Past Announcements' }}</h3>
						<div class="announcements-grid">
							<div v-for="ann in pastAnnouncements" :key="ann.id" class="announcement-card">
								<div class="ann-header">
									<div class="ann-info">
										<h4>{{ ann.subject }}</h4>
										<p class="ann-date">{{ ann.date }}</p>
									</div>
									<span class="ann-category" :class="ann.category">{{ ann.category }}</span>
								</div>
								<div class="ann-content">
									<p>{{ ann.message }}</p>
								</div>
								<div class="ann-footer">
									<div class="ann-stats">
										<span><span class="icon">👥</span> {{ ann.recipients }} recipients</span>
										<span><span class="icon">✉️</span> {{ ann.emailsSent ? 'Email sent' : 'In-app only' }}</span>
									</div>
									<div class="ann-actions">
										<button class="action-btn">View Details</button>
										<button class="action-btn">Resend</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- Reports -->
				<section v-if="activeSection === 'reports'" class="section">
					<div class="section-header">
						<h2 class="section-title">📊 {{ $t('mansion.reports.title') || 'Reports & Analytics' }}</h2>
					</div>
					
					<div class="reports-grid">
						<div class="report-card">
							<h3>{{ $t('mansion.reports.occupancy') || 'Occupancy Report' }}</h3>
							<div class="report-chart">
								<div class="chart-bar" style="height: 95%">
									<span>95%</span>
								</div>
								<p>Current Occupancy</p>
							</div>
							<button class="generate-btn">{{ $t('mansion.reports.generate') || 'Generate Full Report' }}</button>
						</div>

						<div class="report-card">
							<h3>{{ $t('mansion.reports.maintenance') || 'Maintenance Report' }}</h3>
							<div class="report-stats">
								<div class="stat-item">
									<span class="stat-label">{{ $t('mansion.reports.completed') || 'Completed' }}</span>
									<span class="stat-value">142</span>
								</div>
								<div class="stat-item">
									<span class="stat-label">{{ $t('mansion.reports.avgTime') || 'Avg Resolution' }}</span>
									<span class="stat-value">2.3 days</span>
								</div>
							</div>
							<button class="generate-btn">{{ $t('mansion.reports.generate') || 'Generate Full Report' }}</button>
						</div>

						<div class="report-card">
							<h3>{{ $t('mansion.reports.financial') || 'Financial Report' }}</h3>
							<div class="report-summary">
								<p class="summary-item">
									<span>{{ $t('mansion.reports.collected') || 'Collected' }}:</span>
									<strong>¥11,400,000</strong>
								</p>
								<p class="summary-item">
									<span>{{ $t('mansion.reports.pending') || 'Pending' }}:</span>
									<strong>¥600,000</strong>
								</p>
							</div>
							<button class="generate-btn">{{ $t('mansion.reports.generate') || 'Generate Full Report' }}</button>
						</div>
					</div>
				</section>
			</main>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getCurrentInstance } from 'vue'

import KagiLogo from '../components/KagiLogo.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const instance = getCurrentInstance()
const router = instance.proxy.$router

const buildingName = ref( 'Sakura Tower' )
const activeSection = ref( 'overview' )
const showMobileMenu = ref( false )
const searchQuery = ref( '' )
const maintenanceFilter = ref( 'all' )
const currentWeekOffset = ref( 0 )

// Modal states
const showEditModal = ref( false )
const showContactModal = ref( false )
const showHistoryModal = ref( false )
const editingResident = ref( {} )
const contactingResident = ref( null )
const viewingResident = ref( null )
const historyTab = ref( 'payments' )
const message = ref( { subject: '', content: '', sendEmail: false } )

// Document editor states
const editingDocument = ref( null )
const editorMode = ref( 'split' )
const docCategory = ref( 'all' )
const editorTextarea = ref( null )
const docSearchQuery = ref( '' )
const previewContent = ref( null )

// Document categories configuration
const documentCategories = ref( [
	{ id: 'all', label: 'All Documents', icon: '📚' },
	{ id: 'rules', label: 'Building Rules', icon: '📋' },
	{ id: 'guides', label: 'Guides', icon: '📖' },
	{ id: 'forms', label: 'Forms', icon: '📝' },
	{ id: 'notices', label: 'Notices', icon: '📢' }
] )

// History data
const paymentHistory = ref( [
	{ id: 1, date: '2024-12-01', description: 'Monthly Rent', amount: '120,000', status: 'paid' },
	{ id: 2, date: '2024-11-01', description: 'Monthly Rent', amount: '120,000', status: 'paid' },
	{ id: 3, date: '2024-10-01', description: 'Monthly Rent', amount: '120,000', status: 'paid' }
] )

const maintenanceHistory = ref( [
	{ id: 1, date: '2024-11-15', issue: 'Leaky faucet', status: 'completed' },
	{ id: 2, date: '2024-09-20', issue: 'AC repair', status: 'completed' }
] )

const menuItems = computed( () => [
	{ id: 'overview', icon: '📊', label: instance.proxy.$t( 'mansion.menu.overview' ) || 'Overview' },
	{ id: 'residents', icon: '👥', label: instance.proxy.$t( 'mansion.menu.residents' ) || 'Residents' },
	{ id: 'maintenance', icon: '🔧', label: instance.proxy.$t( 'mansion.menu.maintenance' ) || 'Maintenance' },
	{ id: 'bookings', icon: '📅', label: instance.proxy.$t( 'mansion.menu.bookings' ) || 'Bookings' },
	{ id: 'documents', icon: '📄', label: instance.proxy.$t( 'mansion.menu.documents' ) || 'Documents' },
	{ id: 'announcements', icon: '📢', label: instance.proxy.$t( 'mansion.menu.announcements' ) || 'Announcements' },
	{ id: 'reports', icon: '📊', label: instance.proxy.$t( 'mansion.menu.reports' ) || 'Reports' }
] )

// Sample data
const residents = ref( [
	{ id: 1, name: 'Tanaka Yuki', unit: '502', email: 'tanaka@example.com', phone: '080-1234-5678', moveIn: '2023-04-15', status: 'active' },
	{ id: 2, name: 'Sato Kenji', unit: '301', email: 'sato@example.com', phone: '090-2345-6789', moveIn: '2022-08-20', status: 'active' },
	{ id: 3, name: 'Yamada Hana', unit: '105', email: 'yamada@example.com', phone: '080-3456-7890', moveIn: '2024-01-10', status: 'active' }
] )

const maintenanceRequests = ref( [
	{ id: 1, title: 'Water leak in bathroom', description: 'Water dripping from ceiling in the bathroom. Need urgent attention as it may damage the floor below.', unit: '502', resident: 'Tanaka Yuki', category: 'Plumbing', priority: 'urgent', status: 'pending', date: '2024-12-28', assignee: null },
	{ id: 2, title: 'AC not working', description: 'No cold air coming out. Temperature control not responding.', unit: '301', resident: 'Sato Kenji', category: 'HVAC', priority: 'high', status: 'in_progress', date: '2024-12-27', assignee: 'Tech Team A' },
	{ id: 3, title: 'Broken door lock', description: 'Key gets stuck in the lock sometimes', unit: '105', resident: 'Yamada Hana', category: 'Security', priority: 'normal', status: 'pending', date: '2024-12-26', assignee: null }
] )

const facilities = ref( [
	{ id: 1, name: 'Party Room' },
	{ id: 2, name: 'Guest Room' },
	{ id: 3, name: 'Gym' }
] )

const upcomingBookings = ref( [
	{ id: 1, facility: 'Party Room', month: 'DEC', day: '31', time: '18:00-22:00', user: 'Tanaka (502)', purpose: 'New Year Party' },
	{ id: 2, facility: 'Gym', month: 'JAN', day: '02', time: '09:00-11:00', user: 'Reserved for maintenance', purpose: 'Equipment check' }
] )

const documents = ref( [
	{ id: 1, icon: '📋', title: 'Management Rules', description: 'Building management guidelines and regulations for all residents', category: 'rules', lastUpdated: '2024-12-15', views: 342, content: '# Management Rules\n\n## 1. General Guidelines\n- Respect quiet hours (22:00 - 7:00)\n- Keep common areas clean\n- No smoking in common areas\n- Pets must be registered\n\n## 2. Security\n- Always lock entrance doors\n- Register visitors at front desk\n- Do not share access codes\n\n## 3. Maintenance\n- Report issues promptly\n- Allow access for scheduled maintenance' },
	{ id: 2, icon: '📑', title: 'Facility Booking Rules', description: 'Guidelines for reserving and using shared facilities', category: 'rules', lastUpdated: '2024-11-20', views: 156, content: '# Facility Usage Guidelines\n\n## Party Room\n- Maximum 20 people\n- Must be reserved 3 days in advance\n- Clean after use\n\n## Gym\n- Open 6:00 - 23:00\n- Wipe equipment after use\n- No loud music' },
	{ id: 3, icon: '🚗', title: 'Parking Regulations', description: 'Rules for parking spaces and vehicle management', category: 'rules', lastUpdated: '2024-10-10', views: 89, content: '# Parking Regulations\n\n- One car per unit\n- Guest parking available for 3 hours\n- No commercial vehicles\n- Monthly parking fee applies' },
	{ id: 4, icon: '📝', title: 'Move-in Guide', description: 'Complete guide for new residents moving into the building', category: 'guides', lastUpdated: '2024-09-05', views: 234, content: '# Move-in Guide\n\nWelcome to Sakura Tower!\n\n## First Steps\n1. Register at management office\n2. Get your access cards\n3. Set up utilities\n\n## Important Contacts\n- Management: 03-1234-5678\n- Emergency: 110' },
	{ id: 5, icon: '📄', title: 'Maintenance Request Form', description: 'Template for submitting maintenance requests', category: 'forms', lastUpdated: '2024-12-01', views: 45, content: '# Maintenance Request Form\n\n**Unit Number:** ___________\n**Name:** ___________\n**Issue:** ___________\n**Urgency:** [ ] Low [ ] Medium [ ] High' },
	{ id: 6, icon: '📢', title: 'Holiday Schedule 2025', description: 'Building office hours during holidays', category: 'notices', lastUpdated: '2024-12-20', views: 178, content: '# Holiday Schedule 2025\n\n## New Year (Jan 1-3)\n- Office closed\n- Emergency only\n\n## Golden Week (Apr 29 - May 5)\n- Limited hours: 10:00-15:00' }
] )

const pastAnnouncements = ref( [
	{ id: 1, subject: 'Fire Drill Notice', message: 'Annual fire drill scheduled for January 10', date: '2024-12-20', category: 'emergency', recipients: 342 },
	{ id: 2, subject: 'Holiday Schedule', message: 'Office hours during New Year holidays', date: '2024-12-15', category: 'general', recipients: 342 }
] )

const announcement = ref( {
	subject: '',
	category: 'general',
	message: '',
	sendEmail: true
} )

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const currentWeek = computed( () => {
	const date = new Date()
	date.setDate( date.getDate() + currentWeekOffset.value * 7 )
	const startOfWeek = new Date( date )
	startOfWeek.setDate( date.getDate() - date.getDay() + 1 )
	const endOfWeek = new Date( startOfWeek )
	endOfWeek.setDate( startOfWeek.getDate() + 6 )
	
	return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
} )

const filteredResidents = computed( () => {
	if ( !searchQuery.value ) return residents.value
	return residents.value.filter( r => 
		r.name.toLowerCase().includes( searchQuery.value.toLowerCase() ) ||
		r.unit.includes( searchQuery.value )
	)
} )

const filteredMaintenance = computed( () => {
	if ( maintenanceFilter.value === 'all' ) return maintenanceRequests.value
	return maintenanceRequests.value.filter( r => r.status === maintenanceFilter.value || r.priority === maintenanceFilter.value )
} )

const filteredDocuments = computed( () => {
	if ( docCategory.value === 'all' ) return documents.value
	return documents.value.filter( doc => doc.category === docCategory.value )
} )

const renderedMarkdown = computed( () => {
	if ( !editingDocument.value ) return ''
	// Simple markdown rendering (you'd use a proper markdown parser in production)
	let html = editingDocument.value.content
		.replace( /^### (.*$)/gim, '<h3>$1</h3>' )
		.replace( /^## (.*$)/gim, '<h2>$1</h2>' )
		.replace( /^# (.*$)/gim, '<h1>$1</h1>' )
		.replace( /\*\*(.+?)\*\*/g, '<strong>$1</strong>' )
		.replace( /\*(.+?)\*/g, '<em>$1</em>' )
		.replace( /~~(.+?)~~/g, '<del>$1</del>' )
		.replace( /^- (.+)$/gim, '<li>$1</li>' )
		.replace( /^> (.+)$/gim, '<blockquote>$1</blockquote>' )
		.replace( /`([^`]+)`/g, '<code>$1</code>' )
		.replace( /```([^`]+)```/g, '<pre><code>$1</code></pre>' )
		.replace( /\n/g, '<br>' )
	
	// Wrap list items in ul
	html = html.replace( /(<li>.*<\/li>)/s, '<ul>$1</ul>' )
	return html
} )

const lineCount = computed( () => {
	if ( !editingDocument.value?.content ) return 1
	return editingDocument.value.content.split( '\n' ).length
} )

const filteredSearchDocuments = computed( () => {
	let docs = filteredDocuments.value
	if ( docSearchQuery.value ) {
		const query = docSearchQuery.value.toLowerCase()
		docs = docs.filter( doc => 
			doc.title.toLowerCase().includes( query ) ||
			doc.description.toLowerCase().includes( query ) ||
			doc.content?.toLowerCase().includes( query )
		)
	}
	return docs
} )

const navigateToSection = ( section ) => {
	activeSection.value = section
	showMobileMenu.value = false
}

const changeWeek = ( direction ) => {
	currentWeekOffset.value += direction
}

const getBooking = ( facilityId, day ) => {
	// Mock function to get booking for a specific facility and day
	return null
}

const sendAnnouncement = () => {
	console.log( 'Sending announcement:', announcement.value )
	// Reset form
	announcement.value = {
		subject: '',
		category: 'general',
		message: '',
		sendEmail: true
	}
	alert( 'Announcement sent successfully!' )
}

const logout = async () => {
	await authStore.logout()
	router.push( '/' )
}

// Resident management methods
const editResident = ( resident ) => {
	editingResident.value = { ...resident }
	showEditModal.value = true
}

const saveResident = () => {
	const index = residents.value.findIndex( r => r.id === editingResident.value.id )
	if ( index !== -1 ) {
		residents.value[index] = { ...editingResident.value }
	}
	showEditModal.value = false
}

const contactResident = ( resident ) => {
	contactingResident.value = resident
	showContactModal.value = true
	message.value = { subject: '', content: '', sendEmail: false }
}

const sendMessage = () => {
	console.log( 'Sending message to', contactingResident.value.name, message.value )
	showContactModal.value = false
}

const viewHistory = ( resident ) => {
	viewingResident.value = resident
	showHistoryModal.value = true
	historyTab.value = 'payments'
}

// Document management methods
const createNewDocument = () => {
	editingDocument.value = {
		id: Date.now(),
		title: '',
		content: '',
		category: 'general',
		icon: '📄'
	}
	editorMode.value = 'split'
}

const editDocument = ( doc ) => {
	editingDocument.value = { ...doc }
	editorMode.value = 'split'
}

const saveDocument = () => {
	if ( editingDocument.value.id ) {
		const index = documents.value.findIndex( d => d.id === editingDocument.value.id )
		if ( index !== -1 ) {
			documents.value[index] = {
				...editingDocument.value,
				lastUpdated: new Date().toISOString().split( 'T' )[0]
			}
		} else {
			documents.value.push( {
				...editingDocument.value,
				lastUpdated: new Date().toISOString().split( 'T' )[0],
				description: editingDocument.value.content.substring( 0, 100 ) + '...'
			} )
		}
	}
	editingDocument.value = null
}

const cancelEdit = () => {
	editingDocument.value = null
}

const previewDocument = ( doc ) => {
	editingDocument.value = { ...doc }
	editorMode.value = 'preview'
}

const deleteDocument = ( doc ) => {
	if ( confirm( 'Are you sure you want to delete this document?' ) ) {
		const index = documents.value.findIndex( d => d.id === doc.id )
		if ( index !== -1 ) {
			documents.value.splice( index, 1 )
		}
	}
}

const insertMarkdown = ( before, after = '' ) => {
	if ( !editorTextarea.value ) return
	const textarea = editorTextarea.value
	const start = textarea.selectionStart
	const end = textarea.selectionEnd
	const text = textarea.value
	const selectedText = text.substring( start, end )
	
	const newText = text.substring( 0, start ) + before + selectedText + after + text.substring( end )
	editingDocument.value.content = newText
	
	// Set cursor position
	setTimeout( () => {
		textarea.focus()
		textarea.selectionStart = start + before.length
		textarea.selectionEnd = start + before.length + selectedText.length
	}, 0 )
}

// New helper methods for improved documents section
const getCategoryCount = ( categoryId ) => {
	if ( categoryId === 'all' ) return documents.value.length
	return documents.value.filter( doc => doc.category === categoryId ).length
}

const formatDate = ( dateString ) => {
	const date = new Date( dateString )
	return date.toLocaleDateString( 'en-US', { month: 'short', day: 'numeric', year: 'numeric' } )
}

const getPreviewText = ( content ) => {
	if ( !content ) return ''
	// Remove markdown syntax and get first 150 characters
	const plainText = content
		.replace( /[#*`~\[\]()>]/g, '' )
		.replace( /\n/g, ' ' )
		.trim()
	return plainText.length > 150 ? plainText.substring( 0, 150 ) + '...' : plainText
}

const getWordCount = ( content ) => {
	if ( !content ) return 0
	return content.split( /\s+/ ).filter( word => word.length > 0 ).length
}

const shareDocument = ( doc ) => {
	// Implementation for sharing document
	console.log( 'Sharing document:', doc.title )
	alert( `Document "${doc.title}" sharing link copied to clipboard!` )
}

const syncScroll = () => {
	// Sync scroll between editor and preview in split mode
	if ( editorMode.value === 'split' && editorTextarea.value && previewContent.value ) {
		const scrollPercent = editorTextarea.value.scrollTop / 
			( editorTextarea.value.scrollHeight - editorTextarea.value.clientHeight )
		previewContent.value.scrollTop = scrollPercent * 
			( previewContent.value.scrollHeight - previewContent.value.clientHeight )
	}
}
</script>

<style lang="stylus" scoped>
// Base dashboard styles
.mansion-admin-dashboard
	min-height 100vh
	display flex
	flex-direction column
	background #f5f5f5

.header
	background white
	box-shadow 0 2px 4px rgba(0, 0, 0, 0.08)
	position sticky
	top 0
	z-index 100

.header-content
	display flex
	justify-content space-between
	align-items center
	padding 1rem 2rem
	max-width 1400px
	margin 0 auto

.header-left
	display flex
	align-items center
	gap 1rem

	h1
		margin 0
		color #333
		font-size 1.5rem

.header-right
	display flex
	align-items center
	gap 1rem

.user-menu-btn
	display flex
	align-items center
	gap 0.5rem
	padding 0.5rem 1rem
	background transparent
	border 1px solid #e0e0e0
	border-radius 50px
	cursor pointer
	transition all 0.2s ease

	&:hover
		background #f5f5f5

	.user-email
		color #666

	.menu-arrow
		color #999
		font-size 0.8rem

.mobile-settings-menu
	position fixed
	top 0
	right 0
	width 300px
	height 100vh
	background white
	box-shadow -4px 0 20px rgba(0, 0, 0, 0.1)
	z-index 200
	transition transform 0.3s ease

.mobile-menu-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 1px solid #e0e0e0

	h3
		margin 0
		color #333

.close-menu-btn
	background none
	border none
	font-size 1.5rem
	cursor pointer
	color #999

.mobile-menu-content
	padding 1.5rem

.mobile-user-info
	margin-bottom 1.5rem
	padding-bottom 1.5rem
	border-bottom 1px solid #e0e0e0

	.user-email
		font-weight 600
		color #333
		margin-bottom 0.25rem

	.user-role
		color #666
		font-size 0.9rem

.mobile-lang-section
	margin-bottom 1.5rem

.mobile-logout-btn
	width 100%
	padding 0.75rem
	background #FF5252
	color white
	border none
	border-radius 50px
	cursor pointer
	font-weight 500
	transition all 0.2s ease

	&:hover
		background #FF6B6B

.dashboard-content
	display flex
	flex 1
	max-width 1400px
	width 100%
	margin 0 auto

.sidebar
	width 240px
	background white
	border-right 1px solid #e0e0e0
	padding 1rem 0

.nav-menu
	display flex
	flex-direction column

.nav-item
	display flex
	align-items center
	gap 0.75rem
	padding 0.75rem 1.5rem
	background transparent
	border none
	cursor pointer
	transition all 0.2s ease
	color #666
	font-size 0.95rem

	&:hover
		background rgba(255, 193, 7, 0.05)
		color #333

	&.active
		background linear-gradient(90deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)
		color #FF9800
		border-left 3px solid #FFC107
		padding-left calc(1.5rem - 3px)

	.nav-icon
		font-size 1.2rem

	.nav-label
		font-weight 500

.main-content
	flex 1
	padding 2rem
	overflow-y auto

.section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.section-header
	display flex
	justify-content space-between
	align-items center
	margin-bottom 2rem

	.section-title
		margin 0
		color #333
		font-size 1.8rem
		display flex
		align-items center
		gap 0.75rem

		.section-icon
			font-size 1.5rem

// Additional mansion admin specific styles
.admin-badge
	background linear-gradient(135deg, #FF9800 0%, #FFB300 100%)
	color white
	padding 0.25rem 0.75rem
	border-radius 20px
	font-size 0.85rem
	font-weight 600
	margin-right 1rem

.stat-warning
	color #F44336
	font-size 0.85rem

.quick-actions
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082
	margin-top 1.5rem

	h3
		margin 0 0 1rem 0
		color #333

.actions-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
	gap 1rem

.action-card
	display flex
	flex-direction column
	align-items center
	gap 0.5rem
	padding 1.5rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border 2px solid #FFC107
	border-radius 15px
	cursor pointer
	transition all 0.2s ease

	&:hover
		transform translateY(-2px)
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.2)

	.action-icon
		font-size 2rem

.residents-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
	gap 1.5rem

.resident-card
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082

	.resident-header
		display flex
		justify-content space-between
		align-items start
		margin-bottom 1rem

		.resident-info
			h4
				margin 0 0 0.25rem 0
				color #333

			p
				margin 0
				color #666
				font-size 0.9rem

		.resident-status
			padding 0.25rem 0.75rem
			border-radius 12px
			font-size 0.85rem

			&.active
				background #E8F5E9
				color #4CAF50

	.resident-details
		p
			margin 0.5rem 0
			color #666
			font-size 0.9rem

			span
				margin-right 0.5rem

	.resident-actions
		display flex
		gap 0.5rem
		margin-top 1rem

.maintenance-card
	background white
	border-radius 15px
	padding 1.5rem
	margin-bottom 1rem
	border-left 4px solid #e0e0e0

	&.urgent
		border-left-color #F44336

	&.high
		border-left-color #FF9800

.booking-calendar
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082
	margin-bottom 2rem

.calendar-controls
	display flex
	justify-content space-between
	align-items center
	margin-bottom 1.5rem

	button
		padding 0.5rem 1rem
		background white
		border 1px solid #e0e0e0
		border-radius 8px
		cursor pointer

		&:hover
			background #FFF9C4

.bookings-table
	.table-header
		display grid
		grid-template-columns 150px repeat(7, 1fr)
		gap 0.5rem
		margin-bottom 0.5rem
		font-weight 600

	.facility-row
		display grid
		grid-template-columns 150px repeat(7, 1fr)
		gap 0.5rem
		margin-bottom 0.5rem

		.facility-name
			font-weight 500
			color #333

		.booking-cell
			padding 0.5rem
			background #f9f9f9
			border-radius 8px
			text-align center
			font-size 0.85rem

			.available
				color #999

			.booking-block
				background linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)
				padding 0.25rem
				border-radius 6px

				.booking-time
					display block
					font-weight 600
					font-size 0.8rem

				.booking-user
					display block
					font-size 0.75rem
					color #666

.announcement-composer
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082
	margin-bottom 2rem

	form
		.form-group
			margin-bottom 1rem

			label
				display block
				color #666
				margin-bottom 0.5rem

			input, select, textarea
				width 100%
				padding 0.75rem
				border 2px solid #e0e0e0
				border-radius 10px

				&:focus
					outline none
					border-color #FFC107

		.send-btn
			padding 0.75rem 2rem
			background linear-gradient(135deg, #FF9800 0%, #FFB300 100%)
			color white
			border none
			border-radius 50px
			cursor pointer
			font-weight 600

			&:hover
				transform translateY(-1px)
				box-shadow 0 4px 12px rgba(255, 152, 0, 0.3)

.reports-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(300px, 1fr))
	gap 1.5rem

.report-card
	background white
	border-radius 15px
	padding 1.5rem
	border 2px solid #FFE082

	h3
		margin 0 0 1rem 0
		color #333

	.report-chart
		text-align center
		margin 1.5rem 0

		.chart-bar
			background linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)
			width 100%
			border-radius 10px
			display flex
			align-items center
			justify-content center
			color white
			font-size 2rem
			font-weight bold
			margin-bottom 0.5rem

		p
			color #666
			margin 0

	.report-stats, .report-summary
		.stat-item, .summary-item
			display flex
			justify-content space-between
			padding 0.75rem 0
			border-bottom 1px solid #f0f0f0

			&:last-child
				border-bottom none

	.generate-btn
		width 100%
		padding 0.75rem
		background white
		border 2px solid #FFC107
		border-radius 50px
		cursor pointer
		color #333
		font-weight 500
		margin-top 1rem

		&:hover
			background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

.filter-select
	padding 0.6rem 1rem
	border 2px solid #FFC107
	border-radius 50px
	background white
	cursor pointer

.action-btn
	padding 0.5rem 1rem
	background white
	border 1px solid #e0e0e0
	border-radius 8px
	cursor pointer
	font-size 0.85rem

	&:hover
		background #f5f5f5

	&.primary
		background linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)
		color white
		border none

	&.danger
		color #F44336
		border-color #F44336

// Improved Overview Section
.overview-container
	display flex
	flex-direction column
	gap 2rem

.stats-row
	display flex
	gap 1.5rem
	
	@media (max-width: 768px)
		flex-direction column

.stat-box
	flex 1
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.08)
	
	&.primary
		border-top 4px solid #4CAF50
		
	&.secondary
		border-top 4px solid #2196F3
		
	&.warning
		border-top 4px solid #FF9800
		
	&.info
		border-top 4px solid #9C27B0

.stat-header
	display flex
	align-items center
	gap 0.75rem
	margin-bottom 1rem
	
	.stat-icon
		font-size 1.5rem
		
	h3
		margin 0
		font-size 0.9rem
		color #666

.stat-body
	.stat-main
		display flex
		align-items baseline
		gap 0.5rem
		margin-bottom 1rem
		
		.stat-number
			font-size 2.5rem
			font-weight bold
			color #333
			
		.stat-label
			font-size 0.9rem
			color #999

.stat-detail
	display flex
	gap 2rem
	margin-bottom 1rem
	
	.detail-item
		display flex
		flex-direction column
		
		.detail-value
			font-size 1.2rem
			font-weight 600
			color #555
			
		.detail-label
			font-size 0.8rem
			color #999
			margin-top 0.25rem

.stat-progress
	height 8px
	background #e0e0e0
	border-radius 4px
	overflow hidden
	
	.progress-bar
		height 100%
		background linear-gradient(90deg, #4CAF50, #66BB6A)
		border-radius 4px
		transition width 0.3s

.stat-trend
	display flex
	align-items center
	gap 0.5rem
	font-size 0.9rem
	
	&.positive
		color #4CAF50
		
		.trend-icon
			font-weight bold

.stat-badges
	display flex
	gap 0.5rem
	flex-wrap wrap
	
	.badge
		padding 0.25rem 0.75rem
		border-radius 12px
		font-size 0.8rem
		font-weight 500
		
		&.urgent
			background #ffebee
			color #c62828
			
		&.pending
			background #fff3e0
			color #e65100
			
		&.progress
			background #e3f2fd
			color #1565c0

.booking-preview
	.booking-item
		padding 0.5rem
		background #f5f5f5
		border-radius 6px
		margin-bottom 0.5rem
		font-size 0.85rem
		color #666

// Improved Maintenance Section
.header-controls
	display flex
	gap 1rem

.filter-tabs
	display flex
	background white
	border-radius 8px
	padding 4px
	box-shadow 0 2px 4px rgba(0, 0, 0, 0.1)
	
	.filter-tab
		padding 0.5rem 1rem
		border none
		background none
		color #666
		cursor pointer
		border-radius 6px
		transition all 0.2s
		position relative
		
		&.active
			background #4CAF50
			color white
			
		.count
			margin-left 0.5rem
			padding 2px 6px
			background rgba(0, 0, 0, 0.1)
			border-radius 10px
			font-size 0.75rem
			
			&.urgent
				background #ff5252
				color white

.maintenance-grid
	display flex
	flex-direction column
	gap 1rem

.maintenance-item
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 4px rgba(0, 0, 0, 0.08)
	transition transform 0.2s
	
	&:hover
		transform translateY(-2px)
		box-shadow 0 4px 8px rgba(0, 0, 0, 0.12)

.item-header
	display flex
	align-items flex-start
	gap 1rem
	margin-bottom 1rem

.item-priority
	width 40px
	height 40px
	border-radius 8px
	display flex
	align-items center
	justify-content center
	font-size 1.2rem
	
	&.urgent
		background #ffebee
		
	&.high
		background #fff3e0
		
	&.normal
		background #e8f5e9

.item-info
	flex 1
	
	h4
		margin 0 0 0.5rem 0
		color #333
		
	.item-meta
		display flex
		gap 1rem
		font-size 0.85rem
		color #666
		
		.meta-item
			display flex
			align-items center
			gap 0.25rem

.item-status
	padding 0.25rem 0.75rem
	border-radius 12px
	font-size 0.85rem
	font-weight 500
	text-transform capitalize
	
	&.pending
		background #fff3e0
		color #e65100
		
	&.in_progress
		background #e3f2fd
		color #1565c0
		
	&.completed
		background #e8f5e9
		color #2e7d32

.item-body
	.item-description
		color #666
		margin-bottom 1rem
		line-height 1.5
		
	.item-tags
		display flex
		gap 0.5rem
		flex-wrap wrap
		
		.tag
			padding 0.25rem 0.75rem
			background #f5f5f5
			border-radius 12px
			font-size 0.8rem
			color #666
			
			&.assigned
				background #e3f2fd
				color #1565c0

.item-actions
	display flex
	gap 0.5rem
	margin-top 1rem
	
	.btn-action
		padding 0.5rem 1rem
		border 1px solid #ddd
		border-radius 6px
		background white
		color #666
		cursor pointer
		font-size 0.85rem
		transition all 0.2s
		
		&:hover
			background #f5f5f5
			
		&.primary
			background #4CAF50
			color white
			border-color #4CAF50
			
			&:hover
				background #45a049

// Improved Bookings Timeline
.bookings-timeline
	display flex
	flex-direction column
	gap 1.5rem
	margin-top 1.5rem

.timeline-item
	display flex
	gap 1.5rem
	position relative
	
	&:not(:last-child)::after
		content ''
		position absolute
		left 40px
		top 60px
		bottom -1.5rem
		width 2px
		background #e0e0e0

.timeline-date
	.date-box
		width 80px
		height 80px
		background white
		border-radius 12px
		box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
		display flex
		flex-direction column
		align-items center
		justify-content center
		position relative
		z-index 1
		
		.date-month
			font-size 0.8rem
			color #666
			text-transform uppercase
			font-weight 600
			
		.date-day
			font-size 1.8rem
			font-weight bold
			color #333
			line-height 1

.timeline-content
	flex 1

.booking-card
	background white
	border-radius 12px
	padding 1.25rem
	box-shadow 0 2px 4px rgba(0, 0, 0, 0.08)
	
	.booking-header
		display flex
		justify-content space-between
		align-items center
		margin-bottom 1rem
		
		h4
			margin 0
			color #333
			
		.booking-time
			background #e3f2fd
			color #1565c0
			padding 0.25rem 0.75rem
			border-radius 12px
			font-size 0.85rem
			font-weight 500
	
	.booking-info
		display flex
		flex-direction column
		gap 0.5rem
		margin-bottom 1rem
		
		.info-row
			display flex
			gap 0.5rem
			font-size 0.9rem
			
			.label
				color #999
				min-width 80px
				
			.value
				color #333
				font-weight 500
	
	.booking-footer
		display flex
		gap 0.5rem
		
		.btn-sm
			padding 0.4rem 0.8rem
			border 1px solid #ddd
			border-radius 6px
			background white
			color #666
			cursor pointer
			font-size 0.85rem
			transition all 0.2s
			
			&:hover
				background #f5f5f5
				
			&.danger
				color #f44336
				border-color #f44336
				
				&:hover
					background #ffebee

// Improved Document Management Styles
.documents-showcase
	margin-top 1.5rem

.category-tabs
	display flex
	gap 0.5rem
	margin-bottom 2rem
	background white
	padding 0.75rem
	border-radius 12px
	box-shadow 0 2px 4px rgba(0, 0, 0, 0.05)
	
	.category-tab
		display flex
		align-items center
		gap 0.5rem
		padding 0.75rem 1.25rem
		border none
		background transparent
		border-radius 8px
		cursor pointer
		transition all 0.2s
		color #666
		
		&:hover
			background #f5f5f5
			
		&.active
			background linear-gradient(135deg, #4CAF50, #45a049)
			color white
			box-shadow 0 2px 8px rgba(76, 175, 80, 0.3)
			
			.tab-count
				background rgba(255, 255, 255, 0.2)
				color white
		
		.tab-icon
			font-size 1.1rem
			
		.tab-label
			font-weight 500
			
		.tab-count
			padding 2px 8px
			background #e0e0e0
			border-radius 12px
			font-size 0.8rem
			font-weight 600

.documents-masonry
	display grid
	grid-template-columns repeat(auto-fill, minmax(320px, 1fr))
	gap 1.5rem
	margin-bottom 2rem

.document-tile
	background white
	border-radius 16px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.08)
	transition all 0.3s
	display flex
	flex-direction column
	position relative
	overflow hidden
	
	&::before
		content ''
		position absolute
		top 0
		left 0
		right 0
		height 4px
		background linear-gradient(90deg, #4CAF50, #2196F3, #9C27B0)
		opacity 0
		transition opacity 0.3s
	
	&:hover
		transform translateY(-4px)
		box-shadow 0 8px 24px rgba(0, 0, 0, 0.12)
		
		&::before
			opacity 1
			
		.tile-actions
			opacity 1

.tile-header
	display flex
	gap 1rem
	margin-bottom 1rem
	align-items flex-start

.tile-icon-wrapper
	width 48px
	height 48px
	background linear-gradient(135deg, #e3f2fd, #bbdefb)
	border-radius 12px
	display flex
	align-items center
	justify-content center
	flex-shrink 0
	
	.tile-icon
		font-size 1.5rem

.tile-info
	flex 1
	
	.tile-title
		margin 0 0 0.25rem 0
		color #333
		font-size 1.1rem
		font-weight 600
		
	.tile-meta
		display flex
		align-items center
		gap 0.5rem
		font-size 0.85rem
		color #999
		
		.meta-category
			color #4CAF50
			font-weight 500
			text-transform capitalize
			
		.meta-separator
			color #ddd

.tile-description
	color #666
	line-height 1.5
	margin-bottom 1rem
	font-size 0.95rem

.tile-preview
	background #f8f9fa
	border-radius 8px
	padding 1rem
	margin-bottom 1rem
	border-left 3px solid #4CAF50
	
	.preview-text
		color #555
		font-size 0.85rem
		line-height 1.6
		font-family 'Monaco', 'Courier New', monospace

.tile-footer
	margin-top auto
	padding-top 1rem
	border-top 1px solid #f0f0f0
	display flex
	justify-content space-between
	align-items center

.tile-stats
	display flex
	gap 1rem
	
	.stat-item
		display flex
		align-items center
		gap 0.25rem
		font-size 0.85rem
		color #999
		
		.stat-icon
			font-size 0.9rem

.tile-actions
	display flex
	gap 0.5rem
	opacity 0.7
	transition opacity 0.3s
	
	.tile-btn
		width 32px
		height 32px
		border none
		background #f5f5f5
		border-radius 8px
		display flex
		align-items center
		justify-content center
		cursor pointer
		transition all 0.2s
		
		.btn-icon
			font-size 1rem
		
		&:hover
			transform scale(1.1)
			
		&.edit:hover
			background #e3f2fd
			
		&.view:hover
			background #f3e5f5
			
		&.share:hover
			background #e8f5e9
			
		&.delete:hover
			background #ffebee

// Document Editor Panel Styles
.document-editor-panel
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	z-index 1000
	display flex
	align-items center
	justify-content center
	padding 2rem

.editor-container
	background white
	border-radius 20px
	width 100%
	max-width 1400px
	height 90vh
	display flex
	flex-direction column
	box-shadow 0 20px 60px rgba(0, 0, 0, 0.3)
	overflow hidden

.editor-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem 2rem
	border-bottom 1px solid #e0e0e0
	background #fafafa

.editor-title-section
	display flex
	gap 1rem
	flex 1
	
	.doc-title-input
		flex 1
		font-size 1.25rem
		font-weight 600
		padding 0.75rem 1rem
		border 2px solid transparent
		border-radius 8px
		background white
		transition all 0.2s
		
		&:focus
			border-color #4CAF50
			outline none
			box-shadow 0 0 0 3px rgba(76, 175, 80, 0.1)
	
	.doc-category-select
		padding 0.75rem 1rem
		border 2px solid #e0e0e0
		border-radius 8px
		background white
		font-weight 500
		cursor pointer
		
		&:focus
			border-color #4CAF50
			outline none

.editor-view-controls
	display flex
	align-items center
	gap 1.5rem

.view-toggle
	display flex
	background white
	border-radius 10px
	padding 4px
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
	
	.view-btn
		display flex
		align-items center
		gap 0.5rem
		padding 0.5rem 1rem
		border none
		background transparent
		border-radius 8px
		cursor pointer
		transition all 0.2s
		color #666
		
		&.active
			background #4CAF50
			color white
			
		.view-icon
			font-size 1rem
			
		.view-label
			font-size 0.9rem
			font-weight 500

.editor-actions
	display flex
	gap 0.75rem
	
	.btn-save,
	.btn-cancel
		padding 0.75rem 1.5rem
		border-radius 8px
		border none
		font-weight 600
		cursor pointer
		transition all 0.2s
		
	.btn-save
		background linear-gradient(135deg, #4CAF50, #45a049)
		color white
		display flex
		align-items center
		gap 0.5rem
		
		&:hover
			transform translateY(-2px)
			box-shadow 0 4px 12px rgba(76, 175, 80, 0.3)
			
		.btn-icon
			font-size 1rem
			
	.btn-cancel
		background white
		color #666
		border 2px solid #e0e0e0
		
		&:hover
			background #f5f5f5

.editor-workspace
	flex 1
	display flex
	overflow hidden
	
	&.edit
		.editor-panel
			flex 1
		.preview-panel
			display none
			
	&.preview
		.editor-panel
			display none
		.preview-panel
			flex 1
			
	&.split
		.editor-panel,
		.preview-panel
			flex 1

.editor-panel
	display flex
	flex-direction column
	background white

.formatting-toolbar
	display flex
	align-items center
	gap 0.5rem
	padding 1rem
	background #f8f9fa
	border-bottom 1px solid #e0e0e0
	
	.toolbar-group
		display flex
		gap 0.25rem
		
	.toolbar-separator
		width 1px
		height 24px
		background #ddd
		margin 0 0.5rem
	
	.format-btn
		width 36px
		height 36px
		border none
		background white
		border-radius 6px
		display flex
		align-items center
		justify-content center
		cursor pointer
		transition all 0.2s
		
		&:hover
			background #e3f2fd
			transform translateY(-1px)
			
		.format-icon
			font-size 0.9rem
			font-weight 600
			color #333
			
			&.bold
				font-weight 900
				
			&.italic
				font-style italic
				
			&.strike
				text-decoration line-through

.editor-content
	flex 1
	display flex
	overflow hidden
	
	.line-numbers
		width 50px
		background #f8f9fa
		padding 1rem 0
		text-align right
		overflow-y hidden
		border-right 1px solid #e0e0e0
		
		.line-number
			padding 0 0.75rem
			height 1.6rem
			color #999
			font-size 0.85rem
			font-family 'Monaco', 'Courier New', monospace
	
	.markdown-textarea
		flex 1
		padding 1rem 1.5rem
		border none
		outline none
		resize none
		font-family 'Monaco', 'Courier New', monospace
		font-size 0.95rem
		line-height 1.6
		color #333
		
		&::placeholder
			color #bbb

.preview-panel
	display flex
	flex-direction column
	background white
	border-left 1px solid #e0e0e0

.preview-header
	padding 1rem 1.5rem
	background #f8f9fa
	border-bottom 1px solid #e0e0e0
	
	.preview-label
		font-weight 600
		color #666

.preview-content
	flex 1
	overflow-y auto
	padding 2rem

.markdown-rendered
	max-width 800px
	margin 0 auto
	line-height 1.6
	color #333
	
	h1, h2, h3
		margin-top 1.5rem
		margin-bottom 1rem
		color #222
		font-weight 600
		
	h1
		font-size 2rem
		border-bottom 2px solid #e0e0e0
		padding-bottom 0.5rem
		
	h2
		font-size 1.5rem
		
	h3
		font-size 1.2rem
		
	p
		margin 1rem 0
		
	ul, ol
		margin 1rem 0
		padding-left 2rem
		
	li
		margin 0.5rem 0
		
	blockquote
		margin 1rem 0
		padding 0.5rem 1rem
		border-left 4px solid #4CAF50
		background #f8f9fa
		color #666
		
	code
		background #f5f5f5
		padding 2px 6px
		border-radius 3px
		font-family 'Monaco', 'Courier New', monospace
		font-size 0.9em
		color #e91e63
		
	pre
		background #f8f9fa
		padding 1rem
		border-radius 8px
		overflow-x auto
		
		code
			background none
			padding 0
			color #333
			
	del
		text-decoration line-through
		color #999
		
	strong
		font-weight 600
		color #222

// Empty state
.empty-state
	text-align center
	padding 3rem
	
	.empty-icon
		font-size 4rem
		margin-bottom 1rem
		opacity 0.5
		
	h3
		color #333
		margin-bottom 0.5rem
		
	p
		color #999
		margin-bottom 1.5rem
		
	.btn-primary
		padding 0.75rem 1.5rem
		background linear-gradient(135deg, #4CAF50, #45a049)
		color white
		border none
		border-radius 8px
		font-weight 600
		cursor pointer
		transition all 0.2s
		
		&:hover
			transform translateY(-2px)
			box-shadow 0 4px 12px rgba(76, 175, 80, 0.3)

// Animations
.slide-up-enter-active,
.slide-up-leave-active
	transition all 0.3s ease

.slide-up-enter-from
	opacity 0
	transform translateY(20px)

.slide-up-leave-to
	opacity 0
	transform translateY(20px)

.doc-list-enter-active,
.doc-list-leave-active,
.doc-list-move
	transition all 0.3s ease

.doc-list-enter-from
	opacity 0
	transform scale(0.9)

.doc-list-leave-to
	opacity 0
	transform scale(0.9)

// Improved Announcements Grid
.announcements-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap 1.5rem
	margin-top 1.5rem

.announcement-card
	background white
	border-radius 12px
	padding 1.25rem
	box-shadow 0 2px 4px rgba(0, 0, 0, 0.08)
	display flex
	flex-direction column
	transition transform 0.2s
	
	&:hover
		transform translateY(-2px)
		box-shadow 0 4px 8px rgba(0, 0, 0, 0.12)

.ann-header
	display flex
	justify-content space-between
	align-items flex-start
	margin-bottom 1rem
	
	.ann-info
		flex 1
		
		h4
			margin 0 0 0.25rem 0
			color #333
			
		.ann-date
			font-size 0.85rem
			color #999

.ann-category
	padding 0.25rem 0.75rem
	border-radius 12px
	font-size 0.8rem
	font-weight 500
	text-transform capitalize
	
	&.general
		background #e3f2fd
		color #1565c0
		
	&.maintenance
		background #fff3e0
		color #e65100
		
	&.event
		background #f3e5f5
		color #7b1fa2
		
	&.emergency
		background #ffebee
		color #c62828

.ann-content
	flex 1
	margin-bottom 1rem
	
	p
		color #666
		line-height 1.5
		margin 0

.ann-footer
	.ann-stats
		display flex
		gap 1rem
		margin-bottom 0.75rem
		font-size 0.85rem
		color #999
		
		.icon
			margin-right 0.25rem
			
	.ann-actions
		display flex
		gap 0.5rem

// Modal Styles
.modal-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background rgba(0, 0, 0, 0.5)
	display flex
	align-items center
	justify-content center
	z-index 1000

.modal-content
	background white
	border-radius 12px
	width 90%
	max-width 500px
	max-height 90vh
	overflow-y auto
	box-shadow 0 10px 40px rgba(0, 0, 0, 0.2)
	
	&.large
		max-width 800px

.modal-header
	display flex
	justify-content space-between
	align-items center
	padding 1.5rem
	border-bottom 1px solid #e0e0e0
	
	h3
		margin 0
		color #333

.modal-close
	background none
	border none
	font-size 1.5rem
	color #999
	cursor pointer
	padding 0
	width 32px
	height 32px
	display flex
	align-items center
	justify-content center
	border-radius 4px
	transition all 0.2s
	
	&:hover
		background #f5f5f5
		color #333

.modal-body
	padding 1.5rem
	
	.form-group
		margin-bottom 1rem
		
		label
			display block
			margin-bottom 0.5rem
			color #666
			font-size 0.9rem
			
		input,
		textarea,
		select
			width 100%
			padding 0.75rem
			border 1px solid #ddd
			border-radius 6px
			font-size 1rem
			
			&:focus
				outline none
				border-color #4CAF50
				
		textarea
			resize vertical
			min-height 100px
			
		input[type="checkbox"]
			width auto
			margin-right 0.5rem

.form-actions
	display flex
	gap 0.75rem
	justify-content flex-end
	margin-top 1.5rem
	
	button
		padding 0.75rem 1.5rem
		border-radius 6px
		border none
		cursor pointer
		font-weight 500
		transition all 0.2s
		
		&.btn-primary
			background #4CAF50
			color white
			
			&:hover
				background #45a049
				
		&.btn-secondary
			background #f5f5f5
			color #666
			
			&:hover
				background #e0e0e0

.history-tabs
	display flex
	gap 0.5rem
	margin-bottom 1.5rem
	border-bottom 1px solid #e0e0e0
	
	.tab
		padding 0.75rem 1.5rem
		border none
		background none
		color #666
		cursor pointer
		border-bottom 2px solid transparent
		transition all 0.2s
		
		&.active
			color #4CAF50
			border-bottom-color #4CAF50
			
		&:hover:not(.active)
			background #f5f5f5

.history-content
	min-height 300px

.history-list
	.history-item
		display flex
		justify-content space-between
		align-items center
		padding 1rem
		border-bottom 1px solid #f0f0f0
		
		&:hover
			background #f9f9f9
			
		.date
			color #999
			font-size 0.85rem
			min-width 100px
			
		.description,
		.issue
			flex 1
			color #333
			margin 0 1rem
			
		.amount
			font-weight 600
			color #333
			min-width 100px
			text-align right
			
		.status
			padding 0.25rem 0.75rem
			border-radius 12px
			font-size 0.8rem
			font-weight 500
			min-width 80px
			text-align center
			
			&.paid
				background #e8f5e9
				color #2e7d32
				
			&.completed
				background #e8f5e9
				color #2e7d32
				
			&.pending
				background #fff3e0
				color #e65100
</style>