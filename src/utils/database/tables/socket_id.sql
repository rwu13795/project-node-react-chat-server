create table socket_id(
    user_id INTEGER, 
    socket_id VARCHAR(50),
    prev_socket_id VARCHAR(50),
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY(user_id)
);