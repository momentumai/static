/*global momentum*/
momentum.config(['$stateProvider', '$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/main');

    $stateProvider.state('main', {
        'url': '/main',
        'params': {
            'title': 'Momentum for Chrome'
        },
        'views': {
            'container': {
                'templateUrl': 'main.tpl.html',
                'controller': 'MainController'
            }
        }
    });

    $stateProvider.state('settings', {
        'url': '/settings',
        'params': {
            'title': 'Settings'
        },
        'views': {
            'container': {
                'templateUrl': 'settings.tpl.html',
                'controller': 'SettingsController'
            }
        }
    });

    $stateProvider.state('urlBuilder', {
        'url': '/url-builder',
        'params': {
            'title': 'URL builder'
        },
        'views': {
            'container': {
                'templateUrl': 'urlBuilder.tpl.html',
                'controller': 'UrlBuilderController'
            }
        }
    });

    $stateProvider.state('promotion', {
        'url': '/promotion',
        'params': {
            'title': 'Promote content',
            'content': null
        },
        'views': {
            'container': {
                'templateUrl': 'promotion.tpl.html',
                'controller': 'PromotionController'
            }
        }
    });

    $stateProvider.state('preview', {
        'url': '/preview',
        'params': {
            'title': 'Preview content',
            'content': null,
            'model': null,
            'info': null
        },
        'views': {
            'container': {
                'templateUrl': 'preview.tpl.html',
                'controller': 'PreviewController'
            }
        }
    });

    $stateProvider.state('promote', {
        'url': '/promote',
        'params': {
            'title': 'Promote in progress...',
            'content': null,
            'model': null
        },
        'views': {
            'container': {
                'templateUrl': 'promote.tpl.html',
                'controller': 'PromoteController'
            }
        }
    });

    $stateProvider.state('error', {
        'url': '/error',
        'params': {
            'title': 'Aw, Snap! Something went wrong.',
            'message': null
        },
        'views': {
            'container': {
                'templateUrl': 'error.tpl.html',
                'controller': 'ErrorController'
            }
        }
    });
}]);
