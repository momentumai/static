/*global momentum*/
momentum.config(['$stateProvider', '$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {
    var root,
        router,
        main,
        content,
        dashboard;

    $urlRouterProvider.otherwise('/dashboard/main');

    router = $stateProvider.state('router', {
        'url': '/router',
        'abstract': true,
        'views': {
            'body': {
                'templateUrl': 'router.tpl.html',
                'controller': 'RouterController'
            }
        }
    });

    router.state('router.team', {
        'url': '/:teamId?redirect',
        'views': {
            'container': {
                'templateUrl': 'teamRouter.tpl.html',
                'controller': 'TeamRouterController'
            }
        }
    });

    root = $stateProvider.state('root', {
        'url': '/dashboard',
        'abstract': true,
        'views': {
            'body': {
                'templateUrl': 'root.tpl.html'
            }
        }
    });

    main = root.state('root.main', {
        'url': '/main',
        'abstract': true,
        'params': {
            'title': 'Dashboard'
        },
        'views': {
            'container': {
                'templateUrl': 'main.tpl.html',
                'controller': 'MainController'
            }
        }
    });

    dashboard = main.state('root.main.dashboard', {
        'url': '',
        'abstract': true,
        'views': {
            'container-details': {
                'templateUrl': 'dashboard.tpl.html',
                'controller': 'DashboardController'
            }
        }
    });

    dashboard.state('root.main.dashboard.history', {
        'url': '',
        'views': {
            'tab-container': {
                'templateUrl': 'history.tpl.html',
                'controller': 'HistoryController'
            }
        }
    });

    dashboard.state('root.main.dashboard.info', {
        'url': '/info',
        'views': {
            'tab-container': {
                'templateUrl': 'info.tpl.html',
                'controller': 'InfoController'
            }
        }
    });

    content = main.state('root.main.content', {
        'url': '/content/:contentId',
        'abstract': true,
        'views': {
            'container-details': {
                'templateUrl': 'content.tpl.html',
                'controller': 'ContentController'
            }
        }
    });

    content.state('root.main.content.history', {
        'url': '',
        'views': {
            'tab-container': {
                'templateUrl': 'contentHistory.tpl.html',
                'controller': 'ContentHistoryController'
            }
        }
    });

    content.state('root.main.content.info', {
        'url': '/info',
        'views': {
            'tab-container': {
                'templateUrl': 'contentInfo.tpl.html',
                'controller': 'ContentInfoController'
            }
        }
    });

    root.state('root.account-settings', {
        'url': '/settings/account',
        'params': {
            'title': 'Account Settings'
        },
        'views': {
            'container': {
                'templateUrl': 'accountSettings.tpl.html',
                'controller': 'AccountSettingsController'
            }
        }
    });

    root.state('root.rules', {
        'url': '/rules',
        'params': {
            'title': 'Rules'
        },
        'views': {
            'container': {
                'templateUrl': 'rules.tpl.html',
                'controller': 'RulesController'
            }
        }
    });

    root.state('root.experiments', {
        'url': '/experiments',
        'params': {
            'title': 'Experiments'
        },
        'views': {
            'container': {
                'templateUrl': 'experiments.tpl.html',
                'controller': 'ExperimentsController'
            }
        }
    });

    root.state('root.tests', {
        'url': '/experiments/:expId',
        'params': {
            'title': 'Tests'
        },
        'views': {
            'container': {
                'templateUrl': 'tests.tpl.html',
                'controller': 'TestsController'
            }
        }
    });

    root.state('root.experimentWizard', {
        'url': '/experiments/create/:contentId',
        'params': {
            'title': 'Create experiment'
        },
        'views': {
            'container': {
                'templateUrl': 'experimentWizard.tpl.html',
                'controller': 'ExperimentWizardController'
            }
        }
    });

    root.state('root.experimentWizardPreview', {
        'url': '/experiments/create/:contentId/preview',
        'params': {
            'title': 'Preview tests',
            'config': null,
            'contentId': null
        },
        'views': {
            'container': {
                'templateUrl': 'experimentWizardPreview.tpl.html',
                'controller': 'ExperimentWizardPreviewController'
            }
        }
    });

    root.state('root.audiences', {
        'url': '/audiences',
        'params': {
            'title': 'Audiences'
        },
        'views': {
            'container': {
                'templateUrl': 'audiences.tpl.html',
                'controller': 'AudiencesController'
            }
        }
    });

    root.state('root.help', {
        'url': '/help',
        'params': {
            'title': 'Help'
        },
        'views': {
            'container': {
                'templateUrl': 'help.tpl.html',
                'controller': 'HelpController'
            }
        }
    });

    root.state('root.admin', {
        'url': '/admin',
        'params': {
            'title': 'Admin Settings'
        },
        'views': {
            'container': {
                'templateUrl': 'admin.tpl.html',
                'controller': 'AdminController'
            }
        }
    });

    root.state('root.team-settings', {
        'url': '/settings/team',
        'params': {
            'title': 'Team Settings'
        },
        'views': {
            'container': {
                'templateUrl': 'teamSettings.tpl.html',
                'controller': 'TeamSettingsController'
            }
        }
    });

    root.state('root.billing', {
        'url': '/billing',
        'params': {
            'title': 'Billing Settings'
        },
        'views': {
            'container': {
                'templateUrl': 'billingSettings.tpl.html',
                'controller': 'BillingSettingsController'
            }
        }
    });

    root.state('root.facebook', {
        'url': '/facebook',
        'params': {
            'title': 'Facebook integration',
            'message': ''
        },
        'views': {
            'container': {
                'templateUrl': 'facebook.tpl.html',
                'controller': 'FacebookController'
            }
        }
    });

    $stateProvider.state('auth', {
        'url': '/auth',
        'views': {
            'body': {
                'templateUrl': 'auth.tpl.html',
                'controller': 'AuthController'
            }
        }
    });

    $stateProvider.state('forgot-password', {
        'url': '/forgot-password',
        'views': {
            'body': {
                'templateUrl': 'forgotPassword.tpl.html',
                'controller': 'ForgotPasswordController'
            }
        }
    });

    $stateProvider.state('password-setup', {
        'url': '/password-setup/:email/:token',
        'views': {
            'body': {
                'templateUrl': 'passwordSetup.tpl.html',
                'controller': 'PasswordSetupController'
            }
        }
    });
}]);
