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
                    var date = new Date(notif.timestamp),
                        episodes = '';

                    notif.animes.forEach(function(anime) {
                        episodes += `<a href="${anime.href}" target="_blank">${anime.title} - ${anime.episode}</a><br>`
                    });

                    document.getElementById('unread-notifs').innerHTML += `<div class="box">
                    <article class="media"><div class="media-content"><div class="content"><p>
                    <strong>${chrome.i18n.getMessage('new_release')} ${notif.website.name}</strong> <small>
                    ${date.getDate().length == 1 ? '0' + date.getDate() : date.getDate()}/${(date.getMonth() + 1).toString().length == 1 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/${date.getFullYear()}
                    ${date.getHours().toString().length == 1 ? '0' + date.getHours().toString() : date.getHours()}h${date.getMinutes().toString().length == 1 ? '0' + date.getMinutes().toString() : date.getMinutes()}</small>
                    <br>
                    ${episodes}
                    </p></div></div></article></div>`;
                }
            });
        }
    });

    //reset the unread notifications badge.
    chrome.browserAction.setBadgeText({
        text: ''
    });
}
