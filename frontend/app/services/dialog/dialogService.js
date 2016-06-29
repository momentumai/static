/*global momentum, angular, document */
momentum.factory('dialog', [
    '$q',
    '$rootScope',
    '$compile',
    '$templateCache',
    function (
        $q,
        $rootScope,
        $compile,
        $templateCache
    ) {
        var dialog = {},
            defaultArgs = {
                'title': '',
                'template': '',
                'htmlText': 'Success!',
                'model': {},
                'okText': 'Ok',
                'cancelText': 'Cancel',
                'showCancel': false,
                'animate': true,
                'destroy': true,
                'cancelAction': false,
                'canHide': true,
                'dialogClass': ''
            },
            scope;

        dialog.destroy = function () {
            var dialog = document.getElementById('dialog');

            if (dialog) {
                dialog.parentNode.removeChild(dialog);
            }
            if (scope) {
                scope.$destroy();
            }
        };

        dialog.open = function (args) {
            return $q(function (resolve, reject) {
                var dlg,
                    dialogTemplate = $templateCache.get('dialog.tpl.html'),
                    dialogContent,
                    focusHandler,
                    traps;

                dialog.destroy();

                scope = angular.extend(
                    $rootScope.$new(true),
                    defaultArgs,
                    args
                );

                if (scope.template) {
                    scope.htmlText = $templateCache.get(scope.template);
                }

                if (scope.animate) {
                    scope.animateClass = 'animate';
                }

                document.body.insertAdjacentHTML('afterbegin', dialogTemplate);

                dlg = document.getElementById('dialog');
                dialogContent = document.getElementById('dialog-content');

                focusHandler = angular.bind(dialogContent, dialogContent.focus);

                scope.rendered = scope.htmlText;

                scope.submit = function () {
                    var cloned = angular.extend({}, scope.model);

                    scope.loading = true;

                    if (scope.destroy) {
                        dialog.destroy();
                    }
                    resolve(cloned);
                };

                scope.cancel = function () {
                    if (scope.canHide) {
                        dialog.destroy();
                        reject();
                    }
                };

                scope.cancelButton = function () {
                    if (!scope.cancelAction) {
                        dialog.destroy();
                    } else {
                        scope.loading = true;
                    }
                    reject(true);
                };

                $compile(dlg)(scope);

                traps = dlg
                    .getElementsByClassName('dialog-focus-trap');

                traps[0].addEventListener('focus', focusHandler);
                traps[1].addEventListener('focus', focusHandler);

                document.getElementById('dialog-ok').focus();
            });
        };

        return dialog;
    }
]);
