"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTimes, FaUsers, FaUserPlus, FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from 'react-modal';
import { GenericTable } from '../../components/GenericTable';
import type { Employee } from '../../types/index';
import UserService from '../../services/UserServices';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from "@tanstack/react-query";
import { useEmployeeStore } from '../../store/employeeStore';
import { ColumnDef } from "@tanstack/react-table";

const classes = {
    Container: 'h-full bg-white  relative overflow-hidden pt-16',
    BackgroundElements: 'absolute inset-0 pointer-events-none',
    BgSquare1: 'absolute top-20 left-10 w-16 h-16 bg-red-500 border-4 border-black transform rotate-45 opacity-30',
    BgSquare2: 'absolute bottom-20 right-20 w-12 h-12 bg-red-500 border-4 border-black transform -rotate-12 opacity-20',
    BgTriangle: 'absolute top-40 right-40 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[40px] border-b-red-500 opacity-25',
    Content: 'mx-auto sm:px-16 px-4 py-16 relative z-10',
    
    // Header Styles
    Header: 'flex justify-between items-center mb-12   -mt-8 sm:gap-0 gap-12',
    HeaderLeft: 'flex flex-col',
    Title: 'sm:text-5xl text-2xl w-auto font-black text-black uppercase tracking-widest transform -skew-x-3 mb-2',
    Subtitle: 'sm:text-lg text-sm font-bold text-white bg-red-500 border-4 border-black px-4 py-2 inline-block shadow-[4px_4px_0px_0px_#000] uppercase tracking-wide transform ',
    
    // Action Buttons
    ButtonGroup: 'flex items-center gap-4',
    AddButton: 'bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black sm:py-4 py-2 sm:px-8 px-2 uppercase tracking-widest sm:text-lg text-[10px] shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-3',
    
    // Modal Styles (existing classes remain the same...)
    ModalOverlay: 'fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4',
    ModalContent: 'bg-white border-4 border-black max-w-2xl w-full shadow-[16px_16px_0px_0px_#000] relative',
    ModalHeader: 'bg-red-500 border-b-4 border-black p-3 flex justify-between items-center',
    ModalTitle: 'text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3',
    CloseButton: 'text-white hover:text-red-200 text-3xl cursor-pointer transform hover:scale-110 transition-all duration-200',
    
    // Form Styles
    ModalBody: 'px-8 pt-2',
    Form: 'space-y-2',
    FormGroup: 'space-y-6',
    Label: 'text-black font-black text-sm uppercase tracking-widest mt-1',
    Input: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200',
    Select: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200',
    
    // Button Group
    ButtonGroup2: 'flex justify-end gap-4 py-6 ',
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

interface AddUserFormData {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'employee';
    department?: string;
    designation?: string;
}

const Employees = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const [globalFilter, setGlobalFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("");
    const [designationFilter, setDesignationFilter] = useState<string>("");

  const fetchEmployees = async () => {
    return await UserService.getAllUsers();
  }


    // Client-side filtering and pagination
        const { setEmployees, employees } = useEmployeeStore();
        const {
            data: allEmployees,
            isLoading,
            error,
            refetch
        } = useQuery({
            queryKey: ['employees'],
            queryFn: fetchEmployees,
        });

        useEffect(() => {
            if (Array.isArray(allEmployees)) {
                setEmployees(allEmployees);
            }
        }, [allEmployees, setEmployees]);

        const filteredEmployees = ((employees && employees.length) ? employees : (Array.isArray(allEmployees) ? allEmployees : [])).filter((emp: Employee) => {
        let matches = true;
        if (globalFilter) {
            const search = globalFilter.toLowerCase();
            matches = (
                emp.name?.toLowerCase().includes(search) ||
                emp.email?.toLowerCase().includes(search) ||
                emp.role?.toLowerCase().includes(search) ||
                emp.designation?.toLowerCase().includes(search)
            );
        }
        if (roleFilter) {
            matches = matches && emp.role === roleFilter;
        }
        if (designationFilter) {
            matches = matches && emp.designation === designationFilter;
        }
        return matches;
    });

  const totalItems = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setPageIndex(0);
  }, [globalFilter]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<AddUserFormData>({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: '',
      designation: '',
  });

    useEffect(() => {
        // Always run client-only modal setup in useEffect
        Modal.setAppElement('body');
    }, []);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: info => <span className="font-bold text-lg">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: info => <span className="text-gray-600">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: info => <span className="italic">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: info => {
        const role = info.getValue() as string;
        const roleClasses = role === 'admin' 
          ? 'bg-red-500 text-white font-black uppercase px-3 py-1 text-xs rounded-full shadow-md'
          : 'bg-gray-200 text-gray-800 font-bold uppercase px-3 py-1 text-xs rounded-full';
        return <span className={roleClasses}>{role}</span>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row, table }) => (
        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => handleEditUser(row.original)} 
            className="bg-blue-500 hover:bg-blue-600 border-2 border-black text-white p-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
          >
            <FaEdit size={16} />
          </button>
          <button 
            onClick={() => handleDeleteUser(row.original)} 
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
      setEditingUserId(null);
      setMessage(null);
      setFormData({
          name: '',
          email: '',
          password: '',
          role: 'employee',
          department: '',
          designation: '',
      });
  };

  const handleEditUser = (employee: Employee) => {
      const employeeId = employee.id || (employee as any)._id;
      const currentUserId = user?.id;
      
      if (employeeId === currentUserId) {
          setMessage({
              type: 'error',
              text: 'You cannot edit your own information! Please ask another admin to perform this action.'
          });
          setTimeout(() => setMessage(null), 5000);
          return;
      }
      
      const userId = employee.id || (employee as any)._id;
      setIsModalOpen(true);
      setIsEditMode(true);
      setEditingUserId(userId);
      setMessage(null);
      setFormData({
          name: employee.name,
          email: employee.email,
          password: '',
          role: employee.role as 'admin' | 'employee',
          designation: employee.designation || '',
      });
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingUserId(null);
      setMessage(null);
      setFormData({
          name: '',
          email: '',
          password: '',
          role: 'employee',
          department: '',
          designation: '',
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: value
      }));
  };

  const validateForm = (): boolean => {
      if (!formData.name.trim()) {
          setMessage({ type: 'error', text: 'Name is required' });
          return false;
      }
      if (!formData.email.trim()) {
          setMessage({ type: 'error', text: 'Email is required' });
          return false;
      }
      
      if (!isEditMode && !formData.password.trim()) {
          setMessage({ type: 'error', text: 'Password is required' });
          return false;
      }
      if (formData.password && formData.password.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
          return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
          setMessage({ type: 'error', text: 'Please enter a valid email' });
          return false;
      }

      return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
          return;
      }

      setLoading(true);
      setMessage(null);

      try {
          if (isEditMode && editingUserId) {
              const updateData = {
                  name: formData.name.trim(),
                  email: formData.email.trim(),
                  role: formData.role,
                  designation: formData.designation?.trim() || undefined,
              };
              
              await UserService.updateUser(editingUserId, updateData);
              
                            toast.success('🎉 User updated successfully!', {
                                className: 'toast-success',
                            });
              
          } else {
              await UserService.createUser({
                  name: formData.name.trim(),
                  email: formData.email.trim(),
                  role: formData.role,
                  designation: formData.designation?.trim() || undefined,
                  password: formData.password,
              } as any);

                            toast.success('🎉 User created successfully!', {
                                className: 'toast-success',
                            });
          }

          refetch();
          setTimeout(() => {
              handleCloseModal();
          }, 1000);

      } catch (error: any) {
          let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} user`;
          
          if (error.response?.status === 409) {
              errorMessage = 'Email already exists';
          } else if (error.response?.status === 400) {
              errorMessage = error.response.data?.message || 'Invalid user data';
          } else if (error.response?.status === 404) {
              errorMessage = 'User not found';
          } else if (!error.response) {
              errorMessage = 'Network error - please check your connection';
          }
          
                    toast.error(`❌ ${errorMessage}`, {
                        className: 'toast-error',
                    });
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteUser = (employee: Employee) => {
      const employeeId = employee.id || (employee as any)._id;
      const currentUserId = user?.id;
      
      if (employeeId === currentUserId) {
          setMessage({
              type: 'error',
              text: 'You cannot delete yourself! Please ask another admin to perform this action.'
          });
          setTimeout(() => setMessage(null), 5000);
          return;
      }
      
      setEmployeeToDelete(employee);
      setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
      if (!employeeToDelete) return;
      
      try {
          const userId = employeeToDelete.id || (employeeToDelete as any)._id;
          await UserService.deleteUser(userId);
          refetch();
                toast.success(`🎉 ${employeeToDelete.name} deleted successfully`, {
                    className: 'toast-success',
                });
          setTimeout(() => setMessage(null), 3000);
          
      } catch (error: any) {
          let errorMessage = 'Failed to delete user';
          
          if (error.response?.status === 404) {
              errorMessage = 'User not found';
          } else if (error.response?.status === 403) {
              errorMessage = 'Permission denied';
          } else if (!error.response) {
              errorMessage = 'Network error - please check your connection';
          }
          
                    toast.error(`❌ ${errorMessage}`, {
                        className: 'toast-error',
                    });
      } finally {
          setIsDeleteModalOpen(false);
          setEmployeeToDelete(null);
      }
  };

  const cancelDeleteUser = () => {
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
  };

  return (
      <div className={classes.Container}>
          <div className={classes.BackgroundElements}>
              <div className={classes.BgSquare1}></div>
              <div className={classes.BgSquare2}></div>
              <div className={classes.BgTriangle}></div>
          </div>
          
          <div className={classes.Content}>
              <div className={classes.Header}>
                  <div className={classes.HeaderLeft}>
                      <h1 className={classes.Title}>Manage Employees</h1>
                      <p className={classes.Subtitle}>
                          <FaUsers className="inline mr-2" />
                          Team Management
                      </p>
                  </div>
                  
                  <button 


                      onClick={handleOpenModal}
                      className={classes.AddButton}
                  >
                      <FaUserPlus size={20} />
                      Add Employee
                  </button>
              </div>

                            <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                className="neo-brutalism-toast-container pt-16"
                            />

                            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                <input
                                    type="text"
                                    value={globalFilter ?? ''}
                                    onChange={e => setGlobalFilter(e.target.value)}
                                    placeholder="Search all columns..."
                                    className={classes.Input}
                                />
                                <select
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                                    className={classes.Select}
                                    style={{ minWidth: 150 }}
                                >
                                    <option value="">All Roles</option>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select
                                    value={designationFilter}
                                    onChange={e => setDesignationFilter(e.target.value)}
                                    className={classes.Select}
                                    style={{ minWidth: 150 }}
                                >
                                    <option value="">All Designations</option>
                                    {/* Dynamically generate designation options from employees */}
                                    {[...new Set((allEmployees || []).map((emp: Employee) => emp.designation).filter(Boolean))].map((designation) => (
                                        <option key={String(designation)} value={String(designation)}>{String(designation)}</option>
                                    ))}
                                </select>
                            </div>

              <GenericTable
                  data={paginatedEmployees}
                  columns={columns}
                  loading={isLoading}
                  error={error ? String(error) : undefined}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  
                  <button
                                        className={
                                            pageIndex === 0
                                                ? `${classes.CancelButton} bg-gray-300 text-gray-500 cursor-not-allowed`
                                                : classes.CancelButton
                                        }
                                        onClick={() => setPageIndex(pageIndex - 1)}
                                        disabled={pageIndex === 0}
                  >
                    {'<'}
                  </button>
                  <button
                                        className={
                                            pageIndex >= totalPages - 1 ||
                                            filteredEmployees.slice((pageIndex + 1) * pageSize, (pageIndex + 2) * pageSize).length === 0
                                                ? `${classes.CancelButton} bg-gray-300 text-gray-500 cursor-not-allowed`
                                                : classes.CancelButton
                                        }
                                        onClick={() => setPageIndex(pageIndex + 1)}
                                        disabled={
                                            pageIndex >= totalPages - 1 ||
                                            filteredEmployees.slice((pageIndex + 1) * pageSize, (pageIndex + 2) * pageSize).length === 0
                                        }
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
              isOpen={isModalOpen && !isEditMode}
              onRequestClose={handleCloseModal}
              className={classes.ModalContent}
              overlayClassName={classes.ModalOverlay}
          >
              <div className={classes.ModalHeader}>
                  <h2 className={classes.ModalTitle}>
                      <FaUserPlus />
                      Add New Employee
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
                      <div className={classes.FormGroup}>
                          <label htmlFor="name" className={classes.Label}>
                              Full Name *
                          </label>
                          <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter full name"
                              className={classes.Input}
                              disabled={loading}
                              required
                          />
                      </div>
                      <div className={classes.FormGroup}>
                          <label htmlFor="email" className={classes.Label}>
                              Email Address *
                          </label>
                          <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter email address"
                              className={classes.Input}
                              disabled={loading}
                              required
                          />
                      </div>
                      <div className={classes.FormGroup}>
                          <label htmlFor="password" className={classes.Label}>
                              Password *
                          </label>
                          <input
                              type="password"
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Enter password"
                              className={classes.Input}
                              disabled={loading}
                              required
                          />
                      </div>
                      <div className={classes.FormGroup}>
                          <label htmlFor="role" className={classes.Label}>
                              Role *
                          </label>
                          <select
                              id="role"
                              name="role"
                              value={formData.role}
                              onChange={handleInputChange}
                              className={classes.Select}
                              disabled={loading}
                              required
                          >
                              <option value="employee">Employee</option>
                              <option value="admin">Admin</option>
                          </select>
                      </div>
                      <div className={classes.FormGroup}>
                          <label htmlFor="designation" className={classes.Label}>
                              Designation*
                          </label>
                          <input
                              type="text"
                              id="designation"
                              name="designation"
                              value={formData.designation}
                              onChange={handleInputChange}
                              placeholder="Enter Designation"
                              className={classes.Input}
                              disabled={loading}
                          />
                      </div>
                      <div className={classes.ButtonGroup2}>
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
                                      <FaUserPlus />
                                      Create Employee
                                  </>
                              )}
                          </button>
                      </div>
                  </form>
              </div>
          </Modal>

          <Modal
              isOpen={isModalOpen && isEditMode}
              onRequestClose={handleCloseModal}
              className={classes.ModalContent}
              overlayClassName={classes.ModalOverlay}
          >
              <div className={classes.ModalHeader}>
                  <h2 className={classes.ModalTitle}>
                      <FaEdit />
                      Edit User
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
                      <div className={classes.FormGroup}>
                          <label htmlFor="name" className={classes.Label}>
                              Full Name *
                          </label>
                          <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter full name"
                              className={classes.Input}
                              disabled={loading}
                              required
                          />
                      </div>
                      <div className={classes.FormGroup}>
                          <label htmlFor="email" className={classes.Label}>
                              Email Address *
                          </label>
                          <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter email address"
                              className={classes.Input}
                              disabled={loading}
                              required
                          />
                      </div>
                      <div className={classes.FormGroup}>
                          <label htmlFor="role" className={classes.Label}>
                              Role *
                          </label>
                          <select
                              id="role"
                              name="role"
                              value={formData.role}
                              onChange={handleInputChange}
                              className={classes.Select}
                              disabled={loading}
                              required
                          >
                              <option value="employee">Employee</option>
                              <option value="admin">Admin</option>
                          </select>
                      </div>
                      <div className={classes.FormGroup}>
                          <label htmlFor="designation" className={classes.Label}>
                              Designation
                          </label>
                          <input
                              type="text"
                              id="designation"
                              name="designation"
                              value={formData.designation}
                              onChange={handleInputChange}
                              placeholder="Enter Designation"
                              className={classes.Input}
                              disabled={loading}
                          />
                      </div>
                      <div className={classes.ButtonGroup2}>
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
                                      Updating...
                                  </>
                              ) : (
                                  <>
                                      <FaEdit />
                                      Update User
                                  </>
                              )}
                          </button>
                      </div>
                  </form>
              </div>
          </Modal>

          <Modal
              isOpen={isDeleteModalOpen}
              onRequestClose={cancelDeleteUser}
              className={classes.DeleteModalContent}
              overlayClassName={classes.ModalOverlay}
          >
              <div className={classes.DeleteModalHeader}>
                  <h2 className={classes.DeleteModalTitle}>
                      <FaTrash />
                      Confirm Delete
                  </h2>
                  <button onClick={cancelDeleteUser} className={classes.CloseButton}>
                      <FaTimes />
                  </button>
              </div>
              <div className={classes.DeleteModalBody}>
                  <p className={classes.DeleteModalText}>
                      Are you sure you want to delete &quot;<strong>{employeeToDelete?.name}</strong>&quot;?
                      <br />
                      <br />
                      This action cannot be undone.
                  </p>
                  <div className={classes.DeleteModalButtons}>
                      <button
                          onClick={cancelDeleteUser}
                          className={classes.CancelDeleteButton}
                      >
                          Cancel
                      </button>
                      <button
                          onClick={confirmDeleteUser}
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

export default Employees;