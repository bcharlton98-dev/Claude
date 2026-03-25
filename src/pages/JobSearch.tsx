import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Briefcase, ExternalLink, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, RefreshCw, Wifi, CheckCircle2, X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface JobResult {
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
  source: string;
  description: string;
  remote: boolean;
}

interface DirectLinks {
  jobBoards: { name: string; url: string }[];
  nonprofitBoards: { name: string; url: string }[];
  localResources: { name: string; url: string }[];
  tutoringPlatforms: { name: string; url: string; note?: string }[];
}

type ApplicationStatus = 'applied' | 'interviewing' | 'rejected' | 'saved';

interface TrackedJob {
  url: string;
  title: string;
  company: string;
  status: ApplicationStatus;
  date: string;
  notes: string;
}

// ─── Presets ────────────────────────────────────────────────────────────────

const KEYWORD_PRESETS = [
  { label: 'Reading / Literacy', keywords: ['reading tutor', 'literacy tutor', 'reading specialist'] },
  { label: 'Elementary Teaching', keywords: ['elementary teacher', 'ELA teacher', 'kindergarten teacher'] },
  { label: 'Tutoring (General)', keywords: ['tutor', 'academic tutor', 'online tutor'] },
  { label: 'Special Education', keywords: ['special education', 'reading intervention', 'instructional aide'] },
  { label: 'ESL / Adult Ed', keywords: ['ESL teacher', 'adult literacy', 'ELL instructor'] },
  { label: 'Phonics / Early Literacy', keywords: ['phonics tutor', 'early literacy', 'teach kids to read'] },
];

const LOCATION_PRESETS = [
  'Marion, IN',
  'Gas City, IN',
  'Fairmount, IN',
  'Muncie, IN',
  'Kokomo, IN',
  'Anderson, IN',
  'Remote',
];

// ─── Persistence ────────────────────────────────────────────────────────────

function loadTracked(): Record<string, TrackedJob> {
  try {
    return JSON.parse(localStorage.getItem('jobTracker') || '{}');
  } catch { return {}; }
}

function saveTracked(tracked: Record<string, TrackedJob>) {
  localStorage.setItem('jobTracker', JSON.stringify(tracked));
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function JobSearch() {
  const [keywords, setKeywords] = useState(['reading tutor', 'literacy tutor', 'reading specialist']);
  const [keywordInput, setKeywordInput] = useState('reading tutor, literacy tutor, reading specialist');
  const [location, setLocation] = useState('Marion, IN');
  const [includeRemote, setIncludeRemote] = useState(true);
  const [remoteOnly, setRemoteOnly] = useState(false);

  const [results, setResults] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedAt, setSearchedAt] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const [directLinks, setDirectLinks] = useState<DirectLinks | null>(null);
  const [showLinks, setShowLinks] = useState(true);
  const [showPlatforms, setShowPlatforms] = useState(true);
  const [showTracked, setShowTracked] = useState(false);

  const [tracked, setTracked] = useState<Record<string, TrackedJob>>(loadTracked);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Persist tracked jobs
  useEffect(() => { saveTracked(tracked); }, [tracked]);

  // Build direct links from current search params
  useEffect(() => {
    const kw = encodeURIComponent(keywords[0] || 'reading tutor');
    const loc = encodeURIComponent(location);
    setDirectLinks({
      jobBoards: [
        { name: 'Indeed', url: `https://www.indeed.com/jobs?q=${kw}&l=${loc}&fromage=14` },
        { name: 'ZipRecruiter', url: `https://www.ziprecruiter.com/jobs-search?search=${kw}&location=${loc}` },
        { name: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${kw}&location=${loc}` },
        { name: 'SchoolSpring', url: `https://www.schoolspring.com/jobs?term=${kw}` },
        { name: 'EDJOIN', url: `https://www.edjoin.org/Home/Jobs?keyword=${kw}` },
        { name: 'K12JobSpot', url: `https://www.k12jobspot.com/search?q=${kw}` },
        { name: 'EdWeek Jobs', url: 'https://www.edweek.org/jobs' },
        { name: 'Glassdoor', url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${kw}&locKeyword=${loc}` },
        { name: 'SimplyHired', url: `https://www.simplyhired.com/search?q=${kw}&l=${loc}` },
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
        { name: 'Indeed - Marion IN', url: 'https://www.indeed.com/q-teaching-l-marion,-in-jobs.html' },
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
  }, [keywords, location]);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    const allResults: JobResult[] = [];
    const searchErrors: string[] = [];

    // Search Himalayas API (free, CORS-enabled, remote jobs)
    if (includeRemote || remoteOnly) {
      for (const kw of keywords.slice(0, 3)) {
        try {
          const resp = await fetch(`https://himalayas.app/jobs/api?limit=15&q=${encodeURIComponent(kw)}`);
          if (resp.ok) {
            const data = await resp.json();
            for (const job of (data.jobs || [])) {
              allResults.push({
                title: job.title || '',
                company: job.companyName || '',
                location: 'Remote',
                url: job.applicationLink || `https://himalayas.app/jobs/${job.slug}`,
                source: 'Himalayas',
                salary: job.salaryCurrency ? `${job.salaryCurrency} ${job.minSalary || ''}–${job.maxSalary || ''}` : '',
                description: (job.excerpt || '').slice(0, 200),
                remote: true,
              });
            }
          }
        } catch (e) {
          searchErrors.push(`Himalayas: ${e}`);
        }
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    const unique = allResults.filter(r => {
      const key = r.url.replace(/\/$/, '').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setResults(remoteOnly ? unique.filter(r => r.remote) : unique);
    setSearchedAt(new Date().toISOString());
    setErrors(searchErrors);
    setLoading(false);
  }, [keywords, location, includeRemote, remoteOnly]);

  // Auto-search on mount
  useEffect(() => { doSearch(); }, []);

  const applyKeywordPreset = (preset: typeof KEYWORD_PRESETS[0]) => {
    setKeywords(preset.keywords);
    setKeywordInput(preset.keywords.join(', '));
  };

  const updateKeywordsFromInput = () => {
    const kws = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
    if (kws.length > 0) setKeywords(kws);
  };

  const trackJob = (job: JobResult, status: ApplicationStatus) => {
    setTracked(prev => ({
      ...prev,
      [job.url]: {
        url: job.url,
        title: job.title,
        company: job.company,
        status,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      },
    }));
  };

  const untrackJob = (url: string) => {
    setTracked(prev => {
      const next = { ...prev };
      delete next[url];
      return next;
    });
  };

  const updateTrackedNotes = (url: string, notes: string) => {
    setTracked(prev => ({
      ...prev,
      [url]: { ...prev[url], notes },
    }));
  };

  const updateTrackedStatus = (url: string, status: ApplicationStatus) => {
    setTracked(prev => ({
      ...prev,
      [url]: { ...prev[url], status, date: new Date().toISOString().split('T')[0] },
    }));
  };

  // Group results by source
  const groupedResults: Record<string, JobResult[]> = {};
  const filtered = activeFilter === 'all' ? results
    : activeFilter === 'remote' ? results.filter(r => r.remote)
    : results.filter(r => r.source === activeFilter);

  for (const r of filtered) {
    (groupedResults[r.source] ||= []).push(r);
  }

  const sources = [...new Set(results.map(r => r.source))];
  const trackedJobs = Object.values(tracked);

  return (
    <div className="pb-8 -mx-5 -mt-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-5 pt-6 pb-8">
        <h1 className="text-2xl font-bold">Job Search</h1>
        <p className="text-blue-200 text-sm mt-1">Teaching, Tutoring & Literacy Jobs</p>
      </div>

      {/* Search Controls */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, State"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {LOCATION_PRESETS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    location === loc
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Keywords</label>
            <div className="flex items-center gap-2 mt-1">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                onBlur={updateKeywordsFromInput}
                onKeyDown={e => e.key === 'Enter' && (updateKeywordsFromInput(), doSearch())}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="reading tutor, literacy coach..."
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {KEYWORD_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => applyKeywordPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    keywordInput === preset.keywords.join(', ')
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remote toggle */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeRemote}
                onChange={e => { setIncludeRemote(e.target.checked); if (!e.target.checked) setRemoteOnly(false); }}
                className="rounded accent-blue-600"
              />
              Include remote
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={e => { setRemoteOnly(e.target.checked); if (e.target.checked) setIncludeRemote(true); }}
                className="rounded accent-blue-600"
              />
              Remote only
            </label>
          </div>

          {/* Search button */}
          <button
            onClick={() => { updateKeywordsFromInput(); doSearch(); }}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Searching {sources.length > 0 ? `(${results.length} found so far...)` : '...'}
              </>
            ) : (
              <>
                <Search size={18} />
                Search Jobs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Applied Jobs Tracker */}
      {trackedJobs.length > 0 && (
        <div className="px-4 mt-4">
          <button
            onClick={() => setShowTracked(!showTracked)}
            className="w-full flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
          >
            <span className="flex items-center gap-2 font-semibold text-green-800">
              <CheckCircle2 size={18} />
              My Applications ({trackedJobs.length})
            </span>
            {showTracked ? <ChevronUp size={18} className="text-green-600" /> : <ChevronDown size={18} className="text-green-600" />}
          </button>

          {showTracked && (
            <div className="mt-2 space-y-2">
              {trackedJobs.sort((a, b) => b.date.localeCompare(a.date)).map(job => (
                <div key={job.url} className="bg-white rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <a href={job.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline line-clamp-1">
                        {job.title}
                      </a>
                      {job.company && <p className="text-xs text-gray-500">{job.company}</p>}
                    </div>
                    <button onClick={() => untrackJob(job.url)} className="text-gray-400 hover:text-red-500 shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={job.status}
                      onChange={e => updateTrackedStatus(job.url, e.target.value as ApplicationStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${
                        job.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                        job.status === 'interviewing' ? 'bg-purple-100 text-purple-700' :
                        job.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <span className="text-xs text-gray-400">{job.date}</span>
                  </div>
                  <input
                    type="text"
                    value={job.notes}
                    onChange={e => updateTrackedNotes(job.url, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full mt-2 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {(results.length > 0 || loading) && (
        <div className="px-4 mt-4">
          {/* Status bar */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">
              {loading ? 'Searching...' : `${filtered.length} Jobs Found`}
            </h2>
            {searchedAt && (
              <span className="text-xs text-gray-400">
                {new Date(searchedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Source filter pills */}
          {sources.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
              <button
                onClick={() => setActiveFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${
                  activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                All ({results.length})
              </button>
              {results.some(r => r.remote) && (
                <button
                  onClick={() => setActiveFilter('remote')}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1 ${
                    activeFilter === 'remote' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Wifi size={12} /> Remote
                </button>
              )}
              {sources.map(src => (
                <button
                  key={src}
                  onClick={() => setActiveFilter(src)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${
                    activeFilter === src ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {src} ({results.filter(r => r.source === src).length})
                </button>
              ))}
            </div>
          )}

          {/* Job cards */}
          <div className="space-y-2">
            {filtered.map((job, i) => {
              const isTracked = tracked[job.url];
              return (
                <div
                  key={`${job.url}-${i}`}
                  className={`bg-white rounded-xl border p-3.5 transition-all ${
                    isTracked ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 flex items-start gap-1"
                      >
                        {job.title}
                        <ExternalLink size={12} className="shrink-0 mt-1 text-gray-400" />
                      </a>
                      {job.company && (
                        <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.location && (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        <MapPin size={10} /> {job.location}
                      </span>
                    )}
                    {job.remote && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        <Wifi size={10} /> Remote
                      </span>
                    )}
                    {job.salary && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {job.salary}
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {job.source}
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    {isTracked ? (
                      <button
                        onClick={() => untrackJob(job.url)}
                        className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg"
                      >
                        <BookmarkCheck size={14} />
                        {isTracked.status === 'applied' ? 'Applied' :
                         isTracked.status === 'interviewing' ? 'Interviewing' :
                         isTracked.status === 'saved' ? 'Saved' : 'Tracked'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => trackJob(job, 'applied')}
                          className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle2 size={14} />
                          Applied
                        </button>
                        <button
                          onClick={() => trackJob(job, 'saved')}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Bookmark size={14} />
                          Save
                        </button>
                      </>
                    )}
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                    >
                      <ExternalLink size={14} />
                      View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="px-4 mt-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            <p className="font-medium mb-1">Some sources had issues:</p>
            {errors.map((e, i) => <p key={i}>- {e}</p>)}
          </div>
        </div>
      )}

      {/* Direct Links */}
      <div className="px-4 mt-6">
        <button
          onClick={() => setShowLinks(!showLinks)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-800">
            <Briefcase size={18} />
            Browse Job Boards Directly
          </span>
          {showLinks ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showLinks && directLinks && (
          <div className="mt-2 space-y-4">
            <LinkSection title="Job Boards" links={directLinks.jobBoards} />
            <LinkSection title="Nonprofit Boards" links={directLinks.nonprofitBoards} />
            <LinkSection title="Local - Grant County" links={directLinks.localResources} />
          </div>
        )}
      </div>

      {/* Tutoring Platforms */}
      <div className="px-4 mt-3">
        <button
          onClick={() => setShowPlatforms(!showPlatforms)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-800">
            <Bookmark size={18} />
            Tutoring Platforms (Sign Up & Earn)
          </span>
          {showPlatforms ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showPlatforms && directLinks && (
          <div className="mt-2 space-y-2">
            {directLinks.tutoringPlatforms.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  {p.note && <p className="text-xs text-gray-500 mt-0.5">{p.note}</p>}
                </div>
                <ExternalLink size={16} className="text-gray-400 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="px-4 mt-6 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-bold text-blue-900 text-sm">Quick Tips</h3>
          <ul className="mt-2 space-y-1.5 text-xs text-blue-800">
            <li>- Try different keyword presets above to find different types of roles</li>
            <li>- Change the city to nearby towns (Gas City, Muncie, Kokomo)</li>
            <li>- Check "Remote only" for work-from-home tutoring jobs</li>
            <li>- The Grant County Schools Portal has ALL local district jobs</li>
            <li>- Sign up on Wyzant + BookNook to start earning while you search</li>
            <li>- Mark jobs as "Applied" to track your applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function LinkSection({ title, links }: { title: string; links: { name: string; url: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1.5">{title}</h3>
      <div className="space-y-1.5">
        {links.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-3 py-2.5 hover:bg-gray-50"
          >
            <span className="text-sm text-gray-800">{link.name}</span>
            <ExternalLink size={14} className="text-gray-400" />
          </a>
        ))}
      </div>
    </div>
  );
}
