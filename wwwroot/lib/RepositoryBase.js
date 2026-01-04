
class StorageRepository {

    /**
     * @param {string} localStorageKey 
     */
    constructor(localStorageKey) {
        this.localStorageKey = localStorageKey;

        /** @type {object | null} */
        this.instance = null;
    }

    getInstance() {
        if (this.instance != null) {
            return this.instance;
        }

        try {
            this.instance = JSON.parse(localStorage.getItem(this.localStorageKey) || "null");
        } catch (error) {
            console.error(error);
            return null;
        }

        return this.instance;
    }

    /**
     * @param {Object} obj 
     */
    save(obj) {
        this.instance = obj;
        localStorage.setItem(this.localStorageKey, JSON.stringify(obj))
    }
}



class Settings {

    /**
     * @param {object} object 
     */
    static fromObject(object) {
        var instance = Settings.defaultInstance();
        for (var key in instance) {
            instance[key] = object[key];
        }
        return instance;
    }

    /**
     * @param {string} jsonInputValue 
     */
    static fromJson(jsonInputValue) {
        try {
            var jsonParseResult = JSON.parse(jsonInputValue);
            return Settings.fromObject(jsonParseResult);
        } catch (error) {
            console.error(error);
            return this.defaultInstance();
        }
    }

    static defaultInstance() {
        return new Settings(
            "",
            "",
            1000,
            10000,
            1.25
        );
    }

    /*
     * @param {string} immichApiKey 
     * @param {string} immichServerUrl 
     * @param {number} animationSpeed 
     * @param {number} slideDuration 
     * @param {number} zoomMultiplier 
     */
    constructor(immichApiKey, immichServerUrl, animationSpeed, slideDuration, zoomMultiplier) {
        this.immichApiKey = immichApiKey;
        this.immichServerUrl = immichServerUrl;
        this.animationSpeed = animationSpeed;
        this.slideDuration = slideDuration;
        this.zoomMultiplier = zoomMultiplier;
    }

    /**
     * @param {() => void} onValid 
     * @param {() => void} onInvalid 
     */
    validate(onValid, onInvalid) {

        if (this.immichServerUrl == undefined || this.immichServerUrl.length == 0) {
            onInvalid();
            return;
        }

        if (this.immichApiKey == undefined || this.immichApiKey.length == 0) {
            onInvalid();
            return;
        }

        if (this.animationSpeed == undefined || isNaN(this.animationSpeed)) {
            onInvalid();
            return;
        }

        if (this.zoomMultiplier == undefined || isNaN(this.zoomMultiplier)) {
            onInvalid();
            return;
        }

        if (typeof this.animationSpeed == "string") {
            this.animationSpeed = parseInt(this.animationSpeed);
        }

        if (this.slideDuration == undefined || isNaN(this.slideDuration)) {
            onInvalid();
            return;
        }

        if (typeof this.slideDuration == "string") {
            this.slideDuration = parseInt(this.slideDuration);
        }

        // $.get(targetSettings.immichServerUrl, function(response) {
        //     onValid()
        // }).catch(function(e) {
        //     onInvalid()
        // })

        onValid()
    }
}

class SettingsRepository extends StorageRepository {
    constructor() {
        super("settings");

        /** @type {Settings} */
        this.instance = undefined
    }

    /**
     * 
     * @returns {Settings}
     */
    getInstance() {
        if (this.instance != undefined) {
            return this.instance;
        }

        this.instance = super.getInstance();
        if (this.instance != undefined) {
            this.instance = Settings.fromObject(this.instance);
        } else {
            this.instance = Settings.defaultInstance();
        }

        return this.instance;
    }
}









class State {
    constructor() {
        this.mostRecentAlbumId = "";
        this.configFileUrl = "";
    }
}

class StateRepository extends StorageRepository {
    constructor() {
        super("state");

        /** @type {State} */
        this.instance
    }

    getInstance() {
        this.instance = super.getInstance() || new State();
        return this.instance;
    }
}
