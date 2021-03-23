const debug = require('debug')('prerender:blockResources')
const util = require('../util')

let blockedResourcePatterns = [
	"*google-analytics.com*",
	"*api.mixpanel.com*",
	"*fonts.googleapis.com*",
	"*stats.g.doubleclick.net*",
	"*mc.yandex.ru*",
	"*use.typekit.net*",
	"*beacon.tapfiliate.com*",
	"*js-agent.newrelic.com*",
	"*api.segment.io*",
	"*woopra.com*",
	"*static.olark.com*",
	"*static.getclicky.com*",
	"*fast.fonts.com*",
	"*youtube.com/embed*",
	"*cdn.heapanalytics.com*",
	"*googleads.g.doubleclick.net*",
	"*pagead2.googlesyndication.com*",
	"*fullstory.com/rec*",
	"*navilytics.com/nls_ajax.php*",
	"*log.optimizely.com/event*",
	"*hn.inspectlet.com*",
	"*tpc.googlesyndication.com*",
	"*partner.googleadservices.com*",
	"*.ttf",
	"*.eot",
	"*.otf",
	"*.woff",
	"*.woff2",
	"*.png",
	"*.gif",
	"*.tiff",
	"*.pdf",
	"*.jpg",
	"*.jpeg",
	"*.ico",
	"*.svg",
	// added by FamilySearch
	"*streaming.split.io*",
	"*assets.adobedtm*",
	"*newrelic.com*",
	"*nr-data.net*",
	"*cdn.appdynamics.com*",
	"*eum-appdynamics.com*",
	"*w.usabilla.com*",
	"*dkr0d30ggygt1.cloudfront.net/vendor/adobe/*",
	"*omtrdc.net*",
	"*/home/banner/currentBanners*",
];

let blockedResources = [];

module.exports = {
	init: () => {
		if (process.env.EXTRA_BLOCKED_RESOURCES) {
			console.log('adding additional blocked resources:', process.env.EXTRA_BLOCKED_RESOURCES)
			blockedResources = blockedResources.concat(process.env.EXTRA_BLOCKED_RESOURCES.split(','))
		}
	},
	tabCreated: async (req, res, next) => {
		const {enable, requestPaused, failRequest, continueRequest, fulfillRequest} = req.prerender.tab.Fetch
		
		req.prerender.tab.Network.setBlockedURLs({urls:blockedResourcePatterns})

		await enable()

		requestPaused(async event => {
			try {
				const {requestId, resourceType, request} = event
				let shouldBlock = false;
				blockedResources.forEach((substring) => {
					if (request.url.includes(substring)) {
						shouldBlock = true;
					}
				});
				
				if (shouldBlock) {
					util.log(`action=blockingRequest url=${request.url}`)

					const fail = await failRequest({requestId: event.requestId, errorReason: 'Aborted'})
					debug('requestPaused fail', fail)
				} else {
					await continueRequest({requestId})
				}
			} catch (err) {
				console.error('requestPaused error', err)
				await fulfillRequest({requestId: event.requestId, responseCode: 204}).catch(err=>console.error('fulfillRequest catch', err))
			}
		})

		next()		
	}
};