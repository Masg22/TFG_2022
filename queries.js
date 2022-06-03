const { parse } = require('dotenv')
const { query } = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')

const Pool = require('pg').Pool
const pool = new Pool({
  user: PG_USER,
  host: PG_HOST,
  database: PG_DATABASE,
  password: PG_PASSWORD,
  port: PG_PORT,
})

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

//PEOPLE
const getAllPeople = (req, res) => {
    pool.query(
        'SELECT * FROM people ORDER BY name ASC',
        (error, results) => {
            if (error) {
                throw error
              }
              response.status(200).json(results.rows)
        }
    )
}

const createPerson = (req, res) => {
    const { name, surnames, age, gender, emailAddress, isAUser, password, phone } = req.body

    pool.query(
        'INSERT INTO people( name, surnames, age, gender, emailAddress, isAUser, password, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [name, surnames, age, gender, emailAddress, isAUser, password, phone],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(201).send(`Person added with PersonID: ${results.personID}`)
        }
    )
}

const getPersonByID = (req, res) => {
    const id = parseInt(request.params.personID)

    pool.query(
        'SELECT * FROM people WHERE personID = $1',
        [id],
        (error, results) => {
            if (error) {
                throw error
            }
            
            res.status(200).json(results.rows)
        }
    )
}

const updatePersonalData = (req, res) => {
    const id = parseInt(request.params.personID)

    const { name, surname, age, gender, email } = req.body

    pool.query(
        'UPDATE people SET name = $1, surname = $2, age = $3, gender = $4, emailAddress = $5 WHERE personID = $6',
        [name, surname, age, gender, email, id],
        (error, results) => {
            if (error) {
                throw error
            }
            
            res.status(200).send(`Personal data of personID ${id} has been modified`)
        }
    )
}

const unsubscribe = (req, res) => {
    const id = parseInt(request.params.personID)

    const { active } = req.body

    pool.query(
        'UPDATE people SET active = $1 WHERE personID = $2',
        [active, id],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`personID ${id} has been changed his active field`)
        }
    )
}

//RESPONSIBLE

const getAllResponsibles = (req, res) => {
    pool.query(
        'SELECT * FROM people WHERE isAUser = true ORDER BY name ASC',
        (error, results) => {
            if (error) {
                throw error
              }
              response.status(200).json(results.rows)
        }
    )
}

const getResonsiblesCourses = (req, res) => {

    const id = parseInt(req.params.personID)

    pool.query(
        'SELECT * FROM activities WHERE responsible = $1 ORDER BY name ASC',
        [id],
        (error, results) => {
            if (error) {
                throw error
              }
              response.status(200).json(results.rows)
        }
    )
}

//ACTIVITIES
const getAllActivities = (req, res) => {
   
    pool.query(
        'SELECT * FROM activities',
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
} 

const createActivity = (req, res) => {
    const { activityname, activitydescription } = req.body

    pool.query(
        'INSERT INTO activities( activityname, activitydescription, generalstats, totalparticipants) VALUES ($1, $2, null, null)',
        [activityname, activitydescription],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(201).send(`Activity added with ActivityID: ${results.activityID}`)
        }
    )
}

const getActivityByID = (req, res) => {
    const id = parseInt(req.params.activityID)

    pool.query(
        'SELECT * FROM activities WHERE activityID = $1'
        [id],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}

const updateActivity = (req, res) => {
    const id = parseInt(req.params.activityID)
    const {activityname, activitydescription, generalstats, totalparticipants} = req.body

    pool.query(
        'UPDATE activities SET activityname = $1, activitydescription = $2, generalstats = $3, totalparticipants = $4 WHERE acivityID = $5',
        [activityname, activitydescription, generalstats, totalparticipants, id],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`Activity modified with ID: ${id}`)
            }
    )
}

const deleteActivity = (req, res) => {
    const id = parseInt(req.params.activityID)
  
    pool.query(
        'DELETE FROM activities WHERE id = $1', 
        [id], 
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`Activity deleted with ID: ${id}`)
        }
    )
}

//COURSES

const getAllCourses = (req, res) => {
   
    pool.query(
        'SELECT * FROM courses',
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}

const getActivityCourses = (req, res) => {

    const activityID = parseInt(req.params.activityID)

    pool.query(
        'SELECT * FROM courses WHERE activityID = $1',
        [activityID],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}

const createActivityCourse = (req, res) => {

    const activityID = parseInt(req.params.activityID)

    const { coursename, dateini, dateend, schedule, responsible} = req.body

    const courseID = ""

    pool.query(
        'INSERT INTO courses(coursename, dateini, dateend, schedule, courseparticipants, coursestats, responsibel) VALUES ($1, $2, $3, $4, null, null, $5)',
        [activityname, activitydescription],
        (error, results) => {
            if (error) {
                throw error
            }
            courseID = results.courseID
            res.status(201).send(`Course added with ActivityID: ${activityID} and CourseID: ${courseID}`)
        }
    )

    const ini = Date(dateini)
    const end = Date(dateend)

    var sch = schedule.split(';')
    var finalSch = []
    sch.forEach(timetable => {
        var t = timetable.split(',')
        finalSch.push(t)
    });

    for(it = ini; it > end; it = it.addDays(1)){
        for(i=0; i<finalSch.length; ++i){
            if (it.getDay() == finalSch[i][0]){
                pool.query(
                    'INSERT INTO activitydays(activityID, courseID, day, timeini, timeend) VALUES($1, $2, $3, $4, $5)',
                    [activityID, courseID, it, finalSch[i][1], finalSch[i][2]],
                    (error, results) => {
                        if (error) {
                            throw error
                        }
                    }
                )
            }
        }
    }
}

const getCourseByID = (req, res) => {
    const activityId = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)

    pool.query(
        'SELECT * FROM activities WHERE activityID = $1 and courseID = $2'
        [activityId, courseID],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}

const updateCourse = (req, res) => {
    const activityID = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)
    const {coursename, dateini, dateend, schedule, courseparticipants, coursestats, responsible} = req.body

    pool.query(
        'UPDATE courses SET coursename = $1, dateini = $2, dateend = $3, schedule = $4, courseparticipants = $5, coursestats = $6, responsible = $7 WHERE acivityID = $8 and courseID = $9',
        [coursename, dateini, dateend, schedule, courseparticipants, coursestats, responsible, activityID, courseID],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`Course modified with ID: ${activityID}, ${courseID}`)
            }
    )
}

const deleteCourse = (req, res) => {
    const activityID = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)
  
    pool.query(
        'DELETE FROM activities WHERE acivityID = $1 and courseID = $2', 
        [activityID, courseID], 
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`Activity deleted with ID: ${activityID}, ${courseID}`)
        }
    )
}

//ACTIVITYDAY

const getTodayActivities = (req, res) => {
    let ts = Date.now()
    let date_ob = new Date(ts)
    let date = date_ob.getDate()
    let month = date_ob.getMonth() + 1
    let year = date_ob.getFullYear()

    const today = year + "-" + month + "-" + date

    pool.query(
        'SELECT * FROM activitydays WHERE date = $1 ORDER BY timeini ASC',
        [today],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}

const getAllActivityDaysOfTheCourse = (req, res) => {
    const activityID = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)

    pool.query(
        'SELECT * FROM activitydays WHERE activityID = $1 and courseID = $2',
        [activityID, courseID],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}

const getActivityDay = (req, res) => {
    const activityID = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)
    const day = req.params.day
    const timeini = req.params.timeini

    pool.query(
        'SELECT * FROM activitydays WHERE activityID = $1 and courseID = $2 and day = $3 and timeini = $4',
        [activityID, courseID, day, timeini],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}

const open_closeActivityDay = (req, res) => {
    const activityID = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)
    const day = req.params.day
    const timeini = req.params.timeini

    const {closed} = req.body

    pool.query(
        'UPDATE activitydays SET closed = $1 WHERE acivityID = $2 and courseID = $3 and day = $4 and timeini = $5',
        [closed, activityID, courseID, day, timeini],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`activitiday ${activityID},${courseID},${day},${timeini} have been modified to closed: ${closed}`)
        }
    )
}

const anulateActivityday = (req, res) => {
    const activityID = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)

    const { day, timeini } = req.body

    pool.query(
        'DELETE FROM activitydays WHERE acivityID = $1 and courseID = $2 and day = $3 and timeini = $4', 
        [activityID, courseID, day, timeini], 
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`Activityday deleted with ID: ${activityID}, ${courseID}, ${day}, ${timeini}`)
        }
    )
}

//ATTENDEES

const getActivityDayAttendees = (req, res) => {
    const activityID = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)
    const day = req.params.day
    const timeini = req.params.timeini

    pool.query(
        'SELECT a.personID, p.name, p.surname, p.emailAddress, a.ttended, a.late  FROM attendees a natural inner join people p WHERE a.acivityID = $1 and a.courseID = $2 and a.day = $3 and a.timeini = $4',
        [activityID, courseID, day, timeini], 
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`Activityday deleted with ID: ${activityID}, ${courseID}, ${day}, ${timeini}`)
        }
    )
}

const updateAttendees = (req, res) => {
    const activityID = parseInt(req.params.activityID)
    const courseID = parseInt(req.params.courseID)
    const day = req.params.day
    const timeini = req.params.timeini

    const { attened, late, timelate, persons } = req.body

    const queryPersons = ''
    for (i = 0; i < persons.length; ++i){
        queryPersons.concat([',', persons[i]])
    }


    pool.query( 
        'UPDATE attendees SET attended = $1, late = $2, timelate = $3 WHERE acivityID = $4 and courseID = $5 and day = $6 and timeini = $7 and personID IN ($8)',
        [attened, late, timelate, activityID, courseID, day, timeini, queryPersons], 
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).send(`Attendees updated: ${res.length}`)
        }
    )
}

//INSCRIPTIONS

const getPersonInscriptions = (req, res) => {
    const id = parseInt(request.params.personID)

    pool.query(
        'SELECT * FROM inscriptions WHERE personID = $1',
        [id],
        (error, results) => {
            if (error) {
                throw error
            }
            
            res.status(200).json(results.rows)
        }
    )
}
