import express from "express";

import { URL } from "url"

import { redirectFunc, updateTrackerDetailes } from "../helpers/helper.js"
import geolite from "geoip-lite";
const router = express.Router()
router.get("/t/:id", async (req, res) => {
  let ip = req.socket.remoteAddress || req.ip

  let id = req.params.id
  console.log(id)
  try {

    let urlData = await redirectFunc(id)
    console.log(urlData)
    let ipDatas = await geolite.lookup(ip)
    ipDatas = {
      range: ipDatas.range || "no range found",
      country: ipDatas.country || "no coutry found",
      region: ipDatas.region || "no region found",
      city: ipDatas.city || "no city found",
      lat: ipDatas.ll[0] || "no lattitude found",
      lang: ipDatas.ll[1] || "no langttiude found",
      metro: ipDatas.metro || "no metro found",
      area: ipDatas.area || "no area found",
      eu: ipDatas.eu || "no eu found",
      timezone: ipDatas.timezone || "no timezone found"
    }
    let update = await updateTrackerDetailes(id, ipDatas)

    if (urlData.data.url) {
      res.redirect(urlData.data.url)
    }
  } catch (error) {

    res.redirect(process.env.redirect_path)

  }


})

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  console.log("hited short", id)
  try {
    let urlData = await redirectFunc(id, true)
    console.log(urlData)
    if (urlData.data.url || urlData.data.url !== undefined) {
      res.redirect(urlData.data.url)
    }
    throw new Error("no site found")
  } catch (error) {
    let FilePath = new URL("../ui/noShort.html", import.meta.url).pathname
    FilePath = FilePath.slice(1, FilePath.length)

    res.sendFile(FilePath)
  }

})
export default router;