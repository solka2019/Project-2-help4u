-- This is how to get Node to access the mysql instance: https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server
-- This is how to get a view created to see data from multiple tables: https://stackoverflow.com/questions/46558900/using-create-view-with-multiple-tables

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;

DROP DATABASE IF EXISTS help4u;
CREATE DATABASE help4u;
USE help4u;

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
	person_need_id INTEGER,
	person_helper_id INTEGER,
	location_start varchar(500),
	location_end varchar(500),
	status_id INTEGER,
	date_created DATETIME,
	PRIMARY KEY (id),
	FOREIGN KEY(person_need_id) REFERENCES person(id),
	FOREIGN KEY(person_helper_id) REFERENCES person(id),
	FOREIGN KEY(status_id) REFERENCES status(id),
	FOREIGN KEY(task_type_id) REFERENCES task_type(id)
);

DROP VIEW IF EXISTS tasks_v_persons;
CREATE VIEW tasks_v_persons AS
	SELECT 
	    task.id AS task_id,
		task.task_type_id AS type_id,
		task_type.name as type_name,
		task.task_text AS task_text,
		task.status_id AS status_id,

		status.name AS status_name,
		task.person_need_id,

		p1.profile_name AS person_need_name,
		p1.profile_email AS person_need_email,
		p1.profile_location AS person_need_location,
		p1.positive_points AS person_need_positive,
		p1.negative_points AS person_need_negative,
		p1.first_date AS person_need_since_date,

		p2.profile_name AS person_help_name,
		p2.profile_email AS person_help_email,
		p2.profile_location AS person_help_location,
		p2.positive_points AS person_help_positive,
		p2.negative_points AS person_help_negative,
<<<<<<< HEAD
		p2.first_date AS person_help_since_date

=======
		p2.first_date AS person_help_since_date,
		task.date_created
>>>>>>> 3cd4d52d001521707f9ffd42716fa4321bf213a4
FROM task

INNER JOIN status ON (task.status_id=status.id)
INNER JOIN person AS p1 ON (task.person_need_id=p1.id)
INNER JOIN person as p2 ON (task.person_helper_id=p2.id)
INNER JOIN task_type ON (task.task_type_id=task_type.id);

INSERT INTO task_type (name) VALUES ("Need help");
INSERT INTO task_type (name) VALUES ("Can help");

INSERT INTO status (name) VALUES ("New");
INSERT INTO status (name) VALUES ("Waiting");
INSERT INTO status (name) VALUES ("Selected");
INSERT INTO status (name) VALUES ("Approved");
INSERT INTO status (name) VALUES ("In Progress");
INSERT INTO status (name) VALUES ("Completed");

INSERT INTO `help4u`.`person` 
(`profile_email`,
 `profile_name`,
  `profile_location`,
   `positive_points`,
    `negative_points`,
	 `first_date`) 
	 VALUES ('carlosk.usa@gmail.com', 'Carlos', 'Bothell, WA', '2', '0', '2020-01-15');

INSERT INTO `help4u`.`person` 
(`profile_email`,
 `profile_name`,
  `profile_location`,
   `positive_points`,
    `negative_points`,
	 `first_date`)
	  VALUES ('marfkar@gmail.com', 'Marissol', 'Kirkland, WA', '4', '0', '2020-03-20');

INSERT INTO `help4u`.`task` 
(`task_text`,
 `task_type_id`, 
 `person_need_id`, 
 `person_helper_id`, 
 `location_start`, 
 `location_end`, 
 `status_id`) VALUES ('Need help to get groceries', '1', '1', '2', 'Bothell, WA', 'Kirkland, WA', '1');
 
INSERT INTO `help4u`.`task` (`task_text`, `task_type_id`, `person_need_id`, `person_helper_id`, `location_start`, `location_end`, `status_id`) VALUES ('Need help taking the dog out', '1', '2', '1', 'Kirkland, WA', 'Kirkland, WA', '2');
INSERT INTO ``.`person` (`profile_email`, `profile_name`, `profile_location`, `positive_points`, `negative_points`, `first_date`) VALUES ('dude@gmail.com', 'Dude da Silva', 'Seattle, WA', '0', '50', '2020-01-01');
