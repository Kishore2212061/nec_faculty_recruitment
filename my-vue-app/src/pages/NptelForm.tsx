import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Course {
  id?: string;
  courseId?: number;
  courseName: string;
  platform: string;
  duration: string;
  scoreEarned: string;
}

export default function CourseAndInfoForm() {
  // Retrieve userId from localStorage; default to an empty string if not available
  const userId = localStorage.getItem('userId') || '';

  // Courses state and form state
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<Course>({
    courseName: '',
    platform: 'NPTEL',
    duration: '4 weeks',
    scoreEarned: '',
  });

  // Additional info state
  const [additionalInfo, setAdditionalInfo] = useState({
    family: '',
    reference: '',
    anyOtherInfo: '',
    awardsDetails: '',
    noOfAwards: 0,
  });

  // Duration options for courses
  const durationOptions = ['4 weeks', '8 weeks', '12 weeks', '16 weeks', '20 weeks'];

  // Load courses and additional info on mount if userId is available
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/courses/${userId}`)
        .then(res => {
          if (res.data) {
            setCourses(res.data);
          }
        })
        .catch(err => console.error('Fetch Courses Error:', err));

      axios.get(`http://localhost:5000/api/user-info/${userId}`)
        .then(res => {
          if (res.data) {
            setAdditionalInfo({ family: res.data.family || '', reference: res.data.reference || '', anyOtherInfo: res.data. any_other_info || '', awardsDetails: res.data.awards_details || '', noOfAwards: res.data. no_of_awards || 0 }); } })
        .catch(err => console.error('Fetch Additional Info Error:', err));
    }
  }, [userId]);

  // Handle input change for course fields
  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
  };

  // Handle input change for additional info fields
  const handleAdditionalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'noOfAwards' ? Number(e.target.value) || 0 : e.target.value;
    setAdditionalInfo({ ...additionalInfo, [e.target.name]: value });
  };

  // Reset the course form to its initial state
  const resetCourseForm = () => {
    setCourseForm({
      courseName: '',
      platform: 'NPTEL',
      duration: '4 weeks',
      scoreEarned: '',
    });
  };

  // Add a new course to the list
  const addCourse = () => {
    if (!courseForm.courseName) {
      alert('Please enter a course name');
      return;
    }
    // Use crypto.randomUUID() for unique id generation (if supported)
    const newCourse: Course = {
      id: crypto.randomUUID(),
      ...courseForm,
    };
    setCourses([...courses, newCourse]);
    resetCourseForm();
  };

  // Begin editing an existing course
  const editCourse = (course: Course) => {
    setEditingCourseId(course.id || '');
    setCourseForm({
      courseName: course.courseName,
      platform: 'NPTEL',
      duration: course.duration,
      scoreEarned: course.scoreEarned,
    });
  };

  // Update the edited course and reset the form
  const updateCourse = () => {
    if (!editingCourseId) return;
    const updatedCourses = courses.map(course =>
      course.id === editingCourseId ? { ...course, ...courseForm } : course
    );
    setCourses(updatedCourses);
    cancelCourseEdit();
  };

  // Delete a course from the list
  const deleteCourse = (id?: string) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  // Cancel edit mode and reset form
  const cancelCourseEdit = () => {
    setEditingCourseId(null);
    resetCourseForm();
  };

  // Handle form submission: Save courses and additional info to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/courses/${userId}`,
        { courses },
        { headers: { 'Content-Type': 'application/json' } }
      );
      await axios.post(
        `http://localhost:5000/api/user-info/${userId}`,
        { ...additionalInfo, userId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert('Data saved successfully ✅');
    } catch (err) {
      console.error('Save Error:', err);
      alert('Failed to save data ❌');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white">Courses & Family Information</h2>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-auto">
            <div className="space-y-8">
              {/* Courses Section */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">1</span>
                  Courses
                </h3>

                {/* Course Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Course Name</label>
                    <input
                      type="text"
                      name="courseName"
                      value={courseForm.courseName}
                      onChange={handleCourseInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter course name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Platform</label>
                    <input
                      type="text"
                      name="platform"
                      value="NPTEL"
                      className="w-full p-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
                    <select
                      name="duration"
                      value={courseForm.duration}
                      onChange={handleCourseInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    >
                      {durationOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Score Earned</label>
                    <input
                      type="text"
                      name="scoreEarned"
                      value={courseForm.scoreEarned}
                      onChange={handleCourseInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="e.g., 85%"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    {editingCourseId ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={updateCourse}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                        >
                          Update Course
                        </button>
                        <button
                          type="button"
                          onClick={cancelCourseEdit}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={addCourse}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Course
                      </button>
                    )}
                  </div>
                </div>

                {/* Courses Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Course Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Platform</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Score</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {courses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                            No courses added yet. Add your first course above.
                          </td>
                        </tr>
                      ) : (
                        courses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">{course.courseName}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{course.platform}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{course.duration}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{course.scoreEarned}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => editCourse(course)}
                                  className="p-1 text-blue-500 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteCourse(course.id)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Family Details Section */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-2">2</span>
                  Family Details
                </h3>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Family Information
                  </label>
                  <textarea
                    name="family"
                    value={additionalInfo.family}
                    onChange={handleAdditionalInfoChange}
                    className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white h-40"
                    placeholder="Enter information about your family members (names, relationships, occupations, etc.)"
                  ></textarea>
                  <p className="mt-2 text-sm text-gray-500">
                    Please provide details about your family members, including their names, relationships, occupations, and contact information.
                  </p>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                  <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2">3</span>
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      References
                    </label>
                    <textarea
                      name="reference"
                      value={additionalInfo.reference}
                      onChange={handleAdditionalInfoChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white h-32"
                      placeholder="Professional or academic references"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Any Other Information
                    </label>
                    <textarea
                      name="anyOtherInfo"
                      value={additionalInfo.anyOtherInfo}
                      onChange={handleAdditionalInfoChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white h-32"
                      placeholder="Any other relevant information you'd like to share"
                    ></textarea>
                  </div>
                </div>

                {/* Awards Information */}
                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Awards Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Number of Awards</label>
                      <input
                        type="number"
                        name="noOfAwards"
                        value={additionalInfo.noOfAwards}
                        onChange={handleAdditionalInfoChange}
                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Awards Details</label>
                      <textarea
                        name="awardsDetails"
                        value={additionalInfo.awardsDetails}
                        onChange={handleAdditionalInfoChange}
                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white h-32"
                        placeholder="Details of awards received"
                      ></textarea>
                    </div>
                  </div>
                </div>
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