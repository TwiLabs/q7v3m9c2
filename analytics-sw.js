// First-party analytics library served from the service worker so static
// deploys (no API server) still get a working tag. Fixed upstream only:
// this must never become an arbitrary URL proxy.
(function () {
	const TAG_URL =
		'https://www.googletagmanager.com/gtag/js?id=G-3DTW1KTNCF';
	const CACHE = 'space-analytics-v1';
	const MAX_AGE_MS = 300000;

	const matches = (request, origin) => {
		if (request.method !== 'GET') return false;
		try {
			const url = new URL(request.url);
			// Suffix match: static subpath mounts serve this under the
			// package base, not the origin root. Same-origin only.
			return (
				url.origin === origin && url.pathname.endsWith('/api/tag')
			);
		} catch {
			return false;
		}
	};

	self.spaceAnalyticsResponse = async request => {
		const origin = self.location.origin;
		if (!matches(request, origin)) return null;
		const cache = await caches.open(CACHE);
		const cached = await cache.match(request.url);
		if (
			cached !== null &&
			Number(cached.headers.get('x-analytics-cached-at') ?? 0) +
				MAX_AGE_MS >
				Date.now()
		)
			return cached;
		try {
			const upstream = await fetch(TAG_URL, {
				redirect: 'error',
				signal: AbortSignal.timeout(5000)
			});
			if (!upstream.ok) return cached;
			const body = await upstream.text();
			const headers = new Headers({
				'x-analytics-cached-at': String(Date.now())
			});
			headers.set('content-type', 'application/javascript; charset=utf-8');
			await cache.put(request.url, new Response(body, { headers }));
			return new Response(body, { headers });
		} catch {
			return cached;
		}
	};
})();
