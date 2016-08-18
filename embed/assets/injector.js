/*global document, window */
window.momentum_config = JSON.parse('@@bvConfig');

function destroyMomentum () {
    var iframe = document.getElementById('momentum');

    if (iframe) {
        iframe.parentNode.removeChild(iframe);
    }
}

function injectMomentum () {
    var iframe = document.createElement('iframe');

    destroyMomentum();

    iframe.id = 'momentum';

    iframe.src = [
        window.momentum_config.docBase,
        '/embed/index.html?',
        encodeURIComponent(window.location.href)
    ].join('');

    iframe.style.cssText = [
        'position:fixed;',
        'top:0;',
        'left: 0;',
        'width: 100%;',
        'height: 100%;',
        'display: block;',
        'border: 0;',
        'z-index: 999999999999999999;'
    ].join('');

    document.body.appendChild(iframe);
}

function injectMomentumButton () {
    var div = document.createElement('div'),
        img = document.createElement('img');

    div.id = '_momentum_embed_button';
    div.style.cssText = [
        'position:fixed;',
        'top: 15%;',
        'right: 0;',
        'width: 40px;',
        'height: 40px;',
        'margin: 0;',
        'border: 0;',
        'display: block;',
        'background-color: #009688;',
        'margin: 0;',
        'padding: 4px;',
        'border: 0;',
        '-moz-box-sizing: content-box;',
        '-webkit-box-sizing: content-box;',
        'box-sizing: content-box;',
        'z-index: 999999999999999999;',
        'cursor: pointer'
    ].join('');

    img.src = [
        window.momentum_config.docBase,
        '/embed/logo64.png'
    ].join('');
    img.style.cssText = [
        'width: 32px;',
        'height: 32px;',
        'border: 0;',
        'z-index: 99999999;'
    ].join('');

    div.onclick = injectMomentum;
    div.innerHTML = [
        '<img src="',
        window.momentum_config.docBase,
        '/embed/logo64.png',
        '" style="',
        'width:32px;height:32px;margin:4px;border:0;z-index:99999999;',
        '" />'].join('');

    document.body.appendChild(div);
}

window.addEventListener('message', function (event) {
    var parts;

    if (event.origin === window.momentum_config.docBase) {
        if (event.data === 'destroyMomentum') {
            destroyMomentum();
        }

        if (event.data.indexOf('redirect') === 0) {
            parts = event.data.split('~');
            if (window.location.href === parts[1]) {
                destroyMomentum();
                window.location.reload(true);
            } else {
                window.location.href = parts[1];
            }
        }
    }
}, false);

injectMomentumButton();
