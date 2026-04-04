# Airtable Schema Audit & Migration Plan

## Based on Analysis of 10+ Bases (April 2026)

---

## 1. The Core Problem: Copy-Paste Syndrome

Your system's biggest issue is not missing automation -- it's that **Main Records data has been manually copy-pasted into at least 6 secondary bases as plain text**. These are not Airtable synced tables. They are frozen snapshots that drift from the source immediately.

### Where the copies live

| Base | Table | What it copies | Link type |
|---|---|---|---|
| Strengthening Ministry | Grantees | Institutions from Main Records | Plain text (dead copy) |
| Strengthening Ministry | Grant Data | Grants from Main Records | Plain text (dead copy) |
| Strengthening Comms | Coordination Program | Institutions from Main Records | Plain text (dead copy) |
| Office Management | Institutions | Institutions from Main Records | Plain text (dead copy) |
| Office Management | Contacts | Contacts from Main Records | Plain text (dead copy) |
| IM: Young Adults | Summary | Institutions from Main Records | Plain text (dead copy) |
| IM: Young Adults | Grants | Grants from Main Records | Plain text (dead copy) |
| 2024 Annual Gathering | Grantee Invite List | Institutions from Main Records | Plain text (dead copy) |
| 2024 Annual Gathering | Connection Calls Invite List | Institutions from Main Records | Plain text (dead copy) |
| 2024 Annual Reports | Co Pro Grants | Grants from Main Records | Plain text (dead copy) |

**Every one of these should be replaced with an Airtable Sync** from Main Records. That alone eliminates the biggest source of stale data in your system.

---

## 2. Form Tables Creating Island Data

You have **25+ tables** across bases that collect contact information (name, email, institution) via forms but have **zero connection** back to Main Records. Each is an island.

### High-priority form tables (collect contact info independently)

**Strengthening Ministry base:**
- Webinar RSVPs (First Name, Last Name, Email, Organization)
- Connection Calls (First Name, Last Name, Email, Organization)
- Hispanic/Latino Leaders Group (Nombre, Apellido, Email, Organizacion)
- Stories (Name, Email, Institution, Role)
- Introductory Call with New Grantees (First Name, Last Name, Email, Organization)
- 2.2 Nurturing Resubmission Calls (First Name, Last Name, Email, Organization)
- 2025 Annual Report Reader (Name, Email, Phone)
- Podcast (Name, Email, Institution)
- Affinity Group Questionnaire (Name, Email, Institution)
- Affinity Group Pilot (Name, Email, Institution)
- S&S Info Call (First Name, Last Name, Email, Organization)

**IM: Young Adults base:**
- 24 Hatchathon Registration (First Name, Last Name, Email, Phone)
- Story Slam 2025 (First Name, Last Name, Email, Phone)
- Phase 1 Applications (Church Name, Email, Phone)
- Fellows Application (Contact Name, Email, Phone, Church)
- Coaching Call Requests (Contact Name, Email, Church)
- Grant Reports (Church Name, Contact Name)

**Office Management base:**
- Imaginarium Reimbursements (Name, Email, Address)
- Co Pro Reimbursements (Name, Email, Address)
- Stipend Payments (Name, Email, Address)
- Grant Agreement Submissions (Name, Email, Organization)
- Annual Gathering Speaker Honorarium List (Name, Email, Institution)

**2024/2025 Annual Gathering bases:**
- Attendee Registration (Name, Email, Phone, Organization)
- Speaker/Consultant Registration (Name, Email, Institution)
- Connection Calls Registration (Name, Email, Institution)

**Resource Hubs base:**
- Feb 2026 Gathering (Name, Email, Institution)

### What this means

Every time someone fills out one of these forms, their info exists only in that table. If the same person fills out 3 forms across 2 bases, you now have 3 independent records with no link between them and no link to Main Records.

---

## 3. Main Records Issues to Fix First

### 3.1 Missing Stable IDs (CRITICAL)

Neither Contacts nor Institutions has a `RECORD_ID()` field.

**Current state:**
- `Institution ID` = `CONCATENATE({Institution Name, Common})` -- this changes if the name changes
- Contacts has no ID field at all (only `Auto` autonumber and the `Contact Name` formula)

**Fix:**
```
Contacts table:    Add field "ContactID" → Formula: RECORD_ID()
Institutions table: Add field "InstitutionID" → Formula: RECORD_ID()
```

Also add to Contacts:
```
"Match Key" → Formula: LOWER(TRIM({Email - primary}))
```

### 3.2 Broken Roles Table

The Roles table in Main Records is disconnected. The `Contact` field is **plain text**, not a link to the Contacts table. Multiple lookup and rollup fields show `isValid: false` because the link fields they depend on were deleted.

**Options:**
1. **Rebuild**: Create a proper link field to Contacts, re-map the lookups/rollups
2. **Retire**: Move role data into the Contacts table `Role` field (which already exists as multipleSelects) and delete the Roles table

**Recommendation:** Option 2. The Contacts table already has a `Role` field. The separate Roles table adds complexity without clear value, especially since its link is broken.

### 3.3 Data Quality in Select Fields

These need cleanup before any sync or automation will work reliably:

**Institutions > State field** contains junk:
- `"ub"`, `"in"` -- meaningless abbreviations
- `"DC"`, `"NC"`, `"TX"`, `"TN"`, `"OH"`, `"CO"`, `"CA"` -- abbreviations mixed with full names

**Institutions > State Abbrev field** contains junk:
- `"Colorado Springs"`, `"Santa Ana"`, `"Fresno"` -- cities, not states
- `"60187"` -- a zip code

**Contacts > State Abbrev** contains:
- `"46928"` -- a zip code

**Contacts > Suffix** contains:
- `"austin@arisechurches.com"`, `"kevin.duecker@piercechurch.org"` -- email addresses

**Institutions > Denominational Affiliation** contains:
- `"worth"`, `"epic"`, `"4th"` -- form entry errors promoted to select options

**Recommended approach:** Create a cleanup view for each table, filter to these junk values, fix the records, then delete the bad options from the select field configuration.

### 3.4 Redundant Denomination Fields

You have denomination data in 4+ places:

| Table | Field | Type |
|---|---|---|
| Institutions | Institutional Denominational Family | singleSelect (broad categories) |
| Institutions | Institution Denominational Affiliation | singleSelect (specific bodies) |
| Contacts | Denominational Family | singleSelect (broad categories) |
| Contacts | Denominational List | multipleSelects (specific bodies) |

The options across these fields are inconsistent (e.g., "Catholic" vs "Catholic Church" vs "Roman Catholic" vs "Jesuit Catholic").

**Recommendation:** Standardize to two fields per entity:
- `Denominational Family` (broad: Baptist, Methodist, Catholic, etc.)
- `Denominational Affiliation` (specific body: American Baptist Churches USA, etc.)

Align the options across Contacts and Institutions tables.

### 3.5 Duplicate/Orphan Fields

Fields that appear to be leftover experiments or broken:

| Table | Field | Issue |
|---|---|---|
| Contacts | Table 10 | Meaningless name, singleLineText |
| Grants | Temp Inst. | Temporary field never cleaned up |
| Grants | Institutions copy (x2) | Two identically named singleLineText fields |
| Grants | Project Website copy | Duplicate of Project Website |
| Grants | Contacts 2 | Duplicate link to Contacts (in addition to Contacts lookup) |
| Programs | Reimbursements copy | Duplicate |
| Programs | Invoice Payments 2 | Duplicate |
| Programs | Institutions copy | Duplicate |
| Institutions | Invoice Payments, Vendors | Plain text, not links |
| Roles | Field 16 | Unnamed lastModifiedTime |
| Attendance | Field 14 | Unnamed singleLineText |

---

## 4. Base-by-Base Classification

### Tier 1: Must Connect to Main Records (high contact/institution overlap)

| Base | Why | Priority |
|---|---|---|
| **Strengthening Ministry** | Largest secondary base, 20+ tables, heavy form intake, has its own Grantees copy | Highest |
| **Office Management** | Handles reimbursements/stipends for contacts in Main Records, has its own Contacts/Institutions copies | High |
| **IM: Young Adults** | Event registrations, applications, has its own Summary/Grants copies | High |
| **2025 Annual Gathering** | Active event, attendee registration needs Main Records link | High |

### Tier 2: Should Connect (moderate overlap)

| Base | Why | Priority |
|---|---|---|
| **Strengthening Comms Grants** | MicroGrants applications reference institutions, has Coordination Program copy | Medium |
| **Observe & Discern Grants** | Application forms reference institutions and contacts | Medium |
| **2024 Annual Reports** | Has Co Pro Grants copy, assignment tracking by institution | Medium |
| **Resource Hubs** | Currently tiny (1 table), but will grow | Medium |

### Tier 3: Standalone OK (minimal entity overlap)

| Base | Why | Priority |
|---|---|---|
| **Resource Store** | Product inventory, not entity-centric | Low |
| **2024 Annual Gathering** | Historical event, read-only going forward | Archive |
| **Old Imaginarium Bases** | Archive candidates | Archive |

---

## 5. Concrete Migration Plan

### Phase 0: Stabilize Main Records (Week 1)

Do these before touching any other base:

1. **Add `ContactID` field** to Contacts: Formula `RECORD_ID()`
2. **Add `InstitutionID` field** to Institutions: Formula `RECORD_ID()`
3. **Add `Match Key` field** to Contacts: Formula `LOWER(TRIM({Email - primary}))`
4. **Add `Created Via` field** to Contacts: Single select with options: Manual, Form Import, Automation, Historical
5. **Clean State/Suffix junk values** (see Section 3.3)
6. **Delete or archive orphan fields** (see Section 3.5)
7. **Decide on Roles table**: retire or rebuild

### Phase 1: Replace Copy-Paste Tables with Syncs (Weeks 2-3)

For each base in Tier 1, replace the dead-copy tables:

**Strengthening Ministry base:**
1. Set up Airtable Sync: Main Records > Institutions → Synced: Institutions
   - Sync fields: InstitutionID, Institution Name Common, Institution Name Legal, City, State, Institution Type, Denominational Affiliation
2. In the Grantees table, add a link field to Synced: Institutions
3. Migrate: for each Grantee record, link it to the matching synced institution (match on Institution Name, Common)
4. Once verified, hide/delete the old plain-text fields

**Repeat for:** Office Management, IM: Young Adults, 2025 Annual Gathering

### Phase 2: Build Intake Queue for Highest-Volume Forms (Weeks 3-4)

Start with the forms that generate the most new contacts:

1. **Strengthening Ministry > Introductory Call with New Grantees** (already has a "Main Records" checkbox -- this shows the manual process exists)
2. **2025 Annual Gathering > Attendee Registration**
3. **Office Management > Grant Agreement Submissions**

For each:
1. Add Intake Queue table to the base (see schema in main architecture doc)
2. Build Make.com scenario: trigger on new record → search Main Records by email → match or create → link back
3. Test with 5-10 real submissions before going live

### Phase 3: Connect Remaining Form Tables (Weeks 5-8)

Work through the remaining 20+ form tables in priority order. Not every table needs its own Make scenario -- tables that share a base can share one intake flow:

- **Strengthening Ministry**: One Make scenario handles Webinar RSVPs, Connection Calls, S&S Info Calls (all have First Name + Last Name + Email + Organization)
- **IM: Young Adults**: One scenario handles Hatchathon Registration, Story Slam, Fellows Application
- **Office Management**: One scenario handles all three reimbursement tables + Stipend Payments

### Phase 4: Ongoing Governance (Permanent)

1. **New form rule**: Any new form in any base must either link to a Synced: Contacts table or route through an Intake Queue
2. **Weekly dedup check**: Make scenario scans Main Records Contacts for duplicate Match Key values
3. **Monthly sync audit**: Verify all synced tables are still active and field mappings haven't broken
4. **Documentation**: Maintain a registry of all Make scenarios, which bases they touch, which fields they read/write

---

## 6. What NOT to Migrate

Some tables should stay standalone. Don't over-connect:

- **Hatchathon Meals** (IM: Young Adults) -- operational, ephemeral
- **Packing List** (Annual Gathering) -- internal checklist
- **Tshirt form** (IM: Young Adults) -- one-off
- **Resource Inventory** (Resource Store) -- product data, not entity data
- **Baseline Data** (Strengthening Ministry) -- aggregate statistics, not per-contact
- **Network Mapping** (Strengthening Ministry) -- survey data with highly denormalized schema (Partner 1-10 pattern); leave as-is until a redesign

---

## 7. The Update Requests Table -- You Already Built an Intake Queue

The `Update Requests` table in Main Records is essentially a proto-intake queue. It collects:
- New contact info (First Name, Last Name, Email, Phone, Address)
- New institution info (Name, Website, Address)
- Update types (Add Contact, Remove Contact, Update Institution)
- Processing status (New, In Progress, Completed)

**This is the right instinct.** The problem is it's manual -- someone has to read each submission and manually update Main Records.

**Recommendation:** Keep this table but automate it:
1. For "Add New Contact" submissions: auto-run the matching logic (search by email, create if not found)
2. For "Update Institution" submissions: auto-update the linked institution record
3. For "Remove Contact": flag for human review (never auto-delete)

This table should become your **primary write-back channel** from grantees to Main Records.

---

## 8. Quick Reference: What Changes Where

### Main Records (add these fields)

| Table | New Field | Type | Formula |
|---|---|---|---|
| Contacts | ContactID | Formula | `RECORD_ID()` |
| Contacts | Match Key | Formula | `LOWER(TRIM({Email - primary}))` |
| Contacts | Created Via | Single select | Manual, Form Import, Automation, Historical |
| Institutions | InstitutionID | Formula | `RECORD_ID()` |

### Every Tier 1-2 Secondary Base (add these tables)

| Table to Add | Purpose |
|---|---|
| Synced: Institutions | Read-only sync from Main Records |
| Synced: Contacts | Read-only sync from Main Records (if base collects contact data) |
| Intake Queue | Processing buffer for form submissions |

### Every Tier 1-2 Secondary Base (remove/replace)

| Current Table | Action |
|---|---|
| Plain-text copies of Institutions | Replace with link to Synced: Institutions |
| Plain-text copies of Contacts | Replace with link to Synced: Contacts |
| Plain-text copies of Grants | Replace with Airtable Sync from Main Records > Grants |
