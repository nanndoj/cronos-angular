# cronos-angular
Application CRUD ready for AngularJS using RESTFul Services

Multiple components can share a unique Dataset, which is responsible for manage all RestFull requests

    <cronos-dataset host="http://example.com" name="Car" key="id"></cronos-dataset>

It will create a `Dataset` object handling the following http requests:

    GET http://example.com/api/Car
    POST http://example.com/api/Car
    GET http://example.com/api/Car/:id
    PUT http://example.com/api/Car/:id
    DELETE http://example.com/api/Car/:id

The directive will create a Provider that can be used in controllers

    app.controller("CronosController",['DatasetManager', function(DatasetManager, $scope) {
       $dataset = DatasetManager.getDataset("Car");
       // List all entries
       $dataset.list().then(function(response) {
         // GET http://example.com/api/Car HTTP/1.1
         console.log(response);
       });
       
       // Insert a new entry
       $dataset.insert({ "id" : 1}).then(function(response) {
         // POST http://example.com/api/Car HTTP/1.1
         console.log(response);
       });
       
       // Update an entry
       $dataset.update({ "id" : 1, "name": "Foo"}).then(function(response) {
         // PUT http://example.com/api/Car/1 HTTP/1.1
         console.log(response);
       });
       
       // Remove an entry
       $dataset.delete({ "id" : 1, "name": "Foo"}).then(function(response) {
         // DELETE http://example.com/api/Car/1 HTTP/1.1
         console.log(response);
       });
       
       
   });
