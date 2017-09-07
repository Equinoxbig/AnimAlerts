getNotifs();

document.addEventListener('DOMContentLoaded', function() {
    //When settings button is clicked open a settings page.
    document.getElementById('settings').addEventListener('click', function(click) {
        window.open('../html/settings.html', '_blank');
    });
});

function getNotifs() {
    //Get 5 last notifications from storage / config and add a box for each of them with data in it
    chrome.storage.local.get('last_notifs', function(res) {
        console.log(res);
        if (res.last_notifs) {
            res.last_notifs.forEach(function(notif) {
                if (notif) {
                    var date = new Date(notif.timestamp);

                    // Créer une box
                    var box = document.createElement('div');
                    box.className = 'box';
                    document.body.appendChild(box);

                    // Y ajoute la div media
                    var article = document.createElement('article');
                    article.className = 'media';
                    box.appendChild(article);

                    // Y ajoute la div media content
                    var mediaContent = document.createElement('div');
                    mediaContent.className = 'media-content';
                    article.appendChild(mediaContent);

                    // Y ajoute la div content
                    var content = document.createElement('div');
                    content.className = 'content';
                    mediaContent.appendChild(content);

                    // Y ajoute le paragraphe
                    var paragraph = document.createElement('p');
                    paragraph.setAttribute('id', 'newRelease')
                    content.appendChild(paragraph);

                    // Y ajoute le titre : Nouvelle sortie SITE
                    var strong = document.createElement('strong');
                    strong.textContent = `${chrome.i18n.getMessage('new_release')} ${notif.website.name}   `;
                    paragraph.appendChild(strong);

                    // Date :
                    var stringDate = `   ${date.getDate().length == 1 ? '0' + date.getDate() : date.getDate()}/${(date.getMonth() + 1).toString().length == 1 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/${date.getFullYear()} ${date.getHours().toString().length == 1 ? '0' + date.getHours().toString() : date.getHours()}h${date.getMinutes().toString().length == 1 ? '0' + date.getMinutes().toString() : date.getMinutes()}`;
                    var small = document.createElement('small');
                    small.textContent = stringDate;
                    paragraph.appendChild(small);

                    paragraph.appendChild(document.createElement('br'));

                    // Listes des animés :
                    notif.animes.forEach(function(anime) {
                        var a = document.createElement('a');
                        a.setAttribute('href', anime.href);
                        a.setAttribute('target', '_blank');
                        a.textContent = `${anime.title} - ${anime.episode}`;
                        paragraph.appendChild(a);

                        paragraph.appendChild(document.createElement('br'));
                    });
                }
            });
        }
    });

    //reset the unread notifications badge.
    chrome.browserAction.setBadgeText({
        text: ''
    });
}