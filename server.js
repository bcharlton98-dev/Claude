import express from 'express';
import { JSDOM } from 'jsdom';

const app = express();
const PORT = 3001;

app.use(express.json());

// CORS for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ─── Shared ─────────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

async function safeFetch(url, options = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
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

// ─── Indeed ─────────────────────────────────────────────────────────────────

async function searchIndeed(keywords, location) {
  const results = [];
  const searchTerms = keywords.slice(0, 3);

  for (const kw of searchTerms) {
    const params = new URLSearchParams({
      q: kw,
      l: location,
      fromage: '14',
      sort: 'date',
    });

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
      const salary = extractText(card, 'div.salary-snippet-container, div.metadata.salary-snippet-container');

      if (title && href) {
        results.push({
          title, company, location: loc, salary,
          url: href, source: 'Indeed',
          description: snippet.slice(0, 200),
          remote: /remote/i.test(loc + title),
        });
      }
    }
    await sleep(500);
  }
  return results;
}

// ─── ZipRecruiter ───────────────────────────────────────────────────────────

async function searchZipRecruiter(keywords, location) {
  const results = [];
  const kw = keywords[0] || 'reading tutor';

  const params = new URLSearchParams({
    search: kw,
    location: location,
    days: '14',
  });

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
        description: '',
        remote: /remote/i.test(loc + title),
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
    await sleep(400);
  }
  return results;
}

// ─── Himalayas (Remote Jobs - Free CORS API) ────────────────────────────────

async function searchHimalayas(keywords) {
  const results = [];
  for (const kw of keywords.slice(0, 2)) {
    const resp = await safeFetch(
      `https://himalayas.app/jobs/api?limit=15&q=${encodeURIComponent(kw)}`
    );
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
    } catch { /* ignore parse errors */ }
    await sleep(300);
  }
  return results;
}

// ─── EDJOIN ─────────────────────────────────────────────────────────────────

async function searchEDJOIN(keywords) {
  const results = [];
  for (const kw of keywords.slice(0, 2)) {
    const resp = await safeFetch(
      `https://www.edjoin.org/Home/Jobs?keyword=${encodeURIComponent(kw)}`
    );
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
    await sleep(400);
  }
  return results;
}

// ─── Idealist ───────────────────────────────────────────────────────────────

async function searchIdealist(keywords, location) {
  const results = [];
  const kw = keywords[0] || 'reading tutor';
  const query = location ? `${kw} ${location}` : kw;

  const resp = await safeFetch(
    `https://www.idealist.org/en/jobs?q=${encodeURIComponent(query)}&type=JOB`
  );
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

// ─── Main Search Endpoint ───────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

app.post('/api/search', async (req, res) => {
  const {
    keywords = ['reading tutor', 'literacy tutor', 'reading specialist', 'elementary teacher', 'phonics tutor'],
    location = 'Marion, IN',
    includeRemote = true,
    remoteOnly = false,
  } = req.body;

  console.log(`Searching: keywords=${keywords.slice(0, 3).join(', ')} location=${location} remote=${includeRemote}`);

  const allResults = [];
  const errors = [];

  // Run searches in parallel groups to be fast but respectful
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

  for (const arr of resultArrays) {
    allResults.push(...arr);
  }

  // Deduplicate by URL
  const seen = new Set();
  const unique = allResults.filter(r => {
    const key = r.url.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter remote-only if requested
  const filtered = remoteOnly ? unique.filter(r => r.remote) : unique;

  console.log(`Found ${filtered.length} unique results (${errors.length} errors)`);

  res.json({
    results: filtered,
    total: filtered.length,
    errors,
    searchedAt: new Date().toISOString(),
  });
});

// ─── Direct Links Endpoint ──────────────────────────────────────────────────

app.get('/api/links', (req, res) => {
  const { keyword = 'reading tutor', location = 'Marion, IN' } = req.query;
  const kw = encodeURIComponent(keyword);
  const loc = encodeURIComponent(location);

  res.json({
    jobBoards: [
      { name: 'Indeed', url: `https://www.indeed.com/jobs?q=${kw}&l=${loc}&fromage=14` },
      { name: 'ZipRecruiter', url: `https://www.ziprecruiter.com/jobs-search?search=${kw}&location=${loc}` },
      { name: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${kw}&location=${loc}` },
      { name: 'SchoolSpring', url: `https://www.schoolspring.com/jobs?term=${kw}` },
      { name: 'EDJOIN', url: `https://www.edjoin.org/Home/Jobs?keyword=${kw}` },
      { name: 'K12JobSpot', url: `https://www.k12jobspot.com/search?q=${kw}` },
      { name: 'EdWeek Jobs', url: 'https://www.edweek.org/jobs' },
      { name: 'Glassdoor', url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${kw}&locT=C&locId=&locKeyword=${loc}` },
    ],
    nonprofitBoards: [
      { name: 'Idealist', url: `https://www.idealist.org/en/jobs?q=${kw}&type=JOB` },
      { name: 'Foundation List', url: 'https://www.foundationlist.org/education-job-postings/' },
      { name: 'ILA Career Center', url: 'https://careers.literacyworldwide.org/' },
      { name: 'Nonprofit Talent', url: 'https://jobs.nonprofittalent.com/category/education' },
    ],
    localResources: [
      { name: 'Grant County Schools Portal', url: 'https://grantcounty.tedk12.com/hire/index.aspx' },
      { name: 'Marion Community Schools', url: 'https://www.marion.k12.in.us/apps/pages/index.jsp?uREC_ID=3890106&type=d&pREC_ID=2478909' },
      { name: 'Indeed - Marion IN', url: `https://www.indeed.com/q-teaching-l-marion,-in-jobs.html` },
    ],
    tutoringPlatforms: [
      { name: 'Wyzant', url: 'https://www.wyzant.com/tutorsignupstart', note: 'Set your own rate, $30-80/hr' },
      { name: 'BookNook', url: 'https://apply.booknook.com/online-tutoring-jobs', note: 'Reading/literacy specific, K-8' },
      { name: 'Ignite Reading', url: 'https://ignite-reading.com/online-tutoring-jobs/', note: '$17.50-$20/hr, paid training' },
      { name: 'Varsity Tutors', url: 'https://www.varsitytutors.com/tutoring-jobs', note: 'Steady student matching' },
      { name: 'OpenLiteracy', url: 'https://www.openliteracy.com/jobs', note: 'K-6 reading sessions' },
      { name: 'Hoot Reading', url: 'https://www.hootreading.com/', note: '$18-$20/hr, phonics focus' },
      { name: 'Tutor.com', url: 'https://www.tutor.com/apply', note: 'Library/school partnerships' },
      { name: 'Care.com', url: 'https://www.care.com/enroll-provider', note: 'In-person, local families' },
      { name: 'Thumbtack', url: 'https://www.thumbtack.com/pro/', note: 'Local tutoring gigs' },
    ],
  });
});

// ─── Health check ───────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Job Search API running at http://localhost:${PORT}`);
  console.log(`  Also accessible on your local network for phone access\n`);
});
