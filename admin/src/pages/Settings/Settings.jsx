import React, { useCallback, useEffect, useState } from 'react';
import upload_area from '../../assets/upload_area.png';
import axios from 'axios';
import './Settings.css';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Settings = ({ url }) => {
    const [settings, setSettings] = useState({
        gender: [],
        category: [],
        location: []
    });
    const [openSection, setOpenSection] = useState(null);
    // Add state
    const [inputValue, setInputValue] = useState('');
    const [addImage, setAddImage] = useState(null);
    // Edit state
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editType, setEditType] = useState(null);
    const [editImage, setEditImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);

    // Image validation
    const ALLOWED_IMAGE_TYPES = ['image/jpeg','image/jpg','image/png'];
    const MAX_IMAGE_SIZE_MB = 25;
    const validateImageFile = (file) => {
        if (!file) {
            return false;
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error('Only JPG, JPEG or PNG images are allowed');
            return false;
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            toast.error(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`);
            return false;
        }
        return true;
    };

    // Fetch settings
    const fetchSettings = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/settings/list`);
            if (response.data.success) {
                setSettings({
                    gender: response.data.gender || [],
                    category: response.data.category || [],
                    location: response.data.location || []
                });
            } else {
                toast.error(response.data.message || 'Failed to fetch settings');
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
            toast.error(error.response?.data?.message || 'Error while fetching settings');
        }
    }, [url]);
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Toggle section
    const toggleSection = (section) => {
        if (openSection === section) {
            setOpenSection(null);
            setInputValue('');
            setAddImage(null);
        } else {
            setOpenSection(section);
            setInputValue('');
            setAddImage(null);
        }
    };

    // Handle add
    const handleAdd = async () => {
        // Validate name
        if (!inputValue.trim()) {
            toast.error('Please enter a name');
            return;
        }
        // Category image required
        if (openSection === 'category' && !addImage) {
            toast.error('Please upload a category image');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('type', openSection);
            formData.append('name', inputValue.trim());
            // Add image only for category
            if (openSection === 'category' && addImage) {
                formData.append('image', addImage);
            }
            const response = await axios.post(`${url}/api/settings/add`, formData);
            if (response.data.success) {
                toast.success(response.data.message || 'Added successfully');
                // Reset
                setInputValue('');
                setAddImage(null);
                // Refresh
                await fetchSettings();
            } else {
                toast.error(response.data.message || 'Failed to add');
            }
        } catch (error) {
            console.error('Add setting error:', error);
            toast.error(error.response?.data?.message || 'Error while adding');
        }
    };

    // Handle edit
    const handleEdit = (item, type) => {
        setEditId(item._id);
        setEditValue(item.name);
        setEditType(type);
        // Existing category image
        setExistingImage(item.image || null);
        // Clear newly selected image
        setEditImage(null);
        setEditMode(true);
    };

    // Close edit modal
    const closeEditModal = () => {
        setEditMode(false);
        setEditId(null);
        setEditValue('');
        setEditType(null);
        setEditImage(null);
        setExistingImage(null);
    };

    // Handle update
    const handleUpdate = async () => {
        if (!editValue.trim()) {
            toast.error('Please enter a name');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('name',editValue.trim());
            // Add new image only if selected
            if (editImage) {
                formData.append('image',editImage);
            }
            const response = await axios.put(`${url}/api/settings/update/${editId}`,formData);
            if (response.data.success) {
                toast.success(response.data.message || 'Updated successfully');
                closeEditModal();
                await fetchSettings();
            } else {
                toast.error(response.data.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Update setting error:', error);
            toast.error(error.response?.data?.message || 'Error while updating');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this item?');
        if (!confirmDelete) {
            return;
        }
        try {
            const response = await axios.delete(`${url}/api/settings/delete/${id}`);
            if (response.data.success) {
                toast.success(response.data.message || 'Deleted successfully');
                await fetchSettings();
            } else {
                toast.error(response.data.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Delete setting error:', error);
            toast.error(error.response?.data?.message || 'Error while deleting');
        }
    };

    // Define sections
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
    ];

    return (
        <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
            <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
                <h2 className="text-2xl font-bold text-black">
                    Settings
                </h2>
            </div>
            <div className="settings-sections grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <div className="settings-card" key={section.key}>
                        <div className="settings-card-header">
                            <h3>
                                {section.title}
                            </h3>
                            <button type="button" className="add-section-btn"
                                onClick={() =>
                                    toggleSection(section.key)
                                }>
                                {openSection === section.key ? (
                                    <><FaTimes />Close</>
                                ) : (
                                    <><FaPlus />Add</>
                                )}
                            </button>
                        </div>
                        {openSection === section.key && (
                            <div className="settings-card-body">
                                {section.key === 'category' && (
                                    <div className="setting-image-upload">
                                        <label htmlFor="categoryAddImage" className="setting-image-label">
                                            <img src={addImage
                                                  ? URL.createObjectURL(
                                                      addImage
                                                  )
                                                  : upload_area
                                                }
                                                alt="Category" className="setting-image-preview"/>
                                        </label>
                                        <div className="setting-image-info">
                                            <p className="setting-image-title">
                                                Category Image
                                            </p>
                                            <p className="setting-image-help">
                                                JPG, JPEG or PNG
                                            </p>
                                            <p className="setting-image-help">
                                                Click the image to upload
                                            </p>
                                        </div>
                                        <input type="file" id="categoryAddImage"
                                            accept="image/png, image/jpeg, image/jpg"
                                            hidden onChange={(e) => {
                                                const file =
                                                    e.target.files[0];
                                                if (
                                                    validateImageFile(file)
                                                ) {
                                                    setAddImage(file);
                                                } else {
                                                    e.target.value = '';
                                                }
                                            }}/>
                                    </div>
                                )}

                                {/* Add form for name input and add button */}
                                <div className="setting-add-form">
                                    <input type="text" placeholder={
                                            section.key === 'category'
                                                ? 'Enter Car Category'
                                                : section.key === 'gender'
                                                  ? 'Enter Gender'
                                                  : 'Enter Car Location'
                                        }
                                        value={inputValue}
                                        onChange={(e) =>
                                            setInputValue(
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAdd();
                                            }
                                        }}/>
                                    <button type="button" onClick={handleAdd}>
                                        Add
                                    </button>
                                </div>

                                {/* Table for existing items */}
                                <div className="settings-table">
                                    {/* TABLE HEADER */}
                                    <div className={`settings-table-row settings-table-header ${
                                            section.key === 'category'
                                                ? 'category-table-row'
                                                : ''
                                        }`}>
                                        {section.key === 'category' && (
                                            <div>
                                                Image
                                            </div>
                                        )}
                                        <div>
                                            Name
                                        </div>
                                        <div>
                                            Action
                                        </div>
                                    </div>
                                    {/* TABLE DATA */}
                                    {section.data.length === 0 ? (
                                        <div className="no-settings">
                                            No{' '}
                                            {section.title.toLowerCase()}
                                            {' '}found.
                                        </div>
                                    ) : (
                                        section.data.map((item) => (
                                            <div
                                                className={`settings-table-row ${
                                                    section.key === 'category'
                                                        ? 'category-table-row'
                                                        : ''
                                                }`}
                                                key={item._id}>
                                                {/* CATEGORY IMAGE */}
                                                {section.key === 'category' && (
                                                    <div>
                                                        {item.image ? (
                                                            <img src={`${url}/images/${item.image}`}
                                                                alt={item.name}
                                                                className="category-image"/>
                                                        ) : (
                                                            <img src={upload_area}
                                                                alt="No-image"
                                                                className="category-image"/>
                                                        )}
                                                    </div>
                                                )}
                                                {/* NAME */}
                                                <div>
                                                    {item.name}
                                                </div>
                                                {/* ACTION */}
                                                <div className="settings-actions">
                                                    <button type="button"
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            handleEdit(
                                                                item,
                                                                section.key
                                                            )
                                                        }>
                                                        <FaEdit />
                                                        Edit
                                                    </button>
                                                    <button type="button"
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item._id
                                                            )
                                                        }>
                                                        <FaTrash />
                                                        Delete
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

            {/* Edit modal */}
            {editMode && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={closeEditModal}>
                    <div className="settings-edit-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }>
                        <div className="settings-edit-header">
                            <h3>
                                Edit {editType === 'category'
                                    ? 'Car Category'
                                    : editType === 'gender'
                                        ? 'Gender'
                                        : 'Car Location'}
                            </h3>
                            <button type="button"
                                onClick={closeEditModal}
                                className="settings-edit-close">
                                <FaTimes />
                            </button>
                        </div>
                        {editType === 'category' && (
                            <div className="setting-image-upload">
                                <label htmlFor="categoryEditImage"
                                    className="setting-image-label">
                                    <img src={ editImage
                                          ? URL.createObjectURL(
                                              editImage
                                          )
                                          : existingImage ? `${url}/images/${existingImage}` : upload_area
                                        }
                                        alt="Category" className="setting-image-preview"/>
                                </label>
                                <div className="setting-image-info">
                                    <p className="setting-image-title">
                                        Category Image
                                    </p>
                                    <p className="setting-image-help">
                                        Click image to change
                                    </p>
                                    <p className="setting-image-help">
                                        JPG, JPEG or PNG
                                    </p>
                                </div>
                                <input type="file" id="categoryEditImage"
                                    accept="image/png, image/jpeg, image/jpg"
                                    hidden onChange={(e) => {
                                        const file =
                                            e.target.files[0];
                                        if (
                                            validateImageFile(file)
                                        ) {
                                            setEditImage(file);
                                        } else {
                                            e.target.value = '';
                                        }
                                    }}/>
                            </div>
                        )}

                        <div className="settings-edit-field">
                            <label>
                                Name
                            </label>
                            <input type="text" value={editValue}
                                onChange={(e) =>
                                    setEditValue(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter name"/>
                        </div>
                        <div className="settings-edit-buttons">
                            <button type="button" onClick={handleUpdate}
                                className="settings-update-btn">UPDATE
                            </button>
                            <button type="button" onClick={closeEditModal}
                                className="settings-cancel-btn">
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;