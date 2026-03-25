import { JSDOM } from 'jsdom';

// ─── Shared ─────────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

async function safeFetch(url, options = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, {
      ...options,
      headers: { ...HEADERS, ...options.headers },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    return resp;
  } catch {
    return null;
  }
}

function parseHTML(html) {
  return new JSDOM(html).window.document;
}

function extractText(el, selector) {
  const found = el.querySelector(selector);
  return found ? found.textContent.trim() : '';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Indeed ─────────────────────────────────────────────────────────────────

async function searchIndeed(keywords, location) {
  const results = [];
  for (const kw of keywords.slice(0, 3)) {
    const params = new URLSearchParams({ q: kw, l: location, fromage: '14', sort: 'date' });
    const resp = await safeFetch(`https://www.indeed.com/jobs?${params}`);
    if (!resp) continue;

    const doc = parseHTML(await resp.text());
    const cards = doc.querySelectorAll('div.job_seen_beacon, div.jobsearch-ResultsList > div');

    for (const card of [...cards].slice(0, 8)) {
      const titleEl = card.querySelector('h2.jobTitle a, a.jcs-JobTitle');
      if (!titleEl) continue;

      const title = titleEl.textContent.trim();
      let href = titleEl.getAttribute('href') || '';
      if (href && !href.startsWith('http')) href = 'https://www.indeed.com' + href;

      const company = extractText(card, 'span.companyName, [data-testid="company-name"]');
      const loc = extractText(card, 'div.companyLocation, [data-testid="text-location"]');
      const snippet = extractText(card, 'div.job-snippet, td.resultContent div');
      const salary = extractText(card, 'div.salary-snippet-container');

      if (title && href) {
        results.push({
          title, company, location: loc, salary,
          url: href, source: 'Indeed',
          description: snippet.slice(0, 200),
          remote: /remote/i.test(loc + title),
        });
      }
    }
    await sleep(400);
  }
  return results;
}

// ─── ZipRecruiter ───────────────────────────────────────────────────────────

async function searchZipRecruiter(keywords, location) {
  const results = [];
  const params = new URLSearchParams({ search: keywords[0] || 'reading tutor', location, days: '14' });
  const resp = await safeFetch(`https://www.ziprecruiter.com/jobs-search?${params}`);
  if (!resp) return results;

  const doc = parseHTML(await resp.text());
  const cards = doc.querySelectorAll('article.job_result, div.job_result_two_pane');

  for (const card of [...cards].slice(0, 10)) {
    const titleEl = card.querySelector('a[data-tracking-control-name], h2 a, a.job_link');
    if (!titleEl) continue;

    const title = titleEl.textContent.trim();
    let href = titleEl.getAttribute('href') || '';
    if (href && !href.startsWith('http')) href = 'https://www.ziprecruiter.com' + href;

    const company = extractText(card, '.hiring_company, .t_org_link');
    const loc = extractText(card, '.location, .t_location_link');
    const salary = extractText(card, '.salary_label, .t_salary');

    if (title && href) {
      results.push({
        title, company, location: loc, salary,
        url: href, source: 'ZipRecruiter',
        description: '', remote: /remote/i.test(loc + title),
      });
    }
  }
  return results;
}

// ─── SchoolSpring ───────────────────────────────────────────────────────────

async function searchSchoolSpring(keywords, location) {
  const results = [];
  for (const kw of keywords.slice(0, 2)) {
    const params = new URLSearchParams({ term: kw });
    if (location) params.set('location', location);

    const resp = await safeFetch(`https://www.schoolspring.com/jobs?${params}`);
    if (!resp) continue;

    const doc = parseHTML(await resp.text());
    const cards = doc.querySelectorAll('div.job-listing, div.job-card, article.job, a[href*="/job/"]');

    for (const card of [...cards].slice(0, 8)) {
      const link = card.tagName === 'A' ? card : card.querySelector('a[href]');
      if (!link) continue;

      const title = (link.textContent || '').trim().slice(0, 120);
      let href = link.getAttribute('href') || '';
      if (href && !href.startsWith('http')) href = 'https://www.schoolspring.com' + href;

      if (title && href) {
        results.push({
          title, company: '', location: location || 'See listing',
          url: href, source: 'SchoolSpring', salary: '',
          description: '', remote: false,
        });
      }
    }
    await sleep(300);
  }
  return results;
}

// ─── Himalayas (Remote - Free API with CORS) ────────────────────────────────

async function searchHimalayas(keywords) {
  const results = [];
  for (const kw of keywords.slice(0, 2)) {
    const resp = await safeFetch(`https://himalayas.app/jobs/api?limit=15&q=${encodeURIComponent(kw)}`);
    if (!resp) continue;

    try {
      const data = await resp.json();
      for (const job of (data.jobs || []).slice(0, 10)) {
        results.push({
          title: job.title || '',
          company: job.companyName || '',
          location: 'Remote',
          url: job.applicationLink || `https://himalayas.app/jobs/${job.slug}`,
          source: 'Himalayas (Remote)',
          salary: job.salaryCurrency ? `${job.salaryCurrency} ${job.minSalary || ''}–${job.maxSalary || ''}` : '',
          description: (job.excerpt || '').slice(0, 200),
          remote: true,
        });
      }
    } catch { /* ignore */ }
    await sleep(200);
  }
  return results;
}

// ─── EDJOIN ─────────────────────────────────────────────────────────────────

async function searchEDJOIN(keywords) {
  const results = [];
  for (const kw of keywords.slice(0, 2)) {
    const resp = await safeFetch(`https://www.edjoin.org/Home/Jobs?keyword=${encodeURIComponent(kw)}`);
    if (!resp) continue;

    const doc = parseHTML(await resp.text());
    const links = doc.querySelectorAll('a[href*="/Home/JobPosting"]');

    for (const link of [...links].slice(0, 8)) {
      const title = (link.textContent || '').trim();
      let href = link.getAttribute('href') || '';
      if (href && !href.startsWith('http')) href = 'https://www.edjoin.org' + href;

      if (title && href) {
        results.push({
          title, company: '', location: 'See listing',
          url: href, source: 'EDJOIN', salary: '',
          description: '', remote: false,
        });
      }
    }
    await sleep(300);
  }
  return results;
}

// ─── Idealist ───────────────────────────────────────────────────────────────

async function searchIdealist(keywords, location) {
  const results = [];
  const query = location ? `${keywords[0]} ${location}` : keywords[0];

  const resp = await safeFetch(`https://www.idealist.org/en/jobs?q=${encodeURIComponent(query)}&type=JOB`);
  if (!resp) return results;

  const doc = parseHTML(await resp.text());
  const links = doc.querySelectorAll('a[href*="/job/"]');

  for (const link of [...links].slice(0, 10)) {
    const title = (link.textContent || '').trim().slice(0, 120);
    let href = link.getAttribute('href') || '';
    if (href && !href.startsWith('http')) href = 'https://www.idealist.org' + href;

    if (title && href) {
      results.push({
        title, company: '', location: location || 'See listing',
        url: href, source: 'Idealist', salary: '',
        description: '', remote: /remote/i.test(title),
      });
    }
  }
  return results;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const {
    keywords = ['reading tutor', 'literacy tutor', 'reading specialist', 'elementary teacher', 'phonics tutor'],
    location = 'Marion, IN',
    includeRemote = true,
    remoteOnly = false,
  } = req.body || {};

  const allResults = [];
  const errors = [];

  const localSearches = [
    searchIndeed(keywords, location).catch(e => { errors.push(`Indeed: ${e.message}`); return []; }),
    searchZipRecruiter(keywords, location).catch(e => { errors.push(`ZipRecruiter: ${e.message}`); return []; }),
    searchSchoolSpring(keywords, location).catch(e => { errors.push(`SchoolSpring: ${e.message}`); return []; }),
    searchEDJOIN(keywords).catch(e => { errors.push(`EDJOIN: ${e.message}`); return []; }),
    searchIdealist(keywords, location).catch(e => { errors.push(`Idealist: ${e.message}`); return []; }),
  ];

  const remoteSearches = includeRemote || remoteOnly ? [
    searchHimalayas(keywords).catch(e => { errors.push(`Himalayas: ${e.message}`); return []; }),
    searchIndeed(keywords, 'Remote').catch(e => { errors.push(`Indeed Remote: ${e.message}`); return []; }),
  ] : [];

  const searchesToRun = remoteOnly ? remoteSearches : [...localSearches, ...remoteSearches];
  const resultArrays = await Promise.all(searchesToRun);

  for (const arr of resultArrays) allResults.push(...arr);

  // Deduplicate
  const seen = new Set();
  const unique = allResults.filter(r => {
    const key = r.url.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const filtered = remoteOnly ? unique.filter(r => r.remote) : unique;

  return res.status(200).json({
    results: filtered,
    total: filtered.length,
    errors,
    searchedAt: new Date().toISOString(),
  });
}
