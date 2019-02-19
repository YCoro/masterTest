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
   var lkey = req.body.key;
   var shared = req.body.shared_secret;
   if(Object.keys(keys).filter(function(key){
   		return keys[key] == lkey;
   })){
	   	res.status(403).send({
	    	success: 'true',
	    	message: 'Forbidden'
	    });
   }else{
   	keys.push({key: lkey, shared_secret: shared})
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
	if(auth(req,res,'/message')){
		res.status(200).send({
			success: 'true',
			identifier: messages.length
		});
	}else {
		res.status(403).send({
			succes: 'true',
			message: 'Auth error'
		})
	}
});

router.get('/message/:id', function(req,res){
	if(auth(req,res,'/message')){
		res.status(200).send("message:" + messages[req.params.id].msg);
	}else {
		res.status(403).send({
			succes: 'true',
			message: 'Auth error'
		})
	}
});
router.get('/message/:tag', function(req,res){
	let result = [];
	for(var i = 0; i < messages.length; i++)
	{
	  if(messages[i].tags == req.params.tag)
	  {
	    result.push(messages[i].tags.name);
	  }
	}
	if(auth(req,res,'/message')){
		res.status(200).send("Matching tags: " + result);
	}else {
		res.status(403).send({
			succes: 'true',
			message: 'Auth error'
		})
	}
	
});

var auth = function(req,res, url){
	var authorized = false;
	if(keys.includes(req.header['X-Key'])){
		if(keys.includes(req.header['X-Route']) && url.parse(req.url).pathname == url){
			if(req.header['X-Signature']){
				let word1 = req.body.msg;
				let word2 = req.body.tags;
				let mixedWords = sortString(word1?word1+';':''+ word2?word2+';':'' + req.header['X-Route']? req.header['X-Route'] + ";" : '');
				return req.header['X-Signature'] == crypto.createHmac('sha256', keys[req.header['X-Key']].shared_secret).digest(hex);
			}
		}
	}
	return authorized;
}

// sort by name property
function sortString(str){
  var arr = str.split('');
  var tmp;
  for(var i = 0; i < arr.length; i++){
    for(var j = i + 1; j < arr.length; j++){
      /* if ASCII code greater then swap the elements position*/
      if(arr[i] > arr[j]){
        tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    }
  }
  return arr.join('');
}
app.use(router);

app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});