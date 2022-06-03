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

app.get('/people', db.getAllPeople)
app.post('/people', db.createPerson)

app.get('/people/:peopleID', db.getPersonByID)
app.put('/people/:peopleID', db.updatePersonalData)
app.put('/people/:peopleID', db.unsubscribe)

app.get('/people/responsibles', db.getAllResponsibles)

app.get('/people/responsibles/:personID', db.getPersonByID)

app.get('/people/responsibles/:personID/courses', db.getResonsiblesCourses)

app.get('/activities', db.getAllActivities)
app.post('/activities', db.createActivity)

app.get('/activities/:activityID', db.getActivityByID)
app.put('/activities/:activityID', db.updateActivity)
app.delete('/activities/:activityID', db.deleteActivity)

app.get('/courses', db.getAllCourses)

app.get('/activities/:activityID/courses', db.getActivityCourses)
app.post('/activities/:activityID/courses', db.createActivityCourse)

app.get('/activities/:ActivityID/courses/:courseID', db.getCourseByID)
app.put('/activities/:ActivityID/courses/:courseID', db.updateCourse)
app.delete('/activities/:ActivityID/courses/:courseID', db.deleteCourse)

app.get('/activities/:ActivityID/courses/:courseID/today', db.getTodayActivities)

app.get('/activities/:ActivityID/courses/:courseID/activitydays', db.getAllActivityDaysOfTheCourse)
//CREATE ACTIVITY DAY - POST

app.get('/activities/:ActivityID/courses/:courseID/activitydays/:day/:timeini', db.getActivityDay)
app.put('/activities/:ActivityID/courses/:courseID/activitydays/:day/:timeini', db.open_closeActivityDay)
app.delete('/activities/:ActivityID/courses/:courseID/activitydays/:day/:timeini', db.anulateActivityday)

app.get('/activities/:ActivityID/courses/:courseID/activitydays/:day/:timeini/attendees', db.getActivityDayAttendees)
app.put('/activities/:ActivityID/courses/:courseID/activitydays/:day/:timeini/attendees', db.updateAttendees)

app.listen(port, () => {
	console.log(`Running on port ${port}`)
})

