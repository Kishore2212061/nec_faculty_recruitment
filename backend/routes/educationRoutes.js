import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

/** ------------- EDUCATION ROUTES (PIVOTED TABLE) ------------- **/

// Get education record for a user
router.get("/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.query(
        "SELECT * FROM user_education WHERE user_id = ?", 
        [user_id], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results[0] || {}); // return empty if not found
        }
    );
});

// Add or Insert user education (Upsert)
router.post("/", (req, res) => {
    const { user_id } = req.body;
console.log(req.body)
    // destructuring all values
    const {
        // 10th
        tenth_institution, tenth_university, tenth_medium, tenth_specialization, tenth_cgpa_percentage, tenth_first_attempt, tenth_year,

        // 12th
        twelfth_institution, twelfth_university, twelfth_medium, twelfth_specialization, twelfth_cgpa_percentage, twelfth_first_attempt, twelfth_year,

        // UG
        ug_institution, ug_university, ug_medium, ug_specialization, ug_cgpa_percentage, ug_first_attempt, ug_year,

        // PG
        pg_institution, pg_university, pg_medium, pg_specialization, pg_cgpa_percentage, pg_first_attempt, pg_year
    } = req.body;

    // Upsert pattern (insert or update if exists)
    db.query(
        `INSERT INTO user_education 
        (user_id, 
        tenth_institution, tenth_university, tenth_medium, tenth_specialization, tenth_cgpa_percentage, tenth_first_attempt, tenth_year,
        twelfth_institution, twelfth_university, twelfth_medium, twelfth_specialization, twelfth_cgpa_percentage, twelfth_first_attempt, twelfth_year,
        ug_institution, ug_university, ug_medium, ug_specialization, ug_cgpa_percentage, ug_first_attempt, ug_year,
        pg_institution, pg_university, pg_medium, pg_specialization, pg_cgpa_percentage, pg_first_attempt, pg_year)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        ON DUPLICATE KEY UPDATE 
        tenth_institution=VALUES(tenth_institution), tenth_university=VALUES(tenth_university), tenth_medium=VALUES(tenth_medium), tenth_specialization=VALUES(tenth_specialization), tenth_cgpa_percentage=VALUES(tenth_cgpa_percentage), tenth_first_attempt=VALUES(tenth_first_attempt), tenth_year=VALUES(tenth_year),
        twelfth_institution=VALUES(twelfth_institution), twelfth_university=VALUES(twelfth_university), twelfth_medium=VALUES(twelfth_medium), twelfth_specialization=VALUES(twelfth_specialization), twelfth_cgpa_percentage=VALUES(twelfth_cgpa_percentage), twelfth_first_attempt=VALUES(twelfth_first_attempt), twelfth_year=VALUES(twelfth_year),
        ug_institution=VALUES(ug_institution), ug_university=VALUES(ug_university), ug_medium=VALUES(ug_medium), ug_specialization=VALUES(ug_specialization), ug_cgpa_percentage=VALUES(ug_cgpa_percentage), ug_first_attempt=VALUES(ug_first_attempt), ug_year=VALUES(ug_year),
        pg_institution=VALUES(pg_institution), pg_university=VALUES(pg_university), pg_medium=VALUES(pg_medium), pg_specialization=VALUES(pg_specialization), pg_cgpa_percentage=VALUES(pg_cgpa_percentage), pg_first_attempt=VALUES(pg_first_attempt), pg_year=VALUES(pg_year)
        `,
        [
            user_id,
            tenth_institution, tenth_university, tenth_medium, tenth_specialization, tenth_cgpa_percentage, tenth_first_attempt, tenth_year,
            twelfth_institution, twelfth_university, twelfth_medium, twelfth_specialization, twelfth_cgpa_percentage, twelfth_first_attempt, twelfth_year,
            ug_institution, ug_university, ug_medium, ug_specialization, ug_cgpa_percentage, ug_first_attempt, ug_year,
            pg_institution, pg_university, pg_medium, pg_specialization, pg_cgpa_percentage, pg_first_attempt, pg_year
        ],
        (err, results) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Education record inserted/updated successfully" });
        }
    );
});

// Delete education record (per user)
router.delete("/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.query("DELETE FROM user_education WHERE user_id = ?", [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Education record deleted successfully" });
    });
});

export default router;
