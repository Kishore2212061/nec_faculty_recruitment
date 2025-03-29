import React, { useState, useEffect } from 'react';
import PHDForm from './PHDForm';
import axios from 'axios';

interface PivotedEducationData {
  id?: number;
  user_id?: number;
  
  // 10th
  tenth_institution: string;
  tenth_university: string;
  tenth_medium: string;
  tenth_specialization: string;
  tenth_cgpa_percentage: string;
  tenth_first_attempt: string;
  tenth_year: string;
  
  // 12th
  twelfth_institution: string;
  twelfth_university: string;
  twelfth_medium: string;
  twelfth_specialization: string;
  twelfth_cgpa_percentage: string;
  twelfth_first_attempt: string;
  twelfth_year: string;
  
  // UG
  ug_institution: string;
  ug_university: string;
  ug_medium: string;
  ug_specialization: string;
  ug_cgpa_percentage: string;
  ug_first_attempt: string;
  ug_year: string;
  
  // PG
  pg_institution: string;
  pg_university: string;
  pg_medium: string;
  pg_specialization: string;
  pg_cgpa_percentage: string;
  pg_first_attempt: string;
  pg_year: string;
}

interface FormErrors {
  [key: string]: string;
}

const EducationForm: React.FC = () => {
  // Assume user ID is available from context/props/local storage
  const userId = 1; // Replace with actual user ID retrieval

  // Initialize with empty fields for all education levels
  const [educationData, setEducationData] = useState<PivotedEducationData>({
    // 10th
    tenth_institution: '',
    tenth_university: '',
    tenth_medium: '',
    tenth_specialization: '',
    tenth_cgpa_percentage: '',
    tenth_first_attempt: 'yes',
    tenth_year: '',
    
    // 12th
    twelfth_institution: '',
    twelfth_university: '',
    twelfth_medium: '',
    twelfth_specialization: '',
    twelfth_cgpa_percentage: '',
    twelfth_first_attempt: 'yes',
    twelfth_year: '',
    
    // UG
    ug_institution: '',
    ug_university: '',
    ug_medium: '',
    ug_specialization: '',
    ug_cgpa_percentage: '',
    ug_first_attempt: 'yes',
    ug_year: '',
    
    // PG
    pg_institution: '',
    pg_university: '',
    pg_medium: '',
    pg_specialization: '',
    pg_cgpa_percentage: '',
    pg_first_attempt: 'yes',
    pg_year: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'education' | 'phd'>('education');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const mediumOptions = ['Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Other'];
  const firstAttemptOptions = ['yes', 'no'];

  // Define the education levels for iterating in the UI
  const educationLevels = [
    { title: '10th', prefix: 'tenth_' },
    { title: '12th', prefix: 'twelfth_' },
    { title: 'UG', prefix: 'ug_' },
    { title: 'PG', prefix: 'pg_' }
  ];

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
      
      if (response.data && Object.keys(response.data).length > 0) {
        setEducationData(response.data);
        setDataFetched(true);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error fetching education data:', error);
      setApiError('Failed to load your education data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation function
  const validateField = (name: string, value: any): string => {
    // Convert value to string safely before using trim()
    const strValue = value !== null && value !== undefined ? String(value) : '';
    
    // Extract the field type from the name (e.g., 'institution' from 'tenth_institution')
    const fieldType = name.split('_').slice(1).join('_');
    
    switch (fieldType) {
      case 'institution':
      case 'university':
      case 'medium':
        return strValue.trim() === '' ? `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} is required` : '';
      case 'specialization':
        return strValue.trim() === '' ? 'Specialization is required' : '';
      case 'year':
        const yearRegex = /^\d{4}$/;
        if (strValue.trim() === '') return 'Year of completion is required';
        if (!yearRegex.test(strValue)) return 'Please enter a valid 4-digit year';
        const year = parseInt(strValue, 10);
        const currentYear = new Date().getFullYear();
        if (year < 1950 || year > currentYear) return `Year must be between 1950 and ${currentYear}`;
        return '';
      case 'cgpa_percentage':
        const percentageRegex = /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)%?$/;
        const cgpaRegex = /^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/;
        if (strValue.trim() === '') return 'CGPA/Percentage is required';
        if (!percentageRegex.test(strValue) && !cgpaRegex.test(strValue)) 
          return 'Enter valid percentage (0-100%) or CGPA (0-10)';
        return '';
      case 'first_attempt':
        return strValue.trim() === '' ? 'Please select Yes/No' : '';
      default:
        return '';
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEducationData(prev => ({ ...prev, [name]: value }));
    
    const errorMessage = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  // Handle field focus
  const handleFocus = (field: string) => {
    setFocused(field);
  };

  // Handle field blur
  const handleBlur = () => {
    setFocused(null);
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
    const newErrors: FormErrors = {};
    
    // For each education level, validate all fields
    educationLevels.forEach(level => {
      ['institution', 'university', 'medium', 'specialization', 'cgpa_percentage', 'first_attempt', 'year'].forEach(field => {
        const fieldName = `${level.prefix}${field}`;
        const errorMessage = validateField(fieldName, educationData[fieldName as keyof PivotedEducationData]);
        if (errorMessage) {
          newErrors[fieldName] = errorMessage;
          isValid = false;
        }
      });
    });
    
    setErrors(newErrors);
    
    if (isValid) {
      setIsLoading(true);
      setApiError(null);
      
      try {
        // Include user_id in the submission data
        const formData = {
          user_id: userId,
          ...educationData
        };
        
        // Post data to the API
        await axios.post('http://localhost:5000/api/education', formData);
        
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
  const getFormGroupClasses = (fieldName: string, delay: number) => {
    let baseClasses = "transition-all duration-300 mb-4";
    
    // Add animation delay for staggered entrance
    const delayStyle = { animationDelay: `${delay * 0.1}s` };
    
    // Add error class if there's an error
    if (errors[fieldName]) {
      baseClasses += " error-field";
    }
    
    // Add focus class
    if (focused === fieldName) {
      baseClasses += " text-indigo-600 font-semibold";
    }
    
    return {
      className: baseClasses,
      style: delayStyle
    };
  };

  // Helper function to get input classes
  const getInputClasses = (fieldName: string) => {
    let baseClasses = "w-full px-3 py-3 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    
    // Add disabled styling if not in edit mode and data has been fetched
    if (dataFetched && !editMode) {
      baseClasses += " bg-gray-100 cursor-not-allowed";
    }
    
    // Add error styling if there's an error
    if (errors[fieldName]) {
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
            {educationLevels.map((level, levelIndex) => (
              <div key={level.title} className="mb-8 p-4 border-l-4 border-indigo-500 bg-gray-50 rounded-md">
                <h3 className="text-xl font-bold mb-4">{level.title} Education</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div {...getFormGroupClasses(`${level.prefix}institution`, levelIndex * 7 + 0)}>
                    <label className="block mb-1 font-medium">Institution Name</label>
                    <input
                      type="text"
                      name={`${level.prefix}institution`}
                      value={educationData[`${level.prefix}institution` as keyof PivotedEducationData] as string}
                      onChange={handleChange}
                      onFocus={() => handleFocus(`${level.prefix}institution`)}
                      onBlur={handleBlur}
                      className={getInputClasses(`${level.prefix}institution`)}
                      disabled={dataFetched && !editMode}
                    />
                    {errors[`${level.prefix}institution`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${level.prefix}institution`]}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(`${level.prefix}university`, levelIndex * 7 + 1)}>
                    <label className="block mb-1 font-medium">University/Board</label>
                    <input
                      type="text"
                      name={`${level.prefix}university`}
                      value={educationData[`${level.prefix}university` as keyof PivotedEducationData] as string}
                      onChange={handleChange}
                      onFocus={() => handleFocus(`${level.prefix}university`)}
                      onBlur={handleBlur}
                      className={getInputClasses(`${level.prefix}university`)}
                      disabled={dataFetched && !editMode}
                    />
                    {errors[`${level.prefix}university`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${level.prefix}university`]}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(`${level.prefix}medium`, levelIndex * 7 + 2)}>
                    <label className="block mb-1 font-medium">Medium of Instruction</label>
                    <select
                      name={`${level.prefix}medium`}
                      value={educationData[`${level.prefix}medium` as keyof PivotedEducationData] as string}
                      onChange={handleChange}
                      onFocus={() => handleFocus(`${level.prefix}medium`)}
                      onBlur={handleBlur}
                      className={getInputClasses(`${level.prefix}medium`)}
                      disabled={dataFetched && !editMode}
                    >
                      <option value="">Select medium</option>
                      {mediumOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors[`${level.prefix}medium`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${level.prefix}medium`]}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(`${level.prefix}specialization`, levelIndex * 7 + 3)}>
                    <label className="block mb-1 font-medium">Specialization</label>
                    <input
                      type="text"
                      name={`${level.prefix}specialization`}
                      value={educationData[`${level.prefix}specialization` as keyof PivotedEducationData] as string}
                      onChange={handleChange}
                      onFocus={() => handleFocus(`${level.prefix}specialization`)}
                      onBlur={handleBlur}
                      className={getInputClasses(`${level.prefix}specialization`)}
                      disabled={dataFetched && !editMode}
                    />
                    {errors[`${level.prefix}specialization`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${level.prefix}specialization`]}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(`${level.prefix}year`, levelIndex * 7 + 4)}>
                    <label className="block mb-1 font-medium">Year of Completion</label>
                    <input
                      type="text"
                      name={`${level.prefix}year`}
                      value={educationData[`${level.prefix}year` as keyof PivotedEducationData] as string}
                      onChange={handleChange}
                      onFocus={() => handleFocus(`${level.prefix}year`)}
                      onBlur={handleBlur}
                      className={getInputClasses(`${level.prefix}year`)}
                      placeholder="YYYY"
                      disabled={dataFetched && !editMode}
                    />
                    {errors[`${level.prefix}year`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${level.prefix}year`]}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(`${level.prefix}cgpa_percentage`, levelIndex * 7 + 5)}>
                    <label className="block mb-1 font-medium">CGPA/Percentage</label>
                    <input
                      type="text"
                      name={`${level.prefix}cgpa_percentage`}
                      value={educationData[`${level.prefix}cgpa_percentage` as keyof PivotedEducationData] as string}
                      onChange={handleChange}
                      onFocus={() => handleFocus(`${level.prefix}cgpa_percentage`)}
                      onBlur={handleBlur}
                      className={getInputClasses(`${level.prefix}cgpa_percentage`)}
                      placeholder="e.g., 8.5 or 85%"
                      disabled={dataFetched && !editMode}
                    />
                    {errors[`${level.prefix}cgpa_percentage`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${level.prefix}cgpa_percentage`]}</p>
                    )}
                  </div>
                  
                  <div {...getFormGroupClasses(`${level.prefix}first_attempt`, levelIndex * 7 + 6)}>
                    <label className="block mb-1 font-medium">Passed in First Attempt?</label>
                    <select
                      name={`${level.prefix}first_attempt`}
                      value={educationData[`${level.prefix}first_attempt` as keyof PivotedEducationData] as string}
                      onChange={handleChange}
                      onFocus={() => handleFocus(`${level.prefix}first_attempt`)}
                      onBlur={handleBlur}
                      className={getInputClasses(`${level.prefix}first_attempt`)}
                      disabled={dataFetched && !editMode}
                    >
                      {firstAttemptOptions.map(option => (
                        <option key={option} value={option}>{option === 'yes' ? 'Yes' : 'No'}</option>
                      ))}
                    </select>
                    {errors[`${level.prefix}first_attempt`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${level.prefix}first_attempt`]}</p>
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