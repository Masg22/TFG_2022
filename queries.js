const { request, response } = require('express');
const { query } = require('express');
const { json } = require('express/lib/response');
const schedule = require('node-schedule');

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

const triggerActivityStats = schedule.scheduleJob({hour: 9, minute: 54}, () => {
    console.log('ActivityStatsUpdated')
    pool.query(
        `SELECT * FROM (SELECT a."activityID" as "ID", COUNT(*) FILTER (WHERE att.attended AND NOT att.late) AS "attA", COUNT(*) FILTER (WHERE att.attended AND att.late) AS "attL", COUNT(*) FILTER (WHERE NOT att.attended AND NOT att.late) AS "attN" FROM public.activities a NATURAL INNER JOIN public.courses c NATURAL INNER JOIN activitydays ad NATURAL INNER JOIN attendees att WHERE ad.day < CURRENT_DATE GROUP BY a."activityID") att FULL OUTER JOIN (SELECT a."activityID" as "ID", COUNT(*) FILTER (WHERE p.gender='F') AS "genF", COUNT(*) FILTER (WHERE p.gender='M') AS "genM", SUM(CASE WHEN p.age < 18 THEN 1 ELSE 0 END) AS "Under_18", SUM(CASE WHEN p.age BETWEEN 18 AND 25 THEN 1 ELSE 0 END) AS "_18_25", SUM(CASE WHEN p.age BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS "_26_35", SUM(CASE WHEN p.age BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS "_36_45", SUM(CASE WHEN p.age > 45 THEN 1 ELSE 0 END) AS "Over_45", COUNT(*) AS "TotalParticipants" FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p GROUP BY a."activityID") ins ON (att."ID" = ins."ID")`,
        (error, results) => {
            if (error) {
                throw error
            }
            for (let row of results.rows) {
                var id = row["ID"]
                var activityStats = "A:"+(row["attA"] != null ? row["attA"] : '0')+",L:"+(row["attL"] != null ? row["attL"] : '0')+",N:"+(row["attN"] != null ? row["attN"] : '0')+";F:"+row["genF"]+",M:"+row["genM"]+";-18:"+row["Under_18"]+",18_25:"+row["_18_25"]+",26_35:"+row["_26_35"]+",36_45:"+row["_36_45"]+",+45:"+row["Over_45"]
                var participants = row["TotalParticipants"] 
                
                pool.query(
                    'UPDATE public.activities SET generalstats=$1, totalparticipants=$2 WHERE "activityID"=$3',
                    [activityStats, participants, id],
                    (error, results) => {
                        if(error){
                            throw error
                        }
                    }
                )
            }
        }
    )
})

const triggerCourseStats = schedule.scheduleJob({hour:9, minute:54}, () => {
    console.log('CourseStatsUpdated')
    pool.query(
        `SELECT * FROM (SELECT c."courseID" as "ID", COUNT(*) FILTER (WHERE att.attended AND NOT att.late) AS "attA", COUNT(*) FILTER (WHERE att.attended AND att.late) AS "attL", COUNT(*) FILTER (WHERE NOT att.attended AND NOT att.late) AS "attN" FROM public.courses c NATURAL INNER JOIN activitydays ad NATURAL INNER JOIN attendees att WHERE ad.day < CURRENT_DATE GROUP BY c."courseID") att FULL OUTER JOIN (SELECT c."courseID" as "ID", COUNT(*) FILTER (WHERE p.gender='F') AS "genF", COUNT(*) FILTER (WHERE p.gender='M') AS "genM", SUM(CASE WHEN p.age < 18 THEN 1 ELSE 0 END) AS "Under_18", SUM(CASE WHEN p.age BETWEEN 18 AND 25 THEN 1 ELSE 0 END) AS "_18_25", SUM(CASE WHEN p.age BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS "_26_35", SUM(CASE WHEN p.age BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS "_36_45", SUM(CASE WHEN p.age > 45 THEN 1 ELSE 0 END) AS "Over_45", COUNT(*) AS "TotalParticipants" FROM courses c NATURAL INNER JOIN inscriptions i NATURAL INNER JOIN people p GROUP BY c."courseID") ins ON (att."ID" = ins."ID")`,
        (error, results) => {
            if (error) {
                throw error
            }
            for (let row of results.rows) {
                var id = row["ID"]
                var courseStats = "A:"+(row["attA"] != null ? row["attA"] : '0')+",L:"+(row["attL"] != null ? row["attL"] : '0')+",N:"+(row["attN"] != null ? row["attN"] : '0')+";F:"+row["genF"]+",M:"+row["genM"]+";-18:"+row["Under_18"]+",18_25:"+row["_18_25"]+",26_35:"+row["_26_35"]+",36_45:"+row["_36_45"]+",+45:"+row["Over_45"]
                var participants = row["TotalParticipants"] 
                
                pool.query(
                    'UPDATE public.courses SET courseparticipants=$1, coursestats=$2 WHERE "courseID"=$3',
                    [participants, courseStats, id],
                    (error, results) => {
                        if(error){
                            throw error
                        }
                    }
                )
            }
        }
    )
})

const triggerClose = schedule.scheduleJob({hour:9, minute:54}, () => {
    console.log('ClosingTodayActivities')
    pool.query(
        'UPDATE public.activitydays SET closed = true WHERE day < CURRENT_DATE',
        (error, results) => {
            if (error) {
                throw error
            }
        }
    )
    pool.query(
        'UPDATE public.courses SET closedcourse=true WHERE dateend < CURRENT_DATE;',
        (error, results) => {
            if (error) {
                throw error
            }
        }
    )
})

const test = (request, response) => { 
    pool.query(
        'SELECT "courseID" FROM courses ORDER BY "courseID" desc limit 1;',
        (error, results) => {
            if (error) {
                throw error
            }
            response.send(results.rows[0]["courseID"] + " :)")
        }
    )
}

const login = (request, response) => {
    try {
        const {emailAddress, password} = request.body;
        if (!(emailAddress && password)){
            response.status(400).send("All input are required")
        }
        else {
            pool.query(
                'SELECT "personID", name, surnames, "emailAddress", phone, gender, age, active, "personID" AS token FROM people WHERE "emailAddress" = $1 AND password = $2',
                [emailAddress, password],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                    if (results.rows.length == 0) {
                        response.status(404).send("Email or password icorrect");
                      }
                    else if (results.rows[0].active == 'false') {
                        response.status(409).send("This User is unsubscrived want to subscrive again?")
                    }
                    else {
                        response.status(200).json(results.rows)
                    }
                }
            )
        }
    } catch (error) {
        console.log(err);
    }
    
}

const singup = async (request, response) => {
    try {
        const { name, surnames, emailAddress, password, age, gender, phone } = request.body;
        if (!(emailAddress && password && name && surnames && age && gender && phone)) {
          res.status(400).send("All input is required");
        }
        await pool.query(
          'SELECT * FROM people WHERE "emailAddress" = $1', 
          [emailAddress],
          (error, results) => {
            if(error){
              throw error
            }
            if (results == {}) {
              return res.status(409).send("User Already Exist. Please Login");
            }
          }
        )
        pool.query(
          'INSERT INTO public.people(name, surnames, age, gender, "emailAddress", "isAUser", password, phone, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [name, surnames, age, gender, emailAddress, true, password, phone, true],
          (error, results) => {
            if(error){
              throw error
            }
            response.status(201).send(`added`);
          }
        )    
    } catch (err) {
        console.log(err);
    }
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

    const { name, surnames, age, gender, emailAddress } = request.body

    pool.query(
        'UPDATE people SET name = $1, surnames = $2, age = $3, gender = $4, "emailAddress" = $5 WHERE "personID" = $6',
        [name, surnames, age, gender, emailAddress, id],
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

const getResonsiblesCoursesStats = (request, response) => {

    const responsible = parseInt(request.params.personID)

    pool.query(
        'SELECT att."activityID", att."courseID", COUNT(*) FILTER (WHERE att.attended AND NOT att.late) AS "attA", COUNT(*) FILTER (WHERE att.attended AND att.late) AS "attL", COUNT(*) FILTER (WHERE NOT att.attended AND NOT att.late) AS "attN" FROM attendees att NATURAL INNER JOIN courses c WHERE c.responsible = $1 AND att.day <= CURRENT_DATE GROUP BY att."activityID", att."courseID"',
        [responsible],
        (error, results) => {
            if(error){
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

//ACTIVITIES
const getAllActivities = (request, response) => {
   
    pool.query(
        `SELECT a.*, CASE WHEN EXISTS(SELECT * FROM courses c WHERE c."activityID" = a."activityID" AND c.closedcourse = false) THEN 'true' ELSE 'false' END AS hasopencourses FROM activities a`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
} 

const createActivity = (request, response) => {
    const { activityname, activitydescription, activitytype} = request.body

    pool.query(
        'INSERT INTO activities( activityname, activitydescription, generalstats, totalparticipants, activitytype) VALUES ($1, $2, null, null, $3)',
        [activityname, activitydescription, activitytype],
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
    const {activityname, activitydescription, generalstats, totalparticipants, activitytype} = request.body

    pool.query(
        'UPDATE activities SET activityname = $1, activitydescription = $2, generalstats = $3, totalparticipants = $4, activitytype = $6 WHERE "activityID" = $5',
        [activityname, activitydescription, generalstats, totalparticipants, id, activitytype],
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
        'SELECT a."activityID", a.activityname, c.* FROM courses c NATURAL INNER JOIN activities a',
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

const createActivityCourse = async (request, response) => {

    const activityID = parseInt(request.params.activityID)

    const { coursename, dateini, dateend, schedule, responsible} = request.body

    var courseID
    pool.query(
        'INSERT INTO courses("activityID", coursename, dateini, dateend, schedule, courseparticipants, coursestats, responsible) VALUES ($1, $2, $3, $4, $5, null, null, $6) RETURNING "courseID"',
        [activityID, coursename, dateini, dateend, schedule, responsible],
        (error, result) => {
            if (error) {
                throw error
            }

            console.log(`cID: ${result.rows[0].courseID}`)
            courseID = result.rows[0].courseID

            console.log(`INI:${dateini}`)
            console.log(`END:${dateend}`)

            const ini = new Date(dateini)
            const end = new Date(dateend)
        
            var sch = schedule.split(';')
            var finalSch = []
            sch.forEach(timetable => {
                var t = timetable.split(',')
                finalSch.push(t)
            });

            console.log(`${finalSch}`)
            console.log(`INI:${ini}`)
            console.log(`END:${end}`)
        
            for(it = ini; it <= end; it = it.addDays(1)){
                console.log(`testDay: ${it}`)
                for(i=0; i<finalSch.length; ++i){
                    // 0 sun; 1 mon; 2...
                    console.log(`its: ${it.getDay()} vs ${finalSch[i][0]}`)
                    if (it.getDay() == finalSch[i][0]){
                        pool.query(
                            'INSERT INTO activitydays("activityID","courseID", day, timeini, timeend) VALUES($1, $2, $3, $4, $5)',
                            [activityID, courseID, it, finalSch[i][1], finalSch[i][2]],
                            (error, results) => {
                                if (error) {
                                    throw error
                                }
                                console.log(`added`)
                            }
                        )
                    }
                }
            }
            response.status(201).send('Course added fine')
        }
    )

   
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
        'SELECT d.*, a.activityname, a.activitydescription, c.coursename,c.responsible, p.name FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN activitydays d INNER JOIN people p ON c.responsible = p."personID" WHERE d.day = CURRENT_DATE ORDER BY d.timeini ASC',
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
        'SELECT d.*, a.activityname, a.activitydescription, c.coursename, c.responsible, p.name FROM activities a NATURAL INNER JOIN courses c NATURAL INNER JOIN activitydays d INNER JOIN people p ON c.responsible = p."personID" WHERE a."activityID" = $1 and c."courseID"= $2 ORDER BY d.day, d.timeini, d.timeend',
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

const createActivityDay = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)

    const { day, timeini, timeend} = request.body

    pool.query(
        'INSERT INTO activitydays ("activityID", "courseID", day, timeini, timeend, closed) VALUES ($1, $2, $3, $4, $5, false)',
        [activityID, courseID, day, timeini, timeend],
        (error, results) => {
            if (error) {
                throw error
            }
            pool.query(
                'SELECT "personID" FROM inscriptions WHERE "activityID"=$1 AND "courseID"=$2',
                [activityID, courseID],
                (error, results2) => {
                    if (error) {
                        throw error
                    }
                    for(let row of results2.rows){
                        pool.query(
                            'INSERT INTO public.attendees("personID", "activityID", "courseID", day, timeini, attended, late, timelate) VALUES ($1, $2, $3, $4, $5, false, false, false)',
                            [row["personID"], activityID, courseID, day, timeini],
                            (error, results) => {
                                if (error) {
                                    throw error
                                }
                            }
                        )
                    }
                }
            )
            response.status(201).send(`Activityday added with ID: ${activityID}, ${courseID}, ${day}, ${timeini}`)
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

const getActivityDayAttendance = (request, response) => {
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)
    const day = request.params.day
    const timeini = request.params.timeini

    pool.query(
        'SELECT a."personID", p.name, p.surnames, p."emailAddress", a.attended, a.late, a.timelate FROM attendees a NATURAL INNER JOIN people p WHERE a."activityID" = $1 and a."courseID" = $2 and a.day = $3 and a.timeini = $4',
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
        'SELECT a."activityID", a.activityname, c.* FROM inscriptions i NATURAL INNER JOIN courses c NATURAL INNER JOIN activities a WHERE "personID" = $1',
        [id],
        (error, results) => {
            if (error) {
                throw error
            }
            
            response.status(200).json(results.rows)
        }
    )
}

const addPersonInscription = (request, response) => {
    const personID = parseInt(request.params.personID)

    const { activityID, courseID } = request.body

    pool.query(
        'INSERT INTO inscriptions("personID", "activityID", "courseID") VALUES($1, $2, $3)',
        [personID, activityID, courseID],
        (error, results) => {
            if (error) {
                throw error
            }
            pool.query(
                'SELECT day, timeini FROM activitydays WHERE "activityID" = $1 AND "courseID" = $2 AND day >= CURRENT_DATE',
                [activityID, courseID],
                (error, results2) => {
                    if (error) {
                        throw error
                    }
                    for(var row in results2.rows){
                        pool.query(
                            'INSERT INTO public.attendees("personID", "activityID", "courseID", day, timeini, attended, late, timelate) VALUES ($1, $2, $3, $4, $5, false, false, false)',
                            [personID, activityID, courseID, row["day"], row["timeini"]],
                            (error, results3) => {
                                if (error) {
                                    throw error
                                }
                            }
                        )
                    }
                }
            )
            response.status(201).send('added')
        }
    )
}

const deletePersonInsccription = (request, response) => {
    const PersonID = parseInt(request.params.personID)
    const activityID = parseInt(request.params.activityID)
    const courseID = parseInt(request.params.courseID)

    pool.query(
        'DELETE FROM inscriptions WHERE "personID"=$1 AND "activityID"=$2 AND "courseID"=$3',
        [PersonID, activityID, courseID],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send('deleted')
        }
    )
}

const gePersonAttendanceToCourses = (request, response) => {
    const personID = parseInt(request.params.personID)

    pool.query(
        'SELECT att."activityID", att."courseID", COUNT(*) FILTER (WHERE att.attended AND NOT att.late) AS "attA", COUNT(*) FILTER (WHERE att.attended AND att.late) AS "attL", COUNT(*) FILTER (WHERE NOT att.attended AND NOT att.late) AS "attN" FROM attendees att WHERE att."personID" = $1 AND att.day <= CURRENT_DATE GROUP BY att."activityID", att."courseID"',
        [personID],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

//STATS
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
    getActivityDayAttendance,
    createActivityDay,
    getPersonInscriptions,
    addPersonInscription,
    deletePersonInsccription,
    gePersonAttendanceToCourses,
    getResonsiblesCoursesStats,
    login,
    singup, 
    test
}