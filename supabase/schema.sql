-- Kagi Building Management Portal - Supabase Schema
-- Run this in the Supabase SQL Editor to set up all tables, RLS, and triggers.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLES
-- =============================================================

-- 1. PROFILES (extends Supabase Auth users)
CREATE TABLE profiles (
	id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
	email TEXT UNIQUE NOT NULL,
	name TEXT,
	phone TEXT,
	unit TEXT,
	mansion_id UUID,
	avatar TEXT,
	role TEXT NOT NULL DEFAULT 'resident'
		CHECK (role IN ('admin', 'manager', 'mansion_admin', 'resident', 'landlord', 'guest')),
	permissions JSONB DEFAULT '[]'::jsonb,
	settings JSONB DEFAULT '{"theme": "light", "language": "en", "notifications": true}'::jsonb,
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MANSIONS (buildings)
CREATE TABLE mansions (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	name TEXT NOT NULL,
	address TEXT,
	total_units INTEGER DEFAULT 0,
	settings JSONB DEFAULT '{}'::jsonb,
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from profiles to mansions
ALTER TABLE profiles
	ADD CONSTRAINT fk_profiles_mansion
	FOREIGN KEY (mansion_id) REFERENCES mansions(id) ON DELETE SET NULL;

-- 3. FACILITIES
CREATE TABLE facilities (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	mansion_id UUID NOT NULL REFERENCES mansions(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	description TEXT,
	status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
	category TEXT,
	images JSONB DEFAULT '[]'::jsonb,
	capacity INTEGER,
	rules JSONB DEFAULT '[]'::jsonb,
	hours JSONB DEFAULT '{"open": "06:00", "close": "22:00"}'::jsonb,
	pricing JSONB DEFAULT '{"hourly": 0, "deposit": 0}'::jsonb,
	booking_type TEXT DEFAULT 'hourly' CHECK (booking_type IN ('hourly', 'half-day', 'full-day')),
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS
CREATE TABLE bookings (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
	creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	mansion_id UUID NOT NULL REFERENCES mansions(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	description TEXT,
	status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
	priority TEXT DEFAULT 'medium',
	tags JSONB DEFAULT '[]'::jsonb,
	start_date TIMESTAMPTZ NOT NULL,
	end_date TIMESTAMPTZ NOT NULL,
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MAINTENANCE REQUESTS
CREATE TABLE maintenance_requests (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	mansion_id UUID NOT NULL REFERENCES mansions(id) ON DELETE CASCADE,
	creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
	title TEXT NOT NULL,
	description TEXT,
	status TEXT DEFAULT 'pending'
		CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
	priority TEXT DEFAULT 'medium'
		CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
	tags JSONB DEFAULT '[]'::jsonb,
	category TEXT,
	location TEXT,
	images JSONB DEFAULT '[]'::jsonb,
	estimated_cost NUMERIC(10, 2),
	due_date TIMESTAMPTZ,
	completed_at TIMESTAMPTZ,
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BILLS
CREATE TABLE bills (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	mansion_id UUID NOT NULL REFERENCES mansions(id) ON DELETE CASCADE,
	assignee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	description TEXT,
	status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
	priority TEXT DEFAULT 'medium',
	tags JSONB DEFAULT '[]'::jsonb,
	amount NUMERIC(12, 2) NOT NULL,
	currency TEXT DEFAULT 'JPY',
	breakdown JSONB DEFAULT '{}'::jsonb,
	payment_methods JSONB DEFAULT '["bank_transfer", "credit_card"]'::jsonb,
	due_date TIMESTAMPTZ,
	paid_at TIMESTAMPTZ,
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DOCUMENTS
CREATE TABLE documents (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	mansion_id UUID NOT NULL REFERENCES mansions(id) ON DELETE CASCADE,
	creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	description TEXT,
	status TEXT DEFAULT 'active',
	category TEXT,
	tags JSONB DEFAULT '[]'::jsonb,
	file_type TEXT,
	file_size TEXT,
	pages INTEGER,
	storage_path TEXT,
	version TEXT DEFAULT '1.0',
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANNOUNCEMENTS
CREATE TABLE announcements (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	mansion_id UUID NOT NULL REFERENCES mansions(id) ON DELETE CASCADE,
	creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	description TEXT,
	status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published', 'scheduled', 'expired')),
	priority TEXT DEFAULT 'medium',
	tags JSONB DEFAULT '[]'::jsonb,
	expires_at TIMESTAMPTZ,
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS
CREATE TABLE notifications (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	type TEXT NOT NULL,
	title TEXT NOT NULL,
	message TEXT,
	read BOOLEAN DEFAULT FALSE,
	data JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX idx_profiles_mansion ON profiles(mansion_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_facilities_mansion ON facilities(mansion_id);
CREATE INDEX idx_bookings_facility ON bookings(facility_id);
CREATE INDEX idx_bookings_creator ON bookings(creator_id);
CREATE INDEX idx_bookings_mansion ON bookings(mansion_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_maintenance_mansion ON maintenance_requests(mansion_id);
CREATE INDEX idx_maintenance_creator ON maintenance_requests(creator_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_bills_assignee ON bills(assignee_id);
CREATE INDEX idx_bills_mansion ON bills(mansion_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_documents_mansion ON documents(mansion_id);
CREATE INDEX idx_announcements_mansion ON announcements(mansion_id);
CREATE INDEX idx_announcements_expires ON announcements(expires_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- =============================================================
-- TRIGGERS for updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON profiles
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_facilities_updated BEFORE UPDATE ON facilities
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_bookings_updated BEFORE UPDATE ON bookings
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_maintenance_updated BEFORE UPDATE ON maintenance_requests
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_bills_updated BEFORE UPDATE ON bills
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_documents_updated BEFORE UPDATE ON documents
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_announcements_updated BEFORE UPDATE ON announcements
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- Profile creation is handled in the app (SupabaseBackend._getProfile)
-- on first login, rather than via a trigger. This avoids RLS/permission
-- issues with triggers on auth.users.
-- =============================================================

-- =============================================================
-- ROW-LEVEL SECURITY
-- =============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mansions ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
	SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_mansion_id()
RETURNS UUID AS $$
	SELECT mansion_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY profiles_insert_own ON profiles
	FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY profiles_select_own ON profiles
	FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_select_mansion ON profiles
	FOR SELECT USING (
		mansion_id = get_user_mansion_id()
		AND get_user_role() IN ('admin', 'manager', 'mansion_admin')
	);
CREATE POLICY profiles_update_own ON profiles
	FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_update_mansion ON profiles
	FOR UPDATE USING (
		mansion_id = get_user_mansion_id()
		AND get_user_role() IN ('admin', 'manager', 'mansion_admin')
	);

-- MANSIONS
CREATE POLICY mansions_select ON mansions
	FOR SELECT USING (
		id = get_user_mansion_id()
		OR get_user_role() = 'admin'
	);
CREATE POLICY mansions_modify_admin ON mansions
	FOR ALL USING (get_user_role() = 'admin');

-- FACILITIES
CREATE POLICY facilities_select ON facilities
	FOR SELECT USING (
		mansion_id = get_user_mansion_id()
		OR get_user_role() = 'admin'
	);
CREATE POLICY facilities_insert ON facilities
	FOR INSERT WITH CHECK (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);
CREATE POLICY facilities_update ON facilities
	FOR UPDATE USING (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);
CREATE POLICY facilities_delete ON facilities
	FOR DELETE USING (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);

-- BOOKINGS
CREATE POLICY bookings_select_own ON bookings
	FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY bookings_select_mansion ON bookings
	FOR SELECT USING (
		mansion_id = get_user_mansion_id()
		AND get_user_role() IN ('manager', 'mansion_admin', 'admin')
	);
CREATE POLICY bookings_insert ON bookings
	FOR INSERT WITH CHECK (
		creator_id = auth.uid()
		AND mansion_id = get_user_mansion_id()
	);
CREATE POLICY bookings_update_own ON bookings
	FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY bookings_update_mansion ON bookings
	FOR UPDATE USING (
		mansion_id = get_user_mansion_id()
		AND get_user_role() IN ('manager', 'mansion_admin', 'admin')
	);
CREATE POLICY bookings_delete_own ON bookings
	FOR DELETE USING (creator_id = auth.uid());

-- MAINTENANCE REQUESTS
CREATE POLICY maintenance_select_own ON maintenance_requests
	FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY maintenance_select_mansion ON maintenance_requests
	FOR SELECT USING (
		mansion_id = get_user_mansion_id()
		AND get_user_role() IN ('manager', 'mansion_admin', 'admin')
	);
CREATE POLICY maintenance_insert ON maintenance_requests
	FOR INSERT WITH CHECK (
		creator_id = auth.uid()
		AND mansion_id = get_user_mansion_id()
	);
CREATE POLICY maintenance_update_own ON maintenance_requests
	FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY maintenance_update_mansion ON maintenance_requests
	FOR UPDATE USING (
		mansion_id = get_user_mansion_id()
		AND get_user_role() IN ('manager', 'mansion_admin', 'admin')
	);

-- BILLS
CREATE POLICY bills_select_own ON bills
	FOR SELECT USING (assignee_id = auth.uid());
CREATE POLICY bills_select_mansion ON bills
	FOR SELECT USING (
		mansion_id = get_user_mansion_id()
		AND get_user_role() IN ('manager', 'mansion_admin', 'admin')
	);
CREATE POLICY bills_insert_manager ON bills
	FOR INSERT WITH CHECK (
		get_user_role() IN ('manager', 'mansion_admin', 'admin')
	);
CREATE POLICY bills_update_manager ON bills
	FOR UPDATE USING (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);

-- DOCUMENTS
CREATE POLICY documents_select ON documents
	FOR SELECT USING (
		mansion_id = get_user_mansion_id()
		OR get_user_role() = 'admin'
	);
CREATE POLICY documents_insert ON documents
	FOR INSERT WITH CHECK (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);
CREATE POLICY documents_update ON documents
	FOR UPDATE USING (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);
CREATE POLICY documents_delete ON documents
	FOR DELETE USING (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);

-- ANNOUNCEMENTS
CREATE POLICY announcements_select ON announcements
	FOR SELECT USING (
		mansion_id = get_user_mansion_id()
		OR get_user_role() = 'admin'
	);
CREATE POLICY announcements_insert ON announcements
	FOR INSERT WITH CHECK (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);
CREATE POLICY announcements_update ON announcements
	FOR UPDATE USING (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);
CREATE POLICY announcements_delete ON announcements
	FOR DELETE USING (
		(mansion_id = get_user_mansion_id() AND get_user_role() IN ('manager', 'mansion_admin'))
		OR get_user_role() = 'admin'
	);

-- NOTIFICATIONS
CREATE POLICY notifications_select ON notifications
	FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update ON notifications
	FOR UPDATE USING (user_id = auth.uid());

-- =============================================================
-- STORAGE BUCKETS (run in Supabase Dashboard > Storage)
-- =============================================================
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES
-- 	('kagi-files', 'kagi-files', true, 52428800,
-- 	 ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
-- 	('kagi-avatars', 'kagi-avatars', true, 5242880,
-- 	 ARRAY['image/jpeg', 'image/png', 'image/webp']);
