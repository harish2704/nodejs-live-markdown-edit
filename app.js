
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var PORT = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);

app.configure(function(){
  app.set('port', PORT );
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var fs = require('fs');


var index = function(req, res){
  res.render('index', { title: 'Express', files: req.session.registerdFiles });
};



var io = require('socket.io').listen( server );

var monitorFn = function( err, io, fileName, data ){
    var msg = {};
    msg.fileName = fileName;
    msg.data = data;
    io.sockets.emit('change', data );
}

function MoniterRegister( io ){
    this.io = io;
    this.__registeredFiles = [];
}

MoniterRegister.prototype.register = function( fileName, cbFn ){
    cbFn = cbFn || monitorFn;
    var moniterRegister = this;
    if ( this.__registeredFiles.indexOf( fileName ) == -1 ){
        this.__registeredFiles.push( fileName);
        fs.watchFile( fileName, function( oldStat, newStat ){
            fs.readFile( fileName, 'utf8', function( err, data ){
                return cbFn( err, moniterRegister.io, fileName, data, oldStat, newStat );
            });
        });
        return true;
    }
    return false;
}

var mRegister = new MoniterRegister( io );

var liveEdit = function(req, res){
    var fName = req.body.fileName;
    if ( fName && ( fName != '' ) ){
        req.session.registerdFiles = req.session.registerdFiles || [];
        if( mRegister.register( fName ) ){
            req.session.registerdFiles.push( fName );
        }
        res.render('index', { title: 'Express', files: req.session.registerdFiles });
    }
}

app.get('/', index );
app.post('/', liveEdit );

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

