/*global angular, window */
(function () {
    window.bvConfig = JSON.parse('@@bvConfig');

    window.momentum = angular.module('momentum', [
        'ui.router',
        'mdl'
    ]);
}());
