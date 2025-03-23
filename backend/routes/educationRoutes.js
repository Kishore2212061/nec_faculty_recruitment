import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

/** ------------- EDUCATION ROUTES ------------- **/

// Get all education records for a user
router.get("/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.query(
        "SELECT id, degree, institution, university, medium, specialization, cgpa_percentage, first_attempt, year AS end_date FROM education WHERE user_id = ?", 
        [user_id], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// Add new education record
router.post("/", (req, res) => {
    const { user_id, degree, institution, university, medium, specialization, grade, firstAttempt, end_date } = req.body;
    console.log(req.body);

    db.query(
        "INSERT INTO education (user_id, degree, institution, university, medium, specialization, cgpa_percentage, first_attempt, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [user_id, degree, institution, university, medium, specialization, grade, firstAttempt, end_date || null],
        (err, results) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: results.insertId, user_id, degree, institution, university, medium, specialization, grade, firstAttempt, end_date });
        }
    );
});

// Update an education record
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { degree, institution, university, medium, specialization, grade, firstAttempt, end_date } = req.body;
    console.log("PUT request received", req.body);

    db.query(
        "UPDATE education SET degree = ?, institution = ?, university = ?, medium = ?, specialization = ?, cgpa_percentage = ?, first_attempt = ?, year = ? WHERE id = ?",
        [degree, institution, university, medium, specialization, grade, firstAttempt, end_date || null, id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Education record updated successfully" });
        }
    );
});

// Delete an education record
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM education WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Education record deleted successfully" });
    });
});

export default router;
