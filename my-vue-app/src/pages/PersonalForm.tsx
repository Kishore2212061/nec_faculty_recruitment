import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, UserCircle2, X } from 'lucide-react';

export default function PersonalForm() {
  const userId = localStorage.getItem('userId');
  const [formData, setFormData] = useState({
    fullName: '',
    referenceNumber: userId,
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
    appliedDate: new Date().toISOString().split('T')[0],
    photo: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/personal/${userId}`)
        .then((res) => {
          if (res.data) {
            console.log(res.data);
            setFormData(res.data);
  
            if (res.data.photo) {
              const byteCharacters = atob(res.data.photo);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'image/jpeg' });
              const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
  
              setPhotoFile(file);
              setPhotoPreview(`data:image/jpeg;base64,${res.data.photo}`);
            }
          }
        })
        .catch((err) => console.error('Fetch Error:', err));
    }
  }, [userId]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoRemoved(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoRemoved(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields except photo
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'photo') {
          formDataToSend.append(key, value);
        }
      });
      
      // Only send photo-related data if we're changing the photo
      if (photoFile) {
        // New photo uploaded
        formDataToSend.append('photo', photoFile);
      } else if (photoRemoved) {
        // Photo explicitly removed
        formDataToSend.append('photoRemoved', 'true');
      }
      // If neither condition is true, we're keeping the existing photo

      const res = await axios.post(
        `http://localhost:5000/api/personal/${userId}`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert(res.data.message || 'Saved Successfully ✅');
      
      // If save was successful and we had removed the photo, update the formData
      if (photoRemoved) {
        setFormData(prev => ({ ...prev, photo: '' }));
      }
      
    } catch (err) {
      console.error('Save Error:', err);
      alert('Failed to save data ❌');
    }
  };

  const InputField = ({ name, placeholder, type = 'text' }: { name: string; placeholder: string; type?: string }) => (
    <div className="mb-3">
      <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">
        {placeholder}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={(formData as any)[name]}
        onChange={handleChange}
        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex flex-col">
          {/* Header with Photo Upload */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <h2 className="text-2xl font-bold text-white">Personal Information</h2>
              
              {/* Photo Upload Section */}
              <div className="w-full md:w-auto">
                <div className="relative flex items-center gap-4">
                  <div className="relative group">
                    <div className={`w-24 h-24 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 ${photoPreview ? 'border-white/20' : 'border-dashed border-white/40'}`}>
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle2 className="w-12 h-12 text-white/60" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer text-white text-sm font-medium"
                        >
                          Change
                        </label>
                      </div>
                    </div>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <p className="text-white text-sm mb-2">Profile Photo</p>
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-md text-sm font-medium text-white hover:bg-white/20 transition-all duration-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <p className="text-white/60 text-xs mt-1">
                      Recommended: Square JPG, PNG. Max 5MB
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">1</span>
                  Basic Details
                </h3>
                <InputField name="fullName" placeholder="Full Name" />
                {/* <InputField name="referenceNumber" placeholder="Reference Number" /> */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField name="dateOfBirth" placeholder="Date of Birth" type="date" />
                  <InputField name="age" placeholder="Age" type="number" />
                </div>
                <div className="mb-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-600 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-2">2</span>
                  Contact Information
                </h3>
                <InputField name="email" placeholder="Email Address" type="email" />
                <InputField name="mobileNumber" placeholder="Mobile Number" />
                <InputField name="communicationAddress" placeholder="Communication Address" />
                <InputField name="permanentAddress" placeholder="Permanent Address" />
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2">3</span>
                  Additional Information
                </h3>
                <InputField name="religion" placeholder="Religion" />
                <InputField name="community" placeholder="Community" />
                <InputField name="caste" placeholder="Caste" />
                <InputField name="post" placeholder="Post" />
                <InputField name="department" placeholder="Department" />
                {/* <InputField name="appliedDate" placeholder="Applied Date" type="date" /> */}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Save Information
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}