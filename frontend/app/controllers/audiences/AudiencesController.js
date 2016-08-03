/*global momentum */
momentum.controller('AudiencesController', [
    '$scope',
    function ($scope) {
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
            $scope.viewLoaded = 1;
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
