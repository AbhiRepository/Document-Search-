'use strict'
var express = require("express")
var bodyParser = require("body-parser");
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node : 'http://localhost:9200' })

var app = express();
app.use(bodyParser.urlencoded({extended : true}));

app.get('/', function(req, res){
	res.render('home.ejs');
})

app.get('/documents', function(req, res){

	var allRecords = []

	client.search({
		index : 'documentstorage',
		scroll: '10s',
		body : {
			query : {
				"match_all" : {}
			}
		}
	}, function repeatUntillGetAll(err, rawDocs){

		rawDocs.body.hits.hits.forEach(function (hit) {
		    allRecords.push(hit);
		});

		if(rawDocs.body.hits.total.value - 10 > allRecords.length){
			client.scroll({
				scrollId : rawDocs.body._scroll_id,
				scroll : '10s'
			}, repeatUntillGetAll);
		} else {
			console.log('Got all the documents!!!')
			res.render('documents.ejs', { allRecords : allRecords })
		}
	});


})

app.post('/search', function(req, res){
	var askedQuery = req.body.query;
	var relatedRecords = []

	client.search({
		index : 'documentstorage',
		scroll: '10s',
		body : {
			query : {
				fuzzy : {
					documentcontent : {
						value : askedQuery
					}
				}
			}
		}
	}, function repeatUntillGetAll(err, relatedDocs){

		relatedDocs.body.hits.hits.forEach(function (hit) {
		    relatedRecords.push(hit);
		});

		if(relatedDocs.body.hits.total.value - 10 > relatedRecords.length){
			client.scroll({
				scrollId : relatedDocs.body._scroll_id,
				scroll : '10s'
			}, repeatUntillGetAll);
		} else {
			console.log('Got all the documents!!!')
			res.render('documents.ejs', { allRecords : relatedRecords })
		}
	});

})

app.listen(5000, function(){
	console.log('Qoogle Server is running!!!');
})
