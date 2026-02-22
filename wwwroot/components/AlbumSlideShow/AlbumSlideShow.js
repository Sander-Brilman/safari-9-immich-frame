
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


        /** @type {ComponentBase[]} */
        this.slides = [];
        this.currentSlideIndex = 0;


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

            var newSlides = [];

            if (thisRef.settings.enableSplitView == false) {
                for (let i = 0; i < album.assets.length - 1; i++) {
                    newSlides.push(new SingleAssetSlide(album.assets[i], thisRef.immichClient, thisRef.settings));
                }

                if (onComplete) {
                    onComplete();
                }

                return;
            }

            var verticalAssets = album.assets.filter(function (a) { return a.height > a.width });
            verticalAssets.sort(function () { return Math.random() - 0.5 });
            for (let i = 0; i < verticalAssets.length - 2; i += 2) {
                var asset1 = verticalAssets[i];
                var asset2 = verticalAssets[i + 1];

                newSlides.push(new SplitViewSlide(asset1, asset2, thisRef.immichClient, thisRef.settings));
            }

            var horizontalAssets = album.assets.filter(function (a) { return a.height < a.width });
            for (let i = 0; i < horizontalAssets.length - 1; i++) {
                newSlides.push(new SingleAssetSlide(horizontalAssets[i], thisRef.immichClient, thisRef.settings));
            }

            newSlides.sort(function () { return Math.random() - 0.5 });

            thisRef.slides = newSlides;
            thisRef.currentSlideIndex = 0;

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



    /**
     * @param {number} slideIndex 
     */
    addSlideToViewStack(slideIndex) {
        if (this.slides.length <= 0) { return; }

        var thisRef = this;
        var slideContainer = $(`<div class="slide">`);
        var slideComponent = this.slides[this.loopArrayIndex(this.slides, slideIndex)];

        openComponentInElement(slideContainer, slideComponent, function () {
            thisRef.slideShowContainer.prepend(slideContainer);
            slideContainer[0].scrollIntoView();
        });
    }

    removeTopAssetFromViewStack() {
        var settings = settingsRepo.getInstance();
        this.slideShowContainer.children().last().fadeOut(settings.animationSpeed, function () { this.remove() });
    }




    setIntervals() {
        var settings = settingsRepo.getInstance();
        var Interval5Minutes = 60000 * 5;
        var thisRef = this;

        this.onRemove();// remove all existing intervals

        this.refreshAssetsIntervalId = setInterval(function () { thisRef.refreshAssets_Then() }, Interval5Minutes)
        this.loadNextAssetIntervalId = setInterval(function () {

            thisRef.preFetchTimeoutId = setTimeout(function () {
                thisRef.removeTopAssetFromViewStack();
            }, settings.slideDuration / 2);

            thisRef.currentSlideIndex++;
            thisRef.addSlideToViewStack(thisRef.currentSlideIndex);

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
                thisRef.currentSlideIndex--;
                thisRef.setIntervals();
                thisRef.addSlideToViewStack(thisRef.currentSlideIndex);
                thisRef.removeTopAssetFromViewStack();
            });

        var nextButton = $(`<button class="glass-tile">Next slide <i class="bi bi-arrow-right"></i></button>`)
            .on("click", function () {
                thisRef.currentSlideIndex++;
                thisRef.setIntervals();
                thisRef.addSlideToViewStack(thisRef.currentSlideIndex);
                thisRef.removeTopAssetFromViewStack();
            })

        view.filter("#controls-container").append([previousButton, nextButton]);

        this.setIntervals();
        this.refreshAssets_Then(function () {
            thisRef.currentSlideIndex++;
            thisRef.addSlideToViewStack(thisRef.currentSlideIndex);
            onComplete();
        });

    }


    /**
     * @override
     * 
     * @param {() => void} [onComplete=undefined] 
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
