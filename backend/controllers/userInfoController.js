import { db } from '../config/db.js';

// ✅ Save or Update User Additional Information
export const saveUserInfo = (req, res) => {
  const userId = req.params.userId;
  const { family, reference, anyOtherInfo, awardsDetails, noOfAwards } = req.body;

  // Verify if the user exists
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, userResult) => {
    if (err) return res.status(500).json({ error: 'DB Error' });
    if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });

    const sql = `
      INSERT INTO user_additional_info (user_id, family, reference, any_other_info, awards_details, no_of_awards)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        family = VALUES(family),
        reference = VALUES(reference),
        any_other_info = VALUES(any_other_info),
        awards_details = VALUES(awards_details),
        no_of_awards = VALUES(no_of_awards)
    `;

    db.query(sql, [userId, family, reference, anyOtherInfo, awardsDetails, noOfAwards], (err) => {
      if (err) return res.status(500).json({ error: 'Save Failed' });
      res.json({ message: 'User Additional Info Saved ✅' });
    });
  });
};

// ✅ Get User Additional Information by User ID
export const getUserInfo = (req, res) => {
  const userId = req.params.userId;
  db.query('SELECT * FROM user_additional_info WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Fetch Failed' });
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.json({});
    }
  });
};
