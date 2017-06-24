var ws, cache = {};
var version = '0.5.0'

chrome.storage.local.get(['last_notifs', 'websites', 'version'], function(res) {
    if (!res.last_notifs || !res.version || !res.websites || res.version != version)
        initialize();
});


chrome.notifications.onButtonClicked.addListener(function(notifID, index) {
    chrome.notifications.clear(notifID);
    if (!index) {
        //If watch now is clicked open a new page with the link of the anime.
        getCache(notifID);
        //And substract 1 on the badge
        minusBadge();
    } else {
        //Just substract 1 on the badge
        minusBadge();
    }
});

//Remove 1 to what is displayed actually on the badge.
function minusBadge() {
    chrome.browserAction.getBadgeText({
        tabId: null
    }, function(badge) {
        if (parseInt(badge, 10) == badge) {
            badge = parseInt(badge, 10) - 1;
            if (badge > 0) {
                chrome.browserAction.setBadgeText({
                    text: badge.toString()
                });
            } else {
                chrome.browserAction.setBadgeText({
                    text: ''
                });
            }
        } else {
            chrome.browserAction.setBadgeText({
                text: ''
            });
        }
    });
}

//set the badge background as red.
chrome.browserAction.setBadgeBackgroundColor({
    color: '#db3939'
});

//set the icon in the extension bar as the icon.
chrome.browserAction.setIcon({
    path: '../img/icon.png'
});

//remove the badge
chrome.browserAction.setBadgeText({
    text: ''
});


function connect() {
    try {
        ws = new WebSocket('ws://equinox.ovh:535');

        ws.onerror = function(err) {
            console.log(err);
            ws.close();
            setTimeout(function() {
                connect();
            }, 30000);
        }

        ws.onopen = function() {

            chrome.storage.local.get(['websites'], function(res) {
                console.log('Connected to websocket :\nKnown websites :', res.websites);
            });

            this.onclose = function() {
                console.log('Attempting to reconnect');
                setTimeout(function() {
                    connect();
                }, 30000);
            }

            this.onmessage = function(event) {
                var data = JSON.parse(event.data);
                //if data.event_type === 'release'. I keep it so I can add other events in the future if needed.
                if (data.event_type === 'sortie') {
                    chrome.storage.local.get('websites', function(res) {
                        //If the site is unknown add it to the list of known site (in case a site is added on the fly)
                        if (!Object.keys(res.websites).includes(data.website.name.toLowerCase())) {
                            res.websites[data.website.name.toLowerCase()] = {
                                name: data.website.name.toLowerCase(),
                                url: data.website.url,
                                chosen: [],
                                titles: [],
                                language: data.website.language,
                                ignoring: true
                            };
                            chrome.storage.local.set({
                                websites: res.websites
                            });
                            console.log('Known websites : ', res.websites);
                        }
                    });

                    //setTimeout in case of unknown website the site won't cause any trouble because of it not being defined.
                    setTimeout(function() {
                        chrome.storage.local.get(['last_notifs', 'websites'], function(res) {
                            //if checked titles are ignored :
                            if (res.websites[data.website.name.toLowerCase()].ignoring) {
                                var filtered = data.animes.filter(function(anime) {
                                    return !res.websites[data.website.name.toLowerCase()].titles.includes(anime.title);
                                });
                            }
                            //if checked titles are accepted :
                            else {
                                var filtered = data.animes.filter(function(anime) {
                                    return res.websites[data.website.name.toLowerCase()].titles.includes(anime.title);
                                });
                            }
                            data.animes = filtered;
                            //Check if there are still animes after the filter.
                            if (data.animes.length > 0) {
                                console.log('Filtered', filtered);
                                popNotif(data, res.last_notifs);
                            }
                        });
                    }, 2 * 1000);
                }
            }

        }
    } catch (e) {
        console.log(e, 'Attempting to reconnect in 30 seconds.');
        setTimeout(function() {
            connect();
        }, 30000);
    }
}

connect();

function popNotif(data, last_notifs) {
    //create an object for the notification and then create the notification from the object.
    var options = {
        type: 'basic',
        iconUrl: '../img/icon.png',
        title: chrome.i18n.getMessage('new_release') + data.website.name,
        message: '\n',
        buttons: [{
            title: chrome.i18n.getMessage('watch_now')
          }, {
            title: chrome.i18n.getMessage('mark_as_seen')
        }],
        isClickable: false
    };

    data.animes.forEach(function(anime) {
        options.message += anime.title + ' - ' + anime.episode + '\n'
    });

    setTimeout(function() {
        chrome.notifications.create('', options, function(notifID) {
            //Store the notification ID generated by chrome in the notification object.
            data.notifID = notifID;

            //It doesn't matter if some of them are undefined actually they just won't show up.
            if (last_notifs)
                chrome.storage.local.set({
                    last_notifs: [data, last_notifs[0], last_notifs[1], last_notifs[2], last_notifs[3]]
                });

            //If last_notifs had never been declared before.
            else
                chrome.storage.local.set({
                    last_notifs: [data]
                });

            //If there is more than one anime link the homepage of the site
            if (data.animes.length > 1)
                cache[notifID] = data.website.url;

            //Else just link the anime direct link.
            else
                cache[notifID] = data.animes[0].href;

            //add 1 to the badge.
            chrome.browserAction.getBadgeText({
                tabId: null
            }, function(badge) {
                if (parseInt(badge, 10) == badge) {
                    badge = parseInt(badge, 10) + 1;
                    chrome.browserAction.setBadgeText({
                        text: badge.toString()
                    });
                } else {
                    chrome.browserAction.setBadgeText({
                        text: '1'
                    });
                }
            });
        });
    }, 1000);
}

//Because adding event listeners makes the notifications go crazy and open
//an enormous amount of page it's easier to do it this way.
function getCache(notifID) {
    if (cache[notifID]) window.open(cache[notifID], '_blank');
}

//Initialize the data in the storage/config.
function initialize() {
    chrome.storage.local.set({
        last_notifs: [],
        version: version,
        websites: {
            'otakufr': {
                name: 'otakufr',
                url: 'http://otakufr.com',
                language: 'FR',
                chosen: [],
                titles: [],
                ignoring: true
            },
            'goldenkai': {
                name: 'goldenkai',
                url: 'http://goldenkai.me',
                language: 'FR',
                chosen: [],
                titles: [],
                ignoring: true
            },
            'neko-san': {
                name: 'neko-san',
                url: 'http://neko-san.fr',
                language: 'FR',
                chosen: [],
                titles: [],
                ignoring: true
            },
            'adkami': {
                name: 'adkami',
                url: 'http://adkami.com',
                language: 'FR',
                chosen: [],
                titles: [],
                ignoring: true
            },
            'crunchyroll': {
                name: 'crunchyroll',
                url: 'http://www.crunchyroll.com/videos/anime/updated',
                language: 'ALL',
                chosen: [],
                titles: [],
                ignoring: true
            },
            'horriblesubs': {
                name: 'horriblesubs',
                url: 'http://horriblesubs.info',
                language: 'EN',
                chosen: [],
                titles: [],
                ignoring: true
            },
            'japscan': {
                name: 'japscan',
                url: 'http://japscan.com',
                language: 'FR',
                chosen: [],
                titles: [],
                ignoring: true
            },
            'gogoanime': {
                name: 'gogoanime',
                url: 'http://gogoanime.io',
                language: 'EN',
                chosen: [],
                titles: [],
                ignoring: true
            }
        }
    });
}
