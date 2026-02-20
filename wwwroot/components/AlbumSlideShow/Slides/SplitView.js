
class SplitViewSlide extends ComponentBase {

    /**
     * @param {object} asset1
     * @param {object} asset2
     * @param {ImmichClient} immichClient 
     * @param {Settings} settings 
     */
    constructor(asset1, asset2, immichClient, settings) {
        super("components/AlbumSlideShow/Slides/SplitView.html");

        this.asset1 = asset1;
        this.asset2 = asset2;
        this.immichClient = immichClient;
        this.settings = settings;
    }

    /**
     * @param {JQuery<HTMLElement>} view 
     * @param {() => void} onComplete 
     */
    onInit(view, onComplete) {
        
        var assetContainer1 = view.find(".img1");
        var assetContainer2 = view.find(".img2");

        function checkComplete() {
            if (assetContainer1.children().length > 0 && assetContainer2.children().length > 0) {
                onComplete();
            }
        }

        var slide1 = new SingleAssetSlide(this.asset1, this.immichClient, this.settings);
        var slide2 = new SingleAssetSlide(this.asset2, this.immichClient, this.settings);

        openComponentInElement(assetContainer1, slide1, checkComplete);
        openComponentInElement(assetContainer2, slide2, checkComplete);
    }

}