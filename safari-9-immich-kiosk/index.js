/**
 * @typedef {Object} AppSettings
 * @property {string} immichApiKey
 * @property {string} immichServerUrl
 * @property {string} mostRecentAlbumId
 * @property {number} animationSpeed
 * @property {number} slideDuration
 */

/** @type {AppSettings} */

var settings = JSON.parse(localStorage.getItem("settings") || "{}");
settings.animationSpeed = settings.animationSpeed || 1000;// fallback
settings.slideDuration = settings.slideDuration || 30000;// fallback

var settingFileUrl = "/unsafe-app-settings.json";


/**
 * @param {AppSettings} targetSettings 
 * @param {() => void} onValid 
 * @param {() => void} onInvalid 
 */
function validateSettings(targetSettings, onValid, onInvalid) {


    if (targetSettings.immichServerUrl == undefined || targetSettings.immichServerUrl.length == 0 || targetSettings.immichServerUrl.startsWith("https://")) {
        onInvalid();
        return;
    }

    if (targetSettings.immichApiKey == undefined || targetSettings.immichApiKey.length == 0) {
        onInvalid();
        return;
    }



    if (targetSettings.animationSpeed == undefined || parseInt(targetSettings.animationSpeed) == NaN) {
        onInvalid();
        return;
    }

    if (typeof targetSettings.animationSpeed == "string") {
        targetSettings.animationSpeed = parseInt(targetSettings.animationSpeed);
    }



    if (targetSettings.slideDuration == undefined || parseInt(targetSettings.slideDuration) == NaN) {
        onInvalid();
        return;
    }

    if (typeof targetSettings.slideDuration == "string") {
        targetSettings.slideDuration = parseInt(targetSettings.slideDuration);
    }

    onValid();
}

/**
 * @param {AppSettings} targetSettings 
 */
function saveSettings(targetSettings) {
    localStorage.setItem("settings", JSON.stringify(targetSettings))
}



var viewContainer = $("main");
var messageBox = $(".message");

function showMessage(errorText, styleClass) {
    messageBox
        .show()
        .attr("class", `message ${styleClass}`)
        .children("span")
        .text(errorText);
}



/**
 * @param {JQuery<HTMLElement>} elem 
 * @param {number} speed 
 */
function loadView(elem, speed, useFade) {

    if (speed == undefined) {
        speed = 200;
    }

    if (useFade == undefined) {
        useFade = true;
    }

    if (viewContainer.children().length == 0) {
        elem.hide();
        viewContainer.prepend(elem);
        elem.slideDown(speed);
        return;
    }

    var children = viewContainer.children();
    
    if (useFade) {
        children.fadeOut(speed, function () { this.remove() })
    } else {
        children.slideToggle(speed, function () { this.remove() })
    }

    viewContainer.prepend(elem);
}

/**
 * @param {string} path 
 * @param {string} query 
 */
function url(path, query) {
    if (query == undefined) {
        query = "";
    }
    return `${settings.immichServerUrl}${path}?apiKey=${settings.immichApiKey}&${query}`;
}

/**
 * @param {(elem:JQuery<HTMLElement>) => void} onComplete 
 */
function createAlbumGrid(onComplete) {
    var container = $('<div>')
    var buttonGrid = $(`<div class="album-grid">`)

    $.get(url("/api/albums"), function (albums) {

        albums.forEach(function (album) {

            var button = $(`
                <button class="glass-tile">
                    <i class="bi bi-images"></i> ${album.albumName}<br>
                    <small>${album.assetCount} assets</small>
                </button>
                `)
                .click(function () { 
                    settings.mostRecentAlbumId = album.id;
                    saveSettings(settings);
                    initAlbumViewingMode(album.id) 
                })

            buttonGrid.append(button)

        });

        container.append(buttonGrid);
        onComplete(container);
    });
}

function createSingleAssetView(asset) {

    if (asset == undefined) {
        return;
    }

    var srcUrl = url(`/api/assets/${asset.id}/thumbnail`, "size=preview");
    var img = $(`<div class="img content-bottom">`).css('background-image', 'url(' + srcUrl + ')');

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    var year = new Date(asset.localDateTime).getFullYear();
    var month = months[new Date(asset.localDateTime).getMonth()];

    if (asset.exifInfo == undefined || asset.exifInfo.city == undefined || asset.exifInfo.country == undefined) {
        
        var infoCard = $(`
        <h3 class="glass-tile info-card">
            <small class="time">${month} ${year}</small>
        </h3>`);

        return img.append(infoCard);
    }


    var infoCard = $(`
    <h3 class="glass-tile info-card location">
        <i class="bi bi-geo-fill"></i> 
        <span>
            ${asset.exifInfo.city}<br>
            <small>${asset.exifInfo.country},</small> <small>${month} ${year}</small>
        </span>
    </h3>`);

    return img.append(infoCard);
}

var refreshAssetsIntervalId = 0;
var loadNextAssetIntervalId = 0;

var previousSlideButton = $('#previous-slide').hide();
var nextSlideButton = $('#next-slide').hide();


function cleanupAlbumViewingMode() {
    clearInterval(refreshAssetsIntervalId);
    clearInterval(loadNextAssetIntervalId);

    previousSlideButton.hide();
    nextSlideButton.hide();
}

/**
 * @param {string} albumId 
 */
function initAlbumViewingMode(albumId) {
    cleanupAlbumViewingMode();

    var assets = [];
    var currentAssetIndex = 0;

    /**
     * @param {() => void} onComplete 
     */
    function refreshAlbumAssets(onComplete) {
        $.get( url(`/api/albums/${albumId}`), function(album) {
            album.assets.sort(function () { return 0.5 - Math.random() });
            assets = album.assets;
            onComplete()
        })
        .catch(function () {
            showMessage("Failed to fetch album assets, please check your settings and network connection", "error");
            // createSettingsFormView(loadView);
        });
    }

    function loadCurrentAssetAsView() {
        console.log(`loading asset with index ${currentAssetIndex}`);
        
        if (currentAssetIndex < 0) {
            currentAssetIndex = assets.length - 1;
        }

        currentAssetIndex = currentAssetIndex % assets.length;
        if (assets.length <= 0) { return; }

        var asset = assets[currentAssetIndex];
        var view = createSingleAssetView(asset);
        
        // var useFadeAnimation = asset.exifInfo == undefined || asset.exifInfo.exifImageWidth > asset.exifInfo.exifImageHeight;
        loadView(view, settings.animationSpeed, true);
    }

    function setAlbumIntervals() {
        
        refreshAssetsIntervalId = setInterval(refreshAlbumAssets, 300000)// 5 minutes = 300_000
        loadNextAssetIntervalId = setInterval(function() {
            currentAssetIndex++;
            loadCurrentAssetAsView();
        }, settings.slideDuration);

    }

    refreshAlbumAssets(loadCurrentAssetAsView);
    setAlbumIntervals();

    previousSlideButton.on("click", function() {
        currentAssetIndex--;
        loadCurrentAssetAsView();

        cleanupAlbumViewingMode();
        setAlbumIntervals();

        previousSlideButton.fadeIn(200);
        nextSlideButton.fadeIn(200);
    }).fadeIn(200)

    nextSlideButton.on("click", function() {
        currentAssetIndex++;
        loadCurrentAssetAsView(); 

        cleanupAlbumViewingMode();
        setAlbumIntervals();
        
        previousSlideButton.fadeIn(200);
        nextSlideButton.fadeIn(200);
    }).fadeIn(200)

}

/**
 * @param {(elem:JQuery<HTMLElement>) => void} onComplete 
 */
function createSettingsFormView(onComplete) {

    var settingsForm = $(`
    <form class="settings-form">
        <label class="glass-tile field">
            <span>Immich server url:</span>
            <input type="text" id="immich-server-url">
        </label>

        <label class="glass-tile field">
            <span>Immich api key</span>
            <input type="text" id="immich-api-key">
        </label>

        <label class="glass-tile field">
            <span>Slide duration (ms)</span>
            <input type="number" id="slide-duration">
        </label>

        <label class="glass-tile field">
            <span>Animation Speed (ms)</span>
            <input type="number" id="animation-speed">
        </label>

        <button class="glass-tile" type="submit"><i class="bi bi-check-lg"></i> Save</button>
    <form>
    `);

    var serverUrlInput = settingsForm.find("#immich-server-url").val(settings.immichServerUrl);
    var apiKeyInput = settingsForm.find("#immich-api-key").val(settings.immichApiKey);
    var animationSpeedInput = settingsForm.find("#animation-speed").val(settings.animationSpeed);
    var slideDurationInput = settingsForm.find("#slide-duration").val(settings.slideDuration);

    settingsForm.submit(function (e) {
        e.preventDefault();
        console.log("form submit");

        /** @type {AppSettings} */
        var newSettings = {
            animationSpeed: animationSpeedInput.val().trim(),
            slideDuration: slideDurationInput.val().trim(),
            immichApiKey: apiKeyInput.val().trim(),
            immichServerUrl: serverUrlInput.val().trim(),
            mostRecentAlbumId: settings.mostRecentAlbumId,// just take the current
        }

        validateSettings(newSettings,
            function () {// valid
                console.log("settings are valid");

                settings = newSettings;
                saveSettings(settings);
                showMessage("Settings saved!", "success");

                initNormalStartup();
            },
            function () {// invalid
                console.error("settings are not valid");
                showMessage("Settings are not valid", "error");
            }
        )
    })

    onComplete(settingsForm);
}


var albumsButton = $("#show-albums");
var settingsButton = $("#show-settings");

function initForcedFirstSetup() {
    console.log("forced first setup");

    albumsButton.fadeOut(settings.animationSpeed)
    createSettingsFormView(loadView);
}

function initNormalStartup() {
    console.log("settings valid, starting app");

    albumsButton
        .click(function () {
            cleanupAlbumViewingMode();
            createAlbumGrid(loadView);
        })
        .fadeIn(settings.animationSpeed)

    settingsButton
        .click(function () {
            cleanupAlbumViewingMode();
            createSettingsFormView(loadView);
        })
        .fadeIn(settings.animationSpeed)

    if (settings.mostRecentAlbumId && settings.mostRecentAlbumId.length > 0) {
        console.log("Recently opened album found, automatically opening");
        initAlbumViewingMode(settings.mostRecentAlbumId);
        return;
    }

    console.log("no Recently opened album found, opening album grid");
    createAlbumGrid(loadView);
}

validateSettings(
    settings,

    function () {// valid local settings, statup as normal
        initNormalStartup()

        // perform some extra checks to warn the user about potential settings file being left exposed
        $.get(settingFileUrl, function (fetchedSettings) {
            console.log("settings from server found while local settings already exist, this file should be remove to prevent leaking api keys", fetchedSettings);
            showMessage(`Settings file is still present on the server (${settingFileUrl}). Remove this file ASAP to prevent leaking your api key`, "error");
        });
    },

    function () {// invalid, try to fetch from server
        console.log(`invalid local settings, trying to fetch from the server on ${settingFileUrl}`);

        $.get(settingFileUrl, function (fetchedSettings) {
            console.log("settings from server", fetchedSettings);
            settings = fetchedSettings;

            validateSettings(fetchedSettings,
                function () {// valid settings from server
                    console.log("valid settings");
                    showMessage(`Settings file successfully imported from ${settingFileUrl}. Dont forget to remove this file to prevent leaking the api key`, "success");
                    saveSettings(settings);
                    initNormalStartup();
                },
                function() {// (partially) invalid settings from the server
                    showMessage(`Settings file partially imported from ${settingFileUrl}, please review the config and press save when everything is allright. Dont forget to remove this settings file afterwards`, "success");
                    initForcedFirstSetup()
                }
            )
        }).catch(function () {// failed to fetch from server, force first setup
            console.log("no settings found on the server, forcing first setup");
            initForcedFirstSetup()
        });
    }
);
