var express = require("express");
var bodyParser = require("body-parser");
'use strict'
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
var fs = require("fs")


app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	
	fs.readdir('manipulated', function(err, filenames){
		if(err){
			console.log(err)
		} else {
			filenames.forEach(function(filename){
				var textContent = fs.readFileSync('manipulated/'+filename, 'utf8')
				var heading = textContent.substr(0,textContent.indexOf('\n')); // "72"
				var content = textContent.substr(textContent.indexOf('\n')+1);
				async function run(){
					await client.index({
						index : 'documentstorage',
						body : {
							documentid : filename,
							documentheading : heading,
							documentcontent : content
						}
					})
					await client.indices.refresh({ index : 'documentstorage'});
				}

				run().catch(console.log);
			})
		}
	});

	res.send(`processing of ${0} document is done`);
})


app.listen(5000, function(){
	console.log("server is running!!!")
})