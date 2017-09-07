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
            var siteList = document.getElementById('site-list');

            var li = document.createElement('li');
            li.setAttribute('id', `button-${site}`);
            siteList.appendChild(li);

            var a = document.createElement('a');
            li.appendChild(a);

            var siteName = document.createTextNode(`${site[0].toUpperCase() + site.substring(1, site.length).toLowerCase()}`);
            a.appendChild(siteName);

            var i = document.createElement('i');
            i.textContent = `${res.websites[site].language} - `;
            a.insertBefore(i, siteName);
        });

        //Then add the button to the homepage.
        document.getElementById('button-presentation').addEventListener('click', function(click) {
            showPresentation();
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
    chrome.storage.local.get('websites', function(res) {
        //Get data from storage and create the little menu at the top.
        var wrapper = document.getElementById('wrapper');
        // Clear the wrapper
        wrapper.innerHTML = '';

        // Div navbar offset
        var navBarOffset = document.createElement('div');
        navBarOffset.className = 'navbar-offset';
        wrapper.appendChild(navBarOffset);

        // Div field navbar box
        var fieldNav = document.createElement('div');
        fieldNav.className = 'field navbar box';
        navBarOffset.appendChild(fieldNav);

        // Selected site :
        var selectedSite = document.createElement('p');
        selectedSite.className = 'is-4';
        fieldNav.appendChild(selectedSite);
        selectedSite.appendChild(document.createTextNode(chrome.i18n.getMessage('selected_site')));

        // Make the name of the selected site appear as strong
        var selectedSite_strong = document.createElement('strong');
        selectedSite_strong.textContent = `${site[0].toUpperCase() + site.substring(1, site.length).toLowerCase()}`;
        selectedSite.appendChild(selectedSite_strong);

        // I appreciate doing DOM manipulations in JS this is the greatest thing I ever did in my life
        selectedSite.appendChild(document.createElement('br'));
        selectedSite.appendChild(document.createElement('br'));

        selectedSite.appendChild(document.createTextNode(chrome.i18n.getMessage('checked_titles_show')));

        // Radio buttons 1 :
        var field = document.createElement('div');
        field.className = 'field';
        selectedSite.appendChild(field);
        field.appendChild(document.createElement('br'));

        // First button
        // Label
        var label1 = document.createElement('label');
        label1.className = 'radio';
        field.appendChild(label1);
        var label1_text = document.createTextNode(chrome.i18n.getMessage('yes'));
        label1.appendChild(label1_text);

        var radio1 = document.createElement('input');
        radio1.setAttribute('type', 'radio');
        radio1.setAttribute('id', 'checked-true');
        radio1.checked = false;
        label1.insertBefore(radio1, label1_text);

        // Second button
        // Label
        var label2 = document.createElement('label');
        label2.className = 'radio';
        field.appendChild(label2);
        var label2_text = document.createTextNode(chrome.i18n.getMessage('no'));
        label2.appendChild(label2_text);

        var radio2 = document.createElement('input');
        radio2.setAttribute('type', 'radio');
        radio2.setAttribute('id', 'checked-false');
        radio2.checked = true;
        label2.insertBefore(radio2, label2_text);


        // Checked titles are :
        selectedSite.appendChild(document.createElement('br'));
        selectedSite.appendChild(document.createTextNode(chrome.i18n.getMessage('checked_titles_are')));
        selectedSite.appendChild(document.createElement('br'));
        selectedSite.appendChild(document.createElement('br'));

        // First button
        // Label
        var label3 = document.createElement('label');
        label3.className = 'radio';
        selectedSite.appendChild(label3);
        var label3_text = document.createTextNode(chrome.i18n.getMessage('accepted'));
        label3.appendChild(label3_text);

        var radio3 = document.createElement('input');
        radio3.setAttribute('type', 'radio');
        radio3.setAttribute('id', 'accepting');
        radio3.checked = res.websites[site.toLowerCase()].ignoring ? false : true;
        label3.insertBefore(radio3, label3_text);

        // Second button
        // Label
        var label4 = document.createElement('label');
        label4.className = 'radio';
        selectedSite.appendChild(label4);
        var label4_text = document.createTextNode(chrome.i18n.getMessage('ignored'));
        label4.appendChild(label4_text);

        var radio4 = document.createElement('input');
        radio4.setAttribute('type', 'radio');
        radio4.setAttribute('id', 'ignoring');
        radio4.checked = res.websites[site.toLowerCase()].ignoring ? true : false;
        label4.insertBefore(radio4, label4_text);


        // Number of titles displayed :
        selectedSite.appendChild(document.createElement('br'));
        selectedSite.appendChild(document.createElement('br'));
        selectedSite.appendChild(document.createTextNode(chrome.i18n.getMessage('number_titles')));

        var numberTitles = document.createElement('strong');
        numberTitles.setAttribute('id', 'number');
        numberTitles.textContent = '?';
        selectedSite.appendChild(numberTitles);

        selectedSite.appendChild(document.createElement('br'));
        selectedSite.appendChild(document.createElement('br'));

        var control = document.createElement('p');
        control.className = 'control has-icons-right has-icon';
        selectedSite.appendChild(control);


        // Searchbar
        var searchbar = document.createElement('input');
        searchbar.className = 'input is-medium is-fullwidth';
        searchbar.setAttribute('type', 'text');
        searchbar.setAttribute('placeholder', chrome.i18n.getMessage('search_title'));
        searchbar.setAttribute('id', 'searchanime');
        control.appendChild(searchbar);

        // Searchbar icon on left
        var icon_span = document.createElement('span');
        icon_span.className = 'icon is-right';
        control.appendChild(icon_span);

        var icon = document.createElement('i');
        icon.className = 'fa fa-search';
        icon_span.appendChild(icon);


        // Table
        var animeList = document.createElement('div');
        animeList.className = 'anime-list';
        animeList.setAttribute('id', 'anime-list');
        navBarOffset.appendChild(animeList);

        var table = document.createElement('table');
        table.className = 'table';
        table.setAttribute('id', 'table-table');
        animeList.appendChild(table);

        var thead = document.createElement('thead');
        thead.style = 'width:100px!important;';
        table.appendChild(thead);

        var thead_tr = document.createElement('tr');
        thead.appendChild(thead_tr);

        var th_title = document.createElement('th');
        th_title.setAttribute('id', 'table-title');
        th_title.textContent = chrome.i18n.getMessage('table_title');
        thead_tr.appendChild(th_title);

        var th_episode = document.createElement('th');
        th_episode.setAttribute('id', 'table-episode');
        th_episode.textContent = chrome.i18n.getMessage('table_last_episode');
        thead_tr.appendChild(th_episode);

        var th_last_release = document.createElement('th');
        th_last_release.textContent = chrome.i18n.getMessage('table_last_release_date');
        thead_tr.appendChild(th_last_release);

        var tbody = document.createElement('tbody');
        tbody.setAttribute('id', 'full-list');
        table.appendChild(tbody);

        //Then get the animes and display them.
        getAnimeList(site);
    });
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
            //Reset the buttons
            document.getElementById('checked-true').checked = false;
            document.getElementById('checked-false').checked = true;
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
            var fullList = document.getElementById('full-list');

            var row = document.createElement('tr');
            fullList.appendChild(row);

            // Checkbox + title
            var checkboxTitle = document.createElement('td');
            row.appendChild(checkboxTitle);

            var checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            checkbox.setAttribute('id', `checkbox-${index}`);
            checkbox.style = 'margin-right:8px!important;';
            checkbox.checked = res.websites[site.toLowerCase()].titles.includes(anime.title) ? true : false;
            checkboxTitle.appendChild(checkbox);

            var spanTitle = document.createElement('span');
            spanTitle.setAttribute('id', `title-${index}`);
            spanTitle.textContent = anime.title;
            checkboxTitle.appendChild(spanTitle);


            // last episode
            var lastEpisode = document.createElement('td');
            row.appendChild(lastEpisode);

            var episode = document.createElement('span');
            episode.setAttribute('id', `episode-${index}`);
            episode.textContent = anime.episode.toString();
            lastEpisode.appendChild(episode);

            var invisibleTimestamp = document.createElement('span');
            invisibleTimestamp.setAttribute('id', `timestamp-${index}`);
            invisibleTimestamp.textContent = anime.timestamp;
            invisibleTimestamp.style = 'display:none!important;';
            lastEpisode.appendChild(invisibleTimestamp);

            var lastRelease = document.createElement('td');
            lastRelease.textContent = `${semaine[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()} ${date.getHours().toString().length == 1 ? '0' + date.getHours().toString() : date.getHours()}h${date.getMinutes().toString().length == 1 ? '0' + date.getMinutes().toString() : date.getMinutes()}`;
            row.appendChild(lastRelease);
        });
    });

    //Needed timeout because it won't work without it for whatever reasons ¯\_(ツ)_/¯
    setTimeout(function() {
        //Update the number of animes displayed element.
        document.getElementById('number').innerText = data.length;
        //Update and add every listener on every checkbox.
        plsCheckboxes(data, site);
    }, 3);
}

setTimeout(() => {
    //Translate the thing on the menu and the homepage.
    translate();
}, 2);

function translate() {
    document.getElementById('i18n_others').innerText = chrome.i18n.getMessage('i18n_others');
    document.getElementById('i18n_presentation').innerText = chrome.i18n.getMessage('i18n_presentation');
    document.getElementById('i18n_site_settings').innerText = chrome.i18n.getMessage('i18n_site_settings');
    if (document.getElementById('wrapper-presentation')) showPresentation();
}

function showPresentation() {
    var wrapper = document.getElementById('wrapper');
    wrapper.innerHTML = ' ';

    var presentationDiv = document.createElement('div');
    presentationDiv.className = 'presentation';
    presentationDiv.setAttribute('id', 'wrapper-presentation');
    wrapper.appendChild(presentationDiv);

    var presentationText = chrome.i18n.getMessage('i18n_homepage');
    presentationText = presentationText.split('<br>');
    presentationText.forEach(function(part) {
        presentationDiv.appendChild(document.createTextNode(part));
        presentationDiv.appendChild(document.createElement('br'));
    });
}