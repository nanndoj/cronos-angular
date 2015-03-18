var express = require('express')
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var data = [
		  {"id": "567231230123", "nome": "Ford", "sobrenome": "Fiesta", "ano": "2005"},
		  {"id": "547231230123", "nome": "Fiat", "sobrenome": "Palio", "ano": "2006"},
		  {"id": "127231230123", "nome": "Land Rover", "sobrenome": "Discovery", "ano": "2007"},
		  {"id": "767231230123", "nome": "Peugeout", "sobrenome": "206 SE", "ano": "2008"},
		  {"id": "927231230123", "nome": "Lamborguini", "sobrenome": "Aventator", "ano": "2014"}
];

var acessorios = [
		  {"id": "567231231234", "idCarro": "127231230123", "nome": "Rodas de Liga Leve"},
		  {"id": "547231654319", "idCarro": "127231230123", "nome": "Tração 4X4"},
		  {"id": "127456787938", "idCarro": "127231230123", "nome": "Controle de Velocidade"},
		  {"id": "098712323824", "idCarro": "927231230123", "nome": "Portas Automáticas"},
		  {"id": "912342430239", "idCarro": "927231230123", "nome": "GPS de Fábrica"}
];

var versao = [
      {"id": "167231131234", "idAcessorio": "547231654319", "nome": "Turbo Flex 2.0"},
      {"id": "247231254319", "idAcessorio": "547231654319", "nome": "Turbo Diesel 5.4"},
      {"id": "327456387938", "idAcessorio": "547231654319", "nome": "Gasolina 3.0"},
      {"id": "498712423824", "idAcessorio": "098712323824", "nome": "Fun 1.4"},
      {"id": "512342530239", "idAcessorio": "098712323824", "nome": "Joy 1.6"}
];

// apply this rule to all requests accessing any URL/URI
app.all('*', function(req, res, next) {
    // add details of what is allowed in HTTP request headers to the response headers
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', false);
    res.header('Access-Control-Max-Age', '86400');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    // the next() function continues execution and will move onto the requested URL/URI
    next();

});

app.get('/api/Carros', function (req, res) {
  res.setHeader('content-type','application/json');
  res.setHeader('Access-Control-Allow-Origin','*');
  
  res.send(data);
});

app.get('/api/Acessorios', function (req, res) {
  res.setHeader('content-type','application/json');
  res.setHeader('Access-Control-Allow-Origin','*');
  
  var returnData = acessorios.slice(0);

  if(req.query.q) {
    var filters = req.query.q.split('&');
    for(var i = 0.; i < filters.length; i++) {
       var filter = filters[i].split("=");
       returnData = returnData.filter(function(item) {
          return item[filter[0]] == filter[1];
       });    
    }
  }

  res.send(returnData);
});

app.get('/api/Versao', function (req, res) {
  res.setHeader('content-type','application/json');
  res.setHeader('Access-Control-Allow-Origin','*');
  
  var returnData = versao.slice(0);

  if(req.query.q) {
    var filters = req.query.q.split('&');
    for(var i = 0.; i < filters.length; i++) {
       var filter = filters[i].split("=");
       returnData = returnData.filter(function(item) {
          return item[filter[0]] == filter[1];
       });    
    }
  }

  res.send(returnData);
});

app.post('/api/Carros', function (req, res) {
  res.setHeader('content-type','application/json');
  res.setHeader('Access-Control-Allow-Origin','*');
  
  console.log(req.body);
  data.push(req.body);
  res.send({});
});

app.delete('/api/Carros/:id', function (req, res) {
  console.log(req.params.id);
  console.log(req.body);
});

app.put('/api/Carros/:id', function (req, res) {
  console.log(req.params.id);
  console.log(req.body);
});

// fulfils pre-flight/promise request
app.options('*', function(req, res) {
    res.send(200);
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})