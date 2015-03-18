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
	        var datasetIndex;
	        var prev;
	        $scope.$watch(function(){
	    		return DatasetManager.datasets[$scope.cronosDataset];
			}, function (dataset) {
				if(dataset) {
					if(dataset.editing)	{
						$scope.data = angular.copy(dataset.current());					
					} else if(dataset.inserting) {
						$scope.data = {};
					} 						
				}
			},true);

		
			$scope.postUpdates = function() {
				var dataset = DatasetManager.datasets[$scope.cronosDataset];
					if(dataset.inserting) {
					   dataset.insert($scope.data, function() {
					   	  // After insert
					   });	
					   dataset.editing = false;
					} else if(dataset.editing) {
						dataset.data[dataset.getCursor()] = angular.copy($scope.data); 
						dataset.update(dataset.data[dataset.getCursor()], function() {
					   	  // After update
					   	});
						dataset.editing = false;
					}
			};

			$scope.cancelUpdates = function() {
				var dataset = DatasetManager.datasets[$scope.cronosDataset];
				dataset.inserting = false;
				dataset.editing = false;				
			};
	}]);
}(app));