const express = require('express')
const bodyParser = require('body-parser')
const port = process.env.PORT || 5000
const db = require('./queries')

const app = express()
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
	response.json({ info: 'Node.js, Express, and Postgres API - MIGUEL TFG 2022' })
  }
)

app.get('/people', db.getAllPeople) //OK
app.post('/people', db.createPerson)

app.get('/people/:personID', db.getPersonByID) //OK
app.put('/people/:personID', db.updatePersonalData)
app.put('/people/:personID', db.unsubscribe)

app.get('/people/responsibles', db.getAllResponsibles) //CHECK

app.get('/people/responsibles/:personID', db.getPersonByID) //OK

app.get('/people/responsibles/:personID/courses', db.getResonsiblesCourses) //OK

app.get('/activities', db.getAllActivities) //OK
app.post('/activities', db.createActivity)

app.get('/activities/today', db.getTodayActivities) //CHECK - date format - join C & A

app.get('/activities/:activityID', db.getActivityByID) //OK
app.put('/activities/:activityID', db.updateActivity)
app.delete('/activities/:activityID', db.deleteActivity)

app.get('/courses', db.getAllCourses) //OK
app.get('/activities/:activityID/courses', db.getActivityCourses) //OK
app.post('/activities/:activityID/courses', db.createActivityCourse)

app.get('/activities/:activityID/courses/:courseID', db.getCourseByID) //OK
app.put('/activities/:activityID/courses/:courseID', db.updateCourse)
app.delete('/activities/:activityID/courses/:courseID', db.deleteCourse)

app.get('/activities/:activityID/courses/:courseID/activitydays', db.getAllActivityDaysOfTheCourse) //OK
//CREATE ACTIVITY DAY - POST

app.get('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini', db.getActivityDay) //OK ~revisar con datos
app.put('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini', db.open_closeActivityDay)
app.delete('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini', db.anulateActivityday)

app.get('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini/attendees', db.getActivityDayAttendees) //OK ~revisar con datos
app.put('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini/attendees', db.updateAttendees)

app.listen(port, () => {
	console.log(`Running on port ${port}`)
})

