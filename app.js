//Load require modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require("mongoose");
const { Schema } = mongoose;
//Global variables used
const homeStartingContent = "Este es un sitio web con fines de aprendizaje, por lo que algunas funcionalidades son limitadas y enfocadas en la aplicación de conocimiento de temas determinados.";
const aboutContent = "Este sitio ha sido desarrollado mediante Node.JS, con el uso de diferentes librerías como express y mongoose para el manejo de los datos por medio de Mongo DB.";
const contactContent = "No dejo un contacto directo debido al entorno de aprendizaje en el que se enmarca este sitio web pero en caso de alguna duda, no dudes en publicarla por medio del blog haciendo uso de la ruta 'compose'.";
let postsArray = [];
//Necessary declarations for use app
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
require("dotenv").config();
const port = process.env.PORT || 3000;
//Configurations for data base
//Conecction
//Local
/*mongoose.connect("mongodb://localhost:27017/blogsiteDB", { useNewUrlParser: true })
  .then(() => console.log("Conexión exitosa"))
  .catch((err) => {
    console.log("El error es: " + err);
  });*/
//Web
mongoose.connect("mongodb+srv://"+process.env.MONGO_USERNAME+":"+process.env.MONGO_PASSWORD+"@blogcluster.0goyfnz.mongodb.net/"+process.env.MONGO_DBNAME, { useNewUrlParser: true })
  .then(() => console.log("Conexión exitosa"))
  .catch((err) => {
    console.log("El error es: " + err);
  });
//Schema and models
const postSchema = new Schema({
  title: String,
  text: String
});
const Post = mongoose.model("Post", postSchema);
//Respond to GET in the root's server
app.get("/", async function (req, res) {
  let postsfound = await Post.find({});
  res.render("home", {
    homeStartingContent: homeStartingContent,
    postsArray: postsfound
  });
})
//Respond to GET anything in the root's server
app.get("/posts/:anything", async function (req, res) {
  //Sin DB
  let postSearched = _.capitalize(req.params.anything);
  /*postsArray.forEach(function (post) {
    let tittlePost = _.capitalize(post.tittlePost);
    if (tittlePost.includes(postSearched)) {
      res.render("post", {
        postTittle: post.tittlePost,
        postContent: post.bodyPost
      });
    }
  });*/
  //Con DB
  let postsfound = await Post.find({ title: postSearched }).exec();
  if (postsfound.length != 0) {
    if (postsfound[0].title == postSearched) {
      res.render("post", {
        postTittle: postsfound[0].title,
        postContent: postsfound[0].text
      });
    }
  } else {
    res.send("El post no existe");
  }
})
//Respond to GET in the about root
app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
})
//Respond to GET in the contact root
app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
})
//Respond to GET in the compose root
app.get("/compose", function (req, res) {
  res.render("compose");
})
//Respond to POST in the compose root
app.post("/compose", async function (req, res) {
  //Sin DB
  let post = {
    tittlePost: _.capitalize(req.body.newInputTittle),
    bodyPost: _.capitalize(req.body.newInputText)
  };
  //postsArray.push(post);
  //Con DB
  let foundPost = await Post.find({ title: post.tittlePost });
  if (foundPost.length === 0) {
    console.log("No existe el post y toca guardarlo");
    const newPost = new Post({
      title: post.tittlePost,
      text: post.bodyPost
    });
    await newPost.save();
    res.redirect("/");
  } else {
    res.send("El título de este post ya existe, añade uno diferente");
  }
})
//Initialize the port
app.listen(port, function () {
  console.log("Server started on port 3000");
});
