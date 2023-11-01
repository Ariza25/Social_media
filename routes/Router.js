const express = require("express")
const router = express();

router.use("/api/users", require("../routes/UserRoutes"))
router.use("/api/photos", require("../routes/PhotoRoutes"))

router.get("/", (req, res) =>{
    res.send("API working!")
})

module.exports = router