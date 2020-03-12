DROP DATABASE IF EXISTS `oweek`;
CREATE DATABASE `oweek`;
USE oweek;

CREATE TABLE `users` (
id integer NOT NULL AUTO_INCREMENT,
first_name varchar(20) NOT NULL,
last_name varchar(20) NOT NULL,
email varchar(65) NOT NULL,
password varchar(65) NOT NULL,
isAdmin smallint NOT NULL,
PRIMARY KEY(`id`)
);

CREATE TABLE `groupData` (
wufooEntryId integer NOT NULL,
groupNum integer NOT NULL DEFAULT 0,
PRIMARY KEY (`wufooEntryId`)
);

CREATE TABLE `groupMetaData` (
ID integer NOT NULL AUTO_INCREMENT,
manGroupNum integer NOT NULL DEFAULT 0,
womanGroupNum integer NOT NULL DEFAULT 0,
maxNumOfGroups integer NOT NULL DEFAULT 0,
PRIMARY KEY (`ID`)
);

CREATE TABLE `groups` (
groupNumber integer NOT NULL,
menCount integer NOT NULL DEFAULT 0,
womenCount integer NOT NULL DEFAULT 0,
totalCount integer NOT NULL DEFAULT 0,
PRIMARY KEY(`groupNumber`)
);

INSERT INTO `groupMetaData`(`manGroupNum`,`womanGroupNum`,`maxNumOfGroups`) VALUES(0,0,26);