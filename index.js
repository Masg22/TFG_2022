const express = require('express');
//const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false
	}
});

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app
	.route('/')
	.get((req, res) => {
		res.send('hello world')
	});

app
	.route('/tags')
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
		
		const client = await pool.connect();
		
		const { tagname } = req.body.json();
		console.log("json: %j", req.body);
		console.log("tagname: ", [tagname]);

		client.query(
			`INSERT INTO tags (tagName) VALUES ($1)`,
			[tagname],
			(error, result) => {
				if (error) {
					throw error;
				}
				res.status(201).send(`User added with name: ${result.nametag}`);
			})
	});

app.listen(port, () => {
	console.log(`Running on port ${port}`)
})

