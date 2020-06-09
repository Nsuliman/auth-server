'use strict';

const bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const SECRET = process.env.SECRET;

const users = mongoose.Schema({
  username: { type : String , unique : true, required : true ,index: true},
  password:{type:String,require:true},
});



users.pre('save',async function(){
  this.password = await bcrypt.hash(this.password,5);
});

users.statics.authenticateBasic = async function(username,password){
  console.log(this);
  let theUser = await this.find({username:username});
  let valid = await bcrypt.compare(password,theUser[0].password);
  return valid ? theUser : Promise.reject();
};

users.statics.generateToken = function(user){
  let token = jwt.sign({username: user.username},SECRET);
  return token;
};

users.statics.verifyToken = function (token){
  return jwt.verify(token,SECRET, async function(err,decoded){
    if(err){
      console.log('This is not a valid token: ' + err);
      return Promise.reject(err);
    }

    console.log('the decoded value is: ');
    console.log(decoded);
    let username = decoded.username;
    console.log('before')
    let theUser = await mongoose.model('users',users).find({username:username});
    console.log('after')
    console.log(theUser)


    if(theUser[0]){
      return Promise.resolve(decoded);
    }
    return Promise.reject();
  });
};

module.exports = mongoose.model('users',users);