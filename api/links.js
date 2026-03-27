export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { keyword = 'reading tutor', location = 'Marion, IN' } = req.query || {};
  const kw = encodeURIComponent(keyword);
  const loc = encodeURIComponent(location);

  res.status(200).json({
    jobBoards: [
      { name: 'Indeed', url: `https://www.indeed.com/jobs?q=${kw}&l=${loc}&fromage=14` },
      { name: 'ZipRecruiter', url: `https://www.ziprecruiter.com/jobs-search?search=${kw}&location=${loc}` },
      { name: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${kw}&location=${loc}` },
      { name: 'SchoolSpring', url: `https://www.schoolspring.com/jobs?term=${kw}` },
      { name: 'EDJOIN', url: `https://www.edjoin.org/Home/Jobs?keyword=${kw}` },
      { name: 'K12JobSpot', url: `https://www.k12jobspot.com/search?q=${kw}` },
      { name: 'EdWeek Jobs', url: 'https://www.edweek.org/jobs' },
      { name: 'Glassdoor', url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${kw}&locKeyword=${loc}` },
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
}
