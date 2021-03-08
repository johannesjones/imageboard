// QUERIES 

const spicedPg = require('spiced-pg');

const db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/imageboard");


exports.getImages = () => {
    return db.query(`

        SELECT * FROM images
        ORDER BY id DESC
        LIMIT 12
    
    `);
};

exports.postImage = (url, username, title, description) => {
    return db.query(
        `
    
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4) RETURNING id, title, description, username, url

    `,
        [url, username, title, description]
    );
};

exports.getModal = (id) => {
    return db.query(`

        SELECT * FROM images
        WHERE id = $1

    `, [id]);
};

exports.getNextSet = (id) => {
    return db.query(`
    
        SELECT url, title, id, (
            SELECT id FROM images
            ORDER BY id ASC
            LIMIT 1
        ) AS "lowestId" FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 6
    
    `, [id]);
};

exports.getAllComments = (id) => {
    return db.query(`
    
        SELECT * FROM comments
        WHERE image_id = $1  
    
    `, [id]);
};

exports.addComment = (comment, username, id) => {
    return db.query(`
  
        INSERT INTO comments (comment, username, image_id)
        VALUES ($1, $2, $3) RETURNING comment, username, created_at
    
    `, [comment, username, id]);
};
