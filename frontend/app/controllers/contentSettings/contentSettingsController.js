/*global momentum, angular */
momentum.controller('ContentSettingsController', [
    'toast',
    'dialog',
    '$timeout',
    '$scope',
    function (toast, dialog, $timeout, $scope) {
        var blDialogModel = {
            'test': 'https://google.com',
            'rxChange': function (self) {
                var rx = null,
                    match;

                try {
                    rx = new RegExp(self.regexp, 'i');
                } catch (ignore) {
                    //ignore
                }

                if (!rx) {
                    self.blacklisted = false;
                    return;
                }

                if (!self.test) {
                    self.blacklisted = false;
                    return;
                }

                match = self.test.match(rx);
                self.blacklisted = match && match[0] === self.test;
            },
            'rxCheck': function (regexp) {
                // eslint-disable-next-line
                var rx = null;

                try {
                    rx = new RegExp(regexp, 'i');
                } catch (e) {
                    return true;
                }
                return false;
            }
        };

        $scope.viewLoaded = 0;

        function add () {
            var model = angular.extend(
                {},
                blDialogModel,
                {
                    'id': String(Date.now())
                }
            );

            dialog.open({
                'template': 'blacklistDialog.tpl.html',
                'model': model,
                'destroy': false,
                'showCancel': true,
                'okText': 'Add',
                'dialogClass': 'promote-dialog'
            }).then(function () {
                $scope.blacklist.data.push({
                    'id': model.id,
                    'name': model.name,
                    'regexp': model.regexp
                });
                dialog.destroy();
                return toast.open({
                    'htmlText': 'Blacklist item added successfully'
                });
            });
        }

        function edit (item) {
            var model = angular.extend(
                {},
                blDialogModel,
                item
            );

            model.rxChange(model);
            dialog.open({
                'template': 'blacklistDialog.tpl.html',
                'model': model,
                'destroy': false,
                'showCancel': true,
                'okText': 'Save',
                'dialogClass': 'promote-dialog'
            }).then(function () {
                item.name = model.name;
                item.regexp = model.regexp;
                dialog.destroy();
                return toast.open({
                    'htmlText': 'Blacklist item edited successfully'
                });
            });
        }

        function del (id) {
            dialog.open({
                'htmlText': 'Are you sure?',
                'showCancel': true,
                'okText': 'Delete',
                'destroy': false
            }).then(function () {
                $scope.blacklist.data = $scope.blacklist.data.filter(
                    function (item) {
                        return item.id !== id;
                    }
                );
                dialog.destroy();
                return toast.open({
                    'htmlText': 'Blacklist item removed successfully'
                });
            });
        }

        $scope.blacklist = {
            'data': [{
                'id': '1',
                'name': 'All URLs',
                'regexp': '.*'
            }, {
                'id': '2',
                'name': 'Contains macska',
                'regexp': '.*macska.*'
            }],
            'add': add,
            'delete': del,
            'edit': edit
        };

        function animate () {
            $timeout(function () {
                $scope.blacklist.animate();
            });
        }

        function init () {
            animate();
            $scope.viewLoaded = 1;
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
