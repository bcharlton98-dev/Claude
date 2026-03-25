#!/usr/bin/env python3
"""
Teaching & Literacy Job Search Aggregator
==========================================
Searches multiple job boards, school district sites, nonprofit boards,
and tutoring platforms for teaching, tutoring, and literacy education jobs.

Usage:
    python3 job_search.py                          # Run with defaults
    python3 job_search.py --location "Chicago, IL" # Specify location
    python3 job_search.py --keywords "reading specialist, phonics"
    python3 job_search.py --remote-only            # Only remote jobs
    python3 job_search.py --output results.csv     # Save to CSV

The tool searches sources that traditional job boards miss:
- School district career pages
- Nonprofit job boards (Idealist, Foundation List, etc.)
- Tutoring platforms (Wyzant, Varsity Tutors, etc.)
- Education-specific boards (SchoolSpring, EDJOIN, K12JobSpot)
- Literacy organizations (ILA, RIF, Reading Partners, etc.)
- Google search for hidden postings on .edu/.org sites
"""

import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.parse
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4"])
    import requests
    from bs4 import BeautifulSoup


# ─── Configuration ───────────────────────────────────────────────────────────

DEFAULT_KEYWORDS = [
    "reading tutor",
    "literacy tutor",
    "teaching reading",
    "reading specialist",
    "literacy coach",
    "elementary teacher",
    "phonics tutor",
    "reading intervention",
    "literacy instruction",
    "teach kids to read",
    "early literacy",
    "reading teacher",
    "tutoring",
    "ESL teacher",
    "ELA teacher",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


@dataclass
class JobResult:
    title: str
    organization: str
    location: str
    url: str
    source: str
    description: str = ""
    salary: str = ""
    job_type: str = ""  # full-time, part-time, contract, etc.
    remote: bool = False
    date_found: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))


# ─── Search Sources ──────────────────────────────────────────────────────────

class JobSearcher:
    """Aggregates job results from multiple sources."""

    def __init__(self, keywords: list[str], location: str = "", remote_only: bool = False):
        self.keywords = keywords
        self.location = location
        self.remote_only = remote_only
        self.results: list[JobResult] = []
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.errors: list[str] = []

    def search_all(self) -> list[JobResult]:
        """Run all search sources and aggregate results."""
        sources = [
            ("Indeed", self.search_indeed),
            ("SchoolSpring", self.search_schoolspring),
            ("Google (hidden jobs)", self.search_google_hidden),
            ("Google (nonprofit jobs)", self.search_google_nonprofit),
            ("Google (.edu sites)", self.search_google_edu),
            ("EDJOIN", self.search_edjoin),
            ("Idealist", self.search_idealist),
            ("HigherEdJobs", self.search_higheredjobs),
        ]

        for name, search_fn in sources:
            try:
                print(f"  Searching {name}...", end=" ", flush=True)
                count_before = len(self.results)
                search_fn()
                count_new = len(self.results) - count_before
                print(f"found {count_new} results")
            except Exception as e:
                self.errors.append(f"{name}: {e}")
                print(f"error: {e}")
            time.sleep(1)  # Be respectful between requests

        # Deduplicate by URL
        seen_urls = set()
        unique = []
        for r in self.results:
            normalized = r.url.rstrip("/").lower()
            if normalized not in seen_urls:
                seen_urls.add(normalized)
                unique.append(r)
        self.results = unique

        if self.remote_only:
            self.results = [r for r in self.results if r.remote]

        return self.results

    def _get(self, url: str, params: dict = None, timeout: int = 15) -> Optional[requests.Response]:
        """Safe GET request with error handling."""
        try:
            resp = self.session.get(url, params=params, timeout=timeout, allow_redirects=True)
            resp.raise_for_status()
            return resp
        except requests.RequestException:
            return None

    def _extract_text(self, soup: BeautifulSoup, selector: str) -> str:
        """Safely extract text from a BeautifulSoup element."""
        el = soup.select_one(selector)
        return el.get_text(strip=True) if el else ""

    # ── Indeed ────────────────────────────────────────────────────────────

    def search_indeed(self):
        for kw in self.keywords[:5]:  # Limit to avoid rate limiting
            query = kw
            if self.location:
                query += f" {self.location}"

            params = {"q": query, "fromage": "14"}  # Last 14 days
            if self.location:
                params["l"] = self.location

            resp = self._get("https://www.indeed.com/jobs", params=params)
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            cards = soup.select("div.job_seen_beacon, div.jobsearch-ResultsList > div")

            for card in cards[:10]:
                title_el = card.select_one("h2.jobTitle a, a.jcs-JobTitle")
                if not title_el:
                    continue

                title = title_el.get_text(strip=True)
                href = title_el.get("href", "")
                if href and not href.startswith("http"):
                    href = "https://www.indeed.com" + href

                company = self._extract_text(card, "span.companyName, [data-testid='company-name']")
                location = self._extract_text(card, "div.companyLocation, [data-testid='text-location']")
                snippet = self._extract_text(card, "div.job-snippet, td.resultContent div.css-1dbjc4n")
                salary = self._extract_text(card, "div.salary-snippet-container, div.metadata.salary-snippet-container")

                is_remote = "remote" in location.lower() or "remote" in title.lower()

                if title and href:
                    self.results.append(JobResult(
                        title=title,
                        organization=company,
                        location=location,
                        url=href,
                        source="Indeed",
                        description=snippet,
                        salary=salary,
                        remote=is_remote,
                    ))
            time.sleep(0.5)

    # ── SchoolSpring ─────────────────────────────────────────────────────

    def search_schoolspring(self):
        for kw in self.keywords[:3]:
            params = {"term": kw}
            if self.location:
                params["location"] = self.location

            resp = self._get("https://www.schoolspring.com/jobs", params=params)
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            cards = soup.select("div.job-listing, div.job-card, article.job")

            for card in cards[:10]:
                title_el = card.select_one("a.job-title, h3 a, a[href*='/job/']")
                if not title_el:
                    continue

                title = title_el.get_text(strip=True)
                href = title_el.get("href", "")
                if href and not href.startswith("http"):
                    href = "https://www.schoolspring.com" + href

                org = self._extract_text(card, ".school-name, .employer, .organization")
                loc = self._extract_text(card, ".location, .job-location")

                if title and href:
                    self.results.append(JobResult(
                        title=title,
                        organization=org,
                        location=loc or self.location,
                        url=href,
                        source="SchoolSpring",
                    ))
            time.sleep(0.5)

    # ── Google Search (hidden district/org jobs) ─────────────────────────

    def _search_google(self, query: str, source_label: str):
        """Search Google and parse results."""
        params = {
            "q": query,
            "num": 20,
        }
        resp = self._get("https://www.google.com/search", params=params)
        if not resp:
            return

        soup = BeautifulSoup(resp.text, "html.parser")
        # Google search result divs
        for g in soup.select("div.g, div[data-sokoban-container]"):
            link = g.select_one("a[href]")
            title_el = g.select_one("h3")
            snippet_el = g.select_one("div.VwiC3b, span.aCOpRe, div.s")

            if not link or not title_el:
                continue

            href = link.get("href", "")
            # Skip Google's own pages
            if "google.com" in href:
                continue

            title = title_el.get_text(strip=True)
            snippet = snippet_el.get_text(strip=True) if snippet_el else ""

            # Try to extract organization from URL
            try:
                org = urllib.parse.urlparse(href).netloc.replace("www.", "")
            except Exception:
                org = ""

            is_remote = "remote" in title.lower() or "remote" in snippet.lower()

            self.results.append(JobResult(
                title=title,
                organization=org,
                location=self.location or "See listing",
                url=href,
                source=source_label,
                description=snippet[:200],
                remote=is_remote,
            ))

    def search_google_hidden(self):
        """Search for jobs on school district / charter school sites."""
        location_str = f' "{self.location}"' if self.location else ""
        queries = [
            f'"reading tutor" OR "literacy" (careers OR jobs OR "apply now"){location_str} -site:indeed.com -site:linkedin.com -site:ziprecruiter.com',
            f'"teaching" "reading" inurl:careers OR inurl:jobs site:.org{location_str}',
        ]
        for q in queries:
            self._search_google(q, "Google (hidden jobs)")
            time.sleep(1)

    def search_google_nonprofit(self):
        """Search for nonprofit literacy/teaching jobs."""
        location_str = f' "{self.location}"' if self.location else ""
        query = f'("literacy tutor" OR "reading specialist" OR "teaching") (nonprofit OR "non-profit") (careers OR jobs OR hiring){location_str} -site:indeed.com -site:linkedin.com'
        self._search_google(query, "Google (nonprofits)")

    def search_google_edu(self):
        """Search .edu sites for teaching positions."""
        location_str = f' "{self.location}"' if self.location else ""
        query = f'site:.edu ("reading" OR "literacy" OR "tutor") ("position" OR "job" OR "apply"){location_str}'
        self._search_google(query, "Google (.edu)")

    # ── EDJOIN ───────────────────────────────────────────────────────────

    def search_edjoin(self):
        for kw in self.keywords[:3]:
            params = {"keyword": kw}
            resp = self._get("https://www.edjoin.org/Home/Jobs", params=params)
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            rows = soup.select("tr.job-row, div.job-listing, a.job-link")

            for row in rows[:10]:
                link = row if row.name == "a" else row.select_one("a[href]")
                if not link:
                    continue

                title = link.get_text(strip=True)
                href = link.get("href", "")
                if href and not href.startswith("http"):
                    href = "https://www.edjoin.org" + href

                if title and href:
                    self.results.append(JobResult(
                        title=title,
                        organization="",
                        location=self.location or "See listing",
                        url=href,
                        source="EDJOIN",
                    ))
            time.sleep(0.5)

    # ── Idealist ─────────────────────────────────────────────────────────

    def search_idealist(self):
        for kw in self.keywords[:3]:
            query = kw
            if self.location:
                query += f" {self.location}"

            params = {"q": query, "type": "JOB"}
            resp = self._get("https://www.idealist.org/en/jobs", params=params)
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            cards = soup.select("a.card, div.search-result, a[href*='/job/']")

            for card in cards[:10]:
                if card.name == "a":
                    link = card
                else:
                    link = card.select_one("a[href]")
                if not link:
                    continue

                title = link.get_text(strip=True)[:100]
                href = link.get("href", "")
                if href and not href.startswith("http"):
                    href = "https://www.idealist.org" + href

                if title and href and "/job/" in href:
                    self.results.append(JobResult(
                        title=title,
                        organization="",
                        location=self.location or "See listing",
                        url=href,
                        source="Idealist",
                    ))
            time.sleep(0.5)

    # ── HigherEdJobs ─────────────────────────────────────────────────────

    def search_higheredjobs(self):
        params = {"KeyWords": "reading literacy tutor", "JobCat": "166"}
        if self.location:
            params["State"] = self.location.split(",")[-1].strip() if "," in self.location else self.location

        resp = self._get("https://www.higheredjobs.com/faculty/search.cfm", params=params)
        if not resp:
            return

        soup = BeautifulSoup(resp.text, "html.parser")
        rows = soup.select("div.row.record, tr.job-listing, div.search-result")

        for row in rows[:10]:
            link = row.select_one("a[href]")
            if not link:
                continue

            title = link.get_text(strip=True)
            href = link.get("href", "")
            if href and not href.startswith("http"):
                href = "https://www.higheredjobs.com" + href

            org = self._extract_text(row, ".institution, .employer")
            loc = self._extract_text(row, ".location")

            if title and href:
                self.results.append(JobResult(
                    title=title,
                    organization=org,
                    location=loc or self.location or "See listing",
                    url=href,
                    source="HigherEdJobs",
                ))


# ─── Output Formatting ───────────────────────────────────────────────────────

def print_results(results: list[JobResult]):
    """Print results in a readable format."""
    if not results:
        print("\n  No results found. Try broadening your search terms or location.")
        return

    print(f"\n{'='*80}")
    print(f"  FOUND {len(results)} JOB LISTINGS")
    print(f"{'='*80}\n")

    # Group by source
    by_source: dict[str, list[JobResult]] = {}
    for r in results:
        by_source.setdefault(r.source, []).append(r)

    for source, jobs in by_source.items():
        print(f"\n── {source} ({len(jobs)} results) {'─'*40}")
        for i, job in enumerate(jobs, 1):
            remote_tag = " [REMOTE]" if job.remote else ""
            print(f"\n  {i}. {job.title}{remote_tag}")
            if job.organization:
                print(f"     Organization: {job.organization}")
            if job.location:
                print(f"     Location: {job.location}")
            if job.salary:
                print(f"     Salary: {job.salary}")
            if job.description:
                print(f"     {job.description[:120]}...")
            print(f"     URL: {job.url}")


def save_csv(results: list[JobResult], filename: str):
    """Save results to CSV file."""
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "title", "organization", "location", "salary",
            "job_type", "remote", "source", "url", "description", "date_found"
        ])
        writer.writeheader()
        for r in results:
            writer.writerow(asdict(r))
    print(f"\n  Results saved to: {filename}")


def save_json(results: list[JobResult], filename: str):
    """Save results to JSON file."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump([asdict(r) for r in results], f, indent=2)
    print(f"\n  Results saved to: {filename}")


# ─── Direct Links Generator ─────────────────────────────────────────────────

def generate_direct_links(keywords: list[str], location: str = ""):
    """Generate direct search URLs the user can open in their browser."""
    kw_encoded = urllib.parse.quote_plus(keywords[0] if keywords else "reading tutor")
    loc_encoded = urllib.parse.quote_plus(location) if location else ""

    links = {
        "Indeed": f"https://www.indeed.com/jobs?q={kw_encoded}&l={loc_encoded}&fromage=14",
        "SchoolSpring": f"https://www.schoolspring.com/jobs?term={kw_encoded}",
        "EDJOIN": f"https://www.edjoin.org/Home/Jobs?keyword={kw_encoded}",
        "K12JobSpot": f"https://www.k12jobspot.com/search?q={kw_encoded}",
        "Idealist": f"https://www.idealist.org/en/jobs?q={kw_encoded}&type=JOB",
        "ZipRecruiter": f"https://www.ziprecruiter.com/jobs-search?search={kw_encoded}&location={loc_encoded}",
        "LinkedIn": f"https://www.linkedin.com/jobs/search/?keywords={kw_encoded}&location={loc_encoded}",
        "HigherEdJobs": f"https://www.higheredjobs.com/faculty/search.cfm?JobCat=166&KeyWords={kw_encoded}",
        "Foundation List": "https://www.foundationlist.org/education-job-postings/",
        "ILA Career Center": "https://careers.literacyworldwide.org/",
        "Nonprofit Talent": "https://jobs.nonprofittalent.com/category/education",
        "EdWeek Jobs": "https://www.edweek.org/jobs",
        "Wyzant (become a tutor)": "https://www.wyzant.com/tutorsignupstart",
        "Varsity Tutors": "https://www.varsitytutors.com/tutoring-jobs",
        "Care.com tutoring": f"https://www.care.com/tutoring-jobs?q={kw_encoded}",
        "Thumbtack tutoring": "https://www.thumbtack.com/pro/category/tutoring/",
    }

    # Google power searches
    loc_str = f'+"{location}"' if location else ""
    google_searches = {
        "Google: Hidden school/org jobs": (
            f'https://www.google.com/search?q="reading+tutor"+OR+"literacy"+(careers+OR+jobs)+{loc_str}'
            f'+-site:indeed.com+-site:linkedin.com+-site:ziprecruiter.com'
        ),
        "Google: Nonprofit literacy jobs": (
            f'https://www.google.com/search?q="literacy"+OR+"reading"+(nonprofit+OR+non-profit)'
            f'+(careers+OR+jobs+OR+hiring){loc_str}+-site:indeed.com'
        ),
        "Google: .edu teaching jobs": (
            f'https://www.google.com/search?q=site:.edu+("reading"+OR+"literacy"+OR+"tutor")'
            f'+("position"+OR+"job"+OR+"apply"){loc_str}'
        ),
        "Google: .org tutoring jobs": (
            f'https://www.google.com/search?q=site:.org+("reading+tutor"+OR+"literacy+coach")'
            f'+(careers+OR+jobs){loc_str}'
        ),
    }

    return links, google_searches


def print_direct_links(keywords: list[str], location: str = ""):
    """Print clickable links for manual searching."""
    links, google_searches = generate_direct_links(keywords, location)

    print(f"\n{'='*80}")
    print("  DIRECT SEARCH LINKS (open these in your browser)")
    print(f"{'='*80}")

    print("\n── Job Boards ─────────────────────────────────────────────")
    for name, url in links.items():
        print(f"  {name}:")
        print(f"    {url}\n")

    print("\n── Google Power Searches (finds hidden jobs!) ────────────")
    for name, url in google_searches.items():
        print(f"  {name}:")
        print(f"    {url}\n")


# ─── Tutoring Platform Guide ────────────────────────────────────────────────

def print_tutoring_platforms():
    """Print info about tutoring platforms where she can sign up directly."""
    print(f"\n{'='*80}")
    print("  TUTORING PLATFORMS (sign up directly to get students)")
    print(f"{'='*80}")

    platforms = [
        {
            "name": "Wyzant",
            "url": "https://www.wyzant.com/tutorsignupstart",
            "desc": "Set your own rates ($30-80/hr typical for reading). 65,000+ tutors. "
                    "You get 2+ job opportunities/week. 25% commission.",
            "best_for": "Flexible schedule, set own prices, in-person or online",
        },
        {
            "name": "Varsity Tutors",
            "url": "https://www.varsitytutors.com/tutoring-jobs",
            "desc": "Managed platform, they match you with students. More structured. "
                    "Covers 400+ topics. $15-40/hr depending on subject.",
            "best_for": "Steady stream of students, structured environment",
        },
        {
            "name": "Tutor.com",
            "url": "https://www.tutor.com/apply",
            "desc": "Online tutoring for K-12 students. Partners with libraries and schools. "
                    "Background check required.",
            "best_for": "Steady online work, institutional backing",
        },
        {
            "name": "BookNook",
            "url": "https://www.booknook.com/tutors",
            "desc": "Specifically for reading/literacy! Live small-group reading sessions "
                    "(2-5 students). 30-min sessions, 3-5x/week.",
            "best_for": "Reading/literacy specialists - this is THE platform for that",
        },
        {
            "name": "Superprof",
            "url": "https://www.superprof.com/registration/teacher",
            "desc": "Global tutoring marketplace. Free to create a profile. "
                    "First lesson often free to attract students.",
            "best_for": "Building a local client base",
        },
        {
            "name": "Care.com",
            "url": "https://www.care.com/enroll-provider",
            "desc": "Parents search for tutors here. Good for in-person tutoring. "
                    "Premium membership for full access.",
            "best_for": "In-person tutoring, local families",
        },
        {
            "name": "Thumbtack",
            "url": "https://www.thumbtack.com/pro/",
            "desc": "Local service marketplace. Parents post tutoring requests. "
                    "You bid on jobs in your area.",
            "best_for": "In-person local tutoring gigs",
        },
        {
            "name": "OnYourMark Education",
            "url": "https://onyourmarkeducation.com/",
            "desc": "Early literacy focused. Training provided. Great for building "
                    "resume in literacy education.",
            "best_for": "Early literacy, structured training, resume building",
        },
    ]

    for p in platforms:
        print(f"\n  {p['name']}")
        print(f"  {'─' * len(p['name'])}")
        print(f"  {p['desc']}")
        print(f"  Best for: {p['best_for']}")
        print(f"  Sign up: {p['url']}")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Search for teaching, tutoring, and literacy education jobs across multiple sources.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 job_search.py
  python3 job_search.py --location "Austin, TX"
  python3 job_search.py --keywords "phonics tutor, reading specialist"
  python3 job_search.py --location "Remote" --remote-only
  python3 job_search.py --output results.csv --location "Denver, CO"
  python3 job_search.py --links-only --location "Seattle, WA"
  python3 job_search.py --platforms
        """
    )

    parser.add_argument(
        "--location", "-l",
        default="",
        help="Location to search (e.g., 'Chicago, IL', 'Remote')"
    )
    parser.add_argument(
        "--keywords", "-k",
        default="",
        help="Comma-separated keywords (default: reading tutor, literacy, teaching, etc.)"
    )
    parser.add_argument(
        "--remote-only", "-r",
        action="store_true",
        help="Only show remote positions"
    )
    parser.add_argument(
        "--output", "-o",
        default="",
        help="Save results to file (supports .csv and .json)"
    )
    parser.add_argument(
        "--links-only",
        action="store_true",
        help="Just print direct search URLs (no scraping)"
    )
    parser.add_argument(
        "--platforms",
        action="store_true",
        help="Show tutoring platform sign-up info"
    )

    args = parser.parse_args()

    # Parse keywords
    if args.keywords:
        keywords = [k.strip() for k in args.keywords.split(",")]
    else:
        keywords = DEFAULT_KEYWORDS

    print(f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║            Teaching & Literacy Job Search Aggregator                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Searching across job boards, school districts, nonprofits,               ║
║  tutoring platforms, and hidden postings on .edu/.org sites               ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")

    if args.location:
        print(f"  Location: {args.location}")
    print(f"  Keywords: {', '.join(keywords[:5])}{'...' if len(keywords) > 5 else ''}")
    if args.remote_only:
        print("  Filter: Remote only")
    print()

    # Always show tutoring platforms if requested
    if args.platforms:
        print_tutoring_platforms()
        print()

    # Show direct links
    if args.links_only:
        print_direct_links(keywords, args.location)
        print_tutoring_platforms()
        return

    # Run the automated search
    print("  Searching multiple sources (this may take 30-60 seconds)...\n")
    searcher = JobSearcher(keywords, args.location, args.remote_only)
    results = searcher.search_all()

    # Print results
    print_results(results)

    # Show errors if any
    if searcher.errors:
        print(f"\n  Note: Some sources had issues:")
        for err in searcher.errors:
            print(f"    - {err}")

    # Save to file if requested
    if args.output:
        if args.output.endswith(".json"):
            save_json(results, args.output)
        else:
            save_csv(results, args.output)

    # Always show direct links and platforms at the end
    print_direct_links(keywords, args.location)
    print_tutoring_platforms()

    print(f"\n{'='*80}")
    print("  TIPS FOR FINDING MORE JOBS")
    print(f"{'='*80}")
    print("""
  1. CHECK INDIVIDUAL SCHOOL DISTRICT WEBSITES - Many districts only post
     on their own career pages. Search "[your city] school district careers".

  2. USE GOOGLE POWER SEARCHES - The links above use advanced Google
     operators to find jobs on .edu and .org sites that aren't on Indeed.

  3. SIGN UP FOR TUTORING PLATFORMS - Wyzant, BookNook, and Varsity Tutors
     let you start getting students quickly while job searching.

  4. CONTACT LOCAL ORGANIZATIONS DIRECTLY:
     - Public libraries (many run literacy programs)
     - Community colleges (adult education/ESL programs)
     - Head Start programs (early childhood)
     - Boys & Girls Clubs
     - YMCA/YWCA
     - United Way (often funds literacy programs)
     - Local Reading Partners chapter
     - Sylvan Learning Centers / Kumon / Huntington Learning

  5. SET UP JOB ALERTS on SchoolSpring, Indeed, and LinkedIn so new
     postings come to you automatically.

  6. CHECK BACK REGULARLY - Run this tool weekly to catch new postings.
""")


if __name__ == "__main__":
    main()
