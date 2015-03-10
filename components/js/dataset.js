(function($app) {
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
    var DataSet = function(name) {
      // Publiic members
      this.data = null;
      this.name = name;
      this.key = null;
      this.activeRow = null;
      this.inserting = false;
      this.editing = false;

      // Private members
      this.cursor = 0;

      //Public methods
      /**
      * Append a new value to the end of this dataset.
      */ 
      this.insert = function (obj) {
        return $q(function (resolve, reject) {
          this.data.push(obj);
          resolve(obj);
        }.bind(this));
      };

      /**
      * Uptade a value into this dataset by using the dataset key to compare
      * the objects
      */ 
      this.update = function (obj) {

      };

      /**
      * Remove an object from this dataset by using the given id.
      * the objects
      */
      this.remove = function (id) {
        for(var i = 0; i < this.data.length; i++) {
              if(this.data[i][this.key] === id) {
                  this.data.splice(i,1);
              }
          }
      };

      /**
      * Check if the object has more itens to iterate
      */
      this.hasNext = function () {
        return this.data && (cursor < this.data.length - 1);
      };

      this.hasPrevious = function () {
        return this.data && (cursor >= 0);
      };

      /**
      *  Get the current item moving the cursor to the next element
      */
      this.next = function () {
        if(!this.hasNext())  throw "Dataset Overflor Error";
        this.activeRow = this.data[cursor++];
        return this.activeRow;
      };

      /**
      *  Get the previous item
      */
      this.previous = function () {
        if(!this.hasPrevious()) throw "Dataset Overflor Error";
        this.activeRow = this.data[cursor--];
        return this.activeRow;
      };

      /**
      *  Moves the cursor to the specified item
      */
      this.goTo = function (index) {
        if(index >= this.data.length || index < 0) throw "Dataset Overflor Error";
        cursor = index;
        this.activeRow = this.data[cursor];
        return this;
      };

      this.getCursor = function() {
        return cursor;
      }

      this.current = function() {
        return this.activeRow || this.data[0];
      }

    };

    /**
      * Dataset Manager Methods
      */
    this.storeDataset = function (dataset) {
        this.datasets[dataset.name] = dataset;
    },

    this.fetchData = function (attrs) {
        // Get some fake testing data
        return $http.get('data/'+ attrs.name + '.json?_=' + new Date().getTime()).then(function(returnObj) {
            var dts = new DataSet(attrs.name);
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
  $app.directive('cronosDataset',['DatasetManager', function (DatasetManager) {
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
}(app));