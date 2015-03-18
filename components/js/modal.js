(function($app) {
  $app.directive('modal', function () {
    return {
      templateUrl: 'components/templates/modal.template.html',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      controller: 'CronosModalController',
      controllerAs: 'modal',
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;

        scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    };
  });
  app.controller('CronosModalController', function ($scope, $log) {
  });

}(app));

