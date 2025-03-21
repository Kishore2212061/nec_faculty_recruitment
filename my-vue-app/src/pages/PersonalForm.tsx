import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PersonalForm() {
  const userId = localStorage.getItem('userId');
  const [formData, setFormData] = useState({
    fullName: '',
    referenceNumber: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    communicationAddress: '',
    permanentAddress: '',
    religion: '',
    community: '',
    caste: '',
    email: '',
    mobileNumber: '',
    post: '',
    department: '',
    appliedDate: '',
    photo: '', // will hold base64 string
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // ✅ Fetch saved data when the component mounts
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/personal/${userId}`)
        .then((res) => {
          if (res.data) setFormData(res.data);
        })
        .catch((err) => console.error('Fetch Error:', err));
    }
  }, [userId]);

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle photo file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      // Append photo file if new photo is selected
      if (photoFile) formDataToSend.append('photo', photoFile);

      const res = await axios.post(
        `http://localhost:5000/api/personal/${userId}`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert(res.data.message || 'Saved Successfully ✅');
    } catch (err) {
      console.error('Save Error:', err);
      alert('Failed to save data ❌');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Personal Information</h2>

      {/* Reusable Input */}
      {[
        { name: 'fullName', placeholder: 'Full Name' },
        { name: 'referenceNumber', placeholder: 'Reference Number' },
        { name: 'age', placeholder: 'Age' },
        { name: 'communicationAddress', placeholder: 'Communication Address' },
        { name: 'permanentAddress', placeholder: 'Permanent Address' },
        { name: 'religion', placeholder: 'Religion' },
        { name: 'community', placeholder: 'Community' },
        { name: 'caste', placeholder: 'Caste' },
        { name: 'email', placeholder: 'Email', type: 'email' },
        { name: 'mobileNumber', placeholder: 'Mobile Number' },
        { name: 'post', placeholder: 'Post' },
        { name: 'department', placeholder: 'Department' },
      ].map((field) => (
        <input
          key={field.name}
          type={field.type || 'text'}
          name={field.name}
          placeholder={field.placeholder}
          value={(formData as any)[field.name]}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded"
        />
      ))}

      {/* Date Inputs */}
      <input
        type="date"
        name="dateOfBirth"
        value={formData.dateOfBirth}
        onChange={handleChange}
        className="w-full p-3 mb-4 border rounded"
      />
      <input
        type="date"
        name="appliedDate"
        value={formData.appliedDate}
        onChange={handleChange}
        className="w-full p-3 mb-4 border rounded"
      />

      {/* Gender Dropdown */}
      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="w-full p-3 mb-4 border rounded"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      {/* Photo Upload */}
      <input
        type="file"
        name="photo"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full p-3 mb-4 border rounded"
      />

      {/* Show uploaded image */}
      {formData.photo && (
        <img
          src={`data:image/jpeg;base64,${formData.photo}`}
          alt="Uploaded"
          className="w-32 h-32 object-cover mb-4 rounded border"
        />
      )}

      {/* Submit Button */}
      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
        Save
      </button>
    </form>
  );
}
