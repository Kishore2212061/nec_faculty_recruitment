import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile menu button with improved styling */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 rounded-xl bg-white text-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-100"
        aria-label="Toggle menu"
      >
      </button>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Show instructions ONLY on /dashboard route */}
        {location.pathname === '/dashboard' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 sm:px-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome to Faculty Portal
                </h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  Please read the following instructions carefully before proceeding with your application
                </p>
              </div>

              {/* Instructions Content */}
              <div className="flex-1 p-6 sm:p-8">
                <div className="space-y-8">
                  {/* General Instructions Section */}
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 inline-flex items-center justify-center mr-3 text-sm">1</span>
                      General Instructions
                    </h3>
                    <ul className="list-none space-y-3 text-gray-700 pl-11">
                      <li className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Applications are invited only from candidates who completed both UG and PG through Regular Stream in Anna University Affiliated colleges, NITs, IITs, and other state/central universities.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span><strong>Engineering Discipline:</strong> Candidates who passed all subjects in the first attempt in every semester (VIII semesters for UG, IV semesters for PG) are preferred.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span><strong>Arts Discipline:</strong> Candidates who passed all subjects in the first attempt in every semester (VI semesters for UG, IV semesters for PG) are preferred.</span>
                      </li>
                    </ul>
                  </section>

                  {/* Other Instructions Section */}
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 inline-flex items-center justify-center mr-3 text-sm">2</span>
                      Important Guidelines
                    </h3>
                    <ul className="list-none space-y-3 text-gray-700 pl-11">
                      <li className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Applications must be submitted online at <a href="https://www.nec.edu.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">www.nec.edu.in</a> only.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Candidates for Assistant Professor should be below 35 years of age.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>For clarifications, contact <a href="mailto:facultyportal@nec.edu.in" className="text-blue-600 hover:text-blue-700 underline">facultyportal@nec.edu.in</a></span>
                      </li>
                    </ul>
                  </section>

                  {/* Contact Section */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h4>
                    <p className="text-blue-700 mb-4">
                      If you have any questions or need assistance, our support team is here to help.
                    </p>
                    <a 
                      href="mailto:facultyportal@nec.edu.in"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Contact Support
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <button
                      onClick={() => navigate('application-form')}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Begin Application Process
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
}