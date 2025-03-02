export default {

    re: [
        /^https?:\/\/(?:open|play|www)\.spotify\.com\/(?:track|album|artist|show|episode|playlist)/i
    ],

    mixins: [
        "oembed-title",
        "og-image",
        "oembed-thumbnail",
        "oembed-iframe",
        "domain-icon"
    ],

    getMeta: function(meta) {
        var description = meta.og?.description || meta.twitter?.description;
        if (description) {
            description = description.replace('Podcast · [object Object] · ', '');
        }
        return {
            title: meta.og?.title || meta.twitter?.title, //oembed.title is subpar for audiobooks
            date: meta.music?.release_date,
            author: meta.twitter?.audio?.artist_name,
            author_url: meta.music?.musician,
            duration: meta.music?.duration,
            description: description,
            canonical: meta.og?.url,
            site: meta.og?.site_name || 'Spotify'
        }
    },

    getLink: function(iframe, options) {

        const COMPACT_PLAYER_HEIGHT = 152;
        const NORMAL_PLAYER_HEIGHT = 352;

        if (iframe.src) {

            var compact_player = options.getRequestOptions('spotify.compact', options.getRequestOptions('players.horizontal', true));

            var player = {
                href: iframe.src,
                type: CONFIG.T.text_html,
                rel: [CONFIG.R.player, CONFIG.R.ssl],
                options: {}
            };

            if (/album|playlist/.test(iframe.src)) {
                var include_playlist = options.getRequestOptions('spotify.playlist', true);
                player.rel.push(CONFIG.R.playlist);
                player.options.playlist = {
                    label: CONFIG.L.playlist,
                    value: include_playlist
                };
                player.media = {
                    height: !include_playlist ? COMPACT_PLAYER_HEIGHT : (iframe.height || NORMAL_PLAYER_HEIGHT)
                };

            } else if (/episode/.test(iframe.src) && /* isVideo */ !!iframe.width) { // 100% width for audio episodes is not set in `iframe`
                player.media = iframe.height
                    ? {'aspect-ratio' : iframe.width / iframe.height}
                    : {height: COMPACT_PLAYER_HEIGHT}

            // else /track/ or /show or audio /episode (the once without 100% width)
            } else { 
                player.rel.push(CONFIG.R.audio);
                player.options.compact = {
                    label: CONFIG.L.horizontal,
                    value: compact_player === true
                };

                player.media = compact_player ? {
                    height:  COMPACT_PLAYER_HEIGHT,
                } : {
                    height: NORMAL_PLAYER_HEIGHT
                };
            }

            return player;
        }
    },

    getData: function (url, options, cb) {

        options.exposeStatusCode = true; // fallback for playlists - now 404s
        options.followHTTPRedirect = true;

        const trackInAlbumRegex = /^https?:\/\/open\.spotify\.com\/album\/[a-zA-Z0-9]+\?highlight=spotify:track:([a-zA-Z0-9]+)/i;

        if (!options.redirectsHistory && /^https?:\/\/play\./i.test(url)) {
            return cb ({
                redirect: url.replace(/^https?:\/\/play\./i, 'https://open.')
            })
        } else if (!options.redirectsHistory 
            && trackInAlbumRegex.test(url)) {
            return cb ({
                redirect: 'https://open.spotify.com/track/' + url.match(trackInAlbumRegex)[1]
            })            

        } else {
            cb(null);
        }
    },    

    tests: [{noFeeds: true}, {skipMethods: ["getData"], skipMixins: ["oembed-iframe", "oembed-thumbnail", "og-image", "oembed-title"]},
        "https://open.spotify.com/playlist/44CgBWWr6nlpy7bdZS8ZmN",
        "http://open.spotify.com/track/6ol4ZSifr7r3Lb2a9L5ZAB",
        "https://open.spotify.com/playlist/4SsKyjaGlrHJbRCQwpeUsz",
        "http://open.spotify.com/album/42jcZtPYrmZJhqTbUhLApi",
        "https://open.spotify.com/playlist/0OV99Ep2d1DCENJRPuEtXV",
        "https://open.spotify.com/track/4by34YzNiEFRESAnBXo7x4",
        "https://open.spotify.com/track/2qZ36jzyP1u29KaeuMmRZx",
        "http://open.spotify.com/track/7ldU6Vh9bPCbKW2zHE65dg",
        "https://play.spotify.com/track/2vN0b6d2ogn72kL75EmN3v",
        "https://play.spotify.com/track/34zWZOSpU2V1ab0PiZCcv4",
        "https://open.spotify.com/show/7gozmLqbcbr6PScMjc0Zl4?si=nUubrGA2Sj-2pYPgkSWYrA",
        "https://open.spotify.com/episode/2DBstW0LumPSF5SyO5ofRe",
        // soft 404: "https://open.spotify.com/episode/48Hca47BsH35I2GS0trj68",
        "https://open.spotify.com/album/3obcdB2QRQMfUBHzjOto4K?highlight=spotify:track:2qZ36jzyP1u29KaeuMmRZx",
        "https://open.spotify.com/episode/2jAYGAbZHxReyhtK6kI5xG",
        "https://open.spotify.com/track/7wOhrfBztELHLHuQQ3YOVA"
    ]
};