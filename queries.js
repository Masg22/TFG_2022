const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false
  }
})

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

//PEOPLE
const getAllPeople = async(request, response) => {
    await pool.connect()
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

const createPerson = (request, response) => {
    const { name, surnames, age, gender, emailAddress, isAUser, password, phone } = request.body

    pool.query(
        'INSERT INTO people( name, surnames, age, gender, emailAddress, isAUser, password, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [name, surnames, age, gender, emailAddress, isAUser, password, phone],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`Person added with PersonID: ${results.personID}`)
        }
    )
}

const getPersonByID = (request, response) => {
    const id = parseInt(request.params.personID)

    pool.query(
        'SELECT * FROM people WHERE "personID" = $1',
        [id],
        (error, results) => {
            if (error) {
                throw error
            }
            
            response.status(200).json(results.rows)
        }
    )
}

const updatePersonalData = (request, response) => {
    const id = parseInt(request.params.personID)

    const { name, surname, age, gender, email } = request.body

    pool.query(
        'UPDATE people SET name = $1, surname = $2, age = $3, gender = $4, emailAddress = $5 WHERE personID = $6',
        [name, surname, age, gender, email, id],
        (error, results) => {
            if (error) {
                throw error
            }
            
            response.status(200).send(`Personal data of personID ${id} has been modified`)
        }
    )
}

const unsubscribe = (request, response) => {
    const id = parseInt(request.params.personID)

    const { active } = request.body

    pool.query(
        'UPDATE people SET active = $1 WHERE personID = $2',
        [active, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`personID ${id} has been changed his active field`)
        }
    )
}

//RESPONSIBLE

const getAllResponsibles = (request, response) => {
    pool.query(
        'SELECT * FROM people WHERE isAUser = True ORDER BY name ASC',
        [],
        (error, results) => {
            if (error) {
                throw error
              }
              response.status(200).json(results.rows)
        }
    )
}

const getResonsiblesCourses = (request, response) => {

    const id = parseInt(request.params.personID)

    pool.query(
        'SELECT a."activityID", c."courseID", a.activityname, a.activitydescription,c.coursename, c.coursestats, c.courseparticipants FROM courses c NATURAL INNER JOIN activities a WHERE responsible = $1 ORDER BY activityname ASC',
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
const getAllActivities = (request, response) => {
   
    pool.query(
        'SELECT * FROM activities',
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
} 

const createActivity = (request, response) => {
    const { activityname, activitydescription } = request.body

    pool.query(
        'INSERT INTO activities( activityname, activitydescription, generalstats, totalparticipants) VALUES ($1, $2, null, null)',
        [activityname, activitydescription],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`Activity added with ActivityID: ${results.activityID}`)
        }
    )
}

const getActivityByID = (request, response) => { 
    const id = parseInt(request.params.activityID)

    pool.query(
        'SELECT * FROM activities WHERE "activityID" = $1',
        [id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const updateActivity = (request, response) => {
    const id = parseInt(request.params.activityID)
    const {activityname, activitydescription, generalstats, totalparticipants} = request.body

    pool.query(
        'UPDATE activities SET activityname = $1, activitydescription = $2, generalstats = $3, totalparticipants = $4 WHERE acivityID = $5',
        [activityname, activitydescription, generalstats, totalparticipants, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Activity modified with ID: ${id}`)
            }
    )
}

const deleteActivity = (request, response) => {
    const id = parseInt(request.params.activityID)
  
    pool.query(
        'DELETE FROM activities WHERE id = $1', 
        [id], 
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Activity deleted with ID: ${id}`)
        }
    )
}

//COURSES

const getAllCourses = (request, response) => {
   
    pool.query(
        'SELECT * FROM courses',
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getActivityCourses = (request, response) => {

    const activityID = parseInt(request.params.activityID)

    pool.query(
        'SELECT * FROM courses WHERE "activityID" = $1',
        [activityID],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const createActivityCourse = (request, response) => {

    const activityID = parseInt(request.params.activityID)

    const { coursename, dateini, dateend, schedule, responsible} = request.body

    const courseID = ""

    pool.query(
        'INSERT INTO courses(coursename, dateini, dateend, schedule, courseparticipants, coursestats, responsibel) VALUES ($1, $2, $3, $4, null, null, $5)',
        [activityname, activitydescription],
        (error, results) => {
            if (error) {
                throw error
            }
            courseID = results.courseID
            response.status(201).send(`Course added with ActivityID: ${activityID} and CourseID: ${courseID}`)
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

const getCourseByID = (request, response) => {
    const activityId = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)

    pool.query(
        'SELECT * FROM courses WHERE "activityID" = $1 and "courseID" = $2',
        [activityId, courseID],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const updateCourse = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)
    const {coursename, dateini, dateend, schedule, courseparticipants, coursestats, responsible} = request.body

    pool.query(
        'UPDATE courses SET coursename = $1, dateini = $2, dateend = $3, schedule = $4, courseparticipants = $5, coursestats = $6, responsible = $7 WHERE acivityID = $8 and courseID = $9',
        [coursename, dateini, dateend, schedule, courseparticipants, coursestats, responsible, activityID, courseID],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Course modified with ID: ${activityID}, ${courseID}`)
            }
    )
}

const deleteCourse = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)
  
    pool.query(
        'DELETE FROM activities WHERE acivityID = $1 and courseID = $2', 
        [activityID, courseID], 
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Activity deleted with ID: ${activityID}, ${courseID}`)
        }
    )
}

//ACTIVITYDAY

const getTodayActivities = (request, response) => {
    let date_ob = new Date(Date.now())
    let date = date_ob.getDate().toString()
    let month = (date_ob.getMonth() + 1).toString()
    let year = date_ob.getFullYear().toString()

    const today = year + "-" + month + "-" + date

    pool.query(
        'SELECT * FROM activitydays WHERE day = $1',
        [date_ob],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getAllActivityDaysOfTheCourse = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)

    pool.query(
        'SELECT * FROM activitydays WHERE "activityID" = $1 and "courseID" = $2',
        [activityID, courseID],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getActivityDay = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)
    const day = request.params.day
    const timeini = request.params.timeini

    pool.query(
        'SELECT * FROM activitydays WHERE "activityID" = $1 and "courseID" = $2 and day = $3 and timeini = $4',
        [activityID, courseID, day, timeini],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const open_closeActivityDay = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)
    const day = request.params.day
    const timeini = request.params.timeini

    const {closed} = request.body

    pool.query(
        'UPDATE activitydays SET closed = $1 WHERE acivityID = $2 and courseID = $3 and day = $4 and timeini = $5',
        [closed, activityID, courseID, day, timeini],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`activitiday ${activityID},${courseID},${day},${timeini} have been modified to closed: ${closed}`)
        }
    )
}

const anulateActivityday = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)

    const { day, timeini } = request.body

    pool.query(
        'DELETE FROM activitydays WHERE acivityID = $1 and courseID = $2 and day = $3 and timeini = $4', 
        [activityID, courseID, day, timeini], 
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Activityday deleted with ID: ${activityID}, ${courseID}, ${day}, ${timeini}`)
        }
    )
}

//ATTENDEES

const getActivityDayAttendees = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)
    const day = request.params.day
    const timeini = request.params.timeini

    pool.query(
        'SELECT a."personID", p.name, p.surnames, p."emailAddress", a.attended, a.late  FROM attendees a natural inner join people p WHERE a."activityID" = $1 and a."courseID" = $2 and a.day = $3 and a.timeini = $4',
        [activityID, courseID, day, timeini], 
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const updateAttendees = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)
    const day = request.params.day
    const timeini = request.params.timeini

    const { attened, late, timelate, persons } = request.body

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
            response.status(200).send(`Attendees updated: ${response.length}`)
        }
    )
}

//INSCRIPTIONS

const getPersonInscriptions = (request, response) => {
    const id = parseInt(request.params.personID)

    pool.query(
        'SELECT * FROM inscriptions WHERE personID = $1',
        [id],
        (error, results) => {
            if (error) {
                throw error
            }
            
            response.status(200).json(results.rows)
        }
    )
}


module.exports = {
    getAllPeople,
    createPerson,
    getPersonByID,
    updatePersonalData,
    unsubscribe,
    getAllResponsibles,
    getResonsiblesCourses,
    getAllActivities,
    createActivity,
    getActivityByID,
    updateActivity,
    deleteActivity,
    getAllCourses,
    getActivityCourses,
    createActivityCourse,
    getCourseByID,
    updateCourse,
    deleteCourse,
    getTodayActivities,
    getAllActivityDaysOfTheCourse,
    getActivityDay,
    open_closeActivityDay,
    anulateActivityday,
    getActivityDayAttendees,
    updateAttendees,
}