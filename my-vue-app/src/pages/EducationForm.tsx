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
  tenth_cgpa_percentage: string;
  tenth_first_attempt: string;
  tenth_year: string;
  
  // 12th
  twelfth_institution: string;
  twelfth_university: string;
  twelfth_medium: string;
  twelfth_cgpa_percentage: string;
  twelfth_first_attempt: string;
  twelfth_year: string;
  
  // UG
  ug_institution: string;
  ug_university: string;
  ug_medium: string;
  ug_specialization: string;
  ug_degree: string;
  ug_cgpa_percentage: string;
  ug_first_attempt: string;
  ug_year: string;
  
  // PG
  pg_institution: string;
  pg_university: string;
  pg_medium: string;
  pg_specialization: string;
  pg_degree: string;
  pg_cgpa_percentage: string;
  pg_first_attempt: string;
  pg_year: string;
  
  // M.Phil
  mphil_institution: string;
  mphil_university: string;
  mphil_medium: string;
  mphil_specialization: string;
  mphil_degree: string;
  mphil_cgpa_percentage: string;
  mphil_first_attempt: string;
  mphil_year: string;
}

interface FormErrors {
  [key: string]: string;
}

const EducationForm: React.FC = () => {
  // Assume user ID is available from context/props/local storage
  const userId = localStorage.getItem('userId');

  // Initialize with empty fields for all education levels
  const initialFormState: PivotedEducationData = {
    // 10th
    tenth_institution: '',
    tenth_university: '',
    tenth_medium: '',
    tenth_cgpa_percentage: '',
    tenth_first_attempt: 'yes',
    tenth_year: '',
    
    // 12th
    twelfth_institution: '',
    twelfth_university: '',
    twelfth_medium: '',
    twelfth_cgpa_percentage: '',
    twelfth_first_attempt: 'yes',
    twelfth_year: '',
    
    // UG
    ug_institution: '',
    ug_university: '',
    ug_medium: '',
    ug_specialization: '',
    ug_degree: '',
    ug_cgpa_percentage: '',
    ug_first_attempt: 'yes',
    ug_year: '',
    
    // PG
    pg_institution: '',
    pg_university: '',
    pg_medium: '',
    pg_specialization: '',
    pg_degree: '',
    pg_cgpa_percentage: '',
    pg_first_attempt: 'yes',
    pg_year: '',
    
    // M.Phil
    mphil_institution: '',
    mphil_university: '',
    mphil_medium: '',
    mphil_specialization: '',
    mphil_degree: '',
    mphil_cgpa_percentage: '',
    mphil_first_attempt: 'yes',
    mphil_year: '',
  };
  
  const [educationData, setEducationData] = useState<PivotedEducationData>(initialFormState);
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
  const degreeOptions = ['B.Sc.', 'B.Tech', 'B.E.', 'B.A.', 'B.Com', 'BBA', 'BCA', 'M.Sc.', 'M.Tech', 'M.E.', 'M.A.', 'M.Com', 'MBA', 'MCA', 'M.Phil'];

  // Define the education levels for iterating in the UI
  const educationLevels = [
    { title: '10th', prefix: 'tenth_', hasDegree: false, hasSpecialization: false },
    { title: '12th', prefix: 'twelfth_', hasDegree: false, hasSpecialization: false },
    { title: 'UG', prefix: 'ug_', hasDegree: true, hasSpecialization: true },
    { title: 'PG', prefix: 'pg_', hasDegree: true, hasSpecialization: true },
    { title: 'M.Phil', prefix: 'mphil_', hasDegree: true, hasSpecialization: true }
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
    } catch (error: any) {
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
    const fieldParts = name.split('_');
    const level = fieldParts[0];
    const fieldType = fieldParts.slice(1).join('_');
    
    // Skip validation for M.Phil fields if they're empty (M.Phil is optional)
    if (level === 'mphil' && strValue.trim() === '') {
      return '';
    }
    
    switch (fieldType) {
      case 'institution':
      case 'university':
      case 'medium':
        return strValue.trim() === '' ? `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} is required` : '';
      case 'specialization':
        // Only validate specialization for UG, PG, and M.Phil
        if (['ug', 'pg', 'mphil'].includes(level)) {
          return strValue.trim() === '' ? 'Specialization is required' : '';
        }
        return '';
      case 'degree':
        // Only validate degree for UG, PG, and M.Phil
        if (['ug', 'pg', 'mphil'].includes(level)) {
          return strValue.trim() === '' ? 'Degree is required' : '';
        }
        return '';
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

  // Check if a level has any valid data
  const levelHasData = (prefix: string): boolean => {
    const relevantKeys = Object.keys(educationData).filter(key => key.startsWith(prefix));
    return relevantKeys.some(key => {
      const value = educationData[key as keyof PivotedEducationData];
      return typeof value === 'string' && value.trim() !== '';
    });
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    const newErrors: FormErrors = {};
    
    // For each education level, validate all fields
    educationLevels.forEach(level => {
      // Skip validation for M.Phil if all M.Phil fields are empty
      if (level.prefix === 'mphil_' && !levelHasData('mphil_')) {
        return;
      }
      
      // Determine which fields to validate based on the education level
      const basicFields = ['institution', 'university', 'medium', 'cgpa_percentage', 'first_attempt', 'year'];
      let fieldsToValidate = [...basicFields];
      
      if (level.hasDegree) {
        fieldsToValidate.push('degree');
      }
      
      if (level.hasSpecialization) {
        fieldsToValidate.push('specialization');
      }
      
      fieldsToValidate.forEach(field => {
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
        
        setIsSubmitted(true);
        setEditMode(false); // Return to view mode after successful submission
      } catch (error: any) {
        console.error('Error submitting education data:', error);
        setApiError(error.response?.data?.error || 'Failed to save your education data. Please try again.');
        
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
      
      // Scroll to the first error
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Delete education record
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your education record? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await axios.delete(`http://localhost:5000/api/education/${userId}`);
        
        // Reset form after deletion
        setEducationData(initialFormState);
        setDataFetched(false);
        setEditMode(true);
        setIsSubmitted(false);
        setErrors({});
        
        // Show success message
        alert('Education record deleted successfully');
      } catch (error: any) {
        console.error('Error deleting education record:', error);
        setApiError(error.response?.data?.error || 'Failed to delete your education record. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    editMode 
                      ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  disabled={isLoading}
                >
                  {editMode ? 'Cancel Edit' : 'Edit Details'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
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
                  
                  {/* Specialization field only for UG, PG, and M.Phil */}
                  {level.hasSpecialization && (
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
                  )}
                  
                  {/* Degree field for UG, PG, and M.Phil */}
                  {level.hasDegree && (
                    <div {...getFormGroupClasses(`${level.prefix}degree`, levelIndex * 7 + 4)}>
                      <label className="block mb-1 font-medium">Degree</label>
                      <select
                        name={`${level.prefix}degree`}
                        value={educationData[`${level.prefix}degree` as keyof PivotedEducationData] as string}
                        onChange={handleChange}
                        onFocus={() => handleFocus(`${level.prefix}degree`)}
                        onBlur={handleBlur}
                        className={getInputClasses(`${level.prefix}degree`)}
                        disabled={dataFetched && !editMode}
                      >
                        <option value="">Select degree</option>
                        {degreeOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      {errors[`${level.prefix}degree`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`${level.prefix}degree`]}</p>
                      )}
                    </div>
                  )}
                  
                  <div {...getFormGroupClasses(`${level.prefix}year`, levelIndex * 7 + 5)}>
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
                  
                  <div {...getFormGroupClasses(`${level.prefix}cgpa_percentage`, levelIndex * 7 + 6)}>
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
                  
                  <div {...getFormGroupClasses(`${level.prefix}first_attempt`, levelIndex * 7 + 7)}>
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
