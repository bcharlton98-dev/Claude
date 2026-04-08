# Airtable as a Research & Codebook System

## From Filing Cabinet to Knowledge Base

---

## 1. The Shift You're Describing

### Current model: One base per annual report cycle

```
2024 Annual Reports (base)
  └── Assignments table (report + reader + evaluation fields)
  └── Co Pro Grants table (dead copy of grants)

2025 Annual Reports (base)  ← duplicate structure
  └── Assignments table
  └── Co Pro Grants table

2026 Annual Reports (base)  ← duplicate again
  └── ...
```

**Problems:**
- You can't ask "what did Organization X report across all years?"
- You can't search for themes ("neighbor ministry") across years
- Every year you rebuild the same structure
- Reader evaluations from 2024 are invisible when reading 2026 reports
- No longitudinal view of a grantee's journey

### Target model: One base with time as a dimension

```
Annual Reports (single base)
  └── Reports table (one record per report, with Year field)
  └── Synced: Institutions (from Main Records)
  └── Synced: Grants (from Main Records)
  └── Coding table (qualitative tags applied to report content)
  └── Assignments table (reader + evaluation per report)
```

Now you can:
- Filter Reports by year, institution, initiative, or theme
- Click an institution and see every report they've ever submitted
- Search for "neighbor ministry" across all years
- Track how a grantee's challenges evolve over time
- Compare reader evaluations year over year

---

## 2. The Codebook Architecture

A codebook is a structured vocabulary for tagging qualitative data. In Airtable, this becomes a table structure.

### Table: Reports

One record = one annual report submission from one grantee in one year.

| Field | Type | Purpose |
|---|---|---|
| Report ID | Formula: `{Institution} & " - " & {Year}` | Unique identifier |
| Institution | Link to Synced: Institutions | Who submitted this |
| Grant | Link to Synced: Grants | Which grant this report covers |
| Year | Single select (2024, 2025, 2026...) | Time dimension |
| Initiative | Single select | Nurturing Children, Christian Parenting, Young Adults, etc. |
| Report File | Attachment | The actual report document |
| Name on Submission Letter | Single line text | |
| Project Title | Single line text | |
| Codes | Link to Coding table | All qualitative codes applied to this report |
| Reader Assignment | Link to Assignments table | Who read/evaluated this |

### Table: Coding (this is the game-changer)

One record = one instance of a theme/code appearing in a specific report. This is where qualitative research lives.

| Field | Type | Purpose |
|---|---|---|
| Code ID | Autonumber | |
| Report | Link to Reports | Which report this code was found in |
| Code | Link to Codebook | The standardized theme/tag |
| Evidence | Long text | The actual quote or passage from the report |
| Coder | Collaborator | Who applied this code |
| Coder Notes | Long text | Interpretation, context |
| Strength | Single select | Strong, Moderate, Mentioned in passing |
| Date Coded | Created time | Audit trail |

### Table: Codebook (the controlled vocabulary)

One record = one defined theme/code that can be applied across all reports.

| Field | Type | Purpose |
|---|---|---|
| Code Name | Single line text | e.g., "Neighbor Ministry", "COVID Impact", "Intergenerational" |
| Category | Single select | Broad grouping (e.g., Ministry Model, Challenge, Outcome, Practice) |
| Definition | Long text | What this code means -- when to apply it and when not to |
| Examples | Long text | Sample quotes that illustrate this code |
| Coding Instances | Link to Coding table | Every time this code has been applied (auto-populated) |
| Count | Count field | How many times this code appears across all reports |
| Related Codes | Link to Codebook (self-link) | For grouping related themes |

### Table: Assignments (reader evaluations)

One record = one reader's evaluation of one report.

| Field | Type | Purpose |
|---|---|---|
| Assignment ID | Formula | |
| Report | Link to Reports | |
| Reader | Collaborator | |
| Brief Status | Single select | Not Started, In Progress, Complete |
| 3 Sentence Summary | Rich text | (same as your current field) |
| Constituents | Multiple selects | Who are the project constituents? |
| Facing Challenges? | Multiple selects | |
| Creating Resources? | Single select | |
| Resource Types | Multiple selects | |
| Resources Worth Sharing | Rich text | |
| Great Story? | Rich text | |
| Red Flags? | Rich text | |
| Budget > 60% Remaining? | Single select | |
| Academic Research | Long text | |
| Evaluative Tool | Long text | |

---

## 3. What This Unlocks

### Query: "Show me every grantee who discussed neighbor ministry"

```
Coding table → Filter: Code = "Neighbor Ministry"
  → Expand to see: which Reports, which Institutions, which Years
  → Group by Year to see the trend
  → Group by Initiative to see where it's most common
```

### Query: "What has Organization X reported across all years?"

```
Reports table → Filter: Institution = "Organization X"
  → See: 2024 report, 2025 report, 2026 report side by side
  → Expand each to see: reader evaluations, codes applied, red flags
```

### Query: "Which grantees are facing challenges related to COVID?"

```
Coding table → Filter: Code = "COVID Impact" AND Category = "Challenge"
  → See: every report that mentions it, with the actual quotes
  → Group by Year to see if it's increasing or decreasing
```

### Query: "What are the top 10 themes across all Nurturing Children grantees?"

```
Codebook table → Sort by Count (descending)
  → Filter linked Reports by Initiative = "Nurturing Children"
  → Instant top-10 list with counts
```

### Query: "Click on an institution and see everything"

This is what happens when Main Records is properly connected:

```
Main Records > Institutions > Click "First Presbyterian Church"
  └── Contacts: Rev. Smith (Project Director), Jane Doe (Admin)
  └── Grants: #1234 (Nurturing Children, 2023-2026, $250,000)
  └── Projects: "Faith Formation for Families"
  └── Contact Notes: 3 site visit notes, 2 phone calls
  └── Attendance: Attended 2024 Gathering, 2025 Gathering

Annual Reports base > Reports > Filter to "First Presbyterian Church"
  └── 2024 Report: Reader summary, 12 codes applied, no red flags
  └── 2025 Report: Reader summary, 8 codes applied, 1 red flag (budget)

Strengthening Ministry base > Synced: Institutions > "First Presbyterian Church"
  └── Affinity Group: Pilot Group 3
  └── Network Mapping: 4 partners, 3 resources shared
  └── Webinar RSVPs: attended 2 webinars
```

**This is not hypothetical.** This is what Airtable can do today with proper syncs and links. You don't need a custom app. You need the right table structure.

---

## 4. How to Build This

### Step 1: Create the Annual Reports base (unified)

Create ONE new "Annual Reports" base with the four tables above (Reports, Coding, Codebook, Assignments).

### Step 2: Migrate existing data

**From 2024 Annual Reports base:**
- Each row in the current Assignments table becomes a row in the new Reports table (with Year = "2024") AND a row in the new Assignments table (linked to that report)
- The evaluation fields (Constituents, Challenges, Resources, Red Flags, etc.) move to the Assignments table

**You don't lose anything.** You gain the ability to query across years.

### Step 3: Set up syncs

- Sync Main Records > Institutions into the new base as "Synced: Institutions"
- Sync Main Records > Grants into the new base as "Synced: Grants"
- Link each Report record to its synced institution and grant

### Step 4: Build the Codebook

Start with 15-25 codes. You can always add more. Here's a starter set based on your existing evaluation fields:

**Category: Ministry Model**
- Cohort-Based Ministry
- Intergenerational Programming
- Neighbor Ministry
- Digital/Online Ministry
- Worship Integration
- Parent/Caregiver Equipping
- Mentorship Programs

**Category: Challenge**
- COVID Impact
- Staff Turnover / Burnout
- Budget Constraints
- Institutional Instability
- Participant Recruitment
- Denominational Change
- Cultural/Language Barriers

**Category: Outcome**
- Increased Parental Confidence
- Congregation Growth
- New Resources Created
- Community Partnerships Formed
- Sustainability Plan Developed
- Academic Research Produced

**Category: Practice**
- Prayer Practices
- Scripture Engagement
- Service/Mission
- Arts/Creative Expression
- Family Devotions
- Liturgical Practices

### Step 5: Code the reports

This is the labor-intensive part, but it only has to happen once per report:

1. Reader reads the report (as they already do)
2. Reader fills out the evaluation (as they already do)
3. Reader (or a dedicated coder) creates Coding records for each theme they identify
   - Select the Code from the Codebook
   - Paste the relevant quote as Evidence
   - Rate the Strength

Over time, this builds a searchable, filterable, cross-referenced knowledge base of everything your grantees have reported.

---

## 5. The "Ultimate Grantee Profile" View

Once everything is connected, you can build an Airtable Interface (or just use linked record expansions) that shows:

```
┌─────────────────────────────────────────────────────────┐
│  FIRST PRESBYTERIAN CHURCH                              │
│  Theological School | Presbyterian (USA) | Nashville TN │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PEOPLE                           GRANT HISTORY         │
│  ├ Rev. Smith (Director)          ├ #1234 Nurturing     │
│  ├ Jane Doe (Admin)               │  $250,000           │
│  └ Dr. Lee (Advisor)              │  2023-2026          │
│                                   └ #1567 O&D Grant     │
│  ANNUAL REPORTS                     $15,000             │
│  ├ 2024: Complete ✓                 2025-2026           │
│  │  Summary: "Launched 4 cohorts                        │
│  │  serving 120 families..."      ENGAGEMENT            │
│  │  Red flags: None               ├ Attended 2024 Gather│
│  │  Top codes: Cohort-Based (S),  ├ Attended 2025 Gather│
│  │    Parent Equipping (S),       ├ Webinar: Evaluation │
│  │    Intergenerational (M)       ├ Affinity Group: #3  │
│  ├ 2025: In Progress              └ 3 Contact Notes     │
│  │  Assigned to: Lauren                                 │
│  │                                RESOURCES SHARED      │
│  │                                ├ Family Devotion Guide│
│  THEMES ACROSS ALL REPORTS        ├ Cohort Leader Manual│
│  ├ Cohort-Based Ministry (4x)     └ Worship Activity Kit│
│  ├ Parent/Caregiver Equipping (3x)                      │
│  ├ Intergenerational (2x)                               │
│  └ Prayer Practices (2x)                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

This is what "the ultimate codebook" looks like in practice. It's not a separate tool -- it's what happens when your Airtable bases are properly connected and your qualitative data is structured.

---

## 6. What This Means for the Migration Plan

The original migration plan (in Airtable-Schema-Audit.md) still applies. This codebook system is an **extension** of Phase 1-2, not a replacement:

1. **Phase 0**: Stabilize Main Records (add IDs, clean data) -- still required
2. **Phase 1**: Replace copy-paste tables with syncs -- still required
3. **Phase 2**: Build intake automation -- still required
4. **NEW Phase 2.5**: Build unified Annual Reports base with Codebook
5. **Phase 3**: Connect remaining form tables -- still required
6. **NEW Phase 3.5**: Begin coding historical reports (2024 first, then 2025)

The codebook doesn't work without the foundation. But the foundation alone doesn't give you the research capability. You need both.

---

## 7. One Base vs. Multiple Bases Decision Framework

**Keep in ONE base when:**
- The data is about the same entities across time (annual reports by year)
- You want to query/filter/group across time periods
- The tables share relationships (reports link to institutions link to grants)
- The workflow is the same each cycle (reader assignments, evaluations)

**Keep in SEPARATE bases when:**
- The workflow is fundamentally different (event logistics vs. grant management)
- Different teams need different access levels
- The base would exceed Airtable's record limits (50,000 on free, 100,000 on Plus/Pro)
- The data is truly independent (Resource Store inventory has nothing to do with contacts)

**Your annual reports should be ONE base.** The workflow is identical each year. The value is in cross-year comparison. Separate bases destroy that value.

**Your annual gatherings might stay separate** -- each event has unique logistics (venues, breakout sessions, menus) that don't benefit from cross-year querying. But the attendee registration data should still link back to Main Records via synced tables.
