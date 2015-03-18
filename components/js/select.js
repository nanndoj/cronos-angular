(function($app) {
	$app.directive('cronosSelect', function() {

		return {
			scope: {
				valueField: "@",
				displayField: "@",
				dataset: "@",
				disabled: "@"
			},
			controller: 'CronosSelectController',
			restrict: 'E',
			templateUrl: 'components/templates/select.template.html'
		}
	})

	.controller('CronosSelectController', ['DatasetManager','$scope', function(DatasetManager, $scope) {
		$scope.data = DatasetManager.datasets;

		$scope.filterParams = {};
		$scope.filterParams.text = $scope.displayField;
		$scope.filterParams.value = $scope.valueField;

		$scope.item = {};
		
		// Watch for changes on the selection 
		$scope.$watch(function(){
	    		return $scope.item;
		}, function (item) {
			if(item && item.selection)	{
				// Update dataset when selected
				console.log($scope.valueField);
				console.log(item.selection[$scope.valueField]);

				$scope.data[$scope.dataset].goTo(item[item.selection[$scope.valueField]]);					
			} 						
		},true);	

	}])

	.filter('propsFilter', function() {
		return function(items, props) {
			var out = [];
			var searchText = props['search'].search;
			var params = props['params'];

			if (angular.isArray(items)) {
				items.forEach(function(item) {
					var itemMatches = false;

					var keys = Object.keys(params);
					for (var i = 0; i < keys.length; i++) {
						var prop = keys[i];
						var text = params[prop].toLowerCase();
						if (item[text].toString().toLowerCase().indexOf(searchText) !== -1) {
							itemMatches = true;
							break;
						}
					}

					if (itemMatches) {
						out.push(item);
					}
				});
			} else {
				// Let the output be the input untouched
				out = items;
			}

			return out;
		}
	});
}(app));