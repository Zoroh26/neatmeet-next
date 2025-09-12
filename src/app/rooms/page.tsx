'use client';
import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaDoorOpen, FaSpinner, FaTrash, FaEdit } from 'react-icons/fa';
import { MdMeetingRoom } from 'react-icons/md';
import Modal from 'react-modal';
import { GenericTable } from '../../components/GenericTable';
import { ColumnDef } from '@tanstack/react-table';
import type { Room } from '../../types/index';
import RoomService from '../../services/RoomServices';
import {useQuery} from '@tanstack/react-query';

const classes = {
    // Clean container without overlap issues
    Container: 'min-h-screen bg-white relative',
    
    // Simple background elements that don't interfere
    BackgroundElements: 'absolute inset-0 pointer-events-none overflow-hidden',
    BgShape1: 'absolute top-20 right-20 w-8 h-8 bg-red-500 opacity-20 transform rotate-45',
    BgShape2: 'absolute bottom-40 left-20 w-6 h-6 bg-red-500 opacity-15',
    
    Content: 'mx-auto sm:px-16 px-4 py-16 relative z-10',
    
    // Header Styles
    Header: 'flex justify-between items-center mb-12 -mt-8  sm:gap-0 gap-12',
    HeaderLeft: 'flex flex-col',
    Title: 'sm:text-5xl text-2xl font-black text-black uppercase tracking-widest transform -skew-x-3 mb-2 leading-none',
    TitleAccent: 'text-red-500',
    Subtitle: 'sm:text-lg text-sm font-bold text-white bg-red-500 border-4 border-black px-4 py-2 inline-block shadow-[4px_4px_0px_0px_#000] uppercase tracking-wide transform',
    
    // Add Room Button
    AddButton: 'bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black sm:py-4 leading-none py-2 sm:px-8 px-2 uppercase tracking-widest text-lg shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-3',
    
    // FIXED GRID - proper spacing and no overlap
    Grid: ' w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12 justify-items-center',
    
    // Room Container with Action Buttons (similar to Employees)
    RoomContainer: 'relative group',
    ActionButtons: 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-20',
    DeleteButton: 'bg-red-500 hover:bg-red-600 border-2 border-black text-white p-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200',
    
    // Modal Styles
    ModalOverlay: 'fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4',
    ModalContent: 'bg-white border-4 border-black max-w-3xl w-full shadow-[16px_16px_0px_0px_#000] relative',
    ModalHeader: 'bg-red-500 border-b-4 border-black p-6 flex justify-between items-center',
    ModalTitle: 'text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3',
    CloseButton: 'text-white hover:text-red-200 text-3xl cursor-pointer transform hover:scale-110 transition-all duration-200',
    
    // Form Styles
    ModalBody: 'p-2 px-8',
    Form: 'space-y-6 space-x-4',
    FormRow: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    FormGroup: 'space-y-3',
    Label: 'text-black font-black text-sm uppercase tracking-widest',
    Input: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200',
    TextArea: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200 resize-none h-24',
    
    // Amenities Section
    AmenitiesSection: 'space-y-3',
    Select: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200',
    AmenitiesTitle: 'text-black font-black text-sm uppercase tracking-widest',
    AmenitiesGrid: 'grid grid-cols-2 md:grid-cols-3 gap-2',
    AmenityCheckbox: 'flex items-center space-x-2',
    Checkbox: 'w-4 h-4 border-2 border-black focus:ring-0 focus:ring-offset-0 text-red-500',
    AmenityLabel: 'text-black font-bold text-sm',
    
    // Button Group
    ButtonGroup: 'flex justify-end gap-4 pt-6',
    CancelButton: 'bg-gray-200 hover:bg-gray-300 border-4 border-black text-black font-black py-3 px-6 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200',
    SubmitButton: 'bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black py-3 px-8 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2',
    
    // Messages
    ErrorMessage: 'bg-red-100 border-4 border-red-500 text-red-700 px-4 py-3 font-black uppercase tracking-wide mb-4 shadow-[4px_4px_0px_0px_#ef4444]',
    SuccessMessage: 'bg-green-100 border-4 border-green-500 text-green-700 px-4 py-3 font-black uppercase tracking-wide mb-4 shadow-[4px_4px_0px_0px_#22c55e]',
    
    // Delete Confirmation Modal
    DeleteModalContent: 'bg-white border-4 border-black max-w-md w-full shadow-[16px_16px_0px_0px_#000] relative',
    DeleteModalHeader: 'bg-red-500 border-b-4 border-black p-4 flex justify-between items-center',
    DeleteModalTitle: 'text-xl font-black text-white uppercase tracking-wide flex items-center gap-2',
    DeleteModalBody: 'p-6',
    DeleteModalText: 'text-black font-bold text-center mb-6',
    DeleteModalButtons: 'flex justify-center gap-4',
    CancelDeleteButton: 'bg-gray-500 hover:bg-gray-600 border-4 border-black text-white font-black py-3 px-6 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200',
    ConfirmDeleteButton: 'bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black py-3 px-6 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200',
};

interface AddRoomFormData {
    name: string;
    capacity: number;
    location: string;
    description: string;
    amenities: string[];
}

// List of available amenities for rooms
const AVAILABLE_AMENITIES = [
    "Projector",
    "Whiteboard",
    "TV",
    "Conference Phone",
    "WiFi",
    "Air Conditioning",
    "Coffee Machine",
    "Printer",
    "Video Conferencing",
    "Sound System",
    "Wheelchair Accessible",
    "Water Dispenser"
];

const fetchRooms = async () =>{
    return await RoomService.getAllRooms();
}

// Client-only modal setup to avoid hydration mismatch
function ClientOnlyModalSetup() {
  React.useEffect(() => {
    Modal.setAppElement('body');
  }, []);
  return null;
}

const Rooms: React.FC = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const [globalFilter, setGlobalFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState<string>("");
    // Removed statusFilter
    const [capacityFilter, setCapacityFilter] = useState<string>("");

    // Use TanStack Query for data fetching
    const { data: allRooms, isLoading, error, refetch } = useQuery({
        queryKey: ["rooms"],
        queryFn: fetchRooms,
    });

    // Client-side filtering and pagination
    const filteredRooms = (allRooms || []).filter((room: Room) => {
        let matches = true;
        if (globalFilter) {
            const search = globalFilter.toLowerCase();
            matches = (
                room.name?.toLowerCase().includes(search) ||
                room.location?.toLowerCase().includes(search) ||
                room.description?.toLowerCase().includes(search) ||
                room.amenities?.some(amenity => amenity.toLowerCase().includes(search))
            );
        }
        if (locationFilter) {
            matches = matches && room.location === locationFilter;
        }
    // Removed status filter logic
        if (capacityFilter) {
            matches = matches && String(room.capacity) === capacityFilter;
        }
        return matches;
    });

    const totalItems = filteredRooms.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

    // Reset to first page when filter changes
    useEffect(() => {
        setPageIndex(0);
    }, [globalFilter]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
    const [formData, setFormData] = useState<AddRoomFormData>({
        name: '',
        capacity: 1,
        location: '',
        description: '',
        amenities: []
    });

    // useEffect for Modal.setAppElement is now in ClientOnlyModalSetup

    const columns: ColumnDef<Room>[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: info => <span className="font-bold text-lg">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: info => <span className="text-gray-600">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: info => <span className="italic">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "amenities",
        header: "Amenities",
        cell: info => {
          const amenities = info.getValue() as string[];
          return <span className="text-gray-600">{amenities.join(', ')}</span>;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row, table }) => (
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => handleEditRoom(row.original)} 
              className="bg-blue-500 hover:bg-blue-600 border-2 border-black text-white p-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaEdit size={16} />
            </button>
            <button 
              onClick={() => handleDeleteRoom(row.original)} 
              className="bg-red-500 hover:bg-red-600 border-2 border-black text-white p-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaTrash size={16} />
            </button>
          </div>
        ),
      },
    ];

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setIsEditMode(false);
        setEditingRoomId(null);
        setMessage(null);
        setFormData({
            name: '',
            capacity: 1,
            location: '',
            description: '',
            amenities: []
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingRoomId(null);
        setMessage(null);
        setFormData({
            name: '',
            capacity: 1,
            location: '',
            description: '',
            amenities: []
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAmenityChange = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'Room name is required' });
            return false;
        }
        if (formData.capacity < 1) {
            setMessage({ type: 'error', text: 'Capacity must be at least 1' });
            return false;
        }
        if (!formData.location.trim()) {
            setMessage({ type: 'error', text: 'Location is required' });
            return false;
        }
        return true;
    };

    const handleEditRoom = (room: Room) => {
        setIsModalOpen(true);
        setIsEditMode(true);
        setEditingRoomId(room.id || (room as any)._id);
        setFormData({
            name: room.name,
            capacity: room.capacity,
            location: room.location,
            description: room.description,
            amenities: Array.isArray(room.amenities) ? room.amenities : [],
        });
        setMessage(null);
    };

    const handleDeleteRoom = (room: Room) => {
        setRoomToDelete(room);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteRoom = async () => {
        if (!roomToDelete) return;
        
        try {
            const roomId = roomToDelete.id || (roomToDelete as any)._id;
            await RoomService.deleteRoom(roomId);
            refetch();
            setMessage({ type: 'success', text: `${roomToDelete.name} deleted successfully` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to delete room' });
        } finally {
            setIsDeleteModalOpen(false);
            setRoomToDelete(null);
        }
    };

    const cancelDeleteRoom = () => {
        setIsDeleteModalOpen(false);
        setRoomToDelete(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setMessage(null);
        try {
            if (isEditMode && editingRoomId) {
                await RoomService.updateRoom(editingRoomId, {
                    name: formData.name.trim(),
                    capacity: formData.capacity,
                    location: formData.location.trim(),
                    description: formData.description.trim(),
                    amenities: formData.amenities,
                });
                setMessage({ type: 'success', text: 'Room updated successfully!' });
            } else {
                await RoomService.createRoom({
                    name: formData.name.trim(),
                    capacity: formData.capacity,
                    location: formData.location.trim(),
                    description: formData.description.trim(),
                    amenities: formData.amenities,
                    status: 'available',
                });
                setMessage({ type: 'success', text: 'Room created successfully!' });
            }
            refetch();
            handleCloseModal();
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to save room' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.Container}>
           
            <div className={classes.BackgroundElements}>
                <div className={classes.BgShape1}></div>
                <div className={classes.BgShape2}></div>
            </div>
            
            <div className={classes.Content}>
                <div className={classes.Header}>
                    <div className={classes.HeaderLeft}>
                        <h1 className={classes.Title}>
                            MANAGE <span className={classes.TitleAccent}>ROOMS</span>
                        </h1>
                        <p className={classes.Subtitle}>
                            <MdMeetingRoom className="inline mr-2" />
                            Room Management
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleOpenModal}
                        className={classes.AddButton}
                    >
                        <FaPlus size={20} />
                        Add Room
                    </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <input
                        type="text"
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search all columns..."
                        className={classes.Input}
                    />
                    <select
                        value={locationFilter}
                        onChange={e => setLocationFilter(e.target.value)}
                        className={classes.Select}
                        style={{ minWidth: 150 }}
                    >
                        <option value="">All Locations</option>
                        {[...new Set((allRooms || []).map((room: Room) => room.location).filter(Boolean))].map((location) => (
                            <option key={String(location)} value={String(location)}>{String(location)}</option>
                        ))}
                    </select>
                    {/* Removed status filter dropdown */}
                    <select
                        value={capacityFilter}
                        onChange={e => setCapacityFilter(e.target.value)}
                        className={classes.Select}
                        style={{ minWidth: 150 }}
                    >
                        <option value="">All Capacities</option>
                        {[...new Set((allRooms || []).map((room: Room) => room.capacity).filter(Boolean))].map((capacity) => (
                            <option key={String(capacity)} value={String(capacity)}>{String(capacity)}</option>
                        ))}
                    </select>
                </div>

                <GenericTable 
                    data={paginatedRooms} 
                    columns={columns}
                    loading={isLoading} 
                    error={error ? String(error) : null} 
                    onEdit={handleEditRoom} 
                    onDelete={handleDeleteRoom} 
                />

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        
                        <button
                            className={classes.CancelButton}
                            onClick={() => setPageIndex(pageIndex - 1)}
                            disabled={pageIndex === 0}
                        >
                            {'<'}
                        </button>
                        <button
                            className={classes.CancelButton}
                            onClick={() => setPageIndex(pageIndex + 1)}
                            disabled={pageIndex >= totalPages - 1}
                        >
                            {'>'}
                        </button>
                       
                    </div>
                    <span>
                        Page{' '}
                        <strong>
                            {pageIndex + 1} of {totalPages}
                        </strong>
                    </span>
                   
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
                className={classes.ModalContent}
                overlayClassName={classes.ModalOverlay}
            >
                <div className={classes.ModalHeader}>
                    <h2 className={classes.ModalTitle}>
                        <FaDoorOpen />
                        {isEditMode ? 'Edit Room' : 'Add New Room'}
                    </h2>
                    <button onClick={handleCloseModal} className={classes.CloseButton}>
                        <FaTimes />
                    </button>
                </div>

                <div className={classes.ModalBody}>
                    {message && (
                        <div className={message.type === 'error' ? classes.ErrorMessage : classes.SuccessMessage}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={classes.Form}>
                        <div className={classes.FormRow}>
                            <div className={classes.FormGroup}>
                                <label htmlFor="name" className={classes.Label}>
                                    Room Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter room name"
                                    className={classes.Input}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className={classes.FormGroup}>
                                <label htmlFor="capacity" className={classes.Label}>
                                    Capacity *
                                </label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    placeholder="Number of people"
                                    className={classes.Input}
                                    disabled={loading}
                                    min="1"
                                    max="100"
                                    required
                                />
                            </div>
                        </div>

                        <div className={classes.FormGroup}>
                            <label htmlFor="location" className={classes.Label}>
                                Location *
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="e.g., Floor 2, Building A"
                                className={classes.Input}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className={classes.FormGroup}>
                            <label htmlFor="description" className={classes.Label}>
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Room description..."
                                className={classes.TextArea}
                                disabled={loading}
                            />
                        </div>

                        <div className={classes.AmenitiesSection}>
                            <div className={classes.AmenitiesTitle}>Amenities</div>
                            <div className={classes.AmenitiesGrid}>
                                {AVAILABLE_AMENITIES.map((amenity) => (
                                    <div key={amenity} className={classes.AmenityCheckbox}>
                                        <input
                                            type="checkbox"
                                            id={`amenity-${amenity}`}
                                            checked={formData.amenities.includes(amenity)}
                                            onChange={() => handleAmenityChange(amenity)}
                                            className={classes.Checkbox}
                                            disabled={loading}
                                        />
                                        <label 
                                            htmlFor={`amenity-${amenity}`}
                                            className={classes.AmenityLabel}
                                        >
                                            {amenity}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={classes.ButtonGroup}>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className={classes.CancelButton}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={classes.SubmitButton}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaDoorOpen />
                                        {isEditMode ? 'Update Room' : 'Create Room'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onRequestClose={cancelDeleteRoom}
                className={classes.DeleteModalContent}
                overlayClassName={classes.ModalOverlay}
            >
                <div className={classes.DeleteModalHeader}>
                    <h2 className={classes.DeleteModalTitle}>
                        <FaTrash />
                        Confirm Delete
                    </h2>
                    <button onClick={cancelDeleteRoom} className={classes.CloseButton}>
                        <FaTimes />
                    </button>
                </div>
                <div className={classes.DeleteModalBody}>
                    <p className={classes.DeleteModalText}>
                        Are you sure you want to delete "<strong>{roomToDelete?.name}</strong>"?
                        <br />
                        <br />
                        This action cannot be undone.
                    </p>
                    <div className={classes.DeleteModalButtons}>
                        <button
                            onClick={cancelDeleteRoom}
                            className={classes.CancelDeleteButton}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDeleteRoom}
                            className={classes.ConfirmDeleteButton}
                        >
                            <FaTrash className="inline mr-2" />
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Rooms;