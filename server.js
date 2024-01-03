import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors"
import router from "./routes/routes.js"
import shorter from "./routes/shorter.js"
import rateLimit from "express-rate-limit";
import sqlite from "sqlite3";
import path from "path"
configDotenv();
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 1000,
    message: "you have reached your limits.try again after some time !."
});
let dbPath = String(process.env.dbPath);
console.log(dbPath)
let db = new sqlite.Database(dbPath)





try {
    db.serialize(() => {

        //   db.run("drop table shortUrls")
        //   db.run("drop table capchas")
        //   db.run("drop table UrlTracker")
        //   db.run("drop table redirectUrls")



        // creating essintial dbs

        db.run(`create table shortUrls( 

            url_id varchar(40) 
                not null,
                    url char(30) primary key not null,
                    redirect_url char(30) not null,
                    ip varchar(10) not null,
                   
                    createdAt TIMESTAMP
                    not null,
                    updatedAt TIMESTAMP 
    
                    
                    
                    
                    );`, err => { if (err) console.log(err.message, 0) })

        db.run(`
        create table UrlTracker( 
            url_id varchar(40) primary key 
                not null,
                    url char(30) not null,
                    trackedData varchar(150) DEFAULT "",
                    createdUrl
                    char(40) not null,
                    ip text not null,
                    createdAt TIMESTAMP
                    not null,
                    updatedAt TIMESTAMP,
                    trackUrl char(40) not null

                    
                    
                    
                    );`, (err) => {
            if (err) {
                console.log(err.message, 1)

                return
            }





        })
        db.run(`
        create table redirectUrls( 
 
            url_id varchar(40) 
                not null,
                    url char(30) primary key not null,
                    redirect_url char(30) not null,
                   
                    createdAt TIMESTAMP
                    not null,
                    updatedAt TIMESTAMP 

                    
                    
                    
                    );`, err => { if (err) console.log(err.message, 2) })

        db.run(`
                    create table capchas(
                        capcha_id int primary key not null,
                        capcha char(4) not null,
                        ip char(20) not null,
                        createdAt TIMESTAMP  not null,
                        updatedAt TIMESTAMP  
                    );`, err => { if (err) console.log(err.message, 3) })

    });
} catch (err) {
    console.log("error from db creation.", err.message)
}
let app = express()

// app.set('title', 'finder');
app.use(limiter);

app.use(cors())
app.use(express.json())
app.use(express.static(process.cwd()+"\\build\\"));
app.use(express.urlencoded({ extended: false }))
app.use("/finder/services/", router)
app.use("/s/", shorter)
let port = process.env.port
app.get("/",(req,res)=>{
   try {
    res.sendFile(process.cwd()+"\\build\\index.html")
   } catch (error) {
    console.log(error.message,process.cwd()+"\build\index.html")
   }
})
app.listen(port, () => {
    console.log("app running at port", port)
})