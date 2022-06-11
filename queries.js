const { query } = require('express');
const { json } = require('express/lib/response');

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
const getAllPeople = (request, response) => {
    pool.query(
        'SELECT * FROM people WHERE active = true ORDER BY name ASC',
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
        'INSERT INTO people( name, surnames, age, gender, "emailAddress", "isAUser", password, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
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
        'SELECT * FROM people WHERE "personID" = $1 AND active = true',
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

const unsubscribe_subscribe = (request, response) => {
    const id = parseInt(request.params.personID)

    const { active } = request.body

    pool.query(
        'UPDATE people SET active = $1 WHERE "personID" = $2',
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
        'SELECT a."activityID", c."courseID", a.activityname, a.activitydescription, c.coursename,c.coursestats, c.courseparticipants FROM courses c NATURAL INNER JOIN activities a WHERE responsible = $1 ORDER BY activityname ASC',
        [id],
        (error, results) => {
            if (error) {
                res.status(500).json({ message: 'Error gettin Responsible courses', err: `${error}` })
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
                response.status(500).send(`jaja salu2`)
            }
            response.status(200).json(results.rows)
        }
    )
}

const updateActivity = (request, response) => {
    const id = parseInt(request.params.activityID)
    const {activityname, activitydescription, generalstats, totalparticipants} = request.body

    pool.query(
        'UPDATE activities SET activityname = $1, activitydescription = $2, generalstats = $3, totalparticipants = $4 WHERE "activityID" = $5',
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
        'DELETE FROM attendees WHERE "activityID" = $1', 
        [id], 
        (error, results) => {
            if (error) {
                throw error
            }
            pool.query(
                'DELETE FROM inscriptions WHERE "activityID" = $1',
                [id], 
                (error, results) => {
                    if (error) {
                        throw error
                    }
                    pool.query(
                        'DELETE FROM activitydays WHERE "activityID" = $1',
                        [id],
                        (error, results) => {
                            if (error) {
                                throw error
                            }
                            pool.query(
                                'DELETE FROM courses WHERE "activityID" = $1',
                                [id],
                                (error, results) => {
                                    if (error) {
                                        throw error
                                    }
                                    pool.query(
                                        'DELETE FROM activities WHERE "activityID" = $1',
                                        [id],
                                        (error, results) => {
                                            if (error) {
                                                throw error
                                            }
                                            response.status(200).send(`Activity deleted with ID: ${id}`)
                                        }
                                    )
                                }
                            )
                        }
                    )
                }
            )
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
        'SELECT * FROM courses WHERE "activityID" = $1 ORDER BY dateini, dateend DESC',
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
                    'INSERT INTO activitydays("activityID","courseID", day, timeini, timeend) VALUES($1, $2, $3, $4, $5)',
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
        'UPDATE courses SET coursename = $1, dateini = $2, dateend = $3, schedule = $4, courseparticipants = $5, coursestats = $6, responsible = $7 WHERE "activityID" = $8 and courseID = $9',
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
        'DELETE FROM attendees WHERE "activityID" = $1 and "courseID" = $2', 
        [activityID, courseID], 
        (error, results) => {
            if (error) {
                throw error
            }
            pool.query(
                'DELETE FROM inscriptions WHERE "activityID" = $1 and "courseID" = $2',
                [activityID, courseID], 
                (error, results) => {
                    if (error) {
                        throw error
                    }
                    pool.query(
                        'DELETE FROM activitydays WHERE "activityID" = $1 and "courseID" = $2',
                        [activityID, courseID],
                        (error, results) => {
                            if (error) {
                                throw error
                            }
                            pool.query(
                                'DELETE FROM courses WHERE "activityID" = $1 and "courseID" = $2',
                                [activityID, courseID],
                                (error, results) => {
                                    if (error) {
                                        throw error
                                    }
                                    response.status(200).send(`Activity deleted with ID: ${activityID}, ${courseID}`)
                                }    
                            )
                        }
                    )
                }
            )
        }
    )
    pool.query(
        'DELETE FROM activities WHERE "activityID" = $1 and "courseID" = $2', 
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
    pool.query(
        'SELECT d.*, a.activityname, a.activitydescription, c.coursename,c.responsible, p.name FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN activitydays d INNER JOIN people p ON c.responsible = p."personID" WHERE d.day = CURRENT_DATE;',
        (error, results) => {
            if (error) {
                response.status(500).send(`error`)
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
        'UPDATE activitydays SET closed = $1 WHERE "activityID" = $2 and "courseID" = $3 and day = $4 and timeini = $5',
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
        'DELETE FROM activitydays WHERE "activityID" = $1 and "courseID" = $2 and day = $3 and timeini = $4', 
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
        'SELECT a."personID", p.name, p.surnames, p."emailAddress", a.attended, a.late  FROM attendees a NATURAL INNER JOIN people p WHERE a."activityID" = $1 and a."courseID" = $2 and a.day = $3 and a.timeini = $4 and a.attended = false',
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

    const { attended, late, timelate, persons } = request.body

    console.log('attended: ' + attended)
    console.log('late: ' + late)
    console.log('timelate: ' + timelate)
    console.log('persons: ' + persons)

    var query = `UPDATE attendees SET attended = ${attended}, late = ${late}, timelate = '${timelate}' WHERE "activityID" = ${activityID}  and "courseID" = ${courseID} and day = '${day}' and timeini = '${timeini}' and "personID" IN (${persons})`

    console.log('query: ' + query)

    pool.query( 
        query, 
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Attendees updated`)
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

const generateStatsActivity = (request, response) => {
    
    const activityID = parseInt(request.params.activityID)

    pool.query(
        'SELECT att.attended, att.late, COUNT(*) AS PEOPLE FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN activitydays ad NATURAL INNER JOIN attendees att WHERE "activityID"=$1 AND ad.closed = true GROUP BY att.attended, att.late',
        [activityID],
        (error, results1) => {
            if (error) {
                throw error
            }
            pool.query(
                'SELECT p.gender, COUNT(*) AS PERSONS FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p WHERE "activityID"=$1 GROUP BY p.gender',
                [activityID],
                (error, results2) => {
                    if (error) {
                        throw error
                    }
                    pool.query(
                        'SELECT SUM(CASE WHEN p.age < 18 THEN 1 ELSE 0 END) AS Under_18, SUM(CASE WHEN p.age BETWEEN 18 AND 25 THEN 1 ELSE 0 END) AS _18_25, SUM(CASE WHEN p.age BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS _26_35, SUM(CASE WHEN p.age BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS _36_45, SUM(CASE WHEN p.age > 45 THEN 1 ELSE 0 END) AS Over_45 FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p WHERE "activityID"=$1',
                        [activityID],
                        (error, results3) => {
                            if (error) {
                                throw error
                            }
                            pool.query(
                                'SELECT COUNT(*) AS PERSONS FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p WHERE "activityID"=$1',
                                [activityID],
                                (error, results4) => {
                                    if (error) {
                                        throw error
                                    }
                                    pool.query(
                                        'SELECT a."activityID", a.activityname, c."courseID", c.coursename, SUM(CASE WHEN att.attended THEN 1 ELSE 0 END)*100/COUNT(*) AS PERCENTAGE FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN activitydays ad NATURAL INNER JOIN attendees att WHERE "activityID"=$1 GROUP BY a."activityID", c."courseID", c.coursename ORDER BY (SUM(CASE WHEN att.attended THEN 1 ELSE 0 END)/COUNT(*)) LIMIT 3',
                                        [activityID],
                                        (error, results5) => {
                                            if (error) {
                                                throw error
                                            }
                                            response.status(200).json({'attendees': results1.rows, 'gender': results2.rows, 'age': results3.rows, 'participants': results4.rows, 'top3': results5.rows})
                                        }
                                    )
                                }
                            )
                        }
                    )
                }
            )
        }
    )
}

const generateStatsCourse = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)

    pool.query(
        'SELECT att.attended, att.late, COUNT(*) AS PEOPLE FROM courses c NATURAL INNER JOIN activitydays ad NATURAL INNER JOIN attendees att WHERE "activityID"=$1 AND "courseID"=$2 AND ad.closed = true GROUP BY att.attended, att.late',
        [activityID,courseID],
        (error, results1) => {
            if (error) {
                throw error
            }
            pool.query(
                'SELECT p.gender, COUNT(*) AS PERSONS FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p WHERE "activityID"=$1 AND "courseID"=$2 GROUP BY p.gender',
                [activityID,courseID],
                (error, results2) => {
                    if (error) {
                        throw error
                    }
                    pool.query(
                        'SELECT SUM(CASE WHEN p.age < 18 THEN 1 ELSE 0 END) AS Under_18, SUM(CASE WHEN p.age BETWEEN 18 AND 25 THEN 1 ELSE 0 END) AS _18_25, SUM(CASE WHEN p.age BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS _26_35, SUM(CASE WHEN p.age BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS _36_45, SUM(CASE WHEN p.age > 45 THEN 1 ELSE 0 END) AS Over_45 FROM courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p WHERE "activityID"=$1 AND "courseID"=$2',
                        [activityID,courseID],
                        (error, results3) => {
                            if (error) {
                                throw error
                            }
                            pool.query(
                                'SELECT COUNT(*) AS PERSONS FROM courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p WHERE "activityID"=$1 AND "courseID"=$2',
                                [activityID,courseID],
                                (error, results4) => {
                                    if (error) {
                                        throw error
                                    }
                                    response.status(200).json({'attendees': results1.rows, 'gender': results2.rows, 'age': results3.rows, 'participants': results4.rows})
                                }
                            )
                        }
                    )
                }
            )
        }
    )
}

const generateStatsGeneral = (request, response) => {
    
    pool.query(
        'SELECT att.attended, att.late, COUNT(*) AS PEOPLE FROM attendees att NATURAL INNER JOIN activitydays ad WHERE (att.day BETWEEN CURRENT_DATE - 7 AND CURRENT_DATE) AND ad.closed = true GROUP BY att.attended, att.late',
        (error, results1) => {
            if (error) {
                throw error
            }
            pool.query(
                'SELECT p.gender, COUNT(*) AS PERSONS FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p GROUP BY p.gender',
                (error, results2) => {
                    if (error) {
                        throw error
                    }
                    pool.query(
                        'SELECT SUM(CASE WHEN p.age < 18 THEN 1 ELSE 0 END) AS Under_18, SUM(CASE WHEN p.age BETWEEN 18 AND 25 THEN 1 ELSE 0 END) AS _18_25, SUM(CASE WHEN p.age BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS _26_35, SUM(CASE WHEN p.age BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS _36_45, SUM(CASE WHEN p.age > 45 THEN 1 ELSE 0 END) AS Over_45 FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p',
                        (error, results3) => {
                            if (error) {
                                throw error
                            }
                            pool.query(
                                'SELECT COUNT(*) AS PERSONS FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p',
                                (error, results4) => {
                                    if (error) {
                                        throw error
                                    }
                                    pool.query(
                                        'SELECT "activityID", activityname, SUM(CASE WHEN att.attended THEN 1 ELSE 0 END)*100/COUNT(*) AS PERCENTAGE FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN activitydays ad NATURAL INNER JOIN attendees att GROUP BY "activityID" ORDER BY (SUM(CASE WHEN att.attended THEN 1 ELSE 0 END)/COUNT(*)) LIMIT 3',
                                        (error, results5) => {
                                            if (error) {
                                                throw error
                                            }
                                            response.status(200).json({'attendees': results1.rows, 'gender': results2.rows, 'age': results3.rows, 'participants': results4.rows, 'top3': results5.rows})
                                        }
                                    )
                                }
                            )
                        }
                    )
                }
            )
        }
    )
}


module.exports = {
    getAllPeople,
    createPerson,
    getPersonByID,
    updatePersonalData,
    unsubscribe_subscribe,
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
    generateStatsGeneral,
    generateStatsActivity,
    generateStatsCourse,
}