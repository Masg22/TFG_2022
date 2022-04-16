const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { Pool, pool } = require('./config')

const { request } = require('express')
const { response } = require('express')

const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const { body, check } = require('express-validator')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const getPeople = (request, response) => {
	pool.query('SELECT * FROM People', (error, results) => {
		if (error) {
			throw error
		}
		response.status(200).json(results.rows)
	})
}

const addPerson = (request, response) => {
	const { personID, firstName, lastName, age, gender, isUser, emailAddress, phoneNumber } = request.body
	pool.query(
		'INSERT INTO People (PersonID, FirstName, LastName, Age, Gender, IsUser, EmailAddress, PhoneNumber) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
		[personID, firstName, lastName, age, gender, isUser, emailAddress, phoneNumber],
		(error) => {
			if (error) {
				throw error
			}
			response.status(201).json({ status: 'success', message: 'PersonAdded.' })
		}
	)
}

app
	.route('/')
	.get((req, res) => {
		res.send('hello world')
	})

	/*
app.route('/people')
	.get(getPeople)
	.post(
	(request, response) => {
		const { personID, firstName, lastName, age, gender, isUser, emailAddress, phoneNumber } = request.body
		pool.query(
			'INSERT INTO People (PersonID, FirstName, LastName, Age, Gender, IsUser, EmailAddress, PhoneNumber) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
			[personID, firstName, lastName, age, gender, isUser, emailAddress, phoneNumber],
			(error) => {
				if (error) {
					throw error
				}
				response.status(201).json({ status: 'success', message: 'PersonAdded.' })
			}
		)
	}
)
*/
const port = process.env.port || 3000
app.listen(port, () => {
	console.log(`Running on port ${port}`)
})