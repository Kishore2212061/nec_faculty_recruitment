import { db } from '../config/db.js'; // Adjust path as needed

// ✅ Store Personal Data with Photo as Binary (BLOB)
export const savePersonal = (req, res) => {
  const userId = req.params.userId;
  const data = req.body;
  const photoBuffer = req.file ? req.file.buffer : null; // Store photo as binary

  const sql = `
    INSERT INTO personal (
      userId, fullName, dateOfBirth, age, gender,
      communicationAddress, permanentAddress, religion, community, caste,
      email, mobileNumber, post, department, appliedDate, photo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      fullName = VALUES(fullName),
      dateOfBirth = VALUES(dateOfBirth),
      age = VALUES(age),
      gender = VALUES(gender),
      communicationAddress = VALUES(communicationAddress),
      permanentAddress = VALUES(permanentAddress),
      religion = VALUES(religion),
      community = VALUES(community),
      caste = VALUES(caste),
      email = VALUES(email),
      mobileNumber = VALUES(mobileNumber),
      post = VALUES(post),
      department = VALUES(department),
      appliedDate = VALUES(appliedDate),
      photo = VALUES(photo)
  `;

  db.query(sql, [
    userId,
    data.fullName,
    data.dateOfBirth,
    data.age,
    data.gender,
    data.communicationAddress,
    data.permanentAddress,
    data.religion,
    data.community,
    data.caste,
    data.email,
    data.mobileNumber,
    data.post,
    data.department,
    data.appliedDate,
    photoBuffer
  ], (err, result) => {
    if (err) {
      console.error('Save Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Personal Data Saved/Updated ✅' });
  });
};

// ✅ Get Personal Data with Image (BLOB converted to base64)
export const getPersonal = (req, res) => {
  const userId = req.params.userId;

  const sql = `SELECT * FROM personal WHERE userId = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Fetch Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'No personal data found' });
    }

    const personalData = result[0];

    // ✅ Convert photo BLOB to base64 for frontend image rendering
    if (personalData.photo) {
      personalData.photo = personalData.photo.toString('base64');
    }

    res.json(personalData);
  });
};
