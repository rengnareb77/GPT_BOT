CREATE Table users (
    idUser int(11) NOT NULL,
    token varchar(255) UNIQUE NOT NULL,
    PRIMARY KEY (idUser)
);
