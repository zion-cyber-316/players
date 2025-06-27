// if(process.env.NODE_ENV != "production"){
// require('dotenv').config()
// }



require('dotenv').config();


const express = require("express");
const app = express();
const port = 3000;
const Path = require("path")
const mongoose = require("mongoose");
const Players = require("./models/players")
const ejsMate = require("ejs-mate")

const methodOverride = require("method-override");
const { platform } = require("process");

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer  = require('multer')
const {storage} = require("./cloudConfig.js")
const upload = multer({ storage })
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")
const cookieParser = require('cookie-parser')
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const { deserialize } = require('v8');

// let mongoose_url = "mongodb://127.0.0.1:27017/players-stats";

const dburl ="mongodb+srv://gaurav9759434559:aZeYhFn36J3S4e4G@cluster0.ohqzicg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
main().then(()=>{
    console.log("connecting to DB")
}).catch(()=>{
    console.log("error")
})
async function  main(){
     await mongoose.connect(dburl);
    // await mongoose.connect(mongoose_url);
}


app.set("view engine","ejs");
app.set("views",Path.join(__dirname,"views"));

app.engine('ejs', ejsMate);
app.use(express.json());
app.use(cookieParser("secretcode"))
app.use(express.static(Path.join(__dirname,"/public")))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.use((req,res,next)=>{
    res.locals.currUser =req.user;
    next();
})
app.listen(port,()=>{
    console.log("app is listing on port 3000")
})



 const store = MongoStore.create({
    mongoUrl :dburl,
    crypto:{
         secret :"supersecretcode",

    },
    touchAfter: 24 * 3600,
 });

 const sessionOption = {
    store,
    secret :"supersecretcode",
    resave : false,
     saveUninitialized: true,
    cookie :{
        expires : Date.now() + 7 * 24 * 60 * 60 * 10000,
        maxAge : 7 * 24 * 60 * 60 * 10000,
        httpOnly : true,
    },

 }

 app.use(session(sessionOption));
 app.use(flash());
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));


 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());
/// players 



app.get("/",async (req,res)=>{
     
res.cookie("greate","namste",{signed:true});

let playerData = await Players.find();

    res.render("./players/index.ejs",{playerData, msg : req.flash("success")});

   
})

app.get("/new",(req,res)=>{
   

    if(!req.isAuthenticated()){
        
      req.flash("success","you must be login to Add  new player");
      res.redirect("/login")
  
    }else{
        res.render("./players/new.ejs")
    }
    
})


app.post("/test",upload.single("player[image]"), async (req,res)=>{

    let url = req.file.path;
    let filename = req.file.filename;

 
const newPlyer =  new Players(req.body.player);
    newPlyer.image ={url,filename};
  await newPlyer.save();
  req.flash("success","Add new Player");
res.redirect("/")

})


app.get("/:id",async (req,res)=>{

    const gaurav = req.user;
    console.log(gaurav);
    let {id} = req.params;

    const Data = await Players.findById(id);
    // console.log(Data)
res.render("./players/show.ejs",{Data,gaurav})
  
})

//edit route 

app.get("/:id/edit", async(req,res)=>{
      let {id} = req.params;
      const Data = await Players.findById(id);
      console.log(Data)
  res.render("./players/edit.ejs",{Data})
})


// update route 

app.put("/:id",upload.single("player[image]"), async(req,res)=>{
      let {id} = req.params;
let updplayer = await Players.findByIdAndUpdate(id,{...req.body.player});

if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    updplayer.image ={url,filename};
  await updplayer.save();
}
res.redirect("/")

})

//delete route

app.delete("/:id",async(req,res)=>{
     let {id} = req.params;
     await Players.findByIdAndDelete(id);
       req.flash("success"," Player Delete");
     res.redirect("/")


})






//// users 


app.get("/singup",(req,res)=>{
    res.render("./players/singup.ejs")
   
})
app.get("/login",(req,res)=>{
    res.render("./players/login.ejs")
   
})


app.post("/singup" , async(req,res)=>{
    const {username,email,password} = req.body;

    const newUser = new User({username,email});
    const registerUser = await User.register(newUser,password);
//     req.login(registerUser,()=>{
//          req.flash("success"," User register");
//  res.redirect("/players")
//     })
 req.flash("success"," User register");
 res.redirect("/")
})


app.post("/login",passport.authenticate("local",{
    failureRedirect:"/login",
    successFlash:true,
}) , async(req,res)=>{
     req.flash("success"," User login succesfully");
     res.redirect("/")
    
})


app.get("/logout",(req,res)=>{
  if(req.isAuthenticated()){
      req.logout(()=>{
  req.flash("success"," User logout succesfully");
    res.redirect("/")
    

    })
  }else{
      req.flash("success"," User must be login");
     res.redirect("/")
  }
})













app.get("/test",async(req,res)=>{
    let newPlyer = new Players({
        playerName : "virat kohli",
         Matches : 586,
        runs : 19875,
        image : "data:image/jpeg;base64,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"
    });

await newPlyer.save();
console.log("data was save");
res.send("succesful")
})