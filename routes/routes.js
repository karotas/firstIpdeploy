import geolite from "geoip-lite";
import express from "express";

import domainPing from "domain-ping";

import { insertDb, findTrackedData, delTrackerData, redirectFunc, updateTrackerDetailes, short_urlToDb } from "../helpers/helper.js"

const router = express.Router()



class responseObj {
    constructor(obj) {
        this.data = obj.data;
        this.error = obj.error;
        this.message = obj.message
        this.status = obj.status
    }
}
class errorResObj {
    constructor(obj) {


        this.error = obj.error;
        this.message = obj.message
        this.status = obj.status
    }
}


router.post("/siteTO-ip", async (req, res) => {
    let { url } = req.body.data


    try {
        if (!url) {
            throw new Error("site name is required")
            return
        }
        let siteData = await domainPing(url);

        if (!siteData) {
            throw new Error("please provide a valid website url")
            return
        }
        let resData = new responseObj({
            data: {
                domain: siteData.domain,
                ip: siteData.ip,
            },
            status: "success",
            message: "web site ip successfully fetched.",
            error: false
        })

        res.json(resData).status(200)
    } catch (err) {


        let resData = new errorResObj({
            status: "falied",
            message: "invalid website url",
            error: true
        })
        res.json(resData).status(400)
    }

})

router.post("/ipTO-detailes", async (req, res) => {
    let { ip } = req.body.data

    try {
        if (!ip) {
            throw new Error("ip is required")
            return
        }
        let ipData = await geolite.lookup(ip);
        if (!ipData) throw new Error("invalid ip address")

        let resData = new responseObj({
            data: ipData,
            error: false,
            status: "completed",
            message: "successfully fetched."
        })
        res.json(resData).status(200)
    } catch (err) {

        let resData = new errorResObj({
            error: true,
            status: "failed",
            message: err.message
        })
        res.json(resData).status(400)
    }
})

router.post("/my-ip", async (req, res) => {
    //2402:3a80:4479:9137:dda4:6265:8545:3eb8
    let ip = req.ip || req.socket.remoteAddress

    let { my_ip } = req.body?.data
    if (my_ip) {
        try {

            if (!ip) {
                throw new Error("ip could not find")
                return
            }
            let resData = new responseObj({
                data: {
                    ip
                },
                error: false,
                status: "completed",
                message: "successfully fetched."
            })
            res.json(resData).status(200)
        } catch (err) {
            let resData = new errorResObj({
                error: true,
                status: "failed",
                message: err.message
            })
            res.json(resData).status(400)
        }
        return
    }

    try {
        if (!ip) {
            throw new Error("ip could not find")
            return
        }

        let ipData = await geolite.lookup(ip);
        if (!ipData) throw new Error("invalid ip address")

        let resData = new responseObj({
            data: ipData,
            error: false,
            status: "completed",
            message: "successfully fetched."
        })
        res.json(resData).status(200)
    } catch (err) {

        let resData = new errorResObj({
            error: true,
            status: "failed",
            message: err.message
        })
        res.json(resData).status(400)
    }
})

router.post("/location-tracker", async (req, res) => {
    let { url } = req.body.data;

    try {
        let insert = await insertDb({ url, ip: req.ip })



        let resData = new responseObj({
            data: {
                url: insert.data.for_you,
                trackerUrl: insert.data.trackerUrl
            },
            status: "success",
            message: insert.message,
            error: insert.error
        })
        res.json(resData).status(400)
    } catch (err) {

        let resData = new errorResObj({
            status: "falied",
            message: err.message,
            error: err.error
        })
        res.json(resData).status(400)

    }


})

// router.get("/location-tracker/findDetails/:id", async (req, res) => {
//     let ip = req.socket.remoteAddress || req.ip


//     let id = req.params.id

//     try {

//         let url = await redirectFunc(id)

//         let ipDatas = await geolite.lookup(ip)
//         let update = await updateTrackerDetailes(id, ipDatas)

//         res.redirect(url.data)
//     } catch (error) {

//         res.redirect(error.data)

//     }


// })
router.post("/location-tracker/:id", async (req, res) => {

    let id = req.params.id;




    try {
        let datas = await findTrackedData(id)
        let resData = new responseObj({
            data: JSON.parse(datas.data),
            status: "success",
            message: datas.message,
            error: datas.error
        })

        res.json(resData).status(200)

    } catch (error) {

        let resData = new errorResObj({

            status: "success",
            message: error.message,
            error: error.error
        })
        res.json(resData).status(400)
    }

})
router.post("/location-tracker/del/:id", async (req, res) => {
    console.log("hited from del")
    let id = req.params.id


    try {
        let delDatas = await delTrackerData(id)
        console.log(delDatas)
        let resData = new responseObj({

            status: "success",
            message: delDatas.message,
            error: delDatas.error
        })

        res.json(resData).status(200)
    } catch (error) {
        console.log(error.message, "here")
        let resData = new errorResObj({

            status: "success",
            message: error.message,
            error: error.error || true
        })
        res.json(resData).status(400)
    }

})
router.post("/short-urls", async (req, res) => {

    let { url } = req.body.data;


    try {
        let datas = await short_urlToDb(req.ip, url)

        let resData = new responseObj({
            data: datas.data,
            status: "success",
            message: datas.message,
            error: datas.error
        })

        res.json(resData).status(200)
    } catch (error) {

        let resData = new errorResObj({

            status: "success",
            message: error.message,
            error: true
        })
        res.json(resData).status(200)
    }


})
export default router