#!/usr/bin/env python3
"""
Keith Drury Article Scraper
============================
Run this script on your local machine (not in a sandboxed environment)
to crawl drurywriting.com and extract every Keith Drury article URL.

Usage:
    python3 scrape_drury.py

Output:
    - Prints all discovered URLs to console
    - Saves full results to keith_drury_all_urls.txt
    - Saves article details to keith_drury_articles_scraped.json
"""

import requests
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
import json
import time
import sys

BASE_URL = "https://www.drurywriting.com/keith/"
DOMAIN = "drurywriting.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Known index pages to start crawling from
SEED_URLS = [
    "https://www.drurywriting.com/keith/",
    "https://www.drurywriting.com/keith/inex.favorites",
    "https://www.drurywriting.com/keith/index.books.html",
    "https://www.drurywriting.com/keith/index.pastors.pondering",
    "https://www.drurywriting.com/keith/index.pastors.pondering.html",
    "https://www.drurywriting.com/keith/index.worship",
    "https://www.drurywriting.com/keith/index.worship.html",
    "https://www.drurywriting.com/keith/index.students.html",
    "https://www.drurywriting.com/keith/index.out.of.date.html",
    "https://www.drurywriting.com/keith/index.books",
    "https://www.drurywriting.com/keith/protect.htm",
    "https://www.drurywriting.com/keith/recent.pretty.good.writing.htm",
    "https://www.drurywriting.com/keith/sdop.htm",
    "https://www.drurywriting.com/keith/1CALL.htm",
    "https://www.drurywriting.com/keith/1CALL",
    "https://www.drurywriting.com/keith/blog.personal",
    "https://www.drurywriting.com/keith/Blog.book.htm",
    "https://www.drurywriting.com/keith/links",
    "https://www.drurywriting.com/keith/Keith.family.htm",
    "http://keithdrury.blogspot.com/",
]


class LinkExtractor(HTMLParser):
    """Extract all <a href> and <title> from HTML."""

    def __init__(self):
        super().__init__()
        self.links = []
        self.title = ""
        self._in_title = False
        self._in_a = False
        self._current_href = ""
        self._current_text = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "a" and "href" in attrs_dict:
            self._in_a = True
            self._current_href = attrs_dict["href"]
            self._current_text = ""
        if tag == "title":
            self._in_title = True

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_a:
            self._current_text += data

    def handle_endtag(self, tag):
        if tag == "a" and self._in_a:
            self._in_a = False
            self.links.append((self._current_href, self._current_text.strip()))
        if tag == "title":
            self._in_title = False


def fetch_page(url, session):
    """Fetch a page and return its HTML content."""
    try:
        resp = session.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        if resp.status_code == 200:
            return resp.text
        else:
            print(f"  [{resp.status_code}] {url}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"  [ERROR] {url}: {e}", file=sys.stderr)
        return None


def is_keith_drury_url(url):
    """Check if URL is a Keith Drury article on drurywriting.com."""
    parsed = urlparse(url)
    return (
        DOMAIN in parsed.netloc
        and "/keith/" in parsed.path
        and not url.endswith((".jpg", ".jpeg", ".png", ".gif", ".css", ".js", ".ico"))
    )


def normalize_url(url):
    """Normalize URL for deduplication."""
    url = url.split("#")[0]  # Remove fragment
    url = url.rstrip("/")
    # Normalize http to https
    if url.startswith("http://www.drurywriting.com"):
        url = url.replace("http://", "https://", 1)
    if url.startswith("http://drurywriting.com"):
        url = url.replace("http://drurywriting.com", "https://www.drurywriting.com", 1)
    return url


def crawl():
    """Crawl drurywriting.com/keith/ and extract all article URLs."""
    session = requests.Session()
    visited = set()
    to_visit = list(SEED_URLS)
    all_articles = {}  # url -> {title, found_on}

    print("=" * 60)
    print("Keith Drury Article Scraper")
    print("=" * 60)
    print(f"Starting with {len(to_visit)} seed URLs...\n")

    while to_visit:
        url = to_visit.pop(0)
        normalized = normalize_url(url)

        if normalized in visited:
            continue
        visited.add(normalized)

        print(f"Crawling [{len(visited)}/{len(visited) + len(to_visit)}]: {url}")
        html = fetch_page(url, session)

        if html is None:
            continue

        parser = LinkExtractor()
        try:
            parser.feed(html)
        except Exception:
            continue

        page_title = parser.title.strip()

        # Record this page as an article
        if is_keith_drury_url(url):
            if normalized not in all_articles:
                all_articles[normalized] = {
                    "url": normalized,
                    "title": page_title or "(no title)",
                    "found_on": "seed",
                }

        # Process discovered links
        for href, link_text in parser.links:
            if not href:
                continue
            full_url = urljoin(url, href)
            full_normalized = normalize_url(full_url)

            if is_keith_drury_url(full_url) and full_normalized not in visited:
                to_visit.append(full_url)
                if full_normalized not in all_articles:
                    all_articles[full_normalized] = {
                        "url": full_normalized,
                        "title": link_text or "(discovered link)",
                        "found_on": url,
                    }

        # Be polite - small delay between requests
        time.sleep(0.3)

    return all_articles


def also_try_wayback_cdx():
    """Try the Wayback Machine CDX API to find additional URLs."""
    print("\n" + "=" * 60)
    print("Checking Wayback Machine CDX API...")
    print("=" * 60)

    cdx_url = (
        "https://web.archive.org/cdx/search/cdx"
        "?url=drurywriting.com/keith/*"
        "&output=json"
        "&fl=original"
        "&collapse=urlkey"
        "&limit=5000"
    )

    try:
        resp = requests.get(cdx_url, headers=HEADERS, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            urls = set()
            for row in data[1:]:  # Skip header row
                url = row[0]
                if is_keith_drury_url(url):
                    urls.add(normalize_url(url))
            print(f"Found {len(urls)} unique URLs in Wayback Machine")
            return urls
        else:
            print(f"CDX API returned {resp.status_code}")
            return set()
    except Exception as e:
        print(f"CDX API error: {e}")
        return set()


def main():
    # Phase 1: Crawl the live site
    articles = crawl()

    # Phase 2: Check Wayback Machine for additional URLs
    wayback_urls = also_try_wayback_cdx()

    # Merge wayback discoveries
    for url in wayback_urls:
        if url not in articles:
            articles[url] = {
                "url": url,
                "title": "(from Wayback Machine)",
                "found_on": "wayback_cdx",
            }

    # Output results
    print("\n" + "=" * 60)
    print(f"TOTAL UNIQUE ARTICLES FOUND: {len(articles)}")
    print("=" * 60)

    # Sort by URL
    sorted_articles = sorted(articles.values(), key=lambda x: x["url"])

    # Print to console
    for i, article in enumerate(sorted_articles, 1):
        print(f"{i:3d}. [{article['title']}]")
        print(f"     {article['url']}")

    # Save URLs to text file
    with open("keith_drury_all_urls.txt", "w") as f:
        for article in sorted_articles:
            f.write(f"{article['url']}\n")
    print(f"\nSaved {len(sorted_articles)} URLs to keith_drury_all_urls.txt")

    # Save full details to JSON
    with open("keith_drury_articles_scraped.json", "w") as f:
        json.dump(sorted_articles, f, indent=2)
    print(f"Saved full details to keith_drury_articles_scraped.json")


if __name__ == "__main__":
    main()
