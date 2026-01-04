class HeaderView extends ViewBase {

    /**
     * @param {AlbumGridView} gridView 
     * @param {SettingsView} settingsView 
     */
    constructor(gridView, settingsView) {
        super("view/Header/Header.html");

        this.gridView = gridView;
        this.settingsView = settingsView;
    }

    /**
     * @param {JQuery<HTMLElement>} view 
     * @param {() => void} onComplete 
     */
    onInit(view, onComplete) {

        var thisRef = this;

        view.filter("#show-albums").on("click", function () {
            openView(thisRef.gridView);
        });

        view.filter("#show-settings").on("click", function () {
            openView(thisRef.settingsView);
        });

        onComplete();

    }

}