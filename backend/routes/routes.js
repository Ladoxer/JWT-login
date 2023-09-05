const {Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = Router();

router.post('/register', async (req,res) => {
  try {
    const {name,email,password} = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const record = await User.findOne({email:email});

    if(record){
      return res.status(400).send({
        message:"Email is already registered"
      });
    }else{
      const user = new User({
        name,
        email,
        password:hashedPassword
      })
      const result = await user.save();

      // JWT
      const {_id} = await result.toJSON();
      const token = jwt.sign({_id:_id},"secret");

      res.cookie("jwt",token,{
        httpOnly:true,
        maxAge:24*60*60*1000  // ms
      })
  
      res.send({
        message:"sucess"
      })

    }

  } catch (error) {
    console.log(error);
  }
})

router.post('/login', async (req,res) => {
  const {email,password} = req.body;
  const user = await User.findOne({email:email});
  if(!user){
    return res.status(404).send({
      message: "User not Found"
    })
  }

  if(!(await bcrypt.compare(password,user.password))){
    return res.status(400).send({
      message: "Password is Incorrect"
    });
  }

  const token = jwt.sign({_id:user._id},"secret");

  res.cookie("jwt",token,{
    httpOnly:true,
    maxAge:24*60*60*1000
  })

  res.send({
    message:"sucess"
  });
})

router.get('/user', async (req,res) => {
  try {
    const cookie = req.cookies['jwt'];
    const claims = jwt.verify(cookie,"secret")

    if(!claims){
      return res.status(401).send({
        message: "unauthenticated"
      })
    }

    const user = await User.findOne({_id:claims._id});
    const {password,...data} = await user.toJSON();
    res.send(data);

  } catch (error) {
    console.log(error);
    return res.status(401).send({
      message:'unautheticated'
    })
  }
});

router.post('/logout',(req,res)=>{
  res.cookie("jwt","",{maxAge:0});

  res.send({
    message:"sucess"
  })
})

module.exports = router;
