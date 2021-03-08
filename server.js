const express = require('express');
const app = express();
const { getImages, postImage, getModal, getNextSet, getAllComments, addComment } = require('./db');
const { uploader } = require('./uploads');
const s3 = require('./s3');
const s3Url = require("./config").s3Url;

app.use(express.static('public'));

app.use('/comment', express.json());

app.get('/images', (req, res) => {
    getImages()
        .then(({ rows }) => res.json(rows));
});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    // console.log('Inside /upload !!');
    const { title, description, username } = req.body;
    const { filename } = req.file;

    let url = `${s3Url}${filename}`;

    // // Add to DB
    postImage(url, username, title, description).then(({ rows }) => {
        res.json(rows[0]);
    });
    // Send back data to postContent
    // getImages().then(({ rows }) => res.json(rows[0]));

});

app.get('/modal/:id', (req, res) => {
    // console.log('Inside get Modal!!');
    getModal(req.params.id).then(({ rows }) => res.json(rows));
});

app.get('/more/:lastImage', (req, res) => {
    getNextSet(req.params.lastImage).then(({ rows }) => res.json(rows));
});

app.get('/comments/:imageid', (req, res) => {
    const id = parseInt(req.params.imageid);
    getAllComments(id).then(({ rows }) => res.json(rows));
});

app.post('/comment/', express.json(), (req, res) => {
    // console.log('req.body: ', req.body);
    let { comment, username, imageid } = req.body;

    if (comment !== '' && username !== '') {
        addComment(comment, username, imageid).then(({ rows }) => {
            const commentData = {
                comment: rows[0].comment,
                username: rows[0].username,
                created_at: rows[0].created_at,
            };
            res.json(commentData);
        });
    }
});

app.listen(8080, () => console.log('IB server listening'));