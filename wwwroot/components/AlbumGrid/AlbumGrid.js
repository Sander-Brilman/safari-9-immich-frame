
class AlbumGridView extends ComponentBase {

    /**
     * 
     * @param {StateRepository} stateRepo 
     * @param {ImmichClient} immichClient 
     * @param {SettingsRepository} settings 
     */
    constructor(stateRepo, immichClient, settings) {
        super("components/AlbumGrid/AlbumGrid.html");

        this.stateRepo = stateRepo;
        this.immichClient = immichClient;
        this.settingsRepo = settings;
    }

    /**
     * @abstract
     * 
     * @param {JQuery<HTMLElement>} view 
     * @param {() => void} onComplete 
     */
    onInit(view, onComplete) {

        var buttonGrid = view.filter(`.album-grid`);
        var thisRef = this;

        $.get(this.immichClient.apiUrl("/albums"), function (albums) {

            albums.forEach(function (album) {

                var button = $(`
                    <button class="glass-tile">
                        <i class="bi bi-images"></i> ${album.albumName}<br>
                        <small>${album.assetCount} assets</small>
                    </button>
                    `)
                    .on("click", function () {
                        
                        thisRef.stateRepo.getInstance().mostRecentAlbumId = album.id;
                        thisRef.stateRepo.save(thisRef.stateRepo.getInstance());


                        openView(new AlbumSlideShowView(album.id, thisRef.immichClient, thisRef.settingsRepo.get()))
                    })

                buttonGrid.append(button)

            });

            view.append(buttonGrid);
            onComplete();
        });
    }
}
