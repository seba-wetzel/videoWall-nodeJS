// Librerias importadas
var http       = require('http');
var express    = require ('express');
var formidable = require('express-formidable');
var mongo      = require ('mongoose')
var parser     = require ('body-parser');
var fs         = require ('fs');

//Dirty code to avoid warnings
const eventos = require('events');
const emitter = new eventos.EventEmitter(0);             //Deveria corregir esto si la raspi se empieza a colgar
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
  multiples: true,                                   // El request no puede ser un array de archivos
}));
mongo.connect("mongodb://localhost/videowall-test2");  //Base de datos mongodb

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
	archivos.findOne({select:true},function(err, doc){
    console.log(doc);
    if(doc){
		res.render('index',{imagen: doc });}
    else {
      var temp = {url:'/imgs/logo.png'};
      res.render('index',{imagen: temp });
    };;
	});
});

app.get('/images',function(req,res) {
	console.log("images");
	archivos.find(function(err, doc){
		res.render('images',{files: doc });
	});

});

app.get('/upload', function(req, res) {
  res.render('upload');
	console.log("Upload");

});

app.post('/upload', function (req, res) {
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
  res.redirect('/');

});

app.post('/set', function (req, res){
 console.log("set");
 req.fields;

 archivos.find({},function(err, documentos) {
  documentos.forEach(function(documento) {
    documento.select = 'false';
    documento.save();
  });
 });
  if (req.fields.selection){
   archivos.findById(req.fields.selection, function(err, doc) {
   doc.select = true;
   doc.save(function(err, updated){
     console.log(updated);
      });
    });
  };

   //archivos.update({_id:req.fields.selection},{'$set': {select:true}},function (err, tank) {});
   console.log(req.fields.selection);

   res.redirect('/');

  });

app.post('/delete',function (req, res){
  var id =req.fields.selection;
  archivos.findOne({_id:id},function(err, documentos) {
    console.log(documentos.url);
    fs.unlinkSync(documentos.url);
  });
  archivos.findByIdAndRemove(id, function (err,offer){
    res.redirect('/images');
  });


});
// Server

app.listen(puerto);
 console.log("Escuchando en el puerto %d",puerto);
