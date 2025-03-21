import { db } from '../config/db.js';

// ✅ Save or Update Experience
export const saveExperience = (req, res) => {
  const userId = req.params.userId;
  const experiences = req.body;

  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, userResult) => {
    if (err) return res.status(500).json({ error: 'DB Error' });
    if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });

    db.query('DELETE FROM experience WHERE userId = ?', [userId], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Delete Failed' });

      if (experiences.length === 0) return res.json({ message: 'Experience Updated ✅' });

      const values = experiences.map(exp => [
        userId,
        exp.experienceType,
        exp.organization,
        exp.postHeld,
        exp.salaryDrawn,
        exp.fromDate,
        exp.toDate
      ]);

      const insertSql = `
        INSERT INTO experience (userId, experienceType, organization, postHeld, salaryDrawn, fromDate, toDate)
        VALUES ?
      `;

      db.query(insertSql, [values], (insertErr) => {
        if (insertErr) return res.status(500).json({ error: 'Insert Failed' });
        res.json({ message: 'Experience Saved ✅' });
      });
    });
  });
};

// ✅ Get Experience by User ID
export const getExperience = (req, res) => {
  const userId = req.params.userId;
  db.query('SELECT * FROM experience WHERE userId = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Fetch Failed' });
    res.json(result);
  });
};
