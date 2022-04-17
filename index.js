const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false
	}
});

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
	.get(async (req, res) => {
		try {
			const client = await pool.connect();
			const result = await client.query(
				'SELECT * FROM tags'
			);
			const results = { 'results': (result) ? result.rows : null };
			res.send(result.rows);
			client.release();
		}
		catch (err) {
			console.error(err);
			res.send("ERRROR: " + err);
		}
	})
	.post(async (req, res) => {
		try {
			const { tagName } = req.body;
			const client = await pool.connect();
			const result = await client.query(
				'INSERT INTO tags(tagName) VALUES($1)',
				[tagName],
				res.status(201).json({ status: 'success', message: 'Tag added.' })
			);
		} catch (err) {
			console.error(err);
			res.send("ERRROR: " + err);
		}
	})

app.listen(port, () => {
	console.log(`Running on port ${port}`)
})

