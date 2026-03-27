import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Briefcase, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle2, X, Building2, Heart, BookOpen, Search,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  salary_min?: number;
  salary_max?: number;
  description: string;
  redirect_url: string;
  created: string;
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const ADZUNA_APP_ID = '442502e4';
const ADZUNA_APP_KEY = '50a2afd4d6ad64df30f16d7ccaecc188';

function buildAdzunaLocation(location: string): string | undefined {
  if (location === 'Remote') return undefined;
  // Small IN cities → search all of Indiana for better coverage
  return 'Indiana';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}/yr`;
  if (min) return `From ${fmt(min)}/yr`;
  return null;
}

function postedAgo(created: string): string {
  const days = Math.floor((Date.now() - new Date(created).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  return `${Math.floor(days / 7)} weeks ago`;
}

function buildLinks(keyword: string, location: string): DirectLinks {
  const kw = encodeURIComponent(keyword);
  const loc = encodeURIComponent(location);
  return {
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
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function JobCard({ job, onSave }: { job: AdzunaJob; onSave: (job: AdzunaJob) => void }) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  const description = stripHtml(job.description);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{job.title}</h3>
          <p className="text-xs text-blue-600 mt-0.5 font-medium">{job.company.display_name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin size={11} />
              {job.location.display_name}
            </span>
            {salary && (
              <span className="text-xs text-green-600 font-medium">{salary}</span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400 shrink-0 mt-0.5">{postedAgo(job.created)}</span>
      </div>

      <p className="text-xs text-gray-500 mt-2.5 leading-relaxed line-clamp-3">
        {description}
      </p>

      <div className="flex items-center gap-2 mt-3">
        <a
          href={job.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Apply <ExternalLink size={11} />
        </a>
        <button
          onClick={() => onSave(job)}
          className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function SheetLink({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
    >
      <span className="text-sm font-medium text-gray-900">{name}</span>
      <ExternalLink size={16} className="text-gray-400 shrink-0" />
    </a>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function JobSearch() {
  const [keywords, setKeywords] = useState(['reading tutor', 'literacy tutor', 'reading specialist']);
  const [keywordInput, setKeywordInput] = useState('reading tutor, literacy tutor, reading specialist');
  const [location, setLocation] = useState('Marion, IN');
  const [directLinks, setDirectLinks] = useState<DirectLinks>(() => buildLinks('reading tutor', 'Marion, IN'));
  const [bottomSheet, setBottomSheet] = useState<string | null>(null);
  const [showTracked, setShowTracked] = useState(false);
  const [tracked, setTracked] = useState<Record<string, TrackedJob>>(loadTracked);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Job search state
  const [jobs, setJobs] = useState<AdzunaJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState<number | null>(null);

  useEffect(() => { saveTracked(tracked); }, [tracked]);

  useEffect(() => {
    setDirectLinks(buildLinks(keywords[0] || 'reading tutor', location));
  }, [keywords, location]);

  const doSearch = useCallback(async (kws: string[], loc: string) => {
    setLoading(true);
    setError(null);
    setJobs([]);

    const query = kws[0]; // Adzuna uses AND — use primary keyword only
    const where = buildAdzunaLocation(loc);

    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: '20',
      what: query,
      sort_by: 'date',
    });
    if (where) params.set('where', where);

    try {
      const res = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`);
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setJobs(data.results || []);
      setSearchCount(data.count ?? null);
    } catch {
      setError('Could not load jobs. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search on mount
  useEffect(() => {
    doSearch(keywords, location);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyKeywordPreset = (preset: typeof KEYWORD_PRESETS[0]) => {
    setKeywords(preset.keywords);
    setKeywordInput(preset.keywords.join(', '));
  };

  const updateKeywordsFromInput = () => {
    const kws = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
    if (kws.length > 0) setKeywords(kws);
  };

  const handleSearch = () => {
    const kws = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
    const finalKws = kws.length > 0 ? kws : keywords;
    setKeywords(finalKws);
    doSearch(finalKws, location);
  };

  const saveJob = (job: AdzunaJob) => {
    setTracked(prev => ({
      ...prev,
      [job.redirect_url]: {
        url: job.redirect_url,
        title: job.title,
        status: 'saved',
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
    setTracked(prev => ({ ...prev, [url]: { ...prev[url], notes } }));
  };

  const updateTrackedStatus = (url: string, status: ApplicationStatus) => {
    setTracked(prev => ({
      ...prev,
      [url]: { ...prev[url], status, date: new Date().toISOString().split('T')[0] },
    }));
  };

  const trackedJobs = Object.values(tracked);

  return (
    <div className="pb-8">
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
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
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

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search Jobs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Job Results */}
      <div className="px-4 mt-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => doSearch(keywords, location)}
              className="mt-2 text-xs text-red-600 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-3">
              Showing {jobs.length} jobs
              {searchCount && searchCount > jobs.length ? ` of ${searchCount.toLocaleString()} total` : ''}
              {' '}near {location}
            </p>
            <div className="space-y-3">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={saveJob}
                />
              ))}
            </div>
          </>
        )}

        {!loading && !error && jobs.length === 0 && searchCount === 0 && (
          <div className="text-center py-10 text-gray-400">
            <Search size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No jobs found. Try different keywords or a broader location.</p>
          </div>
        )}
      </div>

      {/* Application Tracker */}
      {trackedJobs.length > 0 && (
        <div className="px-4 mt-6">
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
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline line-clamp-1"
                      >
                        {job.title}
                      </a>
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

      {/* More Resources */}
      <div className="px-4 mt-6">
        <h2 className="font-bold text-gray-800 mb-3">More Resources</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setBottomSheet('jobBoards')}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Job Boards</p>
            <p className="text-xs text-gray-500 mt-0.5">{directLinks.jobBoards.length} sites</p>
          </button>

          <button
            onClick={() => setBottomSheet('local')}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
              <Building2 size={20} className="text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Local - Grant County</p>
            <p className="text-xs text-gray-500 mt-0.5">{directLinks.localResources.length} sites</p>
          </button>

          <button
            onClick={() => setBottomSheet('nonprofit')}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
              <Heart size={20} className="text-purple-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Nonprofit Boards</p>
            <p className="text-xs text-gray-500 mt-0.5">{directLinks.nonprofitBoards.length} sites</p>
          </button>

          <button
            onClick={() => setBottomSheet('tutoring')}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
              <BookOpen size={20} className="text-orange-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Tutoring Platforms</p>
            <p className="text-xs text-gray-500 mt-0.5">Sign up & earn</p>
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      {bottomSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setBottomSheet(null); }}
        >
          <div className="absolute inset-0 bg-black/40 animate-[fadeIn_0.2s_ease-out]" />

          <div
            ref={sheetRef}
            className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {bottomSheet === 'jobBoards' && 'Job Boards'}
                {bottomSheet === 'local' && 'Local - Grant County'}
                {bottomSheet === 'nonprofit' && 'Nonprofit Boards'}
                {bottomSheet === 'tutoring' && 'Tutoring Platforms'}
              </h2>
              <button
                onClick={() => setBottomSheet(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-3 space-y-2">
              {bottomSheet === 'jobBoards' && directLinks.jobBoards.map(link => (
                <SheetLink key={link.name} name={link.name} url={link.url} />
              ))}
              {bottomSheet === 'local' && directLinks.localResources.map(link => (
                <SheetLink key={link.name} name={link.name} url={link.url} />
              ))}
              {bottomSheet === 'nonprofit' && directLinks.nonprofitBoards.map(link => (
                <SheetLink key={link.name} name={link.name} url={link.url} />
              ))}
              {bottomSheet === 'tutoring' && directLinks.tutoringPlatforms.map(p => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    {p.note && <p className="text-xs text-gray-500 mt-0.5">{p.note}</p>}
                  </div>
                  <ExternalLink size={16} className="text-gray-400 shrink-0" />
                </a>
              ))}
              <div className="h-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
