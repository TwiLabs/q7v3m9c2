(() => {
	const CACHE_FAMILY = 'space-static-v1:';

	const packageScope = () => new URL(self.registration.scope);
	const cachePrefix = () => `${CACHE_FAMILY}${encodeURIComponent(packageScope().pathname)}:`;
	const cacheName = () => `${cachePrefix()}${encodeURIComponent(self.mas2db7bv92gl5qrngsifs?.buildId || 'development')}`;

	function packagePath(request) {
		const url = new URL(request.url);
		const scope = packageScope();
		if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return null;
		return url.pathname.slice(scope.pathname.length);
	}

	function isPackageAsset(request) {
		if (request.method !== 'GET' || request.headers.has('range')) return false;
		const url = new URL(request.url);
		if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
		const path = packagePath(request);
		if (path === null || !path) return false;

		const proxyPrefix = String(self.mas2db7bv92gl5qrngsifs?.prefix || '/s/res/').replace(/^\//, '');
		if (path.startsWith(proxyPrefix) || path.startsWith('api/')) return false;
		return /^(?:index\.svg|index\.html|newtab\.html|space-config\.json|pc2lf3fzh8f\.js|space-manifest\.json|sw\.js|assets\/|fonts\/|s\/(?!res\/)|c\/|l\/|ep\/|ut\/)/.test(path);
	}

	async function spaceStaticAssetResponse(request, fetchImpl = fetch) {
		if (!isPackageAsset(request)) return null;
		const htmlResponse = response => {
			if (response.status !== 200 || response.type === 'opaque' ||
				(response.url && packagePath({ url: response.url }) === null) ||
				!packagePath(request)?.endsWith('.html')) return response;
			const headers = new Headers(response.headers);
			headers.set('Content-Type', 'text/html; charset=utf-8');
			return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
		};

		const cache = await caches.open(cacheName());
		try {
			const response = htmlResponse(await fetchImpl(request));
			if (
				response.status === 200 &&
				response.type !== 'opaque' &&
				(!response.url || packagePath({ url: response.url }) !== null)
			) {
				await cache.put(request, response.clone());
			}
			return response;
		} catch (error) {
			const cached = await cache.match(request);
			if (cached) return htmlResponse(cached);
			return new Response('Space package resource is unavailable', {
				status: 503,
				headers: { 'Content-Type': 'text/plain; charset=utf-8' },
			});
		}
	}

	async function cleanupSpaceStaticCaches() {
		const prefix = cachePrefix();
		const current = cacheName();
		await Promise.all((await caches.keys())
			.filter(name => name.startsWith(prefix) && name !== current)
			.map(name => caches.delete(name)));
	}

	self.spaceStaticAssetResponse = spaceStaticAssetResponse;
	self.cleanupSpaceStaticCaches = cleanupSpaceStaticCaches;
	self.addEventListener('activate', event => {
		event.waitUntil(cleanupSpaceStaticCaches());
	});
})();
