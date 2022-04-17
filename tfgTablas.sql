CREATE TABLE people (
    PersonID serial PRIMARY KEY NOT NULL,
    FirstName varchar(255) NOT NULL,
    LastName varchar(255),
    Age int,
    Gender varchar(255),
    IsUser boolean,
    EmailAddress varchar(255),
    PhoneNumber varchar(255)
);

CREATE TABLE activities (
  ActivityID serial PRIMARY KEY NOT NULL,
  ActivityName varchar(255) NOT NULL,
  ActivityDescription text,
  ScheduleDay varchar(255),
  StartTime time,
  EndTime time
);

CREATE TABLE attendances(
    PersonID serial,
    ActivityID serial,
    DayOfAttendance date,
    Atendance boolean,
    EnterTime time,
    PRIMARY KEY (PersonID, ActivityID, DayOfAttendance),
    FOREIGN KEY (PersonID) REFERENCES people(PersonID),
    FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID)
);

CREATE TABLE groups(
    GroupName varchar(255),
    PersonID serial,
    PRIMARY KEY (GroupName, PersonID),
    FOREIGN KEY (PersonID) REFERENCES people(PersonID)
);

CREATE TABLE course(
    CouseName varchar(255),
    ActivityID serial,
    PRIMARY KEY (CouseName, ActivityID),
    FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID)
);

CREATE TABLE stadistics(
    StadisticName varchar(255),
    Stats text,
    PRIMARY KEY (StadisticName)
);

CREATE TABLE responsable(
    PersonID int,
    ActivityID int,
    PRIMARY KEY (PersonID, ActivityID),
    FOREIGN KEY (PersonID) REFERENCES people(PersonID),
    FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID)
);

CREATE TABLE tags(
	TagName varchar(255) PRIMARY KEY NOT NULL
);

CREATE TABLE activityTags(
	ActivityID serial,
	TagName varchar(255),
	PRIMARY KEY (ActivityID, TagName),
    FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID),
	FOREIGN KEY (TagName) REFERENCES tags(TagName)
);

