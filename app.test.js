
const request = require('supertest');
//wconst app = require('./server');



/**
 * Test /rooms endpoint:
 * -checks if is json type
 * -checks if the status code is 200
 * -check if is a array of objects 
 * checks if the 2 properties are string
 * 
 * 
 * 
 * 
 * 
 * 
 * User Requirement: I can choose or enter a destination room
 * 
 * User Scenario:
 * 
 * GIVEN a user request for the list of room
 * WHEN the room nodes are retrieved from the database  
 * THEN then the list of rooms are sent to the user
 * 
 */

describe('GET /rooms, GIVEN users request for list of rooms',  function() {
    it('WHEN the room nodes are retrieved from database ', () => {
      return request("http://localhost:3000")
        .get('/rooms')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response)=>{
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        roomName: expect.any(String),
                        numRoom: expect.any(String)
                    }),
                ])
            );
        });
    });
  });

  /**
 *   User Requirement: I can choose or enter a current room
 * 
 *   User Scenario:
 * 
 *   GIVEN a list of the rooms 
 *   WHEN user choose or enter a current room 
 *  THEN the choosen room should be received by the server.
 * 
 */

  describe('POST /currentPosition, GIVEN list of room nodes', () => {
    it('WHEN the user choses a current room',() => {
      request("http://localhost:3000")
        .post('/currentPosition')
        .send({numRoom: '2100'})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            return done();
          });
    });
  });
/**
 * User Requirement: I can choose or enter a destination room
 * 
 * User Scenario:
 * 
 * GIVEN a list of the rooms 
 * WHEN user choose or enter a destination room 
 * THEN the choosen room should be received by the server.
 * 
 */

  describe('POST /destinationRoom, GIVEN list of room nodes', () => {
    it('WHEN the user choses a destination room', () => {
      request("http://localhost:3000")
        .post('/destinationRoom')
        .send({numRoom: '265b'})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            return done();
          });
    });
  });

  /**
   * Once the above two test cases are executed and curent and destination room are choosen, then
   * this test will be path. This test uses current and destination room to return x and y coordinates of the 
   * formed path.
   * 
   * 
   * Requirments: Once I entred my current room adn destination, the app shoul show a path.
   * 
   * GIVEN both destination and current room by the users 
   * WHEN the server retrives and calculate the path from the database 
   * THEN the correct X and Y coordinates and Rooms of tha path are published. 
   */

  describe('GET /pathCoordinates, GIVEN both destination and current room by the users', function() {
    it('WHEN the server retrives and calculate the path from the database', () => {
      return request("http://localhost:3000")
        .get('/pathCoordinates')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response)=>{
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        xDBCoordinates: expect.any(Array),
                        yDBCoordinates: expect.any(Array),
                        roomNum: expect.any(Array)
                    }),
                ])
            );
        });
    });
  });

  
  



  