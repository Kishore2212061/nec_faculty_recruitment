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

const PhDForm: React.FC<{}> = () => {
  const userId = localStorage.getItem("userId");
  const STORAGE_KEY = `phd_form_data_${userId}`;
  const EDIT_MODE_KEY = `phd_form_edit_mode_${userId}`;
  
  // Initialize form data from localStorage if available
  const getInitialFormData = (): FormData => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing saved form data", e);
      }
    }
    
    return {
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
    };
  };

  // Get edit mode from localStorage
  const getEditMode = (): boolean => {
    const savedEditMode = localStorage.getItem(EDIT_MODE_KEY);
    return savedEditMode === 'true';
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [errors, setErrors] = useState<FormErrors>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [existingData, setExistingData] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Use function to get current edit mode from localStorage
  const isEditMode = getEditMode();

  // Save form data to localStorage when it changes
  useEffect(() => {
    // Only save to localStorage if we're in edit mode or during form submission
    // Don't save during initial data fetch or when we're just displaying saved data
    if (isEditMode || !dataFetched) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, STORAGE_KEY, isEditMode, dataFetched]);

  // Fetch existing data only once
  useEffect(() => {
    // Show form with delay for entrance animation
    setTimeout(() => setFormVisible(true), 300);
    
    // Fetch existing PhD data if available
    const fetchExistingData = async () => {
      if (!userId || dataFetched) return; // Skip if already fetched
      
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/phd/${userId}`);
        
        if (response.data && response.data.length > 0) {
          // Log the response data to debug
          console.log('API Response:', response.data);
          
          // Map API data structure to form data structure
          const phdData = response.data[0];
          
          // Ensure we handle all data types correctly
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
          
          console.log('Mapped Form Data:', mappedData);
          
          // Update form data state with the mapped data and save to localStorage
          setFormData(mappedData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedData));
          
          // Set submitted and existingData, but DON'T change edit mode in localStorage
          if (!isEditMode) {
            setSubmitted(true);
          }
          setExistingData(true);
        }
      } catch (error) {
        console.error('Error fetching PhD data:', error);
      } finally {
        setIsLoading(false);
        setDataFetched(true); // Mark data as fetched to prevent refetching
      }
    };

    fetchExistingData();
  }, [userId]); // Only depend on userId to prevent re-fetching

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
          // Completion year can be empty if status is "Pursuing"
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

  const resetForm = () => {
    if (isEditMode && existingData) {
      // Cancel edit mode and revert to stored data
      // Retrieve original data from localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          setFormData(JSON.parse(savedData));
        } catch (e) {
          console.error("Error parsing saved form data", e);
        }
      }
      
      setErrors({});
      setApiError(null);
      localStorage.setItem(EDIT_MODE_KEY, 'false'); // Store edit mode in localStorage
      setSubmitted(true); // Go back to view mode when canceling
    } else {
      // Complete reset
      const emptyForm = {
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
      };
      
      setFormData(emptyForm);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyForm));
      
      setErrors({});
      setApiError(null);
      setSubmitted(false);
      localStorage.setItem(EDIT_MODE_KEY, 'false'); // Store edit mode in localStorage
    }
  };

  const enableEditMode = () => {
    localStorage.setItem(EDIT_MODE_KEY, 'true'); // Store edit mode in localStorage
    setSubmitted(false); // This will ensure the form becomes editable
    
    // Force a re-render by updating a state
    setFocused(''); // This is just a hack to force re-render
    setTimeout(() => setFocused(null), 10); // Reset immediately
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
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
        // Prepare API payload based on the provided API structure
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
        
        console.log('Submitting payload:', phdPayload);
        
        if (isEditMode || existingData) {
          // Update existing record with PUT request
          await axios.put(`http://localhost:5000/api/phd/${userId}`, phdPayload);
          console.log('Updated existing record');
        } else {
          // Create new record with POST request
          await axios.post('http://localhost:5000/api/phd', phdPayload);
          console.log('Created new record');
        }
        
        // Update localStorage with the latest data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        
        // Important: Set states correctly after successful submission
        setSubmitted(true);
        localStorage.setItem(EDIT_MODE_KEY, 'false'); // Store edit mode in localStorage
        setExistingData(true);
      
        console.log('Form submitted successfully:', formData);
      } catch (error) {
        console.error('Error submitting PhD data:', error);
        setApiError('Failed to submit PhD information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Validation errors:', newErrors);
      // Animate error fields
      document.querySelectorAll('.error').forEach(el => {
        el.classList.add('animate-shake');
        setTimeout(() => el.classList.remove('animate-shake'), 500);
      });
    }
  };

  const statusOptions = [
    'Pursuing',
    'Thesis submitted',
    'Viva voce completed',
    'Degree Awarded'
  ];

  // Function to get dynamic classes for form groups
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

  // Function to get dynamic classes for inputs
  const getInputClasses = (fieldName: string) => {
    let classes = "w-full px-3 py-3 bg-gray-100 border-2 rounded-lg text-gray-800 text-base transition-all duration-300 focus:outline-none";
    
    if (errors[fieldName]) {
      classes += " border-red-500 bg-red-50";
    } else if (focused === fieldName) {
      classes += " border-indigo-500 shadow-md shadow-indigo-100";
    } else {
      classes += " border-gray-200";
    }
    
    // Important: Only disable fields when submitted AND not in edit mode
    if (submitted && !isEditMode) {
      classes += " bg-gray-50 cursor-not-allowed";
    }
    
    return classes;
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            disabled={isLoading || (submitted && !isEditMode)}
          />
          {errors.university && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.university}</div>}
        </div>
        
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
            disabled={isLoading || (submitted && !isEditMode)}
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
            disabled={isLoading || (submitted && !isEditMode)}
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
            disabled={isLoading || (submitted && !isEditMode)}
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
            disabled={isLoading || (submitted && !isEditMode)}
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
            disabled={isLoading || (submitted && !isEditMode)}
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
            disabled={isLoading || (submitted && !isEditMode)}
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
            disabled={isLoading || (submitted && !isEditMode)}
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
            disabled={isLoading || (submitted && !isEditMode)}
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
            disabled={isLoading || (submitted && !isEditMode)}
          />
          {errors.postPhDExperience && <div className="text-red-500 text-sm mt-1 animate-fade-in">{errors.postPhDExperience}</div>}
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-8" style={{animationDelay: '1.1s'}}>
        {submitted && !isEditMode ? (
          <button 
            type="button" 
            onClick={enableEditMode}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
            disabled={isLoading}
          >
            Edit Information
          </button>
        ) : (
          <>
            <button 
              type="submit" 
              className={`bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
            </button>
            <button 
              type="button" 
              className="bg-transparent border-2 border-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:border-gray-400"
              onClick={resetForm}
              disabled={isLoading}
            >
              {isEditMode ? 'Cancel' : 'Reset'}
            </button>
          </>
        )}
      </div>
    </form>
  );

  if (isLoading && !formVisible) {
    return (
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8 ${formVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-5'} transition-all duration-300`}>
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-emerald-500 inline-block text-transparent bg-clip-text">PhD Information</h1>
        <p className="text-gray-400 text-base">
        {submitted && !isEditMode 
            ? "Your PhD details are shown below" 
            : isEditMode 
              ? "Update your PhD details below" 
              : "Please provide your PhD details below"}
        </p>
      </div>
      
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 animate-fade-in">
          <p>{apiError}</p>
        </div>
      )}
      
      {renderForm()}
    </div>
  );
};

export default PhDForm;