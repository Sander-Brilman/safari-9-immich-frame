
var months = [
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
    "December"
]

class AlbumSlideShowView extends ComponentBase {

    /**
     * @param {string} albumId 
     * @param {ImmichClient} immichClient 
     * @param {Settings} settings 
     */
    constructor(albumId, immichClient, settings) {
        super("components/AlbumSlideShow/AlbumSlideShow.html");
        this.albumId = albumId;

        this.refreshAssetsIntervalId = 0;
        this.loadNextAssetIntervalId = 0;
        this.preFetchTimeoutId = 0;
        this.preFetchIntervalId = 0;

        
        this.assets = [];
        this.verticalAssets = [];
        this.horizontalAssets = [];

        this.currentAssetIndex = 0;
        this.verticalAssetsIndex = 0;


        this.immichClient = immichClient;
        this.settings = settings;

        /** @type {JQuery<HTMLElement>} */
        this.slideShowContainer
    }



    /**
     * @param {() => void | undefined} [onComplete=undefined] 
     */
    refreshAssets_Then(onComplete) {
        var thisRef = this;
        var url = this.immichClient.apiUrl(`/albums/${this.albumId}`);



        $.get(url, function (album) {

            album.assets.sort(function () { return Math.random() - 0.5 });
            album.assets.sort(function () { return Math.random() - 0.5 });

            thisRef.assets = album.assets;
            thisRef.verticalAssets = thisRef.assets.filter(function(a) { return a.height > a.width });
            thisRef.horizontalAssets = thisRef.assets.filter(function(a) { return a.height < a.width });

            thisRef.currentAssetIndex = 0;
            thisRef.verticalAssetsIndex = 0;

            if (onComplete) {
                onComplete()
            }
        })
            .catch(function (e) {
                console.error(e);

                // messageBox.showError("Failed to fetch album assets, please check your settings and network connection");
            });
    }





    /**
     * @param {Array} array 
     * @param {number} assetIndex 
     */
    loopArrayIndex(array, assetIndex) {
        if (assetIndex < 0) {
            assetIndex = (Math.abs(assetIndex) % array.length);
            return (array.length - 1) - assetIndex;
        }

        return assetIndex % array.length;
    }




    addAssetToViewStack(assetIndex) {
        if (this.assets.length <= 0) { return; }

        var thisRef = this;
        var slideContainer = $(`<div class="slide">`);
        var asset = this.assets[this.loopArrayIndex(this.assets, assetIndex)];

        var assetIsHorizontal = asset.width > asset.height;
        var viewIsVertical = this.view.height() > this.view.width();

        if (assetIsHorizontal || viewIsVertical || this.settings.enableSplitView == false) {
            var singleAssetSlide = new SingleAssetSlide(asset, this.immichClient, settingsRepo.getInstance());
            
            openComponentInElement(slideContainer, singleAssetSlide, function() {
                thisRef.slideShowContainer.prepend(slideContainer);
                slideContainer[0].scrollIntoView();
            });

            return;
        }


        var otherVerticalAssets = this.verticalAssets.filter(function(a, i) { return a != asset });
        var asset2 = otherVerticalAssets[randomNumber(0, otherVerticalAssets.length - 1)];
        var multiAssetSlide = new SplitViewSlide(asset, asset2, this.immichClient, this.settings);

        openComponentInElement(slideContainer, multiAssetSlide, function() {
            thisRef.slideShowContainer.prepend(slideContainer);
            slideContainer[0].scrollIntoView();
        });

        this.verticalAssetsIndex += 2;

        return;
    }

    removeTopAssetFromViewStack() {
        var settings = settingsRepo.getInstance();
        this.slideShowContainer.children().last().fadeOut(settings.animationSpeed, function () { this.remove() });

    }




    setIntervals() {
        var settings = settingsRepo.getInstance();
        var Interval5Minutes = 60000 * 5;
        var thisRef = this;

        this.onRemove(function () { });// remove all existing intervals

        this.refreshAssetsIntervalId = setInterval(function () { thisRef.refreshAssets_Then() }, Interval5Minutes)
        this.loadNextAssetIntervalId = setInterval(function () {

            thisRef.preFetchTimeoutId = setTimeout(function () {
                thisRef.removeTopAssetFromViewStack();
            }, settings.slideDuration / 2);

            thisRef.currentAssetIndex++;
            thisRef.addAssetToViewStack(thisRef.currentAssetIndex);

        }, settings.slideDuration);

    }


    /**
     * @override
     * 
     * @param {JQuery<HTMLElement>} view 
     * @param {() => void} onComplete 
     */
    onInit(view, onComplete) {

        var thisRef = this;
        this.slideShowContainer = view.filter("#slide-show-container")

        var previousButton = $(`<button class="glass-tile"><i class="bi bi-arrow-left"></i> Previous slide</button>`)
            .on("click", function () {
                thisRef.currentAssetIndex--;
                thisRef.setIntervals();
                thisRef.addAssetToViewStack(thisRef.currentAssetIndex);
                thisRef.removeTopAssetFromViewStack();
            });

        var nextButton = $(`<button class="glass-tile">Next slide <i class="bi bi-arrow-right"></i></button>`)
            .on("click", function () {
                thisRef.currentAssetIndex++;
                thisRef.setIntervals();
                thisRef.addAssetToViewStack(thisRef.currentAssetIndex);
                thisRef.removeTopAssetFromViewStack();
            })

        view.filter("#controls-container").append([previousButton, nextButton]);

        this.setIntervals();
        this.refreshAssets_Then(function () {
            thisRef.currentAssetIndex++;
            thisRef.addAssetToViewStack(thisRef.currentAssetIndex);
            onComplete();
        });

    }


    /**
     * @override
     * 
     * @param {() => void} onComplete 
     */
    onRemove(onComplete) {
        clearInterval(this.refreshAssetsIntervalId);
        clearInterval(this.loadNextAssetIntervalId);
        clearInterval(this.preFetchIntervalId);

        clearTimeout(this.preFetchTimeoutId);

        if (onComplete) {
            onComplete();
        }
    }

}
