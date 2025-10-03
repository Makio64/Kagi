// Mock data for dashboards (to be replaced with real backend calls)

export const getMansionResidents = ( _mansionId ) => [
	{ id: 1, name: 'Tanaka Yuki', unit: '502', email: 'tanaka@example.com', phone: '090-1234-5678', moveInDate: 'Jan 2023', status: 'active' },
	{ id: 2, name: 'Sato Kenji', unit: '301', email: 'sato@example.com', phone: '090-2345-6789', moveInDate: 'Mar 2022', status: 'active' },
	{ id: 3, name: 'Yamada Hana', unit: '105', email: 'yamada@example.com', phone: '090-3456-7890', moveInDate: 'Jun 2023', status: 'active' }
]

export const getMaintenanceRequests = ( _mansionId ) => [
	{ id: 1, title: 'Water leak in bathroom', description: 'Water dripping from ceiling', unit: '502', priority: 'urgent', status: 'open', created: '2 hours ago' },
	{ id: 2, title: 'AC not working', description: 'Air conditioning unit making noise', unit: '301', priority: 'high', status: 'assigned', assignedTo: 'Tech Team', created: '1 day ago' },
	{ id: 3, title: 'Door lock issue', description: 'Key card reader not responding', unit: '105', priority: 'medium', status: 'in-progress', assignedTo: 'Security', created: '3 days ago' }
]

export const getAnnouncements = ( _mansionId ) => [
	{ id: 1, title: 'Pool Maintenance', category: 'maintenance', content: 'The swimming pool will be closed for maintenance from Dec 10-12.', date: 'Dec 5, 2024', views: 89 },
	{ id: 2, title: 'New Year Party', category: 'event', content: 'Join us for the annual New Year celebration in the party room!', date: 'Dec 3, 2024', views: 156 },
	{ id: 3, title: 'Elevator Inspection', category: 'urgent', content: 'Mandatory elevator inspection on Dec 15. Service may be interrupted.', date: 'Dec 1, 2024', views: 201 }
]

export const getDocuments = ( _mansionId ) => [
	{ id: 1, name: 'Building Rules', icon: '📋', description: 'Complete building rules and regulations', size: '2.3 MB', lastModified: 'Nov 15, 2024' },
	{ id: 2, name: 'Emergency Procedures', icon: '🚨', description: 'Emergency evacuation and safety procedures', size: '1.5 MB', lastModified: 'Oct 20, 2024' },
	{ id: 3, name: 'Facility Guide', icon: '📖', description: 'Guide to all building facilities', size: '4.1 MB', lastModified: 'Sep 10, 2024' }
]

export const getFacilities = ( _mansionId ) => [
	{ id: 1, name: 'Party Room' },
	{ id: 2, name: 'Gym' },
	{ id: 3, name: 'Meeting Room' },
	{ id: 4, name: 'Guest Parking' }
]

export const getUnitPayments = ( _mansionId ) => [
	{ unit: '101', resident: 'Tanaka Y.', amount: 125000, status: 'paid' },
	{ unit: '102', resident: 'Sato K.', amount: 125000, status: 'paid' },
	{ unit: '103', resident: 'Yamada H.', amount: 125000, status: 'pending' },
	{ unit: '201', resident: 'Suzuki M.', amount: 135000, status: 'paid' },
	{ unit: '202', resident: 'Watanabe T.', amount: 135000, status: 'overdue' }
]

export const getBuildingSettings = ( _mansionId ) => ( {
	name: 'Sakura Tower',
	address: 'Shibuya, Tokyo',
	totalUnits: 120,
	facilities: [
		{ id: 1, name: 'Swimming Pool', enabled: true, hours: '6:00 - 22:00' },
		{ id: 2, name: 'Gym', enabled: true, hours: '5:00 - 23:00' },
		{ id: 3, name: 'Party Room', enabled: true, hours: 'By reservation' },
		{ id: 4, name: 'Rooftop Garden', enabled: true, hours: '7:00 - 20:00' }
	]
} )

// Admin dashboard mock data
export const getBuildings = () => []

export const getUsers = () => []

export const getAdminMaintenanceRequests = () => []

export const getBuildingPayments = () => []
