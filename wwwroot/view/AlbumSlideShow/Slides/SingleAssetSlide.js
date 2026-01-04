

class SingleAssetSlide extends ViewBase {

    /**
     * @param {object} asset 
     * @param {ImmichClient} immichClient 
     * @param {Settings} settings 
     */
    constructor(asset, immichClient, settings) {
        super("view/AlbumSlideShow/Slides/SingleAssetSlide.html");

        this.asset = asset;
        this.immichClient = immichClient;
        this.settings = settings;
    }
    

    /**
     * @param {JQuery<HTMLElement>} view 
     * @param {() => void} onComplete 
     */
    onInit(view, onComplete) {
        
        var srcUrl = this.immichClient.url(`/assets/${this.asset.id}/thumbnail`, "size=preview");

        var img = view.filter('.img')
            .css('background-image', 'url(' + srcUrl + ')')
            .css('transition-duration', `${this.settings.slideDuration * 2}ms`);

        var thisRef = this;
        setTimeout(function () {
            var newBackgroundSize = `scale(${thisRef.settings.zoomMultiplier})`;
            img.css('transform', newBackgroundSize)
        }, 100);

        var simpleInfo = view.filter('.simple-info');
        var detailedInfoCard = view.filter('.detailed-info');

        var year = new Date(this.asset.localDateTime).getFullYear();
        var month = months[new Date(this.asset.localDateTime).getMonth()];
        view.find(".time").text(`${month} ${year}`);

        var hasLocationInfo = this.asset.exifInfo.city != undefined && this.asset.exifInfo.country != undefined;
        if (hasLocationInfo == false) {
            detailedInfoCard.hide();
            onComplete();
            return;
        }

        simpleInfo.hide();

        detailedInfoCard.find(".city").text(`${this.asset.exifInfo.city}`);
        detailedInfoCard.find(".country").text(`${this.asset.exifInfo.country},`);


        onComplete();
    }



}