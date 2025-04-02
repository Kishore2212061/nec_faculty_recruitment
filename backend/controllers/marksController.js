import { db } from '../config/db.js';

// ✅ Calculate and Save/Update User Marks
export const calculateUserMarks = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch user-related data (only education and phd data)
        db.query('SELECT * FROM user_education WHERE user_id = ?', [userId], (err, education) => {
            if (err) {
                console.error('Error fetching education data:', err); // Log detailed error
                return res.status(500).json({ message: 'Error fetching education data', error: err.message });
            }
            if (!education.length) {
                return res.status(404).json({ message: 'User education data not found' });
            }

            // Print fetched education data
            console.log('Fetched Education Data:', education);

            db.query('SELECT * FROM phd WHERE user_id = ?', [userId], (err, phd) => {
                if (err) {
                    console.error('Error fetching PhD data:', err); // Log detailed error
                    return res.status(500).json({ message: 'Error fetching PhD data', error: err.message });
                }

                // Print fetched PhD data
                console.log('Fetched PhD Data:', phd);

                const userData = {
                    education: education[0],
                    phd: phd[0] || null
                };

                const weights = calculateWeights(userData);

                db.query('SELECT * FROM total_weight WHERE user_id = ?', [userId], (err, existingMarks) => {
                    if (err) {
                        console.error('Error checking existing marks:', err); // Log detailed error
                        return res.status(500).json({ message: 'Error checking existing marks', error: err.message });
                    }

                    // Print existing marks data
                    console.log('Existing Marks Data:', existingMarks);

                    if (existingMarks.length) {
                        db.query(`
                            UPDATE total_weight SET 
                            medium_weight = ?, hsc_weight = ?, ug_degree_weight = ?, 
                            pg_degree_weight = ?, mphil_weight = ?, ug_first_attempt_weight = ?, 
                            pg_first_attempt_weight = ?, total_weight = ? WHERE user_id = ?`,
                            [
                                weights.mediumWeight, weights.hscWeight, weights.ugDegreeWeight,
                                weights.pgDegreeWeight, weights.mphilWeight, weights.ugFirstAttemptWeight,
                                weights.pgFirstAttemptWeight, weights.totalWeight, userId
                            ],
                            (err) => {
                                if (err) {
                                    console.error('Error updating total weight:', err); // Log detailed error
                                    return res.status(500).json({ message: 'Error updating total weight', error: err.message });
                                }
                                res.status(200).json({ message: 'Total weight updated successfully', weights });
                            }
                        );
                    } else {
                        db.query(`
                            INSERT INTO total_weight (user_id, medium_weight, hsc_weight, ug_degree_weight, 
                            pg_degree_weight, mphil_weight, ug_first_attempt_weight, pg_first_attempt_weight, 
                            total_weight) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                            [
                                userId, weights.mediumWeight, weights.hscWeight, weights.ugDegreeWeight,
                                weights.pgDegreeWeight, weights.mphilWeight, weights.ugFirstAttemptWeight,
                                weights.pgFirstAttemptWeight, weights.totalWeight
                            ],
                            (err) => {
                                if (err) {
                                    console.error('Error inserting total weight:', err); // Log detailed error
                                    return res.status(500).json({ message: 'Error inserting total weight', error: err.message });
                                }
                                res.status(200).json({ message: 'Total weight calculated and saved successfully', weights });
                            }
                        );
                    }
                });
            });
        });

    } catch (error) {
        console.error('Error calculating marks:', error); // Log detailed error
        res.status(500).json({ message: 'Error calculating marks', error: error.message });
    }
};

// ✅ Helper Function: Calculate Weights
const calculateWeights = ({ education, phd }) => {
    let med, hscmw8, udegmw8, pdegmw8, mphilwet = 0, ugfa = 0, pgfa = 0;

    // ✅ Medium Weight Calculation
    if (education.tenth_medium === 'english' && education.twelfth_medium === 'english') {
        med = 5;
    } else if (education.tenth_medium === 'tamil' && education.twelfth_medium === 'tamil') {
        med = 2;
    } else {
        med = 3.5;
    }

    // ✅ 12th Marks Weight Calculation
    if (education.twelfth_cgpa_percentage > 95) {
        hscmw8 = 5;
    } else if (education.twelfth_cgpa_percentage >= 91) {
        hscmw8 = 4;
    } else if (education.twelfth_cgpa_percentage >= 86) {
        hscmw8 = 3;
    } else if (education.twelfth_cgpa_percentage >= 81) {
        hscmw8 = 2;
    } else {
        hscmw8 = 1;
    }

    // ✅ UG Degree Weight Calculation
    // ✅ UG Degree Weight Calculation
// ✅ UG Degree Weight Calculation
if (education.ug_degree === 'B.E' || education.ug_degree === 'B.TECH') {
    if (education.ug_cgpa_percentage > 90) {
        udegmw8 = 30;
    } else if (education.ug_cgpa_percentage >= 85) {
        udegmw8 = 25;
    } else if (education.ug_cgpa_percentage >= 81) {
        udegmw8 = 20;
    } else if (education.ug_cgpa_percentage >= 75) {
        udegmw8 = 17.5;
    } else if (education.ug_cgpa_percentage >= 71) {
        udegmw8 = 15;
    } else if (education.ug_cgpa_percentage >= 65) {
        udegmw8 = 10;
    } else if (education.ug_cgpa_percentage >= 60) {
        udegmw8 = 5;
    } else {
        udegmw8 = 0;
    }
} else if (education.ug_degree === 'B.Sc.' || education.ug_degree === 'B.A.') { // Adjusted condition to handle B.Sc. and B.A.
    if (education.ug_cgpa_percentage > 90) {
        udegmw8 = 20;
    } else if (education.ug_cgpa_percentage >= 81) {
        udegmw8 = 15;
    } else if (education.ug_cgpa_percentage >= 71) {
        udegmw8 = 10;
    } else if (education.ug_cgpa_percentage >= 60) {
        udegmw8 = 5;
    } else {
        udegmw8 = 0;
    }
} else {
    udegmw8 = 0; // If the degree is something else, assign 0 by default
}



    // ✅ PG Degree Weight Calculation
    if (education.pg_cgpa_percentage > 90) {
        pdegmw8 = 15;
    } else if (education.pg_cgpa_percentage >= 81) {
        pdegmw8 = 12.5;
    } else if (education.pg_cgpa_percentage >= 71) {
        pdegmw8 = 10;
    } else if (education.pg_cgpa_percentage >= 60) {
        pdegmw8 = 5;
    } else {
        pdegmw8 = 0;
    }

    // ✅ M.Phil Weight Calculation
    if (education.pg_degree === 'M.Sc' && education.mphil_year) {
        mphilwet = 5;
    }

    // ✅ UG First Attempt Weight
    ugfa = education.ug_first_attempt === 'yes' ? 5 : 0;

    // ✅ PG First Attempt Weight
    pgfa = education.pg_first_attempt === 'yes' ? 5 : 0;

    // ✅ Total Weight Calculation
    const totalWeight = med + hscmw8 + udegmw8 + pdegmw8 + mphilwet + ugfa + pgfa;

    // Log the calculated weights
    console.log('Calculated Weights:');
    console.log(`Medium Weight: ${med}`);
    console.log(`HSC Weight: ${hscmw8}`);
    console.log(`UG Degree Weight: ${udegmw8}`);
    console.log(`PG Degree Weight: ${pdegmw8}`);
    console.log(`MPhil Weight: ${mphilwet}`);
    console.log(`UG First Attempt Weight: ${ugfa}`);
    console.log(`PG First Attempt Weight: ${pgfa}`);
    console.log(`Total Weight: ${totalWeight}`);

    // Check if the totalWeight is NaN, and set it to 0 if it is
    if (isNaN(totalWeight)) {
        console.error('Calculated total weight is NaN');
        return {
            mediumWeight: 0,
            hscWeight: 0,
            ugDegreeWeight: 0,
            pgDegreeWeight: 0,
            mphilWeight: 0,
            ugFirstAttemptWeight: 0,
            pgFirstAttemptWeight: 0,
            totalWeight: 0
        };
    }

    return {
        mediumWeight: med,
        hscWeight: hscmw8,
        ugDegreeWeight: udegmw8,
        pgDegreeWeight: pdegmw8,
        mphilWeight: mphilwet,
        ugFirstAttemptWeight: ugfa,
        pgFirstAttemptWeight: pgfa,
        totalWeight: totalWeight
    };
};

export const getUserMarks = async (req, res) => {
    const userId = req.params.userId;
    try {
        db.query('SELECT * FROM marks WHERE user_id = ?', [userId], (err, marks) => {
            if (err) return res.status(500).json({ message: 'Error fetching marks', error: err.message });
            if (!marks.length) return res.status(404).json({ message: 'Marks not found' });
            res.status(200).json({ message: 'Marks fetched successfully', marks });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marks', error: error.message });
    }
};