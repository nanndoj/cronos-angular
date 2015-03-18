(function($app) {
  angular.module('cronos.dataset', [])

  /**
  * Global factory responsible for managing all datasets
  */
  .factory('DatasetManager', ['$http','$q', '$resource', '$timeout','$rootScope', function($http, $q, $resource, $timeout, $rootScope) {
     // Global dataset List
    this.datasets = {};

    /**
    * Class representing a single dataset
    */
    var DataSet = function(name) {
      // Publiic members
      this.data = [];
      this.name = name;
      this.key = null;
      this.endpoint = null;
      this.activeRow = {};
      this.inserting = false; 
      this.editing = false;
      this.fetchSize = 2;
      this.observers = [];

      // Private members
      var cursor = 0;
      var service = null;
      var pageIndex = 0;

      this.init = function() {
        this.endpoint = (this.endpoint) ? this.endpoint : "";

        service = $resource(this.endpoint + '/:entry/:id', 
        { 
          entry : this.name,
          id: '@' + this.key 
        }, 
        {
          update: {
            method: 'PUT' // this method issues a PUT request
          },
          save: {
            method: 'POST' // this method issues a POST request
          },
          remove: {
            method: 'DELETE' 
          }
        });

        // Start watching for changes in
        // activeRow to notify observers
        $rootScope.$watch(function(){
          return this.activeRow;
        }.bind(this), function (activeRow) {
          if(activeRow) {
            this.notifyObservers(activeRow);         
          }
        }.bind(this),true);
      }

      //Public methods
      /**
      * Append a new value to the end of this dataset.
      */ 
      this.insert = function (obj) {
        service.save(obj);
        this.data.push(obj);
      };

      /**
      * Uptade a value into this dataset by using the dataset key to compare
      * the objects
      */ 
      this.update = function (obj, callback) {
        var keyObj = {}
        keyObj[this.key] = obj[this.key];
        service.update(keyObj, obj);
      };

      /**
      * Remove an object from this dataset by using the given id.
      * the objects
      */
      this.remove = function (id) {
        for(var i = 0; i < this.data.length; i++) {
              if(this.data[i][this.key] === id) {
                  var obj = this.data.splice(i,1);
                  var keyObj = {}
                  keyObj[this.key] = obj[this.key];
                  service.delete(keyObj, obj);
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
      this.goTo = function (rowId) {
        for(var i = 0; i < this.data.length; i++) {
          if(this.data[i][this.key] === rowId) {
            cursor = i;
            this.activeRow = this.data[cursor];
            return this.activeRow;
          }
        }
      };

      /**
      *  Get the current cursor index
      */
      this.getCursor = function () {
        return cursor;
      };

      /**
      *  Get the current row data
      */
      this.current = function () {
        return this.activeRow || this.data[0];
      }

      /**
      *  Fetch all data from the server
      */
      this.fetch = function (props) {
        // Get some fake testing data
        var endpoint = (this.endpoint) ? this.endpoint : "";

        var resource = $resource(endpoint + "/:entry", { 
          entry: this.name 
        });

        var query = resource.query(props);

        query.$promise.then(function (data) {
            this.data = data;
            this.activeRow = {};
            this.pageIndex++;
        }.bind(this));
      }

      /**
      * Asynchronously notify observers 
      */
      this.notifyObservers = function () {
        for(var key in this.observers) {
          if(this.observers.hasOwnProperty(key)) {
            var dataset = this.observers[key];
            $timeout(function() {
              dataset.notify.call(dataset, this.activeRow);
            }.bind(this),1);  
          }
          
        }
        
      }

      this.notify = function (activeRow) {
        // Parse the filter using regex
        // to identify {params}
        var filter = this.watchFilter;
        var pattern = /\{([A-z][A-z|0-9]*)\}/gim;

        // replace all params found by the 
        // respectiveValues in activeRow
        filter = filter.replace(pattern,function(a,b) {
          return activeRow[b];
        })
        
        this.fetch({
          q: filter
        });
      }

      this.addObserver = function(observer) {
        this.observers.push(observer);
      }

    };

    /**
      * Dataset Manager Methods
      */
    this.storeDataset = function (dataset) {
        this.datasets[dataset.name] = dataset;
    },

    /**
    * Initialize a new dataset
    */
    this.initDataset = function (props) {
        // Get some fake testing data
        var endpoint = (props.endpoint) ? props.endpoint : "";

        var dts = new DataSet(props.name);
        dts.key = props.key;
        dts.endpoint = props.endpoint;
        dts.init();
        this.storeDataset(dts);

        if(!props.lazy) {
          dts.fetch();
        }

        if(props.watch) {
          this.registerObserver(props.watch, dts);
          dts.watchFilter = props.watchFilter;
        }
        
    }

    /**
    * Register a dataset as an observer to another one
    */
    this.registerObserver = function (targetName, dataset) {
      this.datasets[targetName].addObserver(dataset);
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
        var init = function () {
          DatasetManager.initDataset({
            name: attrs.name,
            key: attrs.key,
            endpoint: attrs.endpoint,
            lazy: (attrs.hasOwnProperty('lazy') && attrs.lazy === "") || attrs.lazy === "true",
            watch: attrs.watch,
            watchFilter: attrs.watchFilter
          });
        };

        init();
      }
    };
  }]);
}(app));