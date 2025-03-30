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

    // Validation check
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }

    // Destructuring all values
    const {
        // 10th
        tenth_institution, tenth_university, tenth_medium, tenth_cgpa_percentage, tenth_first_attempt, tenth_year,

        // 12th
        twelfth_institution, twelfth_university, twelfth_medium, twelfth_cgpa_percentage, twelfth_first_attempt, twelfth_year,

        // UG
        ug_institution, ug_university, ug_medium, ug_specialization, ug_degree, ug_cgpa_percentage, ug_first_attempt, ug_year,

        // PG
        pg_institution, pg_university, pg_medium, pg_specialization, pg_degree, pg_cgpa_percentage, pg_first_attempt, pg_year,

        // M.Phil
        mphil_institution, mphil_university, mphil_medium, mphil_specialization, mphil_degree, mphil_cgpa_percentage, mphil_first_attempt, mphil_year
    } = req.body;

    const sql = `
        INSERT INTO user_education 
        (user_id, 
        tenth_institution, tenth_university, tenth_medium, tenth_cgpa_percentage, tenth_first_attempt, tenth_year,
        twelfth_institution, twelfth_university, twelfth_medium, twelfth_cgpa_percentage, twelfth_first_attempt, twelfth_year,
        ug_institution, ug_university, ug_medium, ug_specialization, ug_degree, ug_cgpa_percentage, ug_first_attempt, ug_year,
        pg_institution, pg_university, pg_medium, pg_specialization, pg_degree, pg_cgpa_percentage, pg_first_attempt, pg_year,
        mphil_institution, mphil_university, mphil_medium, mphil_specialization, mphil_degree, mphil_cgpa_percentage, mphil_first_attempt, mphil_year)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        tenth_institution=VALUES(tenth_institution), tenth_university=VALUES(tenth_university), tenth_medium=VALUES(tenth_medium), tenth_cgpa_percentage=VALUES(tenth_cgpa_percentage), tenth_first_attempt=VALUES(tenth_first_attempt), tenth_year=VALUES(tenth_year),
        twelfth_institution=VALUES(twelfth_institution), twelfth_university=VALUES(twelfth_university), twelfth_medium=VALUES(twelfth_medium), twelfth_cgpa_percentage=VALUES(twelfth_cgpa_percentage), twelfth_first_attempt=VALUES(twelfth_first_attempt), twelfth_year=VALUES(twelfth_year),
        ug_institution=VALUES(ug_institution), ug_university=VALUES(ug_university), ug_medium=VALUES(ug_medium), ug_specialization=VALUES(ug_specialization), ug_degree=VALUES(ug_degree), ug_cgpa_percentage=VALUES(ug_cgpa_percentage), ug_first_attempt=VALUES(ug_first_attempt), ug_year=VALUES(ug_year),
        pg_institution=VALUES(pg_institution), pg_university=VALUES(pg_university), pg_medium=VALUES(pg_medium), pg_specialization=VALUES(pg_specialization), pg_degree=VALUES(pg_degree), pg_cgpa_percentage=VALUES(pg_cgpa_percentage), pg_first_attempt=VALUES(pg_first_attempt), pg_year=VALUES(pg_year),
        mphil_institution=VALUES(mphil_institution), mphil_university=VALUES(mphil_university), mphil_medium=VALUES(mphil_medium), mphil_specialization=VALUES(mphil_specialization), mphil_degree=VALUES(mphil_degree), mphil_cgpa_percentage=VALUES(mphil_cgpa_percentage), mphil_first_attempt=VALUES(mphil_first_attempt), mphil_year=VALUES(mphil_year)
    `;

    const values = [
        user_id,
        tenth_institution || '', tenth_university || '', tenth_medium || '', tenth_cgpa_percentage || '', tenth_first_attempt || 'yes', tenth_year || '',
        twelfth_institution || '', twelfth_university || '', twelfth_medium || '', twelfth_cgpa_percentage || '', twelfth_first_attempt || 'yes', twelfth_year || '',
        ug_institution || '', ug_university || '', ug_medium || '', ug_specialization || '', ug_degree || '', ug_cgpa_percentage || '', ug_first_attempt || 'yes', ug_year || '',
        pg_institution || '', pg_university || '', pg_medium || '', pg_specialization || '', pg_degree || '', pg_cgpa_percentage || '', pg_first_attempt || 'yes', pg_year || '',
        mphil_institution || '', mphil_university || '', mphil_medium || '', mphil_specialization || '', mphil_degree || '', mphil_cgpa_percentage || '', mphil_first_attempt || 'yes', mphil_year || ''
    ];

    db.query(sql, values, (err, results) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ 
            message: "Education record inserted/updated successfully",
            id: results.insertId || user_id 
        });
    });
});

// Delete education record (per user)
router.delete("/:user_id", (req, res) => {
    const { user_id } = req.params;
    
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }
    
    db.query("DELETE FROM user_education WHERE user_id = ?", [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "No education record found for this user" });
        }
        res.json({ message: "Education record deleted successfully" });
    });
});

export default router;