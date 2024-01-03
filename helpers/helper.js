import sqlite from "sqlite3"
import path from "path"
import { randomUUID } from "crypto"
import { configDotenv } from "dotenv";
configDotenv()
let dbPath = String(process.env.dbPath);

let db = new sqlite.Database(dbPath)
let trackerUrl = "http://localhost:4000/finder/services/location-tracker/findDetails/"
trackerUrl = "http://localhost:4000/s/t/"
let short_url = "http://localhost:4000/s/"
let insertDb = ({ url, url_id, ip }) => {
    let uid = randomUUID().slice(0, 5)
    let base_url = `http://localhost:3000/services/location-tracker/`


    const time = Date.now();
    const date = new Date(time);
    const currentDate = date.toString();

    return new Promise((resolve, reject) => {
        db.run('INSERT INTO UrlTracker(Url,createdAt, ip,createdUrl,url_id,trackUrl) VALUES(?, ?,?,?,?,?)',
            [url, currentDate, ip, String(base_url + uid), uid, trackerUrl + uid], (err) => {
                if (err) {

                    reject({ error: true, message: "failed to create." })
                }
                db.run('INSERT INTO redirectUrls(redirect_url,createdAt,url,url_id) VALUES(?, ?,?,?)',
                    [url, currentDate, trackerUrl + uid, uid,], (err) => {
                        if (err) {

                            reject({ error: true, message: "failed to create redirect." })

                        }

                        resolve({
                            error: false, data: {
                                for_you: base_url + uid,
                                trackerUrl: trackerUrl + uid
                            }, message: "successfully created your url"
                        })



                        // db.run(`INSERT INTO UrlTracker( )
                        // VALUES(${url}, ${currentDate},${ip},${base_url+uid},${1}')

                        //       `)






                    })









            })


    })

}
let capchaCreater = () => {

    let capcha = "";
    for (let i = 0; i < 4; i++) {
        let randomNum = Math.floor(Math.random() * 9)
        capcha += String(randomNum);

    }
    return { sucess: true, data: capcha }
}
let capchaValidator = ({ capcha, ip, id }) => {
    try {
        db.run(`SELECT ${id} FROM capchas`, (err, data) => {
            if (err) {
                console.log(err)
                return
            }
            console.log(data)
        })
    } catch (error) {
        console.log(error)
    }

}
let findTrackedData = (id) => {
    return new Promise((resolve, reject) => {
        db.get(`select * from UrlTracker where url_id="${id}"`, (err, data) => {
        
            if (err||!data) {
                reject({ error: true, message: "could not find datas" })
                return
            }
            resolve({ error: false, data: data.trackedData, message: "sucessfully tracked." })
        })
    })
}
let redirectFunc = (id, short) => {
    if (short) {
        return new Promise((resolve, reject) => {
            db.get(`select * from shortUrls where url_id="${id}"`, (err, data) => {
  
                if (err||!data) {
                    reject({
                        error: true, message: "could not find datas", data: {
                            url: process.env.redirect_path
                        }
                    })
                    return
                }

                resolve({
                    error: false, message: "sucessfully fetched", data: {
                        url: data?.redirect_url,
                        url_id: data?.url_id
                    }
                })
            })
        })
    }

    return new Promise((resolve, reject) => {
        db.get(`select * from redirectUrls where url_id="${id}"`, (err, data) => {
            if (err) {
                reject({
                    error: true, message: "could not find datas", data: {
                        url: process.env.redirect_path
                    }
                })
                return
            }

            resolve({
                error: false, message: "sucessfully fetched", data: {
                    url: data?.redirect_url,
                    url_id: data?.url_id
                }
            })
        })
    })
}

let updateTrackerDetailes = (uid, ipData) => {
    const time = Date.now();
    const date = new Date(time);
    const currentDate = date.toString();

    return new Promise((resolve, reject) => {

        db.get(`select * from UrlTracker  where url_id="${uid}"`, err => {

            if (err) {
                reject({ error: true, message: "url is invalid", })
                return
            }

            let data = [JSON.stringify(ipData), uid];
            let sql = `UPDATE UrlTracker
            SET trackedData = ?
        
            WHERE url_id = ?`;

            db.run(sql, data, function (err) {
                if (err) {
                    reject({ error: true, message: "failed to add." })
                    return
                }

                resolve({ error: false, message: "added successfully." })
            });

            // close the database connection

        })
    })

}

let short_urlToDb = (ip, redirect_url) => {
    let uid = randomUUID().slice(0, 5)
    


    const time = Date.now();
    const date = new Date(time);
    const currentDate = date.toString();

    return new Promise((resolve, reject) => {
        db.run('INSERT INTO shortUrls(url,createdAt, ip,redirect_url,url_id) VALUES(?, ?,?,?,?)',
            [short_url + uid, currentDate, ip, redirect_url, uid], (err) => {
                if (err) {
             
                    reject({ error: true, message: "failed to create." })
                    return
                }


                resolve({
                    error: false, data: {
                        short_url: short_url + uid,
                    }, message: "successfully created your url"
                })



                // db.run(`INSERT INTO UrlTracker( )
                // VALUES(${url}, ${currentDate},${ip},${base_url+uid},${1}')

                //       `)
















            })


    })
}
let delTrackerData=(id)=>{
  
    return new Promise((resolve,reject)=>{
        db.run(`DELETE FROM UrlTracker WHERE url_id=(?)`,id,(err)=>{
         if(err){
       
            reject({ error: true, message: "failed to delete." })
            return 
         }
         resolve({
            error: false, message: "successfully deleted"
        })
        })
    })

}
export { insertDb,delTrackerData,
     capchaCreater, capchaValidator, findTrackedData, redirectFunc, updateTrackerDetailes, short_urlToDb }
