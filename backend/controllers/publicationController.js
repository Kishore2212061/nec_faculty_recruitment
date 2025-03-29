// SQL Creation Script for Publications Table
/*
CREATE TABLE publications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  journal_type ENUM('SCI', 'Scopus') NOT NULL,
  journal_name VARCHAR(255) NOT NULL,
  publisher VARCHAR(255),
  paper_title VARCHAR(500) NOT NULL,
  vol_no VARCHAR(50),
  doi VARCHAR(100),
  publication_date VARCHAR(7),
  impact_factor VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
*/

import { db } from '../config/db.js';

// ✅ Save or Update Publications
export const savePublications = (req, res) => {
  const userId = req.params.userId;
  const publications = req.body.publications; // Expecting an array of publications

  // Verify if the user exists
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, userResult) => {
    if (err) return res.status(500).json({ error: 'DB Error' });
    if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });

    // Delete existing publications for the user
    db.query('DELETE FROM publications WHERE user_id = ?', [userId], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Delete Failed' });

      if (!publications || publications.length === 0)
        return res.json({ message: 'Publications Updated ✅' });

      // Map publication values for bulk insert
      const values = publications.map(pub => [
        pub.id || crypto.randomUUID(), // Use provided id or generate new
        userId,
        pub.journalType,
        pub.journalName,
        pub.publisher,
        pub.paperTitle,
        pub.volNo,
        pub.doi,
        pub.publicationDate,
        pub.impactFactor
      ]);

      const insertSql = `
        INSERT INTO publications 
        (id, user_id, journal_type, journal_name, publisher, paper_title, 
        vol_no, doi, publication_date, impact_factor)
        VALUES ?
      `;

      db.query(insertSql, [values], (insertErr) => {
        if (insertErr) {
          console.error('Insert Error:', insertErr);
          return res.status(500).json({ error: 'Insert Failed', details: insertErr.message });
        }
        res.json({ message: 'Publications Saved ✅' });
      });
    });
  });
};

// ✅ Get Publications by User ID
export const getPublications = (req, res) => {
  const userId = req.params.userId;
  db.query('SELECT * FROM publications WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Fetch Failed' });
    res.json(results);
  });
};

// Route Configuration (in routes file)
/*
router.post('/api/publications/:userId', savePublications);
router.get('/api/publications/:userId', getPublications);
*/

// Sample Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
};