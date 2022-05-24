create database movistartest;

-- Especificar el uso de SQL:  \sql
-- Conectarse a la base de datos:  \connect root@localhost
-- show databases; Muestra las bases de datos creadas
-- use movistartest; Para conectarse a la base de datos movistartest
-- show columns from `table_name`; Para mostrar los parametros de cada tabla
DROP TABLE IF EXISTS request;

DROP TABLE IF EXISTS message;

DROP TABLE IF EXISTS reverse;

CREATE TABLE request(
    id INT AUTO_INCREMENT NOT NULL,
    date_request date NOT NULL,
    time_request time NOT NULL,
    ip INT NOT NULL,
    account_id INT NOT NULL,
    pos_id INT NOT NULL,
    pos_name VARCHAR(22) NOT NULL,
    pos_state VARCHAR(3) NOT NULL,
    postimezona INT(3) NOT NULL,
    posdate DATE NOT NULL,
    postime TIME NOT NULL,
    dnb VARCHAR(10) NOT NULL,
    amount DOUBLE NOT NULL,
    productgroup VARCHAR(1),
    product_nr INT(6) NOT NULL,
    responsedate DATE NOT NULL,
    responsetime TIME NOT NULL,
    responsecode INT(6) NOT NULL,
    authorizationnr INT(6) NOT NULL,
    error INT(6) NOT NULL,
    action INT(3) NOT NULL,
    reverse_id INT(11),
    PRIMARY KEY (id)
) ENGINE = INNODB;

CREATE TABLE message(
    id INT(10) AUTO_INCREMENT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type INT(10) NOT NULL,
    messagedate DATE NOT NULL,
    messagetime TIME NOT NULL,
    tracenr INT(10) NOT NULL,
    message VARCHAR(512) NOT NULL,
    PRIMARY KEY(id)
) ENGINE = INNODB;

CREATE TABLE reverse(
    id INT(10) AUTO_INCREMENT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    request_id INT(10) NOT NULL,
    isomessage0420_id INT(10) NOT NULL,
    isomessage0430_id INT(10) NOT NULL,
    responsecode INT(6) NOT NULL,
    referencenr INT(11) NOT NULL,
    retries INT(11) NOT NULL,
    PRIMARY KEY (id),
    INDEX(request_id),
    FOREIGN KEY (request_id) REFERENCES request(id)
) ENGINE = INNODB;