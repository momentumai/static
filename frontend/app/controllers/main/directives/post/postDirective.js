/*global momentum*/
momentum.directive('post', [
    function () {
        return {
            'restrict': 'A',
            'templateUrl': 'post.tpl.html',
            'scope': {
                'model': '=ngModel'
            }
        };
    }
]);
