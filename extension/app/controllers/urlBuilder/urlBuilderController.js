/*global momentum, URI, window*/
momentum.controller('UrlBuilderController', [
    'storage',
    '$scope',
    function (storage, $scope) {
        $scope.url = $scope.tabUrl || '';
        $scope.source = '';
        $scope.medium = '';
        $scope.campaign = '';
        $scope.content = '';
        $scope.paid = 0;
        $scope.paid_disabled = 0;
        $scope.result = '';

        $scope.update = function () {
            var uri,
                url,
                params = {};

            $scope.result = '';

            if ($scope.url) {
                url = $scope.url;

                uri = URI(url).normalizeQuery().removeQuery([
                    'utm_source',
                    'utm_campaign',
                    'utm_medium',
                    'utm_m_medium',
                    'utm_content'
                ]);

                if ($scope.source) {
                    uri.addQuery('utm_source', $scope.source);
                }
                if ($scope.medium) {
                    uri.addQuery('utm_medium', $scope.medium);
                }
                if ($scope.campaign) {
                    uri.addQuery('utm_campaign', $scope.campaign);
                }
                if ($scope.content) {
                    uri.addQuery('utm_content', $scope.content);
                }
                if ($scope.paid) {
                    uri.addQuery('utm_m_medium', 'cpc');
                } else {
                    uri.addQuery('utm_m_medium', 't');
                }

                [
                    'campaign',
                    'medium',
                    'source',
                    'content',
                    'paid'
                ].forEach(function (key) {
                    params[key] = $scope[key];
                });

                $scope.result = uri.toString();

                storage.saveUtmParams(params);
            }
        };

        function selectElementContents (el) {
            var range = window.document.createRange(),
                sel;

            range.selectNodeContents(el);
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        $scope.copy = function () {
            $scope.select();
            window.document.execCommand('copy');
            $scope.clicked = 1;
        };

        $scope.select = function () {
            var element = window.document.getElementById('copy-text');

            selectElementContents(element);
        };

        function init () {
            storage.getUtmParams().then(function (params) {
                Object.keys(params).forEach(function (key) {
                    $scope[key] = params[key] || '';
                });
                $scope.update();
            });
        }

        init();
    }
]);
