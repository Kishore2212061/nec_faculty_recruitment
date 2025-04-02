import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalForm from './PersonalForm';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import PublicationsForm from './PublicationsForm';
import NptelForm from './NptelForm';
import { BookOpen, Briefcase, GraduationCap, User, Award, Menu, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const tabs = [
  { id: 'Personal', icon: User },
  { id: 'Education', icon: GraduationCap },
  { id: 'Experience', icon: Briefcase },
  { id: 'Publications', icon: BookOpen },
  { id: 'NPTEL', icon: Award }
];

export default function ApplicationForm() {
  const [activeTab, setActiveTab] = useState('Personal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Check if form is already submitted when component mounts
  useEffect(() => {
    const formSubmitted = localStorage.getItem('formsubmitted');
    if (formSubmitted === '1') {
      setIsFormSubmitted(true);
    }
  }, []);

  const handleSubmit = () => {
    // Show confirmation dialog first
    setShowConfirmation(true);
  };

  const confirmSubmit = async() => {
    // Close the dialog
    setShowConfirmation(false);
    const response = await axios.put(`http://localhost:5000/api/auth/submission/${userId}`);
    console.log(response);
    localStorage.setItem('formsubmitted', '1');
    setIsFormSubmitted(true);
    //if (!response.ok) throw new Error('Failed to submit form');
    // Here you can add any final submission logic if needed
    // For example, validating all sections or sending data to server
    
    // Redirect to application status page
    navigate('/dashboard/application-status');
  };

  const cancelSubmit = () => {
    // Just close the dialog
    setShowConfirmation(false);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'Personal': return <PersonalForm />;
      case 'Education': return <EducationForm />;
      case 'Experience': return <ExperienceForm userId={Number(userId)} />;
      case 'Publications': return <PublicationsForm />;
      case 'NPTEL': return <NptelForm />;
      default: return null;
    }
  };

  // If form is already submitted, show "already submitted" message
  if (isFormSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Already Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your application has been successfully submitted and cannot be edited further.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard/application-status')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                View Application Status
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="min-h-screen flex flex-col p-2 sm:p-4 max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-4 sm:p-6 text-white">
          <h2 className="text-xl sm:text-2xl font-bold">Application Form</h2>
          <p className="text-white/80 mt-1 text-sm sm:text-base">Complete all sections to submit your application</p>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center space-x-2 text-gray-600"
          >
            <Menu className="w-5 h-5" />
            <span>{activeTab}</span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden bg-white border-b border-gray-200 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col">
            {tabs.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium transition-all duration-200
                  ${activeTab === id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 mr-2 ${activeTab === id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tabs Navigation */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-4">
          <div className="flex space-x-2 -mb-px">
            {tabs.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center px-6 py-4 border-b-2 text-sm font-medium transition-all duration-200
                  ${activeTab === id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`w-4 h-4 mr-2 ${activeTab === id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 bg-white rounded-b-2xl overflow-hidden shadow-xl border border-gray-100">
          <div className="h-full overflow-auto p-3 sm:p-6">
            {renderForm()}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            Progress: {tabs.indexOf(tabs.find(t => t.id === activeTab)!) + 1} of {tabs.length}
          </div>
          <div className="flex space-x-3 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={() => {
                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1].id);
                }
              }}
              className="flex-1 sm:flex-none px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
              disabled={activeTab === tabs[0].id}
            >
              Previous
            </button>
            
            {activeTab === 'NPTEL' ? (
              <button
                onClick={handleSubmit}
                className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Submit Application
              </button>
            ) : (
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                  }
                }}
                className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                disabled={activeTab === tabs[tabs.length - 1].id}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Warning</h3>
            <p className="mb-4 text-gray-700">After submission, this form cannot be edited further. Are you sure you want to proceed?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelSubmit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}