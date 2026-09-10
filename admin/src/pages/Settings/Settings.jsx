import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './Settings.css';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Settings = ({ url }) => {
  const [settings, setSettings] = useState({
    gender: [],
    category: [],
    location: []
  })
  const [openSection, setOpenSection] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editValue, setEditValue] = useState('')

  //Fetch settings from the server
  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/settings/list`)
      if (response.data.success) {
        setSettings({
          gender: response.data.gender || [],
          category: response.data.category || [],
          location: response.data.location || []
        })
      } else {
        toast.error(response.data.message || 'Failed to fetch settings')
      }
    } catch (error) {
      console.error('Fetch settings error:', error)
      toast.error(error.response?.data?.message || 'Error while fetching settings')
    }
  }, [url])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // toggle section for adding new setting
  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null)
      setInputValue('')
    } else {
      setOpenSection(section)
      setInputValue('')
    }
  }

  // handle add new setting
  const handleAdd = async () => {
    if (!inputValue.trim()) {
      toast.error('Please enter a name')
      return
    }
    try {
      const response = await axios.post(`${url}/api/settings/add`,
        {
          type: openSection,
          name: inputValue.trim()
        }
      )
      if (response.data.success) {
        toast.success(response.data.message || 'Added successfully')
        setInputValue('')
        await fetchSettings()
      } else {
        toast.error(response.data.message || 'Failed to add')
      }
    } catch (error) {
      console.error('Add setting error:', error)
      toast.error(error.response?.data?.message || 'Error while adding')
    }
  }

  // handle edit setting
  const handleEdit = (item) => {
    setEditId(item._id)
    setEditValue(item.name)
    setEditMode(true)
  }

  // handle update setting
  const handleUpdate = async () => {
    if (!editValue.trim()) {
      toast.error('Please enter a name')
      return
    }
    try {
      const response = await axios.put(`${url}/api/settings/update/${editId}`,
        {
          name: editValue.trim()
        }
      )
      if (response.data.success) {
        toast.success(response.data.message || 'Updated successfully')
        setEditMode(false)
        setEditId(null)
        setEditValue('')
        await fetchSettings()
      } else {
        toast.error(response.data.message || 'Failed to update')
      }
    } catch (error) {
      console.error('Update setting error:', error)
      toast.error(error.response?.data?.message || 'Error while updating')
    }
  }

  // handle delete setting
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this item?'
    )
    if (!confirmDelete) return
    try {
      const response = await axios.delete(`${url}/api/settings/delete/${id}`)
      if (response.data.success) {
        toast.success(
          response.data.message || 'Deleted successfully'
        )
        await fetchSettings()
      } else {
        toast.error(response.data.message || 'Failed to delete')
      }
    } catch (error) {
      console.error('Delete setting error:', error)
      toast.error(error.response?.data?.message || 'Error while deleting'
      )
    }
  }

  // Define sections for rendering
  const sections = [
    {
      key: 'category',
      title: 'Car Category',
      data: settings.category
    },
    {
      key: 'gender',
      title: 'Gender',
      data: settings.gender
    },
    {
      key: 'location',
      title: 'Car Location',
      data: settings.location
    }
  ]

  return (
    <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
        {/* Settings Page Header */}
        <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
            <h2 className="text-2xl font-bold text-black">
            Settings
            </h2>
        </div>

        {/* SETTINGS SECTIONS */}
        <div className="settings-sections">
            {sections.map((section) => (
            <div className="settings-card" key={section.key}>
                {/* SECTION HEADER */}
                <div className="settings-card-header">
                    <h3>
                        {section.title}
                    </h3>
                    <button type="button" className="add-section-btn"
                        onClick={() => toggleSection(section.key)}>
                        {openSection === section.key ? (
                        <><FaTimes />Close
                        </>
                        ) : (
                        <><FaPlus />Add
                        </>
                        )}
                    </button>
                </div>
                {/* CONTENT */}
                {openSection === section.key && (
                <div className="settings-card-body">
                    {/* ADD INPUT */}
                    <div className="setting-add-form">
                        <input type="text" placeholder="Type here"
                            value={inputValue} onChange={(e) =>
                            setInputValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAdd()
                            }
                            }}/>
                        <button type="button" onClick={handleAdd}>
                            Add
                        </button>
                    </div>
                {/* TABLE */}
                <div className="settings-table">
                    {/* TABLE HEADER */}
                    <div className="settings-table-row settings-table-header">
                        <div>Name</div>
                        <div>Action</div>
                    </div>
                    {/* DATA */}
                    {section.data.length === 0 ? (
                        <div className="no-settings">
                        No {section.title.toLowerCase()} found.
                        </div>
                    ) : (
                        section.data.map((item) => (
                        <div className="settings-table-row"
                            key={item._id}>
                            <div>{item.name}</div>
                            <div className="settings-actions">
                                <button type="button" className="edit-btn"
                                    onClick={() =>handleEdit(item)
                                    }><FaEdit />Edit
                                </button>
                                <button type="button" className="delete-btn"
                                    onClick={() =>handleDelete(item._id)
                                    }><FaTrash />Delete
                                </button>
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>
            )}
        </div>
        ))}
    </div>

    {/* EDIT MODAL */}
    {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditMode(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[500px] p-6"
            onClick={(e) => e.stopPropagation()}>
            {/* Heading */}
            <div className="relative bg-blue-100 p-3 rounded mb-6">
              <h3 className="text-2xl font-bold text-black">
                Edit Setting
              </h3>
              <button type="button"
                onClick={() =>
                  setEditMode(false)
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black text-xl">
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Name
              </label>
              <input type="text" value={editValue}
                onChange={(e) =>
                  setEditValue(e.target.value)
                }
                className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                placeholder="Type here"/>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={handleUpdate}
                className="w-1/2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-medium">
                UPDATE
              </button>
              <button type="button" onClick={() => {
                  setEditMode(false)
                  setEditId(null)
                  setEditValue('')
                }}
                className="w-1/2 p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-sm font-medium">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings