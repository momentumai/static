/*global momentum, window*/
momentum.factory('utils', [
    function () {
        var utils = {},
            months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ];

        function getNow () {
            var date = new Date();

            //date.setUTCMonth(date.getUTCMonth() - 1);
            return date;
        }

        utils.downloadCSV = function (data) {
            var a = window.document.createElement('a');

            a.href        = 'data:attachment/csv,' + escape(data);
            a.target      = '_blank';
            a.download    = 'export.csv';
            a.style.display = 'none';

            window.document.body.appendChild(a);

            a.click();
        };

        utils.getMonths = function () {
            var now = getNow(),
                minTimestamp = new Date(2016, 3).getTime(),
                data = [];

            for (;
                minTimestamp < now.getTime();
                now.setUTCMonth(now.getUTCMonth() - 1)) {
                data.push({
                    'id': [now.getUTCMonth(), now.getUTCFullYear()].join('-'),
                    'label': [
                        months[now.getUTCMonth()],
                        now.getUTCFullYear()
                    ].join(' ')
                });
            }

            return {
                'label': 'Select month',
                'selected': data[0].id,
                'data': data
            };
        };

        utils.mergeAssets = function (fbAssets, assets) {
            var ret = {
                'page': {},
                'adaccount': {},
                'business': []
            };

            function flatten (obj) {
                return Object.keys(obj).reduce(function (p, key) {
                    p.push(obj[key]);
                    return p;
                }, []);
            }

            Object.keys(fbAssets.pages || {}).forEach(function (id) {
                ret.page[id] = {
                    'type': 'page',
                    'value': id,
                    'display': fbAssets.pages[id],
                    'default': false
                };
            });

            Object.keys(fbAssets.adaccounts || {}).forEach(function (id) {
                ret.adaccount[id] = {
                    'type': 'adaccount',
                    'value': id,
                    'display': fbAssets.adaccounts[id],
                    'default': false,
                    'checked': false
                };
            });

            Object.keys(fbAssets.businesses || {}).forEach(function (id) {
                ret.business.push({
                    'id': id,
                    'label': fbAssets.businesses[id]
                });
            });

            assets.forEach(function (asset) {
                ret[asset.type][asset.value] = asset;
                asset.checked = true;
            });

            ret.page = flatten(ret.page);
            ret.adaccount = flatten(ret.adaccount);

            return ret;
        };

        return utils;
    }
]);
