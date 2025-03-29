import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Building2, Briefcase, DollarSign, Plus, Save, Pencil, Trash2, AlertCircle, ArrowUp, ArrowDown, Check } from 'lucide-react';

interface Experience {
  id?: number;
  experienceType: string;
  organization: string;
  postHeld: string;
  salaryDrawn: string;
  fromDate: string;
  toDate: string;
  isEditing?: boolean;
}

interface Props {
  userId: number;
}

export default function ExperienceForm({ userId }: Props) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [errors, setErrors] = useState<{[key: string]: {[field: string]: boolean}}>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/experience/${userId}`);
        if (res.data.length) {
          const dataWithEditFlag = res.data.map((exp: Experience) => ({
            ...exp,
            isEditing: false,
          }));
          setExperiences(dataWithEditFlag);
        }
      } catch (err) {
        console.error('Failed to fetch experience');
      }
    };
    fetchData();
  }, [userId]);

  const validateExperience = (experience: Experience, index: number) => {
    const newErrors: {[field: string]: boolean} = {};
    
    if (!experience.experienceType) newErrors.experienceType = true;
    if (!experience.organization) newErrors.organization = true;
    if (!experience.postHeld) newErrors.postHeld = true;
    if (!experience.salaryDrawn) newErrors.salaryDrawn = true;
    if (!experience.fromDate) newErrors.fromDate = true;
    if (!experience.toDate) newErrors.toDate = true;
    
    setErrors(prev => ({...prev, [index]: newErrors}));
    
    return Object.keys(newErrors).length === 0;
  };

  const validateAllExperiences = () => {
    let isValid = true;
    const newErrors: {[key: string]: {[field: string]: boolean}} = {};
    
    experiences.forEach((experience, index) => {
      if (!validateExperience(experience, index)) {
        isValid = false;
        newErrors[index] = errors[index] || {};
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [name]: value } : exp))
    );
    
    // Clear error for this field if it has a value now
    if (value && errors[index] && errors[index][name]) {
      const updatedErrors = {...errors};
      updatedErrors[index][name] = false;
      setErrors(updatedErrors);
    }
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        experienceType: '',
        organization: '',
        postHeld: '',
        salaryDrawn: '',
        fromDate: '',
        toDate: '',
        isEditing: true,
      },
    ]);
  };

  const deleteExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
    
    // Remove errors for deleted experience
    const newErrors = {...errors};
    delete newErrors[index];
    setErrors(newErrors);
  };

  const toggleEdit = (index: number) => {
    // Validate before leaving edit mode
    if (experiences[index].isEditing) {
      const isValid = validateExperience(experiences[index], index);
      if (!isValid) {
        return;
      }
    }
    
    setExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, isEditing: !exp.isEditing } : exp))
    );
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === experiences.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedExperiences = [...experiences];
    const temp = updatedExperiences[index];
    updatedExperiences[index] = updatedExperiences[newIndex];
    updatedExperiences[newIndex] = temp;
    
    setExperiences(updatedExperiences);
    
    // Update errors indices as well
    if (errors[index] || errors[newIndex]) {
      const newErrors = {...errors};
      const tempError = newErrors[index];
      newErrors[index] = newErrors[newIndex];
      newErrors[newIndex] = tempError;
      setErrors(newErrors);
    }
  };

  const handleSave = async () => {
    setFormSubmitted(true);
    
    if (!validateAllExperiences()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      await axios.post(`http://localhost:5000/api/experience/${userId}`, experiences);
      alert('Experience Saved ✅');
      setExperiences((prev) => prev.map((exp) => ({ ...exp, isEditing: false })));
      setFormSubmitted(false);
    } catch (err) {
      alert('Failed to save');
    }
  };

  return (
    <div className="bg-gray-50">
      <div>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              Experience Details
            </h2>
          </div>

          <div className="p-6">
            {experiences.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-8"></th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Experience Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Organization</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Post Held</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Salary</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.map((exp, idx) => (
                      <tr key={idx} 
                          className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${exp.isEditing ? 'bg-blue-50' : ''}`}>
                        {/* Move Up/Down controls */}
                        <td className="px-2 py-3 text-gray-700 align-middle">
                          <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => moveExperience(idx, 'up')}
                              disabled={idx === 0}
                              className={`p-1 rounded ${idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}>
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => moveExperience(idx, 'down')}
                              disabled={idx === experiences.length - 1}
                              className={`p-1 rounded ${idx === experiences.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}>
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Experience Type */}
                        <td className="px-4 py-3">
                          {exp.isEditing ? (
                            <div>
                              <select
                                name="experienceType"
                                value={exp.experienceType}
                                onChange={(e) => handleChange(idx, e)}
                                className={`w-full px-3 py-2 border ${
                                  errors[idx]?.experienceType ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                required
                              >
                                <option value="">Select Type</option>
                                <option value="Teaching">Teaching</option>
                                <option value="Industry">Industry</option>
                              </select>
                              {errors[idx]?.experienceType && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-1" /> Required
                                </p>
                              )}
                            </div>
                          ) : (
                            <span>{exp.experienceType || '—'}</span>
                          )}
                        </td>

                        {/* Organization */}
                        <td className="px-4 py-3">
                          {exp.isEditing ? (
                            <div>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                  name="organization"
                                  placeholder="Organization"
                                  value={exp.organization}
                                  onChange={(e) => handleChange(idx, e)}
                                  className={`w-full pl-10 pr-3 py-2 border ${
                                    errors[idx]?.organization ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                  } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                  required
                                />
                              </div>
                              {errors[idx]?.organization && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-1" /> Required
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span>{exp.organization || '—'}</span>
                            </div>
                          )}
                        </td>

                        {/* Post Held */}
                        <td className="px-4 py-3">
                          {exp.isEditing ? (
                            <div>
                              <input
                                name="postHeld"
                                placeholder="Position"
                                value={exp.postHeld}
                                onChange={(e) => handleChange(idx, e)}
                                className={`w-full px-3 py-2 border ${
                                  errors[idx]?.postHeld ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                required
                              />
                              {errors[idx]?.postHeld && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-1" /> Required
                                </p>
                              )}
                            </div>
                          ) : (
                            <span>{exp.postHeld || '—'}</span>
                          )}
                        </td>

                        {/* Salary */}
                        <td className="px-4 py-3">
                          {exp.isEditing ? (
                            <div>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                  name="salaryDrawn"
                                  placeholder="Salary"
                                  value={exp.salaryDrawn}
                                  onChange={(e) => handleChange(idx, e)}
                                  className={`w-full pl-10 pr-3 py-2 border ${
                                    errors[idx]?.salaryDrawn ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                  } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                  required
                                />
                              </div>
                              {errors[idx]?.salaryDrawn && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-1" /> Required
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span>{exp.salaryDrawn || '—'}</span>
                            </div>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3">
                          {exp.isEditing ? (
                            <div className="space-y-2">
                              <div>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                  <input
                                    name="fromDate"
                                    type="date"
                                    value={exp.fromDate}
                                    onChange={(e) => handleChange(idx, e)}
                                    className={`w-full pl-10 pr-3 py-2 border ${
                                      errors[idx]?.fromDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                    } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    required
                                  />
                                </div>
                                {errors[idx]?.fromDate && (
                                  <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> Required
                                  </p>
                                )}
                              </div>
                              <div>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                  <input
                                    name="toDate"
                                    type="date"
                                    value={exp.toDate}
                                    onChange={(e) => handleChange(idx, e)}
                                    className={`w-full pl-10 pr-3 py-2 border ${
                                      errors[idx]?.toDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                    } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    required
                                  />
                                </div>
                                {errors[idx]?.toDate && (
                                  <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> Required
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{exp.fromDate} — {exp.toDate || 'Present'}</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => toggleEdit(idx)}
                              className={`p-2 rounded-md text-sm font-medium transition-colors
                                ${exp.isEditing 
                                  ? 'bg-green-600 text-white hover:bg-green-700' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                              title={exp.isEditing ? "Save changes" : "Edit"}
                            >
                              {exp.isEditing ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Pencil className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteExperience(idx)}
                              className="p-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No experience records found. Add your first experience.</p>
              </div>
            )}

            {experiences.length === 0 && formSubmitted && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md mt-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Please add at least one experience record
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={addExperience}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" /> Add Experience
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" /> Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}