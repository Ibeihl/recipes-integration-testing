const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Recipes", function() {
    before(function() {
        return runServer();
    });
    after(function() {
        return closeServer();
    });

    //here we are testing the GET (all) endpoint, we expect the initial basicsss.
    //1) a correct 200 status 2) the responce obj to be json
    //3) the response body to be an array because there are multiple recipes
    //4) the response body to include at least 2 objs (because we hardcoded 2 in)
    //5)we then test each obj in the array to make sure they all include
    //the correct keys, which we know are id, name, and ingredients.
    it('should list out all the recipes when GET request to /recipes', function() {
        return chai
        .request(app)
        .get('/recipes')
        .then(function(res){
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body.length).to.be.at.least(2);
            const expectedKeys = ['id', 'name', 'ingredients'];
            res.body.forEach((item) => {
                expect(item).to.be.a('object');
                expect(item).to.include.keys(expectedKeys);
            });
        })
    })
    //here we are going to test the POST endpoint, and will initially expect the basics
    //we will also start with a test NEWRECIPE to use to verify that everything is working
    //we expect the 201 status, a json object, and the res.body to be obj, cuz its returning new obj
    //we also expect the new obj to include the correct keys, and to have an id thats not null
    //we finally expect the res.body.id to === the newRecipe ID... still unclear on the Object.assign
    it('should correctly POST a new recipe if it has all the right fields to /recipes', function() {
        const newRecipe = { name: 'butt candy', ingredients: 'butt and candy' };
        return chai
        .request(app)
        .post('/recipes')
        .send(newRecipe)
        .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id', 'name', 'ingredients');
            expect(res.body.id).to.not.equal(null);
            expect(res.body).to.deep.equal(
                Object.assign(newRecipe, {id: res.body.id})
            )
        });
    });
    //next we are going to test our PUT endpoint, which is updating existing recipes
    //like the post endpoint, we are going to first create an updateRecipe const as a test dummy
    //we need the of the update, so we have to get an id first, then go to PUT endpoint
    //we then check for all the common things, like a status, json, is the res and obj etc?

    it('should correctly update a recipe at the PUT endpoint /recipes/id and return new recipe', function() {
        const updateRecipe = { "name" : "butthole candy", "ingredients": "buttholes and sugar"};
        return(
          chai
            .request(app)
            .get('/recipes')
            .then(function(res) {
                updateRecipe.id = res.body[0].id
                return chai
                .request(app)
                .put(`/recipes/${updateRecipe.id}`)
                .send(updateRecipe);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            })
        );
    });

    //finally we are testing our DELETE endpoint to make sure it works.....
    //similarly to PUT we first need to GET to get an ID of an item to delete, then we can
    //make a req to our DELETE endpoint and ensure we get the right res.status
    it('should delete the right item when going to DELETE endpoint at /recipes/id', function() {
        return(
            chai
            .request(app)
            .get('/recipes')
                .then(function(res) {
                    const deleteId = res.body[0].id
                    return chai
                    .request(app)
                    .delete(`/recipes/${deleteId}`)
                    .send(deleteId)
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                })
        )
    })
})