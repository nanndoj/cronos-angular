angular.module('cronos.dataset', [])

/**
* Global factory responsible for managing all datasets
*/
.factory('DatasetManager', ['$http','$q', function($http, $q) {
   // Global dataset List
  this.datasets = {};

  /**
  * Class representing a single dataset
  */
  var DataSet = {
    data: null,
    name: null,
    key: null,

    /**
    * Append a new value to the end of this dataset.
    */ 
    insert: function (obj) {
      return $q(function (resolve, reject) {
        this.data.push(obj);
        resolve(obj);
      }.bind(this));
    },

    /**
    * Uptade a value into this dataset by using the dataset key to compare
    * the objects
    */ 
    update: function (obj) {

    },

    /**
    * Remove an object from this dataset by using the given id.
    * the objects
    */
    remove: function (id) {
      for(var i = 0; i < this.data.length; i++) {
            if(this.data[i][this.key] === id) {
                this.data.splice(i,1);
            }
        }
    }

  }

  this.storeDataset = function (dataset) {
      this.datasets[dataset.name] = dataset;
  },

  this.fetchData = function (attrs) {
      // Get some fake testing data
      return $http.get(attrs.name + '.json?_=' + new Date().getTime()).then(function(returnObj) {
          var dts = Object.create(DataSet);
          dts.name = attrs.name;
          dts.data = returnObj.data;
          dts.key = attrs.key;
          this.storeDataset(dts);
      }.bind(this));
  }

  return this;
}]);

/**
* Cronus Dataset Directive
*/
app.directive('cronosDataset',['DatasetManager', function (DatasetManager) {
  return {
    restrict: 'E',
    template: '',
    link: function(scope, element, attrs) {
      var fetchData = function () {
        DatasetManager.fetchData(attrs)
      };

      if(attrs.realtime) {
        setInterval(fetchData, 1000);
      }

      fetchData();
    }
  };
}]);