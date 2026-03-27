export default async function handler(req, res) {
  const { what, where } = req.query;

  const ADZUNA_APP_ID = '442502e4';
  const ADZUNA_APP_KEY = '50a2afd4d6ad64df30f16d7ccaecc188';

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: '20',
    what: what || 'reading tutor literacy',
    sort_by: 'date',
  });

  if (where) {
    params.set('where', where);
  }

  try {
    const apiRes = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`
    );
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: 'Adzuna API error' });
    }
    const data = await apiRes.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}
