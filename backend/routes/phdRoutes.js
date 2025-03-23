import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

/** ------------- PhD ROUTES ------------- **/

// Get all PhD records for a user
router.get("/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.query(
        `SELECT id, university, title, guide_name, guide_college, status, 
        year_of_registration, year_of_completion, no_of_publications_during_phd, 
        no_of_publications_post_phd, post_phd_experience 
        FROM phd WHERE user_id = ?`, 
        [user_id], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// Add a new PhD record
router.post("/", (req, res) => {
    console.log("Received POST data:", req.body); // Log complete request body

    const { 
        user_id, 
        university, 
        title, 
        guide_name = "",  // Ensure non-null value
        guide_college = "", 
        status, 
        year_of_registration,   
        year_of_completion,     
        no_of_publications_during_phd = 0, 
        no_of_publications_post_phd = 0,   
        post_phd_experience = "" 
    } = req.body;

    // Additional null check
    if (!guide_name) {
        return res.status(400).json({ error: "Guide name is required" });
    }

    db.query(
        `INSERT INTO phd 
        (user_id, university, title, guide_name, guide_college, status, 
        year_of_registration, year_of_completion, no_of_publications_during_phd, 
        no_of_publications_post_phd, post_phd_experience) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, university, title, guide_name, guide_college, status, 
         year_of_registration, year_of_completion, no_of_publications_during_phd, 
         no_of_publications_post_phd, post_phd_experience],
        (err, results) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: results.insertId, message: "PhD record added successfully" });
        }
    );
});

// Update a PhD record
router.put("/:id", (req, res) => {
    console.log("Received PUT data:", req.body); // Log complete request body

    const { id } = req.params;
    const { 
        university, 
        title, 
        guide_name = "",  // Ensure non-null value
        guide_college = "", 
        status, 
        year_of_registration,   
        year_of_completion,     
        no_of_publications_during_phd = 0, 
        no_of_publications_post_phd = 0,   
        post_phd_experience = "" 
    } = req.body;

    // Additional null check
    if (!guide_name) {
        return res.status(400).json({ error: "Guide name is required" });
    }

    db.query(
        `UPDATE phd SET 
        university = ?, title = ?, guide_name = ?, guide_college = ?, status = ?, 
        year_of_registration = ?, year_of_completion = ?, 
        no_of_publications_during_phd = ?, no_of_publications_post_phd = ?, 
        post_phd_experience = ? WHERE user_id = ?`,
        [university, title, guide_name, guide_college, status, 
         year_of_registration, year_of_completion, no_of_publications_during_phd, 
         no_of_publications_post_phd, post_phd_experience, id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "PhD record updated successfully" ,results});
        }
    );
});

// Delete a PhD record
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM phd WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "PhD record deleted successfully" });
    });
});

export default router;
