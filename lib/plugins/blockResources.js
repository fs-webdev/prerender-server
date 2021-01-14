let blockedResources = [
	"google-analytics.com",
	"api.mixpanel.com",
	"fonts.googleapis.com",
	"stats.g.doubleclick.net",
	"mc.yandex.ru",
	"use.typekit.net",
	"beacon.tapfiliate.com",
	"js-agent.newrelic.com",
	"api.segment.io",
	"woopra.com",
	"static.olark.com",
	"static.getclicky.com",
	"fast.fonts.com",
	"youtube.com/embed",
	"cdn.heapanalytics.com",
	"googleads.g.doubleclick.net",
	"pagead2.googlesyndication.com",
	"fullstory.com/rec",
	"navilytics.com/nls_ajax.php",
	"log.optimizely.com/event",
	"hn.inspectlet.com",
	"tpc.googlesyndication.com",
	"partner.googleadservices.com",
	".ttf",
	".eot",
	".otf",
	".woff",
	".png",
	".gif",
	".tiff",
	".pdf",
	".jpg",
	".jpeg",
	".ico",
	".svg",
	// added by familysearch
	"streaming.split.io",
	"adobedtm",
	"newrelic",
	"adrum",
	"appdynamics",
	"w.usabilla.com",
	"dkr0d30ggygt1.cloudfront.net/vendor/adobe/",
	"omtrdc.net",
	"/home/banner/currentBanners",
];

module.exports = {
	init: () => {
		if (process.env.EXTRA_BLOCKED_RESOURCES) {
			console.log('adding additional blocked resources:', process.env.EXTRA_BLOCKED_RESOURCES)
			blockedResources = blockedResources.concat(process.env.EXTRA_BLOCKED_RESOURCES.split(','))
		}
	},
	tabCreated: (req, res, next) => {
		req.prerender.tab.Network.setRequestInterception({
			patterns: [{urlPattern: '*'}]
		}).then(() => {
			next();
		});

		req.prerender.tab.Network.requestIntercepted(({interceptionId, request}) => {

			let shouldBlock = false;
			blockedResources.forEach((substring) => {
				if (request.url.includes(substring)) {
					console.log(`action=blockingRequest url=${request.url}`)
					shouldBlock = true;
				}
			});

			let interceptOptions = {interceptionId};

			if (shouldBlock) {
				interceptOptions.errorReason = 'Aborted';
			}

			req.prerender.tab.Network.continueInterceptedRequest(interceptOptions);

		});
	}
};