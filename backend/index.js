const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/routes');

const app = express();

app.use(cors({
  credentials:true,
  origin:['http://localhost:4200']
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api",routes);

mongoose.connect('mongodb://127.0.0.1:27017/jwtproject',{
  useNewUrlParser:true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("connected to database..");

  app.listen(5000, ()=>{
    console.log("App is listenning on port 5000")
  })
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});