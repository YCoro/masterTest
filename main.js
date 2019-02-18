var express = require("express"),
    app = express(),
    http     = require("http"),
    server   = http.createServer(app),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();
var keys= [];
router.get('/', function(req, res) {
	//req.body
	console.log(req.method, req.url);
   res.send("Hello World!");
});
router.put('/credential', function(req, res) {
   var key = req.body.key;
   var shared = req.body.shared_secret;
   if(keys.includes(key)){
	   	res.status(403).send({
	    	success: 'true',
	    	message: 'Forbidden'
	    });
   }else{
   	keys.push(key)
   	res.status(204).send({
   		success: 'true',
   		message: 'key Stored'
   	})
   }
   
});

var messages = [];
router.post('/message', function(req,res){
	var msg = req.body.msg;
	var tag = req.body.tag;
	console.log(req.header['X-Key']);
	messages.push({message: msg, tags:tag});
	console.log(messages)
	res.status(200).send({
		success: 'true',
		identifier: messages.length
	});
})

router.get('/message/:id', function(req,res){
	res.status(200).send("message:" + messages[req.params.id].msg);
})
router.get('/message/:tag', function(req,res){
	let result = [];
	for(var i = 0; i < messages.length; i++)
	{
	  if(messages[i].tags == req.params.tag)
	  {
	    result.push(messages[i].tags.name);
	  }
	}

	res.status(200).send("Matching tags: " + result);
})

app.use(router);

app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});