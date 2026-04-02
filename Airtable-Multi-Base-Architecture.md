# Airtable Multi-Base Architecture

## System Design for Cross-Base Data Integrity

---

## 1. Mental Model: Source of Truth vs. Application Layer

The single most important concept in this architecture is the **separation between canonical data and operational data**.

### Main Records = The Registry

Main Records is **not** an application. It does not run workflows, manage pipelines, or handle form submissions. It is a **registry** -- the canonical list of entities that exist in your system.

Main Records owns:

| Entity | Why it lives here |
|---|---|
| **Contacts** | A person exists once. Period. Every base that references a person points back here. |
| **Institutions** | An institution exists once. Every program, resource, or engagement references it from here. |
| **Contact-Institution Relationships** | The canonical mapping of who belongs where. |
| **Global Tags / Categories** | Controlled vocabularies shared across bases (e.g., contact types, institution categories). |

Main Records does **not** own:

- Form submissions (that's intake, handled by application bases)
- Engagement logs, program enrollments, resource assignments (those are operational)
- Workflow statuses, pipeline stages, task assignments (those are application-specific)

### Secondary Bases = Application Layers

Each secondary base (e.g., Resource Hubs) is an **application** that consumes canonical data and produces operational data. It owns its own workflows but borrows its entities.

Think of it this way:

```
Main Records = "Who exists"
Resource Hubs = "What they're doing in this context"
```

### The Rule

> **If deleting a secondary base would mean losing the fact that a person or institution exists, your architecture is broken.**

Every secondary base should be deletable (in theory) without losing core entity data. You'd lose operational history, but never the registry.

---

## 2. Architecture Design

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     MAIN RECORDS                        │
│                  (Source of Truth)                       │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Contacts │  │ Institutions │  │ Contact-Inst Map │  │
│  │          │  │              │  │                  │  │
│  │ RecordID │  │ RecordID     │  │ ContactID        │  │
│  │ Email    │  │ Name         │  │ InstitutionID    │  │
│  │ Name     │  │ Domain       │  │ Role             │  │
│  └────┬─────┘  └──────┬───────┘  └──────────────────┘  │
│       │               │                                  │
│       │  ┌────────────┘                                  │
│       │  │  Airtable Sync (read-only)                    │
└───────┼──┼──────────────────────────────────────────────┘
        │  │
        ▼  ▼
┌──────────────────────────────────────────────────────────┐
│                   RESOURCE HUBS                           │
│                 (Application Layer)                        │
│                                                           │
│  ┌──────────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ Synced:      │  │ Intake   │  │ Resources /       │   │
│  │ Contacts(RO) │  │ Queue    │  │ Engagements       │   │
│  │              │  │          │  │                   │   │
│  │ RecordID     │  │ Raw Name │  │ Local Contact Ref │   │
│  │ Email        │  │ Raw Email│  │ Program           │   │
│  │ Name         │  │ Status   │  │ Status            │   │
│  └──────────────┘  └────┬─────┘  └───────────────────┘   │
│                         │                                  │
│              ┌──────────┘                                  │
│              ▼                                             │
│  ┌─────────────────────┐                                  │
│  │ Make/Zapier         │                                  │
│  │ Automation Layer    │◄──── Matching + Creation Logic   │
│  └─────────────────────┘                                  │
└──────────────────────────────────────────────────────────┘
```

### 2.2 The Four Stages

Every piece of data entering the system moves through exactly four stages:

#### Stage 1: Intake

A form submission lands in the **Intake Queue** table of the secondary base. This is raw, unvalidated data. It is never directly linked to anything.

#### Stage 2: Match

An automation (Make scenario or Zapier zap) searches Main Records for an existing contact using matching logic (see Section 3).

#### Stage 3: Create or Skip

- **Match found**: The automation grabs the canonical `RecordID` from Main Records.
- **No match found**: The automation creates a new record in Main Records, then grabs the new `RecordID`.

#### Stage 4: Link

The automation writes the canonical `RecordID` back into the Intake Queue record (or directly into the operational table) in the secondary base, linking it to the synced read-only copy of the contact.

---

## 3. Matching Logic

This is where most multi-base systems fail. You need a deterministic, tiered matching strategy.

### Matching Priority

```
Priority 1: Email (exact, case-insensitive)
Priority 2: Full Name + Institution (fuzzy)
Priority 3: Phone Number (normalized, digits only)
Priority 4: No match → Create new record
```

### Why Email First

Email is the only field that is:
- Globally unique (in practice)
- User-provided (not system-generated)
- Present on virtually every form

### Matching Implementation (Make Scenario)

```
Trigger: New record in Intake Queue (status = "Pending")
    │
    ▼
Step 1: Search Main Records > Contacts
        WHERE Email = {Intake.Email} (case-insensitive)
    │
    ├── Found → Set variable: MatchedRecordID
    │
    └── Not Found →
            Step 2: Search by Name + Institution
            │
            ├── Found → Set variable: MatchedRecordID
            │           Flag for human review (Status = "Review Match")
            │
            └── Not Found →
                    Step 3: Create new Contact in Main Records
                            Set variable: MatchedRecordID = new record ID
                            Set Intake Status = "New Contact Created"
```

### Critical Detail: Fuzzy Name Matching

Do **not** rely on exact name matching. People write "Bob Smith", "Robert Smith", "robert smith", "Bob smith Jr." Use these rules:

- Normalize: lowercase, trim whitespace, strip titles (Mr., Dr., etc.)
- Compare: first name + last name separately
- Threshold: if first name matches AND last name matches AND institution matches, treat as likely match but **flag for review**

For Make.com, use the `Text > Lower` and `Text > Trim` functions. For more advanced fuzzy matching, use a custom Make HTTP module calling a simple string-similarity API or a Google Apps Script webhook.

---

## 4. Recommended Schema

### 4.1 Main Records Base

#### Table: Contacts

| Field | Type | Purpose |
|---|---|---|
| `ContactID` | Formula: `RECORD_ID()` | Immutable unique identifier. This is the cross-base key. |
| `Email` | Email (unique) | Primary matching field |
| `First Name` | Single line text | |
| `Last Name` | Single line text | |
| `Full Name` | Formula: `{First Name} & " " & {Last Name}` | Display convenience |
| `Phone` | Phone number | Secondary matching field |
| `Contact Type` | Single select | Person, Organization Rep, etc. |
| `Institutions` | Link to Institutions | Many-to-many via junction |
| `Created Via` | Single select | Manual, Form: Resource Hub, Import, API |
| `Created Date` | Created time | Audit trail |
| `Last Modified` | Last modified time | Audit trail |
| `Match Key` | Formula: `LOWER(TRIM({Email}))` | Normalized matching anchor |

#### Table: Institutions

| Field | Type | Purpose |
|---|---|---|
| `InstitutionID` | Formula: `RECORD_ID()` | Cross-base key |
| `Name` | Single line text | |
| `Domain` | URL | For email-domain matching |
| `Type` | Single select | University, Nonprofit, Government, etc. |
| `Contacts` | Link to Contacts | Via junction table |
| `Created Date` | Created time | |

#### Table: Contact-Institution Map (Junction)

| Field | Type | Purpose |
|---|---|---|
| `Contact` | Link to Contacts | |
| `Institution` | Link to Institutions | |
| `Role` | Single line text | Their role at this institution |
| `Status` | Single select | Active, Former, Unknown |

### 4.2 Resource Hubs Base

#### Table: Synced Contacts (Read-Only Sync from Main Records)

| Field | Type | Notes |
|---|---|---|
| `ContactID` | Synced | **This is your join key** |
| `Email` | Synced | |
| `Full Name` | Synced | |
| `Contact Type` | Synced | |

Sync only the fields you need. Do not sync everything.

#### Table: Synced Institutions (Read-Only Sync from Main Records)

| Field | Type | Notes |
|---|---|---|
| `InstitutionID` | Synced | Join key |
| `Name` | Synced | |
| `Type` | Synced | |

#### Table: Intake Queue

| Field | Type | Purpose |
|---|---|---|
| `Submission ID` | Autonumber | Local reference |
| `Raw Email` | Email | As submitted, unmodified |
| `Raw First Name` | Single line text | As submitted |
| `Raw Last Name` | Single line text | As submitted |
| `Raw Institution` | Single line text | As submitted |
| `Matched ContactID` | Single line text | Written by automation after matching |
| `Matched Contact` | Link to Synced Contacts | Set by automation after matching |
| `Match Type` | Single select | Exact Email, Name+Inst, New, Manual Review |
| `Processing Status` | Single select | Pending, Matched, Created, Review, Error |
| `Processed Date` | Date | When automation ran |
| `Notes` | Long text | For review notes |

#### Table: Resources (or Programs, Engagements, etc.)

| Field | Type | Purpose |
|---|---|---|
| `Resource ID` | Autonumber | |
| `Contact` | Link to Synced Contacts | The canonical link |
| `Institution` | Link to Synced Institutions | The canonical link |
| `Program` | Single select | |
| `Status` | Single select | Application-specific statuses |
| `Enrolled Date` | Date | |
| (other workflow-specific fields) | | |

### 4.3 Naming Conventions

| Convention | Example | Why |
|---|---|---|
| Tables: PascalCase, plural | `Contacts`, `Intake Queue` | Airtable standard |
| Fields: Title Case | `First Name`, `Created Date` | Readability |
| IDs: `{EntityName}ID` | `ContactID`, `InstitutionID` | Instantly recognizable as a key |
| Synced tables: prefix with `Synced:` | `Synced: Contacts` | Immediately obvious it's read-only |
| Raw intake fields: prefix with `Raw` | `Raw Email`, `Raw First Name` | Distinguishes unvalidated input from canonical data |
| Automation-written fields: document in description | `Matched ContactID` (desc: "Set by Make scenario") | So collaborators don't manually edit them |

---

## 5. Sync Strategy and Tradeoffs

### One-Way Sync (Recommended Default)

```
Main Records ──sync──▶ Resource Hubs (read-only)
```

**How it works**: Airtable's native sync feature pushes selected fields from Main Records into secondary bases as read-only mirror tables.

| Pro | Con |
|---|---|
| Zero configuration drift | Cannot write back to Main Records from the synced table |
| Clear data ownership | Sync can lag by a few minutes |
| No conflict resolution needed | Must use automation (Make/Zapier) to write back |
| Native Airtable, no external tools | Synced tables cannot be linked to other synced tables |

### Simulated Two-Way Sync (Use Sparingly)

```
Main Records ◄──Make/Zapier──► Resource Hubs
```

**How it works**: Automations watch for changes in both directions and propagate updates.

| Pro | Con |
|---|---|
| Feels like a unified database | Conflict resolution is your problem |
| Users can edit in either base | Race conditions if two edits happen simultaneously |
| More flexible | Significantly more complex to build and maintain |
| | Debugging failures requires understanding the full automation chain |

### My Recommendation

**Use one-way sync for entity data (contacts, institutions). Use automations only for the write-back path (intake processing).** Do not attempt full two-way sync unless you have a specific, validated use case that cannot be solved by directing users to edit in Main Records.

The moment you implement two-way sync on core entity fields (name, email, etc.), you've created two sources of truth. That defeats the entire purpose.

---

## 6. Common Failure Points and Prevention

### Failure 1: Duplicate Contacts

**Cause**: Form submissions create new records without checking for existing matches.

**Prevention**: Every form submission goes through the Intake Queue. Nothing writes directly to Main Records except the matching automation.

**Detection**: Weekly automation that searches Main Records for duplicate emails and flags them.

### Failure 2: Orphaned Records

**Cause**: A record exists in Resource Hubs but has no corresponding entry in Main Records (the `Matched ContactID` field is empty).

**Prevention**: The Intake Queue's `Processing Status` field. Nothing moves from Intake Queue to an operational table until status = "Matched" or "Created".

**Detection**: View in Resource Hubs filtered to `Matched ContactID is empty` AND `Processing Status != Pending`.

### Failure 3: Sync Lag Confusion

**Cause**: A new contact is created in Main Records by the automation, but the synced table in Resource Hubs hasn't updated yet. The automation tries to link to a synced record that doesn't exist yet.

**Prevention**: After creating a new contact in Main Records, add a **2-3 minute delay** in the Make scenario before attempting to link in the secondary base. Alternatively, write the `ContactID` as plain text first, then run a separate scheduled scenario that resolves text IDs to synced record links.

### Failure 4: Field Mismatch After Schema Changes

**Cause**: Someone renames or removes a field in Main Records. The sync breaks silently or the automation fails.

**Prevention**:
- Lock synced field names with a naming convention (prefix `Synced:`)
- Document every field that is referenced by an automation
- Use Airtable's field descriptions to note "Used by Make scenario: Contact Matching"
- Test automations after any schema change

### Failure 5: Manual Edits to Automation-Managed Fields

**Cause**: A collaborator manually edits `Matched ContactID` or `Processing Status` in the Intake Queue, breaking the automation's assumptions.

**Prevention**:
- Use field-level permissions (Airtable Pro/Enterprise) to lock automation-managed fields
- If permissions aren't available, add a `Locked` checkbox and train collaborators
- Color-code or group automation-managed fields in the table view

### Failure 6: Automation Failures Go Unnoticed

**Cause**: A Make scenario fails (API rate limit, field type mismatch, etc.) and no one notices for days. Records pile up in Intake Queue unprocessed.

**Prevention**:
- Make.com: Enable error notifications (email or Slack)
- Create a dashboard view in the Intake Queue: filter `Processing Status = Pending` AND `Created Date < 1 day ago`
- Weekly manual audit of the Intake Queue

---

## 7. Step-by-Step Flow: New Form Submission

Here is the complete lifecycle of a single form submission, from the moment someone clicks "Submit" to a fully linked, canonical record.

```
Step 1: SUBMISSION
────────────────────────────────────────────────
User fills out form in Resource Hubs base.
Airtable form creates a new record in Intake Queue.

  Intake Queue record:
    Raw Email: "jane.doe@university.edu"
    Raw First Name: "Jane"
    Raw Last Name: "Doe"
    Raw Institution: "State University"
    Processing Status: "Pending"
    Matched ContactID: (empty)
    Match Type: (empty)

Step 2: TRIGGER
────────────────────────────────────────────────
Make.com scenario triggers on:
  "New record in Intake Queue WHERE Processing Status = Pending"

Step 3: NORMALIZE
────────────────────────────────────────────────
Make normalizes the raw input:
  Normalized Email: "jane.doe@university.edu" (lowercased, trimmed)
  Normalized First: "jane"
  Normalized Last: "doe"

Step 4: SEARCH (Email Match)
────────────────────────────────────────────────
Make searches Main Records > Contacts:
  WHERE Match Key = "jane.doe@university.edu"

  Result A: FOUND → Go to Step 6a
  Result B: NOT FOUND → Go to Step 5

Step 5: SEARCH (Name + Institution Match)
────────────────────────────────────────────────
Make searches Main Records > Contacts:
  WHERE LOWER(First Name) = "jane"
    AND LOWER(Last Name) = "doe"

  Result A: FOUND, and institution matches → Go to Step 6b
  Result B: NOT FOUND → Go to Step 6c

Step 6a: EXACT MATCH
────────────────────────────────────────────────
Set Matched ContactID = existing record's ContactID
Set Match Type = "Exact Email"
Set Processing Status = "Matched"
→ Go to Step 7

Step 6b: FUZZY MATCH (Needs Review)
────────────────────────────────────────────────
Set Matched ContactID = existing record's ContactID
Set Match Type = "Name+Inst (Review)"
Set Processing Status = "Review"
→ STOP. Human reviews before proceeding.

Step 6c: NO MATCH (Create New)
────────────────────────────────────────────────
Make creates a new record in Main Records > Contacts:
  Email: "jane.doe@university.edu"
  First Name: "Jane" (original casing)
  Last Name: "Doe"
  Created Via: "Form: Resource Hub"

Wait 2-3 minutes for sync propagation.

Set Matched ContactID = new record's ContactID
Set Match Type = "New"
Set Processing Status = "Created"
→ Go to Step 7

Step 7: LINK
────────────────────────────────────────────────
Make searches Synced: Contacts in Resource Hubs:
  WHERE ContactID = {Matched ContactID}

Links the Intake Queue record's "Matched Contact" field
  to the synced contact record.

Step 8: PROMOTE
────────────────────────────────────────────────
Make creates (or updates) a record in the operational table
  (e.g., Resources, Engagements):
  Contact: linked to Synced Contact
  Program: (from form data)
  Status: "New"

Set Intake Queue Processing Status = "Complete"

Step 9: DONE
────────────────────────────────────────────────
The Intake Queue record is now fully processed.
The contact exists once in Main Records.
The operational record in Resource Hubs links to
  the canonical synced copy.
```

---

## 8. Implementation Plan

### Phase 1: Foundation (Week 1)

1. **Audit Main Records**: Ensure Contacts and Institutions tables have the schema defined in Section 4.1. Add `ContactID` (formula: `RECORD_ID()`), `Match Key`, and `Created Via` fields if missing.
2. **Set up sync**: Create synced tables in Resource Hubs for Contacts and Institutions. Sync only the fields listed in Section 4.2. Name them `Synced: Contacts` and `Synced: Institutions`.
3. **Create Intake Queue**: Build the table in Resource Hubs with the schema in Section 4.2.
4. **Redirect forms**: Point all Resource Hubs forms to write into the Intake Queue, not directly into operational tables.

### Phase 2: Automation (Week 2)

5. **Build the Make scenario**: Implement the matching flow from Section 7 (Steps 2-7).
6. **Test with known contacts**: Submit forms for people who already exist in Main Records. Verify exact email matching works.
7. **Test with new contacts**: Submit forms for people who don't exist. Verify new records are created in Main Records and synced back correctly.
8. **Test fuzzy matching**: Submit forms with slight name variations. Verify they land in "Review" status.

### Phase 3: Hardening (Week 3)

9. **Build the review workflow**: Create a filtered view in Intake Queue for `Processing Status = Review`. Train a human reviewer on how to approve or reject fuzzy matches.
10. **Build error monitoring**: Enable Make.com error notifications. Create the "stale pending" dashboard view.
11. **Build deduplication detection**: Create a weekly Make scenario that searches Main Records for contacts sharing the same email and flags them.
12. **Lock down fields**: Use field permissions or documentation to prevent manual edits to automation-managed fields.

### Phase 4: Scale (Week 4+)

13. **Replicate for additional bases**: When you add new application bases, follow the same pattern: synced tables + Intake Queue + Make scenario.
14. **Document**: Maintain a single document listing every Make scenario, what it does, what fields it touches, and what triggers it. This is your system map.

---

## 9. Key Principles (Summary)

1. **Main Records is a registry, not an application.** It answers "who exists," not "what are they doing."
2. **Every entity has one home.** Contacts live in Main Records. Engagements live in their application base. No exceptions.
3. **Forms never write directly to Main Records.** Everything goes through an Intake Queue and matching automation.
4. **`RECORD_ID()` is your cross-base key.** Store it as `ContactID` / `InstitutionID`. Reference it everywhere.
5. **One-way sync for reads, automation for writes.** Do not attempt two-way sync on entity data.
6. **Flag ambiguity, don't resolve it automatically.** Fuzzy matches go to human review. False positives are worse than duplicates.
7. **Monitor your automations.** An unmonitored automation is a future data quality crisis.
8. **Name things so their purpose is obvious.** `Synced: Contacts`, `Raw Email`, `Matched ContactID` -- a new collaborator should understand the system from field names alone.
