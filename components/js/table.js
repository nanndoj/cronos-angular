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
            fields : '='
        }
      };
    }])

    .controller("CronosTableController",['DatasetManager', '$scope', function(DatasetManager, $scope) {
        $scope.data = DatasetManager.datasets;
        $scope.transitient = {};
        var activeRow = null;

        $scope.doInsert = function() {
            // Create an insert promise
            var insert = $scope.data[this.dataset].insert(this.transitient);
            // Executed asynchronously when the promise is done execution
            insert.then(function(obj) {
                // Clear the transitient data
                this.transitient = {};
                this.inserting = false;
            }.bind(this));
        }

        $scope.doDelete = function(id) {
            var remove = $scope.data[this.dataset].remove(id);
        }

        $scope.doUpdate = function(data) {
            // Create an update promise
            var update = $scope.data[this.dataset].update(data);
        }

        $scope.startInserting = function() {
            this.inserting = true;
        }

        $scope.cancel = function() {
            this.inserting = false;
            this.transitient = {};
        }

        $scope.updateCursor = function(index) {
            var dataset = $scope.data[this.dataset];
            dataset.goTo(index);
        }
    }]);
}(app));