// Librerias importadas
var http = require('http');
var express = require ('express');
var mongo   = require ('mongoose')
var parser  = require ('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');


// Instantaciones y configuraciones
var puerto = 80;
var app     = express();
app.set("view engine","jade");                   //Motor de plantillas jade
app.use(express.static("public"));               //Carpeta de contenidos estaticos
app.use(parser.json());                         //Parser de los envios post y get
app.use(parser.urlencoded({extended:true}));
mongo.connect("mongodb://localhost/videowall");  //Base de datos mongodb

// Schema de la base de datos
var schema = {
	titulo:String,
	descripcion:String,
	tipo:String,
	url:String,
	select:Boolean
};

// Instantacion de la base de datos
var archivos = mongo.model("archivos",schema);

var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname.replace(path.extname(file.originalname), "") + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({ storage: storage })

// Rutas
app.get('/', function(req, res) {
  console.log("index");
	res.render('index');
});

app.get('/upload', function(req, res) {
  res.render('upload');
	console.log("Upload");

});

app.post('/upload',upload.array('file'),function(req,res) {

		 var entrada = {                            //Variable donde guardar los post para guardar en la base de datos
		 	titulo:req.body.titulo,
		 	descripcion:req.body.descripcion,
			url:req.body.path,
		 	select:false
		};

	var nuevaEntrada = new archivos (entrada);
	nuevaEntrada.save(function(err){           //Guardamos en la base de datos las nuevas entradas
		console.log(entrada);
	});
  console.log(req);
	res.render('index');
})

app.get('/files',function(req,res) {
	archivos.find(function(err, doc){
		res.render('files',{files: doc });
	});

});

// Server
app.listen(puerto);
 console.log("Escuchando en el puerto %d",puerto);
