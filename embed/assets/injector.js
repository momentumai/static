/*global document, chrome, window */

var destroyMomentum,
    injectMomentum,
    injectMomentumButton;

destroyMomentum = function () {
    var iframe = document.getElementById('momentum');

    if (iframe) {
        iframe.parentNode.removeChild(iframe);
    }
};

injectMomentum = function () {
    var iframe = document.createElement('iframe');

    destroyMomentum();

    iframe.id = 'momentum';

    iframe.src = [
        chrome.runtime.getURL('index.html'),
        encodeURIComponent(window.location.href)
    ].join('?');

    iframe.style.cssText = 'position:fixed; ' +
                            'top:0; ' +
                            'left: 0; ' +
                            'width: 100%;' +
                            'height: 100%;' +
                            'display: block;' +
                            'border: 0;' +
                            'z-index: 99999999;';

    document.body.appendChild(iframe);
};

injectMomentumButton = function () {
    var iframe = document.createElement('iframe');

    destroyMomentum();

    iframe.id = 'momentum';

    iframe.src = [
        chrome.runtime.getURL('button.html'),
        encodeURIComponent(window.location.href)
    ].join('?');

    iframe.style.cssText = 'position:fixed; ' +
                            'top:0; ' +
                            'rigth: 0; ' +
                            'width: 30px;' +
                            'height: 30px;' +
                            'display: block;' +
                            'border: 0;' +
                            'z-index: 99999999;';

    document.body.appendChild(iframe);
};

injectMomentumButton();
