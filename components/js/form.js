(function($app) {
	$app.directive('cronosDataset',['DatasetManager', function(DatasetManager) {
	  return {
	    restrict: 'A',
	    controller:'CronosGenericDatasetController',
	    controllerAs: "ctrl",
	    scope: {
	        cronosDataset : "@"
	    },
	    transclude: 'element',
	    replace: true,
	    link: function(scope, elem, attrs, ctrl, transclude) {
	      transclude(scope, function(clone) {
	        elem.after(clone);
	      });
	    }
	  };
	}])

	.controller("CronosGenericDatasetController",['DatasetManager','$scope','$timeout', function(DatasetManager, $scope, $timeout) {
	        // watch for the specific dataset
	        var prev;
	        $scope.$watch(function(){
	    		return DatasetManager.datasets[$scope.cronosDataset];
			}, function (dataset) {
				if(dataset) {
					$scope.data = dataset.current();
					angular.copy($scope.data, $scope.prev);
				}
			},true);
	}])


}(app));