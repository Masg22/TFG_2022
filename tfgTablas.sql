CREATE TABLE People (
    PersonID int PRIMARY KEY auto_increment NOT NULL,
    FirstName varchar(255) NOT NULL,
    LastName varchar(255),
    Age int,
    Gender varchar(255),
    IsUser boolean,
    EmailAddress varchar(255),
    PhoneNumber varchar(255)
);

CREATE TABLE Activities (
  ActivityID int PRIMARY KEY auto_increment NOT NULL,
  ActivityName varchar(255) NOT NULL,
  ScheduleDay varchar(255),
  StartTime time,
  EndTime time
);

CREATE TABLE Tags (
    TagName varchar(255) PRIMARY KEY NOT NULL,
);

CREATE TABLE Attendances(
    PersonID int,
    ActivityID int,
    DayOfAttendance date,
    Atendance boolean,
    EnterTime time,
    PRIMARY KEY (PersonID, ActivityID, DayOfAttendance),
    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID),
    FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID)
);

CREATE TABLE Groups(
    GroupName varchar(255),
    PersonID int,
    PRIMARY KEY (GroupName, PersonID),
    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID),
);

CREATE TABLE Course(
    CouseName varchar(255),
    ActivityID int,
    PRIMARY KEY (PersonID, ActivityID),
    FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID)
);

CREATE TABLE Stadistics(
    StadisticName varchar(255),
    Stats text,
    PRIMARY KEY (StadisticName)
);

CREATE TABLE Responsable(
    PersonID int,
    ActivityID int,
    PRIMARY KEY (PersonID, ActivityID),
    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID),
    FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID)
);

