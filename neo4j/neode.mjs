import Neode from 'neode'
import express from 'express'
import bodyParser from 'body-parser'
import e from 'express'
import Integer from 'neo4j-driver/lib/integer.js'


//var { json } = require('body-parser')
//var neo4j = require('neo4j-driver')
//const { Console } = require('console')
export var router = express.Router()



var user = 'neo4j'
var password = '123456789'
var uri = 'bolt://localhost'
//var uri = 'bolt://neo4j:7687'
var instance = new Neode(uri, user, password);
//var instance = new Neode('http://neo4j:test@neo4j:7474');


var QueryToGetRooms = "MATCH(n) RETURN n"
var getX = 'MATCH (n:Room {num: $num}) RETURN n.x'
var getY = 'MATCH (n:Room {num: $num}) RETURN n.y'
var isSelected;
var currentRoom;
var destinationRoom;
var choosenPath = []




router.get('/rooms',(req, res) =>{
  instance.cypher(QueryToGetRooms)
    .then(results => {
      var roomList = []
      results.records.forEach(record => {
        roomList.push({
          roomName: record._fields[0].properties.name,
          numRoom: record._fields[0].properties.num
        });
      });
      res.status(200).json(roomList)
    }).catch(function (error) {
      console.log(error);
    })
})

router.post("/currentPosition", (req, res) => {

  var floorModel = []
  floorModel.push({
    numRoom: req.body.numRoom,
  });
  currentRoom = floorModel[0].numRoom
  console.log(currentRoom)

})



router.post("/destinationRoom", (req, res) => {

  var floorModel = []
  floorModel.push({
    numRoom: req.body.numRoom

  });
  destinationRoom = floorModel[0].numRoom
  console.log(destinationRoom)

})

router.get("/isSelected", (req, res) => {
  if (destinationRoom != null) {
    isSelected = "true";

  } else {
    isSelected = "false";
  }

  res.status(200).json(isSelected)


})


router.get("/pathCoordinates", (req, res) => {

  /**
   * Retrieving X and Y coordinates of first path into an array of integers
   */

  var firstPathDB = []
  var firstPathObject = {};
  var xCoordIntArrayF;
  var yCoordIntArrayF;
  var destinationRoomString = "" + destinationRoom
  var currentRoomString = "" + currentRoom

  var xQu = "MATCH path = (from:Room { num:$current })-[:LEAD*..500]->(to:Room { num: $destination}) RETURN[n in nodes(path)| n.x] AS dataXF, [n in nodes(path)|n.y] AS dataYF, [n in nodes(path)|n.num] as roomNum LIMIT 1"
  instance.cypher(xQu,{
    current:currentRoom,
    destination:destinationRoomString
  }).then(results => {
    //console.log(JSON.stringify(results))
    //console.log(results.records)
    results.records.forEach(record => {
      firstPathDB.push({
        xDBCoordinates: record._fields[0],
        yDBCoordinates: record._fields[1],
        roomNum: record._fields[2]
      })
    })
    //(JSON.stringify(firstPathDB[0].tojas))
    var xCoordStringArray = new Array()
    var yCoordStringArray = new Array()
    for (var i = 0; i < firstPathDB.length; i++) {
      xCoordStringArray.push(firstPathDB[i].xDBCoordinates);
      yCoordStringArray.push(firstPathDB[i].yDBCoordinates);
    }


    xCoordIntArrayF = xCoordStringArray[0].map(i => Number(i)); //transform string values into integer array
    yCoordIntArrayF = yCoordStringArray[0].map(i => Number(i));
    // console.log("X " + xCoordIntArrayF + " " + "Y " + yCoordIntArrayF);

    /**
     * Retrieving X and Y coordinates of an alternative path into an array of integers
     */

    var secondPathDB = []
    var xCoordStringArray = new Array()
    var yCoordStringArray = new Array()
    var yCoordIntArrayS;
    var xCoordIntArrayS;


    var yQu = "MATCH path = (from:Room { num:$current })-[:ALEAD*..500]->(to:Room { num: $destination}) RETURN[n in nodes(path)| n.x] AS dataXS, [n in nodes(path)|n.y] AS dataYS, [n in nodes(path)|n.num] as roomNum LIMIT 1"
    instance.cypher(yQu, {
      current: currentRoomString,
      destination: destinationRoomString
    }).then(results => {

      //console.log(results.records) 

      results.records.forEach(record => {
        secondPathDB.push({
          xDBCoordinates: record._fields[0],
          yDBCoordinates: record._fields[1],
          roomNum: record._fields[2]
        })
      })



      for (var i = 0; i < secondPathDB.length; i++) {
        xCoordStringArray.push(secondPathDB[i].xDBCoordinates);
        yCoordStringArray.push(secondPathDB[i].yDBCoordinates);

      }
      xCoordIntArrayS = xCoordStringArray[0].map(i => Number(i));
      yCoordIntArrayS = yCoordStringArray[0].map(i => Number(i));
      // console.log("X " + xCoordIntArrayS + " " + "Y " + yCoordIntArrayS)



      var costsOfBothPath = []
      var costQuery = "RETURN gds.alpha.similarity.euclideanDistance($xFirst, $yFirst) AS costFirstPath,gds.alpha.similarity.euclideanDistance($xSecond, $ySecond) AS costSecondPath"
      instance.cypher(costQuery, {
        xFirst: xCoordIntArrayF,
        yFirst: yCoordIntArrayF,
        xSecond: xCoordIntArrayS,
        ySecond: yCoordIntArrayS
      }).then(results => {
        results.records.forEach(record => {
          costsOfBothPath.push({
            costFirstPath: record._fields[0],
            costSecondPath: record._fields[1]
          })
        })
       // console.log("true")

        if (costsOfBothPath[0].costFirstPath < costsOfBothPath[0].costSecondPath) {
          res.status(200).json(firstPathDB)
          destinationRoom = null;

        } else if (costsOfBothPath[0].costFirstPath > costsOfBothPath[0].costSecondPath) {
          res.status(200).json(secondPathDB)
          destinationRoom=null;
        } else {
          res.status(200).json("error")
        }
        //console.log(results.records)


      }).catch(error => {
        console.log(error)
      })
    }).catch(error => {
      console.log("Y error " + error)
    })


  }).catch(function (error) {
    console.log("x error " + error);
  })

  destinationRoom = null
})

// router.get("/lifts", (req, res) => {


//   var liftsNode = [];
//   var lifts = "MATCH (n:Room) WHERE n.name ENDS WITH 'lift' RETURN n.name, n.x, n.y"
//   instance.cypher(lifts).then(results => {

//     results.records.forEach(record => {

//       liftsNode.push({
//         liftName: record._fields[0].properties.name,
//         liftX: record._fields[0].properties.x,
//         liftY: record._fields[0].properties.y
//       })

//     })

//   })


// })