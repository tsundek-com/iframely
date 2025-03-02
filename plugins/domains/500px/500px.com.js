export default {

    re: /^https?:\/\/(?:web\.)?500px\.com\/photo\/(\d+)/i,

    mixins: ["*"],

    getLinks: function(urlMatch, twitter, utils, options, cb) {
        if (twitter.image) {
            utils.getImageMetadata(twitter.image, options, function(error, data) {
                if (data.width && data.height) {
                    return cb(null, {
                        template_context: {
                            title: twitter.title + ' | ' + twitter.site,
                            img_src: twitter.image,
                            id: urlMatch[1]
                        },
                        type: CONFIG.T.text_html,
                        rel: [CONFIG.R.image, CONFIG.R.ssl, CONFIG.R.inline],
                        "aspect-ratio": data.width / data.height
                    })
                } else {
                    return cb();
                }
            });
        } else {
            return cb();
        }
    },

    getData: function(options) {
        options.timeout = 40 * 1000;
    },

    tests: [{skipMethods:['getData']},
        "https://web.500px.com/photo/13541787/Long-After-Sunset-In-The-Black-Mountains-by-Jim-Ross/",
        "https://500px.com/photo/56891080/frozen-by-ryan-pendleton?ctx_page=1&from=user&user_id=116369"
    ]
};