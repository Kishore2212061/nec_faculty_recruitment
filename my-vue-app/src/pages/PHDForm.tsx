import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FormData {
  university: string;
  title: string;
  guideName: string;
  college: string;
  status: string;
  registrationYear: string;
  completionYear: string;
  publicationsDuringPhD: string;
  publicationsPostPhD: string;
  postPhDExperience: string;
}

interface FormErrors {
  [key: string]: string;
}

const PhDForm: React.FC = () => {
  const userId = localStorage.getItem("userId");
  const [formData, setFormData] = useState<FormData>({
    university: '',
    title: '',
    guideName: '',
    college: '',
    status: '',
    registrationYear: '',
    completionYear: '',
    publicationsDuringPhD: '',
    publicationsPostPhD: '',
    postPhDExperience: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [existingData, setExistingData] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  useEffect(() => {
    setTimeout(() => setFormVisible(true), 300);
    fetchPhDData();
  }, [userId]);

  const fetchPhDData = async () => {
    if (!userId || dataFetched) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/phd/${userId}`);
      
      if (response.data && response.data.length > 0) {
        const phdData = response.data[0];
        
        const mappedData = {
          university: phdData.university || '',
          title: phdData.title || '',
          guideName: phdData.guide_name || '',
          college: phdData.guide_college || '',
          status: phdData.status || '',
          registrationYear: phdData.year_of_registration?.toString() || '',
          completionYear: phdData.year_of_completion?.toString() || '',
          publicationsDuringPhD: phdData.no_of_publications_during_phd?.toString() || '0',
          publicationsPostPhD: phdData.no_of_publications_post_phd?.toString() || '0',
          postPhDExperience: phdData.post_phd_experience || '',
        };

        setFormData(mappedData);
        setOriginalData(mappedData);
        setExistingData(true);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error fetching PhD data:', error);
      setApiError('Failed to fetch PhD data. Please try again later.');
    } finally {
      setIsLoading(false);
      setDataFetched(true);
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'university':
      case 'title':
      case 'guideName':
      case 'college':
        return value.trim() === '' ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required` : '';
      case 'status':
        return value.trim() === '' ? 'Status is required' : '';
      case 'registrationYear':
      case 'completionYear':
        const yearRegex = /^\d{4}$/;
        if (value.trim() === '') {
          if (name === 'completionYear' && formData.status === 'Pursuing') return '';
          return `${name === 'registrationYear' ? 'Registration' : 'Completion'} year is required`;
        }
        if (!yearRegex.test(value)) return 'Please enter a valid 4-digit year';
        const year = parseInt(value, 10);
        if (year < 1900 || year > new Date().getFullYear()) return 'Please enter a valid year';
        return '';
      case 'publicationsDuringPhD':
      case 'publicationsPostPhD':
        const numRegex = /^\d+$/;
        if (value.trim() === '') return `Number of publications ${name === 'publicationsDuringPhD' ? 'during' : 'post'} PhD is required`;
        if (!numRegex.test(value)) return 'Please enter a valid number';
        return '';
      case 'postPhDExperience':
        return value.trim() === '' ? 'Post PhD experience is required' : '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const errorMessage = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handleFocus = (name: string) => {
    setFocused(name);
  };

  const handleBlur = () => {
    setFocused(null);
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Cancel edit - restore original data
      if (originalData) {
        setFormData(originalData);
      }
      setErrors({});
    }
    setEditMode(!editMode);
    setSubmitted(!editMode);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const errorMessage = validateField(key, value);
      if (errorMessage) {
        newErrors[key] = errorMessage;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const phdPayload = {
          user_id: userId,
          university: formData.university,
          title: formData.title,
          guide_name: formData.guideName,
          guide_college: formData.college,
          status: formData.status,
          year_of_registration: parseInt(formData.registrationYear),
          year_of_completion: formData.completionYear ? parseInt(formData.completionYear) : null,
          no_of_publications_during_phd: parseInt(formData.publicationsDuringPhD),
          no_of_publications_post_phd: parseInt(formData.publicationsPostPhD),
          post_phd_experience: formData.postPhDExperience
        };

        if (existingData) {
          await axios.put(`http://localhost:5000/api/phd/${userId}`, phdPayload);
        } else {
          await axios.post('http://localhost:5000/api/phd', phdPayload);
        }

        setOriginalData(formData);
        setSubmitted(true);
        setEditMode(false);
        setExistingData(true);
      } catch (error) {
        console.error('Error submitting PhD data:', error);
        setApiError('Failed to save PhD information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const statusOptions = [
    'Pursuing',
    'Thesis submitted',
    'Viva voce completed',
    'Degree Awarded'
  ];

  const getFormGroupClasses = (fieldName: string) => {
    let classes = "transition-all duration-300 mb-4";
    
    if (errors[fieldName]) {
      classes += " error";
    }
    
    if (focused === fieldName) {
      classes += " text-indigo-600 font-semibold";
    }
    
    return classes;
  };

  const getInputClasses = (fieldName: string) => {
    let classes = "w-full px-3 py-3 bg-gray-100 border-2 rounded-lg text-gray-800 text-base transition-all duration-300 focus:outline-none";
    
    if (errors[fieldName]) {
      classes += " border-red-500 bg-red-50";
    } else if (focused === fieldName) {
      classes += " border-indigo-500 shadow-md shadow-indigo-100";
    } else {
      classes += " border-gray-200";
    }
    
    if (submitted && !editMode) {
      classes += " bg-gray-50 cursor-not-allowed";
    }
    
    return classes;
  };

  if (isLoading && !formVisible) {
    return (
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8 ${formVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-5'} transition-all duration-300`}>
      <div className="flex justify-between items-center mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-emerald-500 inline-block text-transparent bg-clip-text">
            PhD Information
          </h1>
          <p className="text-gray-400 text-base">
            {submitted && !editMode 
              ? "Your PhD details are shown below" 
              : editMode 
                ? "Update your PhD details below" 
                : "Please provide your PhD details below"}
          </p>
        </div>
        
        {existingData && (
          <button
            onClick={toggleEditMode}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              editMode
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {editMode ? 'Cancel Edit' : 'Edit Information'}
          </button>
        )}
      </div>
      
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
          <p>{apiError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Form fields remain the same, just update the disabled prop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Include all your existing form fields here, with disabled={submitted && !editMode} */}
          {/* Example of one field: */}
          <div className={getFormGroupClasses('university')} style={{animationDelay: '0.1s'}}>
            <label htmlFor="university" className="block mb-2 font-medium text-gray-800">University</label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              onFocus={() => handleFocus('university')}
              onBlur={handleBlur}
              placeholder="Enter your university name"
              className={getInputClasses('university')}
              disabled={submitted && !editMode}
            />
            {errors.university && (
              <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.university}</div>
            )}
          </div>
          
          {/* Continue with all other fields... */}
          <div className={getFormGroupClasses('title')} style={{animationDelay: '0.2s'}}>
          <label htmlFor="title" className="block mb-2 font-medium text-gray-800">Title of PhD</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onFocus={() => handleFocus('title')}
            onBlur={handleBlur}
            placeholder="Enter your PhD title"
            className={getInputClasses('title')}
            disabled={submitted && !editMode}
          />
          {errors.title && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.title}</div>}
        </div>
        
        <div className={getFormGroupClasses('guideName')} style={{animationDelay: '0.3s'}}>
          <label htmlFor="guideName" className="block mb-2 font-medium text-gray-800">Guide Name</label>
          <input
            type="text"
            id="guideName"
            name="guideName"
            value={formData.guideName}
            onChange={handleChange}
            onFocus={() => handleFocus('guideName')}
            onBlur={handleBlur}
            placeholder="Enter your guide's name"
            className={getInputClasses('guideName')}
            disabled={submitted && !editMode}
          />
          {errors.guideName && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.guideName}</div>}
        </div>
        
        <div className={getFormGroupClasses('college')} style={{animationDelay: '0.4s'}}>
          <label htmlFor="college" className="block mb-2 font-medium text-gray-800">College</label>
          <input
            type="text"
            id="college"
            name="college"
            value={formData.college}
            onChange={handleChange}
            onFocus={() => handleFocus('college')}
            onBlur={handleBlur}
            placeholder="Enter your college name"
            className={getInputClasses('college')}
            disabled={submitted && !editMode}
          />
          {errors.college && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.college}</div>}
        </div>
        
        <div className={getFormGroupClasses('status')} style={{animationDelay: '0.5s'}}>
          <label htmlFor="status" className="block mb-2 font-medium text-gray-800">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            onFocus={() => handleFocus('status')}
            onBlur={handleBlur}
            className={getInputClasses('status')}
            disabled={submitted && !editMode}
          >
            <option value="">Select Status</option>
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.status && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.status}</div>}
        </div>
        
        <div className={getFormGroupClasses('registrationYear')} style={{animationDelay: '0.6s'}}>
          <label htmlFor="registrationYear" className="block mb-2 font-medium text-gray-800">Year of Registration</label>
          <input
            type="text"
            id="registrationYear"
            name="registrationYear"
            value={formData.registrationYear}
            onChange={handleChange}
            onFocus={() => handleFocus('registrationYear')}
            onBlur={handleBlur}
            placeholder="YYYY"
            maxLength={4}
            className={getInputClasses('registrationYear')}
            disabled={submitted && !editMode}
          />
          {errors.registrationYear && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.registrationYear}</div>}
        </div>
        
        <div className={getFormGroupClasses('completionYear')} style={{animationDelay: '0.7s'}}>
          <label htmlFor="completionYear" className="block mb-2 font-medium text-gray-800">Year of Completion</label>
          <input
            type="text"
            id="completionYear"
            name="completionYear"
            value={formData.completionYear}
            onChange={handleChange}
            onFocus={() => handleFocus('completionYear')}
            onBlur={handleBlur}
            placeholder="YYYY"
            maxLength={4}
            className={getInputClasses('completionYear')}
            disabled={submitted && !editMode}
          />
          {errors.completionYear && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.completionYear}</div>}
        </div>
        
        <div className={getFormGroupClasses('publicationsDuringPhD')} style={{animationDelay: '0.8s'}}>
          <label htmlFor="publicationsDuringPhD" className="block mb-2 font-medium text-gray-800">Publications During PhD</label>
          <input
            type="text"
            id="publicationsDuringPhD"
            name="publicationsDuringPhD"
            value={formData.publicationsDuringPhD}
            onChange={handleChange}
            onFocus={() => handleFocus('publicationsDuringPhD')}
            onBlur={handleBlur}
            placeholder="Number of publications"
            className={getInputClasses('publicationsDuringPhD')}
            disabled={submitted && !editMode}
          />
          {errors.publicationsDuringPhD && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.publicationsDuringPhD}</div>}
        </div>
        
        <div className={getFormGroupClasses('publicationsPostPhD')} style={{animationDelay: '0.9s'}}>
          <label htmlFor="publicationsPostPhD" className="block mb-2 font-medium text-gray-800">Publications Post PhD</label>
          <input
            type="text"
            id="publicationsPostPhD"
            name="publicationsPostPhD"
            value={formData.publicationsPostPhD}
            onChange={handleChange}
            onFocus={() => handleFocus('publicationsPostPhD')}
            onBlur={handleBlur}
            placeholder="Number of publications"
            className={getInputClasses('publicationsPostPhD')}
            disabled={submitted && !editMode}
          />
          {errors.publicationsPostPhD && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.publicationsPostPhD}</div>}
        </div>
        
        <div className={`${getFormGroupClasses('postPhDExperience')} col-span-1 md:col-span-2`} style={{animationDelay: '1s'}}>
          <label htmlFor="postPhDExperience" className="block mb-2 font-medium text-gray-800">Post PhD Experience</label>
          <textarea
            id="postPhDExperience"
            name="postPhDExperience"
            value={formData.postPhDExperience}
            onChange={handleChange}
            onFocus={() => handleFocus('postPhDExperience')}
            onBlur={handleBlur}
            placeholder="Describe your post PhD experience"
            rows={4}
            className={getInputClasses('postPhDExperience')}
            disabled={submitted && !editMode}
          />
          {errors.postPhDExperience && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.postPhDExperience}</div>}
        </div>
      
          
        </div>
        
        {(!submitted || editMode) && (
          <div className="flex justify-center gap-4 mt-8">
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : existingData ? 'Update' : 'Submit'}
            </button>
            
            <button 
              type="button"
              onClick={toggleEditMode}
              className="bg-transparent border-2 border-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PhDForm;