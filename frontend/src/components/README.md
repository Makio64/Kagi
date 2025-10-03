# Component Organization Guide

Clean, simple structure: **Generic** vs **Project-Specific**

---

## 📁 Structure Overview

```
components/
├── ui/         → 🌐 Project-agnostic (copy to ANY project)
├── core/       → 🌐 Generic UI components
├── form/       → 🌐 Generic form controls
└── kagi/       → 🔑 Kagi-specific (everything for THIS project)
```

---

## 🌐 Generic Components (Portable)

### `ui/` - Visual Effects & Animations
**100% project-agnostic** - Copy to any project
- `BurgerButton.vue` - Hamburger menu button
- `Spinner.vue` - Loading spinner
- `ProgressBar.vue` - Progress indicator
- `ButtonFX.vue` - Button with effects
- `GradientButton.vue` - Gradient button
- `SVGCircle.vue` - SVG circle component
- `ImgNext.vue` - Advanced image component

### `core/` - Base UI Kit
**Generic UI components** - Reusable across projects
- `KButton.vue` - Button component with variants
- `KCard.vue` - Card container
- `KModal.vue` - Modal dialog
- `KTable.vue` - Basic table
- `KDataTable.vue` - Advanced data table with sorting/filtering
- `KToast.vue` - Toast notifications
- `StatusBadge.vue` - Status indicator badges

### `form/` - Form Controls
**Generic form inputs** - Reusable forms
- `KInput.vue` - Text input
- `KSelect.vue` - Dropdown select
- `KCheckbox.vue` - Checkbox
- `KRadio.vue` - Radio button
- `KSwitch.vue` - Toggle switch
- `KTextarea.vue` - Multi-line text input

---

## 🔑 Kagi-Specific Components

Everything in `kagi/` is specific to this application.

### `kagi/layout/` - App Layouts
Application-wide layout components:
- `DashboardLayout.vue` - Main dashboard wrapper
- `DashboardHeader.vue` - Dashboard header
- `DashboardSidebar.vue` - Navigation sidebar
- `DashboardContainer.vue` - Content container

### `kagi/navigation/` - Navigation
Application navigation:
- `DesktopMenu.vue` - Desktop navigation
- `MobileMenu.vue` - Mobile navigation

### `kagi/dashboard/` - Dashboard Components
Reusable dashboard UI elements:
- `StatCard.vue` - Statistics cards
- `SectionHeader.vue` - Section headers
- `DashboardSection.vue` - Section wrapper
- `DashboardNavigation.vue` - Dashboard nav
- `FormSection.vue` - Form sections
- `MobileSettingsMenu.vue` - Mobile settings

### `kagi/admin/` - Admin Dashboard
System administrator components:
- `AdminOverviewSection.vue` - Admin overview

### `kagi/mansion/` - Mansion Admin
Building manager components:
- `ResidentsSection.vue` - Residents management
- `MaintenanceRequestsSection.vue` - Maintenance requests

### `kagi/resident/` - Resident Portal
Resident dashboard components:
- `BookingsSection.vue` - Facility bookings
- `ProfileSection.vue` - User profile
- `MaintenanceSection.vue` - Maintenance view

### `kagi/shared/` - Shared Features
Features used across multiple roles:

#### `shared/bills/`
- `BillDetails.vue` - Bill detail view

#### `shared/contacts/`
- `ContactManager.vue` - Contact management
- `EmergencyContacts.vue` - Emergency contacts

#### `shared/documents/`
- `DocumentViewer.vue` - Document viewer

#### `shared/events/`
- `EventDetails.vue` - Event details

#### `shared/facilities/`
- `FacilityBooking.vue` - Booking interface

#### `shared/brand/`
- `KagiLogo.vue` - App logo
- `LanguageSwitcher.vue` - Language switcher
- `EmailPopup.vue` - Email dialog
- `DashboardCard.vue` - Generic card

---

## 🎯 Decision Tree

**Where should my component go?**

```
Is it 100% generic (no Kagi-specific logic)?
├─ YES → Is it a visual effect/animation?
│         ├─ YES → ui/
│         └─ NO → Is it a form control?
│                 ├─ YES → form/
│                 └─ NO → core/
│
└─ NO (Has Kagi-specific logic)
          → kagi/
            ├─ Used only by admins? → kagi/admin/
            ├─ Used only by mansion admins? → kagi/mansion/
            ├─ Used only by residents? → kagi/resident/
            ├─ Used across roles? → kagi/shared/
            ├─ Layout/structure? → kagi/layout/
            ├─ Navigation? → kagi/navigation/
            └─ Dashboard UI? → kagi/dashboard/
```

## ✅ Best Practices

### 1. **Keep Generic Components Clean**
- `ui/`, `core/`, `form/` should have **zero** Kagi-specific imports
- Test: "Can I copy this to another project?" → If yes, it's generic

### 2. **Component Naming**
- Generic: `K` prefix (KButton, KCard)
- Kagi-specific: Descriptive names (ResidentsSection, AdminOverviewSection)

### 3. **Auto-Import**
- All components auto-import via `unplugin-vue-components`
- No manual imports needed in most cases

### 4. **Single Responsibility**
- Each component = ONE thing
- If > 200 lines, consider extracting sections

### 5. **Role-Based Organization**
- Components used by ONE role → Put in that role's folder
- Components shared across roles → `kagi/shared/`

---

## 📊 Statistics

```
Generic (Portable):
├── ui/     7 components
├── core/   7 components
└── form/   6 components
Total:      20 components ← Copy to any project!

Kagi-Specific:
└── kagi/   28 components ← Project-specific
```

---

## 🔄 Migration History

**Recent Reorganization:**
1. Created `kagi/` folder for all project-specific code
2. Moved `layout/` → `kagi/layout/`
3. Moved `navigation/` → `kagi/navigation/`
4. Moved `dashboard/` → `kagi/dashboard/`
5. Split `sections/` by user role → `kagi/{admin,mansion,resident}/`
6. Merged `features/` → `kagi/shared/`
7. Removed old folders (mansion/, sections/, features/)

**Result:**
- ✅ Clear separation: generic vs project-specific
- ✅ Role-based organization (matches user roles)
- ✅ Easy to find components by purpose
- ✅ Clean, portable `ui/` folder
- ✅ Zero root-level components
