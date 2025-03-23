import { db } from '../config/db.js';

// ✅ Save or Update Courses
export const saveCourses = (req, res) => {
  const userId = req.params.userId;
  const courses = req.body.courses; // Expecting an array of courses

  // Verify if the user exists
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, userResult) => {
    if (err) return res.status(500).json({ error: 'DB Error' });
    if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });

    // Delete existing courses for the user
    db.query('DELETE FROM courses WHERE user_id = ?', [userId], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Delete Failed' });

      if (!courses || courses.length === 0)
        return res.json({ message: 'Courses Updated ✅' });

      // Map course values for bulk insert
      const values = courses.map(course => [
        userId,
        course.courseName,
        course.platform,
        course.duration,
        course.scoreEarned
      ]);

      const insertSql = `
        INSERT INTO courses (user_id, course_name, platform, duration, score_earned)
        VALUES ?
      `;

      db.query(insertSql, [values], (insertErr) => {
        if (insertErr) return res.status(500).json({ error: 'Insert Failed' });
        res.json({ message: 'Courses Saved ✅' });
      });
    });
  });
};

// ✅ Get Courses by User ID
export const getCourses = (req, res) => {
  const userId = req.params.userId;
  db.query('SELECT * FROM courses WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Fetch Failed' });
    res.json(results);
  });
};
