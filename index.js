const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { Pool, pool } = require('./config')

const { request } = require('express')
const { response } = require('express')

const port = process.env.PORT || 5000

const app = express()
app
	.route('/')
	.get((req, res) => {
		res.send('hello world')
	})

app
	.route('/db')
	.get(async(req,res) => {
		try{
			const client = await pool.connect();
			const result = await client.query(
				'SELECT * FROM tags'
			);
			const results = {'results': (result) ? result.rows : null};
			res.render('tags/db', results);
			client.release();
		}
		catch (err){
			console.error(err);
			res.send("ERRROR: " + err);
		}
	})

app.listen(port, () => {
	console.log(`Running on port ${port}`)
})

