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

app.route('/people/:peopleID')
   .get(db.getPersonByID)
   .put(db.updatePersonalData)
   .put(db.unsubscribe)

app.route('/people/responsibles')
   .get(db.getAllResponsibles)

app.route('/people/responsibles/:personID')
   .get(db.getPersonByID)

app.route('/people/responsibles/:personID/courses')
   .get(db.getResonsiblesCourses)


app.route('/activities')
   .get(db.getAllActivities)
   .post(db.createActivity)

app.route('/activities/:activityID')
   .get(db.getActivityByID)
   .put(db.updateActivity)
   .delete(db.deleteActivity)

app.route('/courses').get(db.getAllCourses)

app.route('/activities/:activityID/courses')
   .get(db.getActivityCourses)
   .post(db.createActivityCourse)

app.route('/activities/:ActivityID/courses/:courseID')
	.get(db.getCourseByID)
	.put(db.updateCourse)
	.delete(db.deleteCourse)

app.route('/activities/:ActivityID/courses/:courseID/today')
   .get(db.getTodayActivities)

app.route('/activities/:ActivityID/courses/:courseID/activitydays')
   .get(db.getAllActivityDaysOfTheCourse)

app.route('/activities/:ActivityID/courses/:courseID/activitydays/:day/:timeini')
   .get(db.getActivityDay)
   .put(db.open_closeActivityDay)
   .delete(db.anulateActivityday)

app.route('/activities/:ActivityID/courses/:courseID/activitydays/:day/:timeini/attendees')
   .get(db.getActivityDayAttendees)
   .put(db.updateAttendees)

app.listen(port, () => {
	console.log(`Running on port ${port}`)
})

