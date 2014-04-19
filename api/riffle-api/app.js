/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongoose =  require('mongoose')
  , mongoStore = require('connect-mongo')(express)
  , logfmt = require("logfmt")
  , fs = require("fs")
  ;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.bodyParser({uploadDir:'./uploads'}));
var mongoUri =  process.env.MONGOLAB_URI ||
                process.env.MONGOHQ_URL ||
                'mongodb://localhost/riffle';

Grid = mongoose.Grid;

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  mongoose.connect(mongoUri);
}
var Schema = mongoose.Schema;
var soundBites = new Schema({
    path: {type: String},
    size: {type: String},
    originalName: {type: String},
    name: {type: String}
});

var Model = mongoose.model('riffs', soundBites);

app.get('/', function (req, res){
  res.render('index');
});

app.post('/riff-upload', function(req, res, next){
    var data = new Buffer('');
    
    // get the temporary location of the file
    var tmp_path = req.files.audio.path;
    
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './riffs/' + req.files.audio.name;
    
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            var name = req.files.audio.name || '';
            var riff = new Model({originalName: req.files.audio.originalFilename, name: name, path: target_path, size: req.files.audio.size, });
            riff.save();
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.audio.size + ' bytes');
        });
    });
});

app.get('/list', function(req, res){
    return Model.find( function(err, riffs){
      res.json('list', {
        riffs: riffs 
      })
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
