import { db } from '../config/db.js';

// ✅ Calculate and Save/Update User Marks
export const calculateUserMarks = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch user-related data
        db.query('SELECT * FROM user_education WHERE user_id = ?', [userId], (err, education) => {
            if (err) return res.status(500).json({ message: 'Error fetching education data', error: err.message });
            if (!education.length) return res.status(404).json({ message: 'User education data not found' });

            db.query('SELECT * FROM experience WHERE userId = ?', [userId], (err, experience) => {
                if (err) return res.status(500).json({ message: 'Error fetching experience data', error: err.message });

                db.query('SELECT * FROM publications WHERE user_id = ?', [userId], (err, publications) => {
                    if (err) return res.status(500).json({ message: 'Error fetching publications data', error: err.message });

                    db.query('SELECT * FROM phd WHERE user_id = ?', [userId], (err, phd) => {
                        if (err) return res.status(500).json({ message: 'Error fetching PhD data', error: err.message });

                        // Prepare user data for weight calculation
                        const userData = {
                            education: education[0],
                            experience,
                            publications,
                            phd: phd[0] || null
                        };

                        // Calculate weight
                        const weights = calculateWeights(userData);

                        // Check if marks exist for user
                        db.query('SELECT * FROM marks WHERE user_id = ?', [userId], (err, existingMarks) => {
                            if (err) return res.status(500).json({ message: 'Error checking existing marks', error: err.message });

                            if (existingMarks.length) {
                                // Update existing marks
                                db.query(`
                                    UPDATE marks SET 
                                    medium_weight = ?, hsc_weight = ?, ug_degree_weight = ?, 
                                    pg_degree_weight = ?, mphil_weight = ?, ug_first_attempt_weight = ?, 
                                    pg_first_attempt_weight = ?, experience_weight = ?, publications_weight = ?, 
                                    total_weight = ? WHERE user_id = ?`, 
                                    [
                                        weights.mediumWeight, weights.hscWeight, weights.ugDegreeWeight,
                                        weights.pgDegreeWeight, weights.mphilWeight, weights.ugFirstAttemptWeight,
                                        weights.pgFirstAttemptWeight, weights.experienceWeight, weights.publicationsWeight,
                                        weights.totalWeight, userId
                                    ],
                                    (err) => {
                                        if (err) return res.status(500).json({ message: 'Error updating marks', error: err.message });
                                        res.status(200).json({ message: 'Marks updated successfully', weights });
                                    }
                                );
                            } else {
                                // Insert new marks record
                                db.query(`
                                    INSERT INTO marks (user_id, medium_weight, hsc_weight, ug_degree_weight, 
                                    pg_degree_weight, mphil_weight, ug_first_attempt_weight, pg_first_attempt_weight, 
                                    experience_weight, publications_weight, total_weight) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                    [
                                        userId, weights.mediumWeight, weights.hscWeight, weights.ugDegreeWeight,
                                        weights.pgDegreeWeight, weights.mphilWeight, weights.ugFirstAttemptWeight,
                                        weights.pgFirstAttemptWeight, weights.experienceWeight, weights.publicationsWeight,
                                        weights.totalWeight
                                    ],
                                    (err) => {
                                        if (err) return res.status(500).json({ message: 'Error inserting marks', error: err.message });
                                        res.status(200).json({ message: 'Marks calculated successfully', weights });
                                    }
                                );
                            }
                        });
                    });
                });
            });
        });

    } catch (error) {
        console.error('Error calculating marks:', error);
        res.status(500).json({ message: 'Error calculating marks', error: error.message });
    }
};

// ✅ Get User Marks
export const getUserMarks = (req, res) => {
    const userId = req.params.userId;

    db.query('SELECT * FROM marks WHERE user_id = ?', [userId], (err, marks) => {
        if (err) return res.status(500).json({ message: 'Error retrieving marks', error: err.message });
        if (!marks.length) return res.status(404).json({ message: 'Marks not found' });

        res.status(200).json(marks[0]);
    });
};

// ✅ Helper Function: Calculate Weights
const calculateWeights = ({ education, experience, publications }) => {
    return {
        mediumWeight: (education.tenth_medium === 'english' && education.twelfth_medium === 'english') ? 5 : 
                      (education.tenth_medium === 'tamil' && education.twelfth_medium === 'tamil') ? 2 : 3.5,
        hscWeight: education.twelfth_cgpa_percentage > 95 ? 5 :
                   education.twelfth_cgpa_percentage >= 91 ? 4 :
                   education.twelfth_cgpa_percentage >= 86 ? 3 :
                   education.twelfth_cgpa_percentage >= 81 ? 2 : 1,
        ugDegreeWeight: education.ug_cgpa_percentage > 90 ? 10 :
                        education.ug_cgpa_percentage >= 81 ? 7.5 :
                        education.ug_cgpa_percentage >= 71 ? 5 :
                        education.ug_cgpa_percentage >= 60 ? 3 : 0,
        pgDegreeWeight: education.pg_cgpa_percentage > 90 ? 15 :
                        education.pg_cgpa_percentage >= 81 ? 12.5 :
                        education.pg_cgpa_percentage >= 71 ? 10 :
                        education.pg_cgpa_percentage >= 60 ? 5 : 0,
        mphilWeight: (education.pg_degree === 'M.Sc' && education.mphil_year) ? 5 : 0,
        ugFirstAttemptWeight: education.ug_first_attempt ? 5 : 0,
        pgFirstAttemptWeight: education.pg_first_attempt ? 5 : 0,
        experienceWeight: experience.length ? experience.length * 2 : 0,
        publicationsWeight: publications.length ? publications.length * 1.5 : 0,
        totalWeight: 0, 
    };
};