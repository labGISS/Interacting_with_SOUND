/**
 * Edit the window.location.search parameters
 * @param key parameter to edit
 * @param value value to set. Delete the parameter if null or undefined
 * @return string updated search parameters string
 */
function updateLocationSearchParams(key, value) {
    if (!key) {
        return;
    }

    const params = new window.URLSearchParams(window.location.search);
    if (value === undefined || value === null) {
        params.delete(key);
    } else {
        params.set(key, value);
    }

    return params.toString();
}

/**
 * Push a search parameters string to the history stack. Use with updateLocationSearchParams
 */
function pushSearchParametersString(paramString) {
    if (!window.history.pushState) {
        return;
    }

    let url = new URL(window.location.href);

    url.search = paramString;
    url = url.toString();
    window.history.replaceState({url: url}, null, url);
}

/**
 * Monkey patch the window.history object to add a replaceState event listener
 * See https://zobzn.com/js-push-state-listener
 */
(function(history){
    var replaceState = history.replaceState;
    history.replaceState = function(state) {
        replaceState.apply(history, arguments);
        if (typeof history.onreplacestate == "function") {
            history.onreplacestate({state: state});
        }
    };
})(window.history);
