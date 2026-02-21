
/**
 * @abstract
 */
class ComponentBase {

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
    startInit(onComplete) {
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
 * @param {JQuery<HTMLElement>} containerElement 
 * @param {ComponentBase} component 
 * @param {() => void | undefined} [onComplete=undefined] 
 */
function openComponentInElement(containerElement, component, onComplete) {
    containerElement.children().remove();

    component.startInit(function (newView) {
        containerElement.append(newView)
        newView.on("remove", function () {
            component.onRemove(function () { });
        });

        if (onComplete) {
            onComplete();
        }
    });
}