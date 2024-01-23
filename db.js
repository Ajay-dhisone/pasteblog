const mongoose = require("mongoose")
//const blogpost = require("models\blogmodel.js")


async function getdb() {
    mongoose.connect("mongodb://localhost:27017/blogdb").then(()=>{
    console.log("1");
}).catch((err)=>{
    console.log("-1");
})    
}



module.exports={
    getdb
} 