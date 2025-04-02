import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Publication {
  id?: string;
  journal_type: string;
  journal_name: string;
  publisher: string;
  paper_title: string;
  vol_no: string;
  doi: string;
  publication_date: string;
  impact_factor: string;
}

export default function PublicationsForm() {
  // Retrieve userId from localStorage; default to an empty string if not available
  const userId = localStorage.getItem('userId') || '';

  // Publications state and form state
  const [publications, setPublications] = useState<Publication[]>([]);
  const [editingPublicationId, setEditingPublicationId] = useState<string | null>(null);
  const [publicationForm, setPublicationForm] = useState<Publication>({
    journal_type: '',
    journal_name: '',
    publisher: '',
    paper_title: '',
    vol_no: '',
    doi: '',
    publication_date: '',
    impact_factor: '',
  });

  // Journal type options
  const journalTypeOptions = ['SCI', 'Scopus'];

  // Load publications on mount if userId is available
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/publications/${userId}`)
        .then(res => {
          if (res.data) {
            console.log(res.data);
            setPublications(res.data);
          }
        })
        .catch(err => console.error('Fetch Publications Error:', err));
    }
  }, [userId]);

  // Handle input change for publication fields
  const handlePublicationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPublicationForm({ ...publicationForm, [e.target.name]: e.target.value });
  };

  // Reset the publication form to its initial state
  const resetPublicationForm = () => {
    setPublicationForm({
      journal_type: '',
      journal_name: '',
      publisher: '',
      paper_title: '',
      vol_no: '',
      doi: '',
      publication_date: '',
      impact_factor: '',
    });
  };

  // Add a new publication to the list
  const addPublication = () => {
    if (!publicationForm.journal_name || !publicationForm.paper_title) {
      alert('Please enter journal name and paper title');
      return;
    }
    // Use crypto.randomUUID() for unique id generation (if supported)
    const newPublication: Publication = {
      id: crypto.randomUUID(),
      ...publicationForm,
    };
    setPublications([...publications, newPublication]);
    resetPublicationForm();
  };

  // Begin editing an existing publication
  const editPublication = (publication: Publication) => {
    setEditingPublicationId(publication.id || '');
    setPublicationForm({
      journal_type: publication.journal_type,
      journal_name: publication.journal_name,
      publisher: publication.publisher,
      paper_title: publication.paper_title,
      vol_no: publication.vol_no,
      doi: publication.doi,
      publication_date: publication.publication_date,
      impact_factor: publication.impact_factor,
    });
  };

  // Update the edited publication and reset the form
  const updatePublication = () => {
    if (!editingPublicationId) return;
    const updatedPublications = publications.map(publication =>
      publication.id === editingPublicationId ? { ...publication, ...publicationForm } : publication
    );
    setPublications(updatedPublications);
    cancelPublicationEdit();
  };

  // Delete a publication from the list
  const deletePublication = (id?: string) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this publication?')) {
      setPublications(publications.filter(publication => publication.id !== id));
    }
  };

  // Cancel edit mode and reset form
  const cancelPublicationEdit = () => {
    setEditingPublicationId(null);
    resetPublicationForm();
  };

  // Handle form submission: Save publications to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/publications/${userId}`,
        { publications },
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert('Publications saved successfully ✅');
    } catch (err) {
      console.error('Save Error:', err);
      alert('Failed to save publications ❌');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white">Publications</h2>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-auto">
            <div className="space-y-8">
              {/* Publications Section */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">1</span>
                  Publication Details
                </h3>

                {/* Publication Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Journal Type</label>
                    <select
                      name="journal_type"
                      value={publicationForm.journal_type}
                      onChange={handlePublicationInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    >
                      <option value="">Select</option>
                      {journalTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Journal Name</label>
                    <input
                      type="text"
                      name="journal_name"
                      value={publicationForm.journal_name}
                      onChange={handlePublicationInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter journal name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Publisher</label>
                    <input
                      type="text"
                      name="publisher"
                      value={publicationForm.publisher}
                      onChange={handlePublicationInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter publisher"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Paper Title</label>
                    <input
                      type="text"
                      name="paper_title"
                      value={publicationForm.paper_title}
                      onChange={handlePublicationInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter paper title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Volume Number</label>
                    <input
                      type="text"
                      name="vol_no"
                      value={publicationForm.vol_no}
                      onChange={handlePublicationInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter volume number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">DOI</label>
                    <input
                      type="text"
                      name="doi"
                      value={publicationForm.doi}
                      onChange={handlePublicationInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter DOI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Publication Date</label>
                    <input
                      type="month"
                      name="publication_date"
                      value={publicationForm.publication_date}
                      onChange={handlePublicationInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Impact Factor</label>
                    <input
                      type="text"
                      name="impact_factor"
                      value={publicationForm.impact_factor}
                      onChange={handlePublicationInputChange}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter impact factor"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    {editingPublicationId ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={updatePublication}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                        >
                          Update Publication
                        </button>
                        <button
                          type="button"
                          onClick={cancelPublicationEdit}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={addPublication}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Publication
                      </button>
                    )}
                  </div>
                </div>

                {/* Publications Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Journal Type</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Journal Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Paper Title</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Volume</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Publication Date</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {publications.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                            No publications added yet. Add your first publication above.
                          </td>
                        </tr>
                      ) : (
                        publications.map((publication) => (
                          <tr key={publication.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">{publication.journal_type}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{publication.journal_name}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{publication.paper_title}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{publication.vol_no}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{publication.publication_date}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => editPublication(publication)}
                                  className="p-1 text-blue-500 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deletePublication(publication.id)}
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
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Save Publications
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}