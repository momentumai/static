/* globals window, document, chrome */

window.addEventListener('message', function (event) {
    var momentum,
        parts,
        csl = chrome.storage.local;

    function close () {
        momentum = document.getElementById('momentum');
        momentum && momentum.parentNode.removeChild(momentum);
    }

    if (event.origin === 'chrome-extension://' + chrome.runtime.id) {
        if (event.data === 'destroyMomentum') {
            close();
        }

        if (event.data.indexOf('redirect') === 0) {
            parts = event.data.split('~');
            if (window.location.href === parts[1]) {
                close();
                window.location.reload(true);
            } else {
                window.location.href = parts[1];
            }
        }
    }

    if (event.data && event.data.type === 'BVSID') {
        csl.set({'BVSID': event.data.value});
    }

    if (event.data && event.data === 'invalidateCache') {
        csl.set({'BVCACHE': String(Date.now())});
    }
}, false);
