const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Hoot = require("../models/hoot");
const { verify } = require("jsonwebtoken");
const router = express.Router();

// Add Routes here


// POST
router.post("/", verifyToken, async (req, res) => {
    try {
      req.body.author = req.user._id;
      const hoot = await Hoot.create(req.body);
      hoot._doc.author = req.user;
      res.status(201).json(hoot);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });
  
// Get / Hoots / Read
router.get("/", verifyToken, async (req, res) => {
 try {
const hoots = await Hoot.find({})
    .populate("author")
    .sort({createdAt: "desc"});
res.status(200).json(hoots);
 } catch (err) {
    res.status(500).json({ err: err.message});
 }
});

// Show 
// controllers/hoots.js

router.get("/:hootId", verifyToken, async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId).populate("author");
      res.status(200).json(hoot);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });
  
// UPdate /PUT/hoots/:hootId

router.put("/:hootId", verifyToken, async (req,res) => {
    try {
// Find the hoot
const hoot = await Hoot.findById(req.params.hootId);

//Check permissions:
if(!hoot.author.equals(req.user._id)) {
    return res.status(403).send("You're not allowed to do that!");
}
// Update hoot:
const updatedHoot = await Hoot.findByIdAndUpdate(
    req.params.hootId,
    req.body,
    {new: true}
);

// Append req.user to the author property: 
updatedHoot._doc.author = req.user;

// Issue JSON response:
res.status(200).json(updatedHoot);
    } catch (err) {
res.status(500).json({err: err.message});
    }
})

// Delete/ hoots/:hootId
router.delete("/:hootId", verifyToken, async (req, res) => {
try {
const hoot = await Hoot.findById(req.params.hootId);

if(!hoot.author.equals(req.user._id)) {
    return res.status(403).send("You're not allowed to do that!");
}

const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
res.status(200).json(deletedHoot);
} catch (err) {
res.status(500).json({err: err.message});
}

});



module.exports = router;