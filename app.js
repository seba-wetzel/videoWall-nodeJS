// Librerias importadas
var http       = require('http');
var express    = require ('express');
var formidable = require('express-formidable');
var mongo      = require ('mongoose')
var parser     = require ('body-parser');

//Dirty code to avoid warnings
const eventos = require('events');
const emitter = new eventos.EventEmitter();             //Deveria corregir esto si la raspi se empieza a colgar
emitter.setMaxListeners(0);

// Instantaciones y configuraciones
var puerto = 80;
var app     = express();
app.set("view engine","jade");                   //Motor de plantillas jade
app.use(express.static("public"));               //Carpeta de contenidos estaticos
app.use('/uploads' , express.static('uploads'));
app.use(parser.json());                         //Parser de los envios post y get
app.use(parser.urlencoded({extended:true}));
app.use(formidable({
  encoding: 'utf-8',
  uploadDir: './uploads',
  multiples: false,                                   // El request no puede ser un array de archivos
}));
mongo.connect("mongodb://localhost/videowall-test");  //Base de datos mongodb

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

// Rutas
app.get('/', function(req, res) {
  console.log("index");
	res.render('index');
});

app.get('/files',function(req,res) {
	archivos.find(function(err, doc){
		res.render('files',{files: doc });
	});

});

app.get('/upload', function(req, res) {
  res.render('upload');
	console.log("Upload");

});

app.post('/upload', (req, res) => {
  req.fields; // contains non-file fields
  req.files; // contains files
	console.log(req.fields);
	console.log(req.files.subido.path);

	var entrada = {                            //Variable donde guardar los post para guardar en la base de datos
	 titulo:req.fields.titulo,
	 descripcion:req.fields.descripcion,
	 url:req.files.subido.path,
	 select:false
 	};

 var nuevaEntrada = new archivos (entrada);

 nuevaEntrada.save(function(err){           //Guardamos en la base de datos las nuevas entradas
	 console.log(entrada);
 });
  res.redirect('/files');

});

// Server
app.listen(puerto);
 console.log("Escuchando en el puerto %d",puerto);
