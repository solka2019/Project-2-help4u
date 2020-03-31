-- This is how to get Node to access the mysql instance: https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server
-- This is how to get a view created to see data from multiple tables: https://stackoverflow.com/questions/46558900/using-create-view-with-multiple-tables

-- Use the following two lines only in local mySql
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
-- flush privileges;

DROP DATABASE IF EXISTS wa8bxbm0ennqp83q;
CREATE DATABASE wa8bxbm0ennqp83q;
USE wa8bxbm0ennqp83q;

CREATE TABLE status
(
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(20),
	PRIMARY KEY (id)
);


CREATE TABLE task_type
(
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(20),
	PRIMARY KEY(id)
);


CREATE TABLE person
(
	id INT NOT NULL AUTO_INCREMENT,
	profile_email varchar(255) NOT NULL,
	profile_name varchar(255) NOT NULL,
	profile_location varchar(255),
	positive_points INTEGER,
	negative_points INTEGER,
	first_date DATETIME,
	PRIMARY KEY (id)
);

CREATE TABLE task
(
	id INT NOT NULL AUTO_INCREMENT,
	task_text varchar(255),
	task_type_id INTEGER,
	person_1_id INTEGER,
	person_2_id INTEGER,
	location_start varchar(500),
	location_end varchar(500),
	status_id INTEGER,
	date_created DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(person_1_id) REFERENCES person(id),
	FOREIGN KEY(person_2_id) REFERENCES person(id),
	FOREIGN KEY(status_id) REFERENCES status(id),
	FOREIGN KEY(task_type_id) REFERENCES task_type(id)
);
-- view - is used to combine the info from all the tables. 
DROP VIEW IF EXISTS tasks_v_persons;
CREATE VIEW tasks_v_persons AS
	SELECT 
	    task.id AS task_id,
		task.task_type_id AS type_id,
		task_type.name as type_name,
		task.task_text AS task_text,
		task.location_start as location_start,
		task.location_end as location_end,
		task.status_id AS status_id,
		status.name AS status_name,
		task.person_1_id,
		p1.profile_name AS person_need_name,
		p1.profile_email AS person_need_email,
		p1.profile_location AS person_need_location,
		p1.positive_points AS person_need_positive,
		p1.negative_points AS person_need_negative,
		p2.profile_name AS person_help_name,
		p2.profile_email AS person_help_email,
		p2.profile_location AS person_help_location,
		p2.positive_points AS person_help_positive,
		p2.negative_points AS person_help_negative,
		task.date_created
FROM task
LEFT JOIN status ON (task.status_id=status.id)
LEFT JOIN person AS p1 ON (task.person_1_id=p1.id)
LEFT JOIN person as p2 ON (task.person_2_id=p2.id)
LEFT JOIN task_type ON (task.task_type_id=task_type.id);

-- https://stackoverflow.com/questions/27619026/error-code-1248-every-derived-table-must-have-its-own-alias-no-solution-found/27619065
DROP PROCEDURE IF EXISTS GetTasksByEmail;
DELIMITER //
 
CREATE PROCEDURE getTasksByEmail(
    IN email VARCHAR(255)
)
BEGIN
    SELECT * FROM 
    (
	SELECT * FROM tasks_v_persons
		WHERE person_need_email = email AND status_id <> 6 AND status_id <> 7
    UNION DISTINCT
    SELECT * FROM tasks_v_persons
		WHERE person_help_email = email AND (status_id=4 OR status_id=5)
	UNION DISTINCT
    SELECT task_id, type_id, type_name, task_text, null, null, status_id, status_name, person_1_id, person_need_name, person_need_email, person_need_location, person_need_positive, person_need_negative, person_help_name, person_help_email, person_help_location, person_help_positive, person_help_negative, date_created FROM tasks_v_persons
        WHERE person_help_email = email AND status_id < 4
    ) as RESULT ORDER BY date_created DESC;
    
END //
 
DELIMITER ;

INSERT INTO task_type (name) VALUES ("Need help");
INSERT INTO task_type (name) VALUES ("Can help");
INSERT INTO status (name) VALUES ("New");
INSERT INTO status (name) VALUES ("Waiting");
INSERT INTO status (name) VALUES ("Selected");
INSERT INTO status (name) VALUES ("Approved");
INSERT INTO status (name) VALUES ("In Progress");
INSERT INTO status (name) VALUES ("Completed");
INSERT INTO status (name) VALUES ("Abandoned");
INSERT INTO `wa8bxbm0ennqp83q`.`person` (`profile_email`, `profile_name`, `profile_location`, `positive_points`, `negative_points`, `first_date`) VALUES ('carlosk.usa@gmail.com', 'Carlos', 'Bothell, WA', '2', '0', '2020-01-15');
INSERT INTO `wa8bxbm0ennqp83q`.`person` (`profile_email`, `profile_name`, `profile_location`, `positive_points`, `negative_points`, `first_date`) VALUES ('marfkar@gmail.com', 'Marissol', 'Kirkland, WA', '4', '0', '2020-03-20');
INSERT INTO `wa8bxbm0ennqp83q`.`task` (`task_text`, `task_type_id`, `person_1_id`, `person_2_id`, `location_start`, `location_end`, `status_id`) VALUES ('Need help to get groceries', '1', '1', '2', 'Bothell, WA', 'Kirkland, WA', '1');
INSERT INTO `wa8bxbm0ennqp83q`.`task` (`task_text`, `task_type_id`, `person_1_id`, `person_2_id`, `location_start`, `location_end`, `status_id`) VALUES ('Need help taking the dog out', '1', '2', '1', 'Kirkland, WA', 'Kirkland, WA', '2');
INSERT INTO `wa8bxbm0ennqp83q`.`person` (`profile_email`, `profile_name`, `profile_location`, `positive_points`, `negative_points`, `first_date`) VALUES ('dude@gmail.com', 'Dude da Silva', 'Seattle, WA', '0', '50', '2020-01-01');
