import express from 'express';
import http from 'http'
import bodyParser from 'body-parser'
//import{router} from "./neo4j"
import {router} from "./neo4j/neode.mjs"

//const http = require('http');
//const express = require("express"); //initializes the framework
const app = express();// express module bindid to the variab "app0"
//var router = require('./neo4j/');
//app.use(express.static('public'));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

const port = 3000;
app.use(router);

app.listen(port,()=>{
    console.log("server has started on port 3000");
});
