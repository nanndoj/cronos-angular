(function($app) {
  angular.module('cronos.datasource', [])

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
      this.active = {};
      this.inserting = false; 
      this.editing = false;
      this.fetchSize = 2;
      this.observers = [];
      this.rowsPerPage = null;
      this.append = false;

      // Private members
      var cursor = 0;
      var page = 0;
      var service = null;

      this.init = function() {
        this.endpoint = (this.endpoint) ? this.endpoint : "";

        service = $resource(this.endpoint + '/:entity/:id', 
        { 
          entity : this.entity,
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
          return this.active;
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
        service.save(obj).$promise.then(function(obj) {
          this.data.push(obj);
        }.bind(this));
      };

      /**
      * Uptade a value into this dataset by using the dataset key to compare
      * the objects
      */ 
      this.update = function (obj, callback) {
        var keyObj = {}
        keyObj[this.key] = obj[this.key];
        service.update(keyObj, obj).$promise.then(function(obj) {
          this.data.forEach(function(currentRow) {
            if(currentRow[this.key] === obj[this.key]) {
              this.copy(obj,currentRow);
            }
          }.bind(this));
        }.bind(this));        
      };

      /**
      * Insert or update based on the active row
      */ 
      this.post = function () {
        if(this.inserting) {
          this.insert(this.active);
          this.inserting = false;
        } else if(this.editing) {
          this.update(this.active);
          this.editing = false;
        }

      };

      this.cancel = function() {
        this.inserting = false;
        this.editing = false;
      }

      /**
      * Remove an object from this dataset by using the given id.
      * the objects
      */
      this.remove = function (id) {
        for(var i = 0; i < this.data.length; i++) {
              if(this.data[i][this.key] === id) {
                  var obj = this.data.splice(i,1)[0];
                  var keyObj = {}
                  keyObj[this.key] = obj[this.key];
                  service.remove(keyObj, obj);
                  this.active = {}
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
        return this.data && (cursor > 0);
      };

      /**
      *  Get the current item moving the cursor to the next element
      */
      this.next = function () {
        if(!this.hasNext());
        this.active = this.copy(this.data[++cursor],{});
        return this.active;
      };

      /**
      *  Get the previous item
      */
      this.previous = function () {
        if(!this.hasPrevious()) throw "Dataset Overflor Error";
        this.active = this.copy(this.data[--cursor],{});
        return this.active;
      };

      /**
      *  Moves the cursor to the specified item
      */
      this.goTo = function (rowId) {
        for(var i = 0; i < this.data.length; i++) {
          if(this.data[i][this.key] === rowId) {
            cursor = i;
            this.active = this.copy(this.data[cursor],{});
            return this.active;
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
        return this.active || this.data[0];
      }

      /**
      *  Fetch all data from the server
      */
      this.fetch = function (props) {
        // Get some fake testing data
        var endpoint = (this.endpoint) ? this.endpoint : "";

        var resource = $resource(endpoint + "/:entity", { 
          entity: this.entity 
        });

        // if pagination rows was defined
        // we need to control the page on each 
        // fetch request
        if(this.rowsPerPage && this.rowsPerPage > 0) {
          props.page = page + 1;
        } 

        var query = resource.query(props);

        query.$promise.then(
          // Success Handler
          function (data) {
            // If prepend property was set. 
            // Add the new data before the old one
            if(this.prepend) this.data = data.concat(this.data);  

            // If append property was set. 
            // Add the new data after the old one
            if(this.append) this.data = this.data.concat(data);

            // When neither append nor preppend was set
            // Just replace the current data
            if(!this.prepend && !this.append) {
              this.data = data;
              this.active = {};
            }

          }.bind(this),
          // Error Handler
          function (error) {                 
            console.log(error);
          }
        );
      }

      /**
      * Asynchronously notify observers 
      */
      this.notifyObservers = function () {
        for(var key in this.observers) {
          if(this.observers.hasOwnProperty(key)) {
            var dataset = this.observers[key];
            $timeout(function() {
              dataset.notify.call(dataset, this.active);
            }.bind(this),1);  
          }
          
        }
        
      }

      this.notify = function (activeRow) {
        if(activeRow) {
          // Parse the filter using regex
          // to identify {params}
          var filter = this.watchFilter;
          var pattern = /\{([A-z][A-z|0-9]*)\}/gim;

          // replace all params found by the 
          // respectiveValues in activeRow
          filter = filter.replace(pattern,function(a,b) {
            return activeRow.hasOwnProperty(b) ? activeRow[b] : "";
          });
          
          this.fetch({
            q: filter
          });
        }
      }

      this.addObserver = function(observer) {
        this.observers.push(observer);
      }

      /**
      * Clone a JSON Object
      */
      this.copy = function (from,to) {
        if(from == null || typeof(from) != 'object')
            return from;

        to = to || {}; 

        for(var key in from) {
            if(from.hasOwnProperty(key)) {
              to[key] = this.copy(from[key]);
            }
        }
        return to;
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
        var endpoint = (props.endpoint) ? props.endpoint : "";

        var dts = new DataSet(props.name);
        dts.entity = props.entity;
        dts.key = props.key;
        dts.rowsPerPage = props.rowsPerPage;
        dts.append = props.append;
        dts.endpoint = props.endpoint;
        dts.init();
        this.storeDataset(dts);

        if(!props.lazy && !props.watch) {
          // Query string object
          var queryObj = {};
          if(dts.rowsPerPage) queryObj.per_page = dts.rowsPerPage;

          // Fill the dataset
          dts.fetch(queryObj);
        }

        if(props.watch) {
          this.registerObserver(props.watch, dts);
          dts.watchFilter = props.watchFilter;
        }

        // Add this instance into the root scope
        // This will expose the dataset name as a
        // global variable
        $rootScope[dts.name] = dts;
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
  $app.directive('datasource',['DatasetManager', function (DatasetManager) {
    return {
      restrict: 'E',
      template: '',
      link: function(scope, element, attrs) {
        var init = function () {
          DatasetManager.initDataset({
            name: attrs.name,
            entity: attrs.entity,
            key: attrs.key,
            endpoint: attrs.endpoint,
            lazy: (attrs.hasOwnProperty('lazy') && attrs.lazy === "") || attrs.lazy === "true",
            append: (attrs.hasOwnProperty('append') && attrs.append === "") || attrs.append === "true",
            prepend: (attrs.hasOwnProperty('prepend') && attrs.prepend === "") || attrs.prepend === "true",
            watch: attrs.watch,
            rowsPerPage: attrs.rowsPerPage,
            watchFilter: attrs.watchFilter
          });
        };

        init();
      }
    };
  }]);
}(app));