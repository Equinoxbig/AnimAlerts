//Days of the week and months, used when dates are displayed.
var semaine = [chrome.i18n.getMessage('monday'), chrome.i18n.getMessage('tuesday'), chrome.i18n.getMessage('wednesday'), chrome.i18n.getMessage('thursday'), chrome.i18n.getMessage('friday'), chrome.i18n.getMessage('saturday'), chrome.i18n.getMessage('sunday')],
    mois = [chrome.i18n.getMessage('january'), chrome.i18n.getMessage('february'), chrome.i18n.getMessage('march'), chrome.i18n.getMessage('april'), chrome.i18n.getMessage('may'), chrome.i18n.getMessage('june'), chrome.i18n.getMessage('july'), chrome.i18n.getMessage('august'), chrome.i18n.getMessage('september'), chrome.i18n.getMessage('october'), chrome.i18n.getMessage('november'), chrome.i18n.getMessage('december')];

//Used to cache requests to API.
let cache = {};

//onload get every site from storage / config.
document.addEventListener('DOMContentLoaded', function() {
    getSites();
});

function getSites() {
    chrome.storage.local.get('websites', function(res) {
        //For Each site add a button on the left menu
        Object.keys(res.websites).forEach(function(site) {
            document.getElementById('site-list').innerHTML += `<li id="button-${site}"><a><i>${res.websites[site].language} - </i>${site[0].toUpperCase() + site.substring(1, site.length).toLowerCase()}</a></li>`
        });

        //Then add the button to the homepage.
        document.getElementById('button-presentation').addEventListener('click', function(click) {
            document.getElementById('wrapper').innerHTML = `<div class="presentation" id="wrapper-presentation">${chrome.i18n.getMessage('i18n_homepage')}</div>`;
        });

        setTimeout(function() {
            Object.keys(res.websites).forEach(function(site) {
                document.getElementById(`button-${site}`).addEventListener('click', function(click) {
                    show(site);
                });
            });
        }, 1);
    });
}

function show(site) {
    //Get data from storage and create the little menu at the top.
    chrome.storage.local.get(['websites'], function(res) {
        document.getElementById('wrapper').innerHTML = `
        <div class="navbar-offset"><div class="field navbar box">
        <p class="is-4">${chrome.i18n.getMessage('selected_site')}<strong>${site[0].toUpperCase() + site.substring(1, site.length).toLowerCase()}</strong><br><br>${chrome.i18n.getMessage('checked_titles_show')}<div class="field">
        <br>
        <label class="radio">
        <input type="radio" id="checked-true">
        ${chrome.i18n.getMessage('yes')}
        </label>
        <label class="radio">
        <input type="radio" id="checked-false" checked>
        ${chrome.i18n.getMessage('no')}
        </label>
        </div><br>${chrome.i18n.getMessage('checked_titles_are')} <br><br><label class="radio">
        <input type="radio" id="accepting" ${res.websites[site.toLowerCase()].ignoring ? '' : 'checked'}>
        ${chrome.i18n.getMessage('accepted')}
        </label>
        <label class="radio">
        <input type="radio" id="ignoring" ${res.websites[site.toLowerCase()].ignoring ? 'checked' : ''}>
        ${chrome.i18n.getMessage('ignored')}
        </label><br><br>${chrome.i18n.getMessage('number_titles')}<strong id="number">?</strong><br><br></p>
        <p class="control has-icons-right has-icon">
            <input class="input is-medium is-fullwidth" type="text" placeholder="${chrome.i18n.getMessage('search_title')}" id="searchanime">
            <span class="icon is-right">
                <i class="fa fa-search"></i>
            </span>
        </p>
    </div><div class="anime-list" id="anime-list"><table class="table" id="table-table"><thead style="width:100px!important;"><tr><th id="table-title">${chrome.i18n.getMessage('table_title')}</th><th id="table-episode">${chrome.i18n.getMessage('table_last_episode')}</th><th>${chrome.i18n.getMessage('table_last_release_date')}</th></tr></thead>
    <tbody id="full-list"></tbody></table></div>`;
    });

    //Then get the animes and display them.
    getAnimeList(site);
}

function getAnimeList(site) {
    //If a request has already been sent get data from cache.
    if (cache[site.toLowerCase()]) {
        render(cache[site.toLowerCase()], site);
    }
    //Else request data.
    else {
        fetch(`http://equinox.ovh:353/${site.replace('-', '')}.json`, {
            method: 'GET'
        }).then(function(res) {
                res.json().then(function(data) {
                    render(data, site);
                });
            },
            function(err) {
                console.log(err.message);
            });
    }
}

function render(data, site) {
    //As every title from japscan is prefixed with Scan
    if (site == 'japscan')
        document.getElementById('searchanime').value = 'Scan ';

    //If data isn't cached, cache it.
    if (!cache[site.toLowerCase()])
        cache[site.toLowerCase()] = data;


    //Otherwise event listeners are a bit laggy
    setTimeout(function() {
        //Display every animes once.
        displayAll(data, site);

        //Only show checked animes
        document.getElementById('checked-true').addEventListener('click', function() {
            //Unchecking the other option
            document.getElementById('checked-false').checked = false;
            //Getting only checked anims and displaying them
            chrome.storage.local.get('websites', function(res) {
                displayAll(res.websites[site.toLowerCase()].chosen, site);
            });
        });

        //Show every animes
        document.getElementById('checked-false').addEventListener('click', function() {
            //Unchecking the other option
            document.getElementById('checked-true').checked = false
            //Display every animes
            displayAll(data, site);
        });

        //Updating accepting / ignoring checked animes
        document.getElementById('ignoring').addEventListener('click', function() {
            //Unchecking the other option
            document.getElementById('accepting').checked = false;

            //Updating the config
            chrome.storage.local.get('websites', function(res) {
                res.websites[site.toLowerCase()].ignoring = true;
                chrome.storage.local.set({
                    websites: res.websites
                });
            });
        });

        //Updating accepting / ignoring checked animes
        document.getElementById('accepting').addEventListener('click', function() {
            //Unchecking the other option
            document.getElementById('ignoring').checked = false;

            //Updating the config
            chrome.storage.local.get('websites', function(res) {
                res.websites[site.toLowerCase()].ignoring = false;
                chrome.storage.local.set({
                    websites: res.websites
                });
            });
        });

        //Searchbar filtering everytime a thing is typed in
        document.getElementById('searchanime').addEventListener('keyup', function(e) {
            //Get every title that includes the thing in the searchbar
            var display = data.filter(function(elem) {
                return elem.title.toLowerCase().includes(document.getElementById('searchanime').value.toLowerCase());
            });
            //Display these titles
            displayAll(display, site);
        });
    }, 5);
}

//Adds event listener for each checkbox
function plsCheckboxes(array, site) {
    array.forEach(function(anime, index) {
        document.getElementById(`checkbox-${index}`).addEventListener('click', function(click) {
            chrome.storage.local.get('websites', function(res) {
                //If checkbox is checked by the user
                if (click.toElement.checked) {
                    //and the anime is not already in the array
                    if (!res.websites[site.toLowerCase()].titles.includes(document.getElementById(`title-${index}`).innerHTML)) {
                        //Push anime data in chosen and title only in titles. and update the storage / config.
                        res.websites[site.toLowerCase()].chosen.push({
                            title: document.getElementById(`title-${index}`).innerHTML,
                            episode: document.getElementById(`episode-${index}`).innerHTML,
                            timestamp: document.getElementById(`timestamp-${index}`).innerHTML
                        });
                        res.websites[site.toLowerCase()].titles.push(document.getElementById(`title-${index}`).innerHTML);
                        chrome.storage.local.set({
                            websites: res.websites
                        });
                    }
                }
                //Else if checkbox is unchecked by the user
                else {
                    //And the anime title is in the array
                    if (res.websites[site.toLowerCase()].titles.includes(document.getElementById(`title-${index}`).innerHTML)) {
                        //Filter the array and remove everything that has the title. And update the storage / config
                        res.websites[site.toLowerCase()].chosen = res.websites[site.toLowerCase()].chosen.filter(function(elem) {
                            return elem.title != document.getElementById(`title-${index}`).innerHTML;
                        });
                        res.websites[site.toLowerCase()].titles = res.websites[site.toLowerCase()].titles.filter(function(title) {
                            return title != document.getElementById(`title-${index}`).innerHTML;
                        });
                        chrome.storage.local.set({
                            websites: res.websites
                        });
                    }
                }
            });
        });
    });
}

function displayAll(data, site) {
    //Reset what is actually displayed
    document.getElementById('full-list').innerHTML = ' ';
    //Get data to know if an anime should be checked or not.
    chrome.storage.local.get('websites', function(res) {
        data.forEach(function(anime, index) {
            //Timestamp has to be parsed as Int
            var date = new Date(parseInt(anime.timestamp, 10));
            //Add a row in the table.
            document.getElementById('full-list').innerHTML += `<tr><td>
              <input type="checkbox" id="checkbox-${index}" ${res.websites[site.toLowerCase()].titles.includes(anime.title) ? 'checked' : ''}>
              <span id="title-${index}">${anime.title}</span></input></td><td><span id="episode-${index}">${anime.episode.toString()}</span><span style='display:none!important' id="timestamp-${index}">${anime.timestamp}</span></td><td>${semaine[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}
              ${date.getHours().toString().length == 1 ? '0' + date.getHours().toString() : date.getHours()}h${date.getMinutes().toString().length == 1 ? '0' + date.getMinutes().toString() : date.getMinutes()}</small>
              </small></td></tr>`;
        });
    });

    //Needed timeout because it won't work without it for whatever reasons ¯\_(ツ)_/¯
    setTimeout(function() {
        //Update the number of animes displayed element.
        document.getElementById('number').innerHTML = data.length;
        //Update and add every listener on every checkbox.
        plsCheckboxes(data, site);
    }, 3);
}

setTimeout(() => {
    //Translate the thing on the menu and the homepage.
    translate();
}, 2);

function translate() {
    document.getElementById('i18n_others').innerHTML = chrome.i18n.getMessage('i18n_others');
    document.getElementById('i18n_presentation').innerHTML = chrome.i18n.getMessage('i18n_presentation');
    document.getElementById('i18n_site_settings').innerHTML = chrome.i18n.getMessage('i18n_site_settings');
    if (document.getElementById('wrapper-presentation')) document.getElementById('wrapper-presentation').innerHTML = chrome.i18n.getMessage('i18n_homepage');
}
