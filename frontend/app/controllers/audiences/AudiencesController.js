/*global momentum */
momentum.controller('AudiencesController', [
    '$scope',
    'fb',
    function ($scope, fb) {
        $scope.viewLoaded = 0;

        $scope.audiences = [{
            'id': 'random_id',
            'name': 'Programozok akik hotfixelnek',
            'data': {
                'custom_audiences': [{'id': 6004192254512}]
            }
        }, {
            'id': 'random_id2',
            'name': 'Programozok akik meg mindig hotfixelnek',
            'data': {
                'custom_audiences': [{'id': 6004192254512}]
            }
        }, {
            'id': 'random_id3',
            'name': 'Programozok akik meg mindig hotfixelnek :(',
            'data': {
                'custom_audiences': [{'id': 6004192254512}]
            }
        }];

        $scope.customAudiences = [{
            'name': 'KEKBUR',
            'id': 6004192254512
        }, {
            'name': 'lulz',
            'id': 6004192254513
        }];

        $scope.customAudiences.unshift({
            'name': 'Add custom audence'
        });

        $scope.deleteCustomAudience = function (audience, id) {
            var d = audience.data;

            d.custom_audiences = d.custom_audiences.filter(function (act) {
                return act.id && act.id !== id;
            });
        };

        $scope.addCustomAudience = function (audience) {
            if (audience.$caValue) {
                audience.data.custom_audiences.push({
                    'id': audience.$caValue
                });
            }
            delete audience.$caValue;
        };

        $scope.filteredCustomAudiences = function (audience) {
            var ca = audience.data.custom_audiences.map(function (act) {
                return act.id;
            });

            return $scope.customAudiences.filter(function (act) {
                return !act.id || ca.indexOf(act.id) === -1;
            });
        };

        $scope.customAudienceByid = function (id) {
            return $scope.customAudiences.filter(function (act) {
                return act.id && id && act.id === id;
            })[0].name;
        };

        $scope.open = function (audience) {
            var isOpen = 0;

            if (audience.open) {
                return false;
            }

            $scope.audiences.forEach(function (a) {
                if (a.id === audience.id) {
                    a.open = 1;
                    isOpen = 1;
                } else {
                    a.open = 0;
                }
            });

            $scope.audiences.isOpen = isOpen;
        };

        function init () {
            fb.get('/me', $scope.user.fb_access_token);
            $scope.viewLoaded = 1;
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
