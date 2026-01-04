
/**
 * @abstract
 */
class ViewBase {

    /**
     * @param {string} htmlFileUrl 
     */
    constructor(htmlFileUrl) {
        this.htmlFileUrl = htmlFileUrl;

        /** @type {JQuery<HTMLElement>} */
        this.view
    }

    /**
     * @param {(content: JQuery<HTMLElement>) => void} onComplete 
     */
    startViewInit(onComplete) {
        var thisRef = this;
        $.get(this.htmlFileUrl, function (rawViewHtml) {

            thisRef.view = $(rawViewHtml);

            thisRef.onInit(thisRef.view, function() {
                onComplete(thisRef.view);
            })
        })
        .catch(function(e) {
            console.error(e);
            
        })
    }

    /**
     * @param {() => void} onComplete 
     */
    startRemoval(onComplete) {
        this.onRemove(function() {
            onComplete();
        })
    }

    /**
     * @abstract
     * 
     * @param {JQuery<HTMLElement>} view 
     * @param {() => void} onComplete 
     */
    onInit(view, onComplete) {
        onComplete()
    }
    
    /**
     * @abstract
     * 
     * @param {() => void} onComplete 
     */
    onRemove(onComplete) {
        onComplete()
    }
}


/**
 * @param {JQuery<HTMLElement>} container 
 * @param {ViewBase} newViewObj 
 * @param {() => void | undefined} [onComplete=undefined] 
 */
function openViewIn(container, newViewObj, onComplete) {
    container.children().remove();

    newViewObj.startViewInit(function (newView) {
        container.append(newView)
        newView.on("remove", function () {
            newViewObj.onRemove(function () { });
        });

        if (onComplete) {
            onComplete();
        }
    });
}