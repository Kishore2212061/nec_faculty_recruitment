import React, { useState, useEffect } from 'react';
import PHDForm from './PHDForm';
import axios from 'axios';

interface EducationData {
  id?: number;
  user_id?: number;
  degree: string;
  institution: string;
  university: string;
  medium: string;
  specialization: string;
  yearOfCompletion: string;
  cgpa: string;
  firstAttempt: string;
}

interface FormErrors {
  [key: string]: string;
}

const EducationForm: React.FC = () => {
  // Assume user ID is available from context/props/local storage
  const userId = 1; // Replace with actual user ID retrieval

  // Initialize with static rows for 10th, 12th, UG and PG
  const [educationData, setEducationData] = useState<EducationData[]>([
    {
      degree: '10th',
      institution: '',
      university: '',
      medium: '',
      specialization: '',
      yearOfCompletion: '',
      cgpa: '',
      firstAttempt: 'yes',
    },
    {
      degree: '12th',
      institution: '',
      university: '',
      medium: '',
      specialization: '',
      yearOfCompletion: '',
      cgpa: '',
      firstAttempt: 'yes',
    },
    {
      degree: 'UG',
      institution: '',
      university: '',
      medium: '',
      specialization: '',
      yearOfCompletion: '',
      cgpa: '',
      firstAttempt: 'yes',
    },
    {
      degree: 'PG',
      institution: '',
      university: '',
      medium: '',
      specialization: '',
      yearOfCompletion: '',
      cgpa: '',
      firstAttempt: 'yes',
    },
  ]);
  
  const [errors, setErrors] = useState<FormErrors[]>([{}, {}, {}, {}]);
  const [focused, setFocused] = useState<{ index: number; field: string | null }>({ index: -1, field: null });
  const [formVisible, setFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'education' | 'phd'>('education');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false); // New state for edit mode
  const [dataFetched, setDataFetched] = useState(false); // Track if data has been fetched

  const mediumOptions = ['Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Other'];
  const firstAttemptOptions = ['yes', 'no'];

  useEffect(() => {
    // Delayed appearance animation
    setTimeout(() => setFormVisible(true), 300);
    setTimeout(() => setAnimateForm(true), 500);
    
    // Fetch existing education data if available
    fetchEducationData();
  }, []);

  // Fetch existing education data from API
  const fetchEducationData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      const response = await axios.get(`http://localhost:5000/api/education/${userId}`);
      
      if (response.data && response.data.length > 0) {
        // Map API data to our form structure
        const existingData = response.data;
        const newEducationData = [...educationData];
        console.log(newEducationData)
        let hasData = false;
        
        existingData.forEach((item: any) => {
          const index = newEducationData.findIndex(ed => ed.degree === item.degree);
          if (index !== -1) {
            hasData = true;
            newEducationData[index] = {
              ...newEducationData[index],
              id: item.id,
              institution: item.institution || '',
              university: item.university || '',
              medium: item.medium || '',
              specialization: item.specialization || '',
              yearOfCompletion: item.end_date ? item.end_date : '',
              cgpa: item.cgpa_percentage || '',
              firstAttempt: item.firstAttempt || 'yes',
            };
          }
        });
        
        setEducationData(newEducationData);
        setDataFetched(hasData); // Set dataFetched if we found any data
        setEditMode(false); // Start in view mode when data is fetched
      }
    } catch (error) {
      console.error('Error fetching education data:', error);
      setApiError('Failed to load your education data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation function
  // Validation function
const validateField = (name: string, value: any): string => {
  // Convert value to string safely before using trim()
  const strValue = value !== null && value !== undefined ? String(value) : '';
  
  switch (name) {
    case 'institution':
    case 'university':
    case 'medium':
      return strValue.trim() === '' ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required` : '';
    case 'specialization':
      return strValue.trim() === '' ? 'Specialization is required' : '';
    case 'yearOfCompletion':
      const yearRegex = /^\d{4}$/;
      if (strValue.trim() === '') return 'Year of completion is required';
      if (!yearRegex.test(strValue)) return 'Please enter a valid 4-digit year';
      const year = parseInt(strValue, 10);
      const currentYear = new Date().getFullYear();
      if (year < 1950 || year > currentYear) return `Year must be between 1950 and ${currentYear}`;
      return '';
    case 'cgpa':
      const percentageRegex = /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)%?$/;
      const cgpaRegex = /^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/;
      if (strValue.trim() === '') return 'CGPA/Percentage is required';
      if (!percentageRegex.test(strValue) && !cgpaRegex.test(strValue)) 
        return 'Enter valid percentage (0-100%) or CGPA (0-10)';
      return '';
    case 'firstAttempt':
      return strValue.trim() === '' ? 'Please select Yes/No' : '';
    default:
      return '';
  }
};

  // Handle input changes
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newEducationData = [...educationData];
    newEducationData[index] = { ...newEducationData[index], [name]: value };
    setEducationData(newEducationData);
    
    const errorMessage = validateField(name, value);
    const newErrors = [...errors];
    newErrors[index] = { ...newErrors[index], [name]: errorMessage };
    setErrors(newErrors);
  };

  // Handle field focus
  const handleFocus = (index: number, field: string) => {
    setFocused({ index, field });
  };

  // Handle field blur
  const handleBlur = () => {
    setFocused({ index: -1, field: null });
  };

  // Format education data for API
  const formatDataForApi = (data: EducationData) => {
    return {
      user_id: userId,
      degree: data.degree,
      institution: data.institution,
      university: data.university,
      medium: data.medium,
      specialization: data.specialization,
      start_date: null, // Not used in your form but required by API
      end_date: `${data.yearOfCompletion}`, // Approximating graduation date
      grade: data.cgpa, // Ensure the field name matches what backend expects
      firstAttempt: data.firstAttempt,
    };
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    // Reset submission status when entering edit mode
    if (!editMode) {
      setIsSubmitted(false);
    }
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    const newErrors = educationData.map(education => {
      const formErrors: FormErrors = {};
      Object.entries(education).forEach(([key, value]) => {
        // Skip validation for degree as it's pre-set
        if (key !== 'degree' && key !== 'id' && key !== 'user_id') {
          const errorMessage = validateField(key, value as string);
          if (errorMessage) {
            formErrors[key] = errorMessage;
            isValid = false;
          }
        }
      });
      return formErrors;
    });
    
    setErrors(newErrors);
    
    if (isValid) {
      setIsLoading(true);
      setApiError(null);
      
      try {
        // Process each education record
        const apiPromises = educationData.map(async (education) => {
          const formattedData = formatDataForApi(education);
          console.log("Submitting data:", formattedData);
          
          if (education.id) {
            // Update existing record
            console.log(`PUT request to http://localhost:5000/api/education/${education.id}`);
            return axios.put(`http://localhost:5000/api/education/${education.id}`, formattedData);
          } else {
            // Create new record
            return axios.post('http://localhost:5000/api/education', formattedData);
          }
        });
        
        await Promise.all(apiPromises);
        console.log('Education data submitted successfully');
        setIsSubmitted(true);
        setEditMode(false); // Return to view mode after successful submission
      } catch (error) {
        console.error('Error submitting education data:', error);
        setApiError('Failed to save your education data. Please try again.');
        
        // Animate error fields
        document.querySelectorAll('.error-field').forEach(el => {
          el.classList.add('animate-shake');
          setTimeout(() => el.classList.remove('animate-shake'), 500);
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Animate error fields
      document.querySelectorAll('.error-field').forEach(el => {
        el.classList.add('animate-shake');
        setTimeout(() => el.classList.remove('animate-shake'), 500);
      });
    }
  };

  // Helper function to get form group classes
  const getFormGroupClasses = (index: number, fieldName: string, delay: number) => {
    let baseClasses = "transition-all duration-300 mb-4";
    
    // Add animation delay for staggered entrance
    const delayStyle = { animationDelay: `${delay * 0.1}s` };
    
    // Add error class if there's an error
    if (errors[index] && errors[index][fieldName]) {
      baseClasses += " error-field";
    }
    
    // Add focus class
    if (focused.index === index && focused.field === fieldName) {
      baseClasses += " text-indigo-600 font-semibold";
    }
    
    return {
      className: baseClasses,
      style: delayStyle
    };
  };

  // Helper function to get input classes
  const getInputClasses = (index: number, fieldName: string) => {
    let baseClasses = "w-full px-3 py-3 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    
    // Add disabled styling if not in edit mode and data has been fetched
    if (dataFetched && !editMode) {
      baseClasses += " bg-gray-100 cursor-not-allowed";
    }
    
    // Add error styling if there's an error
    if (errors[index] && errors[index][fieldName]) {
      baseClasses += " border-red-500 bg-red-50";
    }
    
    return baseClasses;
  };
    
  return (
    <div className={`education-form-container ${formVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'education' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('education')}
        >
          Education Details
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'phd' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('phd')}
        >
          PhD Details
        </button>
      </div>
      
      {activeTab === 'education' ? (
        <div className={`bg-white p-6 rounded-lg shadow-md ${animateForm ? 'transform-none opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-500`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Education Details</h2>
            {dataFetched && (
              <button
                type="button"
                onClick={toggleEditMode}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  editMode 
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {editMode ? 'Cancel Edit' : 'Edit Details'}
              </button>
            )}
          </div>
          
          {isLoading && (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {apiError}
            </div>
          )}
          
          {isSubmitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Your education details have been saved successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {educationData.map((education, index) => (
              <div key={index} className="mb-8 p-4 border-l-4 border-indigo-500 bg-gray-50 rounded-md">
                <h3 className="text-xl font-bold mb-4">{education.degree} Education</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div {...getFormGroupClasses(index, 'institution', 0)}>
                    <label className="block mb-1 font-medium">Institution Name</label>
                    <input
                      type="text"
                      name="institution"
                      value={education.institution}
                      onChange={(e) => handleChange(index, e)}
                      onFocus={() => handleFocus(index, 'institution')}
                      onBlur={handleBlur}
                      className={getInputClasses(index, 'institution')}
                      disabled={dataFetched && !editMode}
                    />
                    {errors[index]?.institution && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].institution}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(index, 'university', 1)}>
                    <label className="block mb-1 font-medium">University/Board</label>
                    <input
                      type="text"
                      name="university"
                      value={education.university}
                      onChange={(e) => handleChange(index, e)}
                      onFocus={() => handleFocus(index, 'university')}
                      onBlur={handleBlur}
                      className={getInputClasses(index, 'university')}
                      disabled={dataFetched && !editMode}
                    />
                    {errors[index]?.university && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].university}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(index, 'medium', 2)}>
                    <label className="block mb-1 font-medium">Medium of Instruction</label>
                    <select
                      name="medium"
                      value={education.medium}
                      onChange={(e) => handleChange(index, e)}
                      onFocus={() => handleFocus(index, 'medium')}
                      onBlur={handleBlur}
                      className={getInputClasses(index, 'medium')}
                      disabled={dataFetched && !editMode}
                    >
                      <option value="">Select medium</option>
                      {mediumOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors[index]?.medium && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].medium}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(index, 'specialization', 3)}>
                    <label className="block mb-1 font-medium">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={education.specialization}
                      onChange={(e) => handleChange(index, e)}
                      onFocus={() => handleFocus(index, 'specialization')}
                      onBlur={handleBlur}
                      className={getInputClasses(index, 'specialization')}
                      disabled={dataFetched && !editMode}
                    />
                    {errors[index]?.specialization && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].specialization}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(index, 'yearOfCompletion', 4)}>
                    <label className="block mb-1 font-medium">Year of Completion</label>
                    <input
                      type="text"
                      name="yearOfCompletion"
                      value={education.yearOfCompletion}
                      onChange={(e) => handleChange(index, e)}
                      onFocus={() => handleFocus(index, 'yearOfCompletion')}
                      onBlur={handleBlur}
                      className={getInputClasses(index, 'yearOfCompletion')}
                      placeholder="YYYY"
                      disabled={dataFetched && !editMode}
                    />
                    {errors[index]?.yearOfCompletion && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].yearOfCompletion}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(index, 'cgpa', 5)}>
                    <label className="block mb-1 font-medium">CGPA/Percentage</label>
                    <input
                      type="text"
                      name="cgpa"
                      value={education.cgpa}
                      onChange={(e) => handleChange(index, e)}
                      onFocus={() => handleFocus(index, 'cgpa')}
                      onBlur={handleBlur}
                      className={getInputClasses(index, 'cgpa')}
                      placeholder="e.g., 8.5 or 85%"
                      disabled={dataFetched && !editMode}
                    />
                    {errors[index]?.cgpa && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].cgpa}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(index, 'firstAttempt', 6)}>
                    <label className="block mb-1 font-medium">Passed in First Attempt?</label>
                    <select
                      name="firstAttempt"
                      value={education.firstAttempt}
                      onChange={(e) => handleChange(index, e)}
                      onFocus={() => handleFocus(index, 'firstAttempt')}
                      onBlur={handleBlur}
                      className={getInputClasses(index, 'firstAttempt')}
                      disabled={dataFetched && !editMode}
                    >
                      {firstAttemptOptions.map(option => (
                        <option key={option} value={option}>{option === 'yes' ? 'Yes' : 'No'}</option>
                      ))}
                    </select>
                    {errors[index]?.firstAttempt && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].firstAttempt}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Only show the Save button if in edit mode or no data has been fetched yet */}
            {(!dataFetched || editMode) && (
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Education Details'}
                </button>
              </div>
            )}
          </form>
        </div>
      ) : (
        <PHDForm />
      )}
    </div>
  );
};

export default EducationForm;