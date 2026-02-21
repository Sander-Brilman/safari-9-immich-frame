
class StorageRepository {

    /**
     * @param {string} localStoragePrefix 
     */
    constructor(localStoragePrefix) {
        this.localStoragePrefix = `${localStoragePrefix}_`;

        /** @type {object | null} */
        this.instance = null;
    }

    get() {
        
        if (this.instance != null) {
            return this.instance;
        }

        try {
            this.instance = {};
            
            for (var key in localStorage) {
                
                var startsWithPrefix = key.indexOf(this.localStoragePrefix) == 0;
                if (startsWithPrefix) {
                    this.instance[key.replace(this.localStoragePrefix, "")] = localStorage.getItem(key);
                }
            }

            return this.instance
            
        } catch (error) {
            console.error(error);
            return null;
        }


    }

    /**
     * @param {Object} obj 
     */
    save(obj) {
        this.instance = obj;

        for (var key in obj) {
            try {
                localStorage.setItem(`${this.localStoragePrefix}${key}`, obj[key]);
            } catch (error) {
                console.error(`failed to set localstorage item ${this.localStoragePrefix}${key}. [value] [reason]`, obj[key], error);
            }
        }
    }
}



class Settings {

    /**
     * @param {object} targetObject 
     */
    static fromObject(targetObject) {
        var instance = Settings.defaultInstance();
        for (var key in instance) {
            if (targetObject[key] != undefined) {
                instance[key] = targetObject[key];
            }
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
            1.25,
            true
        );
    }

    /**
     * @param {string} immichApiKey 
     * @param {string} immichServerUrl 
     * @param {number} animationSpeed 
     * @param {number} slideDuration 
     * @param {number} zoomMultiplier 
     * @param {boolean} enableSplitView 
     */
    constructor(immichApiKey, immichServerUrl, animationSpeed, slideDuration, zoomMultiplier, enableSplitView) {
        this.immichApiKey = immichApiKey;
        this.immichServerUrl = immichServerUrl;
        this.animationSpeed = animationSpeed;
        this.slideDuration = slideDuration;
        this.zoomMultiplier = zoomMultiplier;
        this.enableSplitView = enableSplitView;
    }

    /**
     * @param {() => void} onValid 
     * @param {(errors: string[]) => void} onInvalid 
     */
    validate(onValid, onInvalid) {

        if (this.immichServerUrl == undefined || this.immichServerUrl.length == 0) {
            onInvalid(["server url cannot be empty"]);
            return;
        }

        if (this.immichApiKey == undefined || this.immichApiKey.length == 0) {
            onInvalid(["api key cannot be empty"]);
            return;
        }

        if (this.animationSpeed == undefined || isNaN(this.animationSpeed)) {
            onInvalid(["animation speed must be a number"]);
            return;
        }

        if (typeof this.animationSpeed == "string") {
            this.animationSpeed = parseInt(this.animationSpeed);
        }

        if (this.zoomMultiplier == undefined || isNaN(this.zoomMultiplier)) {
            onInvalid(["zoom multiplier must be a number"]);
            return;
        }

        if (typeof this.zoomMultiplier == "string") {
            this.zoomMultiplier = parseFloat(this.zoomMultiplier);
        }

        if (this.slideDuration == undefined || isNaN(this.slideDuration)) {
            onInvalid(["slide duration must be a number"]);
            return;
        }

        if (typeof this.slideDuration == "string") {
            this.slideDuration = parseInt(this.slideDuration);
        }

        if (typeof this.enableSplitView == "string") {
            this.enableSplitView = this.enableSplitView == "true";
        }

        // $.get(targetSettings.immichServerUrl, function(response) {
        //     onValid()
        // }).catch(function(e) {
        //     onInvalid()
        // })

        onValid()
    }
}

class SettingsRepository {
    constructor() {

        /** @type {Settings} */
        this.instance = undefined
        this.storageRepo = new StorageRepository("settings");
    }

    /**
     * 
     * @returns {Settings}
     */
    get() {
        if (this.instance != undefined) {
            return this.instance;
        }

        this.instance = Settings.fromObject(this.storageRepo.get());

        if (this.instance != undefined) {
            this.instance = Settings.fromObject(this.instance);
        } else {
            this.instance = Settings.defaultInstance();
        }

        return this.instance;
    }

    /**
     * 
     * @param {Settings} newSettings 
     */
    save(newSettings) {
        this.instance = newSettings;
        this.storageRepo.save(newSettings);
    }
}









class State {
    constructor() {
        this.mostRecentAlbumId = "";
        this.configFileUrl = "";
    }
}

class StateRepository {
    constructor() {
        /** @type {State} */
        this.instance
        this.storageRepo = new StorageRepository("state");
    }

    getInstance() {
        this.instance = this.storageRepo.get() || new State();
        return this.instance;
    }

    /**
     * @param {State} state 
     */
    save(state) {
        this.instance = state;
        this.storageRepo.save(state);
    }
}
