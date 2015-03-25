(function($app) {
    $app.directive('cronosTable',['DatasetManager', function(DatasetManager) {
      return {
        restrict: 'E',
        templateUrl: "components/templates/table.template.html",
        controller: 'CronosTableController',
        controllerAs: "TableCtrl",
        scope: {
            dataset : '@',
            headers : '=',
            fields : '=',
            form : '@',
            lazzy : '='
        }
      };
    }])

    .controller("CronosTableController",['DatasetManager', '$scope', function(DatasetManager, $scope) {
        $scope.data = DatasetManager.datasets;
        $scope.transitient = {};
        $scope.searchText = "";

        var activeRow = null;


        $scope.isActive = function (rowId) {
            var dataset = $scope.data[this.dataset];
            return dataset.active && dataset.active[dataset.key] == rowId;
        }

        $scope.selectRow = function (rowId) {
            $scope.data[this.dataset].goTo(rowId);
        }        

        $scope.doInsert = function () {
            // Create an insert promise
            var insert = $scope.data[this.dataset].insert(this.transitient);
            // Executed asynchronously when the promise is done execution
            insert.then(function (obj) {
                // Clear the transitient data
                this.transitient = {};
                this.inserting = false;
            }.bind(this));
        }

        $scope.doDelete = function (id) {
            var remove = $scope.data[this.dataset].remove(id);
        }

        $scope.doUpdate = function (data) {
            // Create an update promise
            var update = $scope.data[this.dataset].update(data);
        }

        $scope.startInserting = function () {
            $scope.data[this.dataset].inserting = true;
            $scope.data[this.dataset].active = {};
        }

        $scope.cancel = function () {
            this.inserting = false;
            this.transitient = {};
        }

        $scope.doEdit = function (rowId) {
            var dataset = $scope.data[this.dataset];
            dataset.goTo(rowId);
            dataset.editing = true;
        }
    }]);
}(app));