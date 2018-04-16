const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Blog Posts', function() {

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should list blog posts on GET', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.at.least(1);
                const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
                res.body.forEach(function(post) {
                    expect(post).to.be.an('object');
                    expect(post).to.include.keys(expectedKeys);
                });
            });
    });

    it('should add a post on POST', function() {
        const newPost = {title: "test-post", content: "This is the content for the test post", author: "Test Williams"};
        return chai.request(app)
            .post('/blog-posts')
            .send(newPost)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
                expect(res.body.id).to.not.equal(null);
                expect(res.body).to.deep.equal(Object.assign(newPost, {id: res.body.id, publishDate: res.body.publishDate}));
            });
    });

    it('should error if POST missing expected values', function() {
        const badRequestData = {};
        return chai.request(app)
            .post('/blog-posts')
            .send(badRequestData)
            .catch(function(res) {
                expect(res).to.have.status(400);
            });
    });

    it('should update a post on PUT', function() {
        const updatePost = {title: "updated post", content: "This is the updated content to this post", author: "Up Dater"};
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                updatePost.id = res.body[0].id;

                return chai.request(app)
                    .put(`/blog-posts/${updatePost.id}`)
                    .send(updatePost);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            });
    });

    it('should remove a post on DELETE', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/blog-posts/${res.body[0].id}`);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            });
    });
});