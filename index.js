const express = require('express')
const bodyParser = require('body-parser')
const port = process.env.PORT || 5000
const db = require('./queries')
const { request } = require('express')
const { response } = require('express')

const { Pool } = require('pg/lib')

const app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
	response.json({ info: 'Node.js, Express, and Postgres API - MIGUEL TFG 2022' })
  }
)

app.post('/singup', db.singup)

app.get('/test', db.test)

app.get('/people', db.getAllPeople) //OK
app.post('/people', db.createPerson) //OK

app.get('/people/responsibles', db.getAllResponsibles) //CHECK
app.get('/people/responsibles/:personID', db.getPersonByID) //OK

app.get('/people/responsibles/:personID/courses', db.getResonsiblesCourses) //OK
app.get('/people/responsibles/:personID/courses/attendance', db.getResonsiblesCoursesStats)

app.get('/people/:personID', db.getPersonByID) //OK
app.put('/people/:personID', db.updatePersonalData) //OK
app.put('/people/:personID/unsub', db.unsubscribe_subscribe) //OK

app.get('/person/:personID/inscriptions', db.getPersonInscriptions)
app.post('/person/:personID/inscriptions', db.addPersonInscription)
app.get('/person/:personID/inscriptions/attendance', db.gePersonAttendanceToCourses)
app.delete('/person/:personID/inscriptions/:activityID/:courseID', db.deletePersonInsccription)

app.get('/activities', db.getAllActivities) //OK
app.post('/activities', db.createActivity) //OK

app.get('/activities/generalstats', db.generateStatsGeneral) //OK

app.get('/activities/today', db.getTodayActivities) //OK

app.get('/activities/:activityID', db.getActivityByID) //OK
app.put('/activities/:activityID', db.updateActivity) //OK
app.delete('/activities/:activityID', db.deleteActivity) //OK

app.get('/activities/:activityID/activitystats', db.generateStatsActivity) 

app.get('/courses', db.getAllCourses) //OK
app.get('/activities/:activityID/courses', db.getActivityCourses) //OK
app.post('/activities/:activityID/courses', db.createActivityCourse)

app.get('/activities/:activityID/courses/:courseID', db.getCourseByID) //OK
app.put('/activities/:activityID/courses/:courseID', db.updateCourse)
app.delete('/activities/:activityID/courses/:courseID', db.deleteCourse)

app.get('/activities/:activityID/courses/:courseID/coursestats', db.generateStatsCourse) //OK

app.get('/activities/:activityID/courses/:courseID/activitydays', db.getAllActivityDaysOfTheCourse) //OK
app.post('/activities/:activityID/courses/:courseID/activitydays', db.createActivityDay)

app.get('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini', db.getActivityDay) //OK 
app.put('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini', db.open_closeActivityDay) //OK
app.delete('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini', db.anulateActivityday)

app.get('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini/attendees', db.getActivityDayAttendees) //OK
app.put('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini/attendees', db.updateAttendees) //OK

app.get('/activities/:activityID/courses/:courseID/activitydays/:day/:timeini/attendance', db.getActivityDayAttendance) //OK

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

app.listen(port, () => {
	console.log(`Running on port ${port}`)
})

