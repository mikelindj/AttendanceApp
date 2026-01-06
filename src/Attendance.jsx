import React, { useState, useEffect, useRef } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Button,
  Card,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  makeStyles,
  tokens,
  Text,
  Title1,
  Label,
  Field,
  Select,
  Option,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Toaster,
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
} from '@fluentui/react-components';
import { Checkmark24Regular, Dismiss24Regular, ChartMultiple24Regular, List24Regular } from '@fluentui/react-icons';

// API Base URL - points to parents.acsacademy.edu.sg
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://parents.acsacademy.edu.sg';

// Attendance status options matching Dataverse choice values
const ATTENDANCE_STATUSES = [
  { value: 1000, label: 'Present' },
  { value: 1001, label: 'Absent' },
  { value: 1002, label: 'Late Arrival' },
  { value: 1003, label: 'Early Dismissal' },
];

const DEFAULT_STATUS = 1000; // Present

// Excluded student ID - excluded from all calculations
// const EXCLUDED_STUDENT_ID = 'c7891aae-6ad6-f011-8544-00224856f021';

const useStyles = makeStyles({
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '12px 0', // Only vertical padding, no horizontal padding to maximize width
    minHeight: '100vh',
    paddingBottom: '80px', // Space for fixed footer (reduced since no internal scrolling)
  },
  header: {
    marginBottom: '16px',
    padding: '12px 16px',
    backgroundColor: '#00205c',
    borderRadius: 0,
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.2',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
  },
  dashboardToggle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:active': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
  },
  dashboardContainer: {
    padding: '12px',
  },
  dashboardStats: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  dashboardStatCard: {
    flex: '1 1 200px',
    minWidth: '150px',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  dashboardStudentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dashboardStudentItem: {
    padding: '10px 12px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px', // Reduced gap to prevent overlap
    marginBottom: '16px',
    alignItems: 'flex-end',
    flexWrap: 'nowrap', // Prevent wrapping
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: 0, // Allow flex items to shrink
    position: 'relative', // For z-index stacking
    zIndex: 100, // Higher z-index for the container
    isolation: 'isolate', // Create new stacking context
  },
  dateControlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: '0 0 40%', // Reduced to 40% to prevent overlap with class dropdown
    maxWidth: '40%',
    minWidth: 0,
  },
  studentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    // Removed maxHeight and overflowY to allow natural page scrolling
    padding: '4px',
    position: 'relative', // For dropdown positioning
  },
  skeletonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    gap: '16px',
  },
  skeletonText: {
    height: '20px',
    backgroundColor: tokens.colorNeutralStroke2,
    borderRadius: tokens.borderRadiusSmall,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonTextLarge: {
    width: '150px',
  },
  skeletonTextSmall: {
    width: '80px',
  },
  skeletonSelect: {
    width: '180px',
    height: '36px',
    backgroundColor: tokens.colorNeutralStroke2,
    borderRadius: tokens.borderRadiusMedium,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  studentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px', // Reduced horizontal padding to maximize width
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    transition: 'background-color 0.2s ease',
    gap: '12px',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  studentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
    marginBottom: '4px',
    backgroundColor: tokens.colorNeutralBackground2,
    gap: '12px',
  },
  studentRowChanged: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    borderLeft: `3px solid ${tokens.colorPaletteYellowBorderActive}`,
  },
  studentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  statusSelect: {
    minWidth: '180px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  summaryBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: '10px 12px',
    boxShadow: tokens.shadow16,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap', // Prevent wrapping
    gap: '8px',
    overflow: 'hidden', // Prevent overflow
    // Height calculation for padding bottom
    height: 'auto',
    minHeight: '60px',
  },
  summaryStats: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'nowrap', // Prevent wrapping
    alignItems: 'center',
    fontSize: '12px',
    whiteSpace: 'nowrap', // Prevent text wrapping
    overflow: 'hidden',
    flex: '1 1 auto',
    minWidth: 0, // Allow shrinking
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    flexShrink: 0, // Don't shrink individual items
  },
  submitButton: {
    minWidth: '140px',
    flexShrink: 0, // Don't shrink button
    whiteSpace: 'nowrap',
  },
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    padding: '24px',
  },
  dateInput: {
    padding: '8px 10px', // Reduced padding for more compact size
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    fontSize: '16px', // Keep 16px to prevent iOS zoom, but make field narrower
    fontFamily: 'inherit',
    width: '100%',
    minHeight: '38px', // Consistent height with other inputs
    backgroundColor: 'white',
    boxSizing: 'border-box', // Ensure padding is included in width
    '&:focus': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '2px',
    },
  },
  classSelect: {
    padding: '8px 10px', // Reduced padding to match date input
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    fontSize: '16px', // Keep 16px to prevent iOS zoom
    fontFamily: 'inherit',
    minHeight: '38px', // Consistent with date input
    width: '100%',
    backgroundColor: 'white',
    appearance: 'menulist', // Ensure native select appearance on mobile
    WebkitAppearance: 'menulist', // iOS Safari
    MozAppearance: 'menulist', // Firefox
    cursor: 'pointer',
    position: 'relative',
    zIndex: 9999, // Very high z-index to ensure it's above everything
    touchAction: 'manipulation', // Improve touch handling on mobile
    boxSizing: 'border-box', // Ensure padding is included in width
    '&:focus': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '2px',
    },
  },
});

function Attendance() {
  const styles = useStyles();
  const { dispatchToast } = useToastController();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: statusValue }
  const [remarks, setRemarks] = useState({}); // { studentId: remarksText }
  const [originalAttendance, setOriginalAttendance] = useState({}); // Track original state
  const [originalRemarks, setOriginalRemarks] = useState({}); // Track original remarks state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start as false, require auth
  const [isInTeams, setIsInTeams] = useState(false); // Check if running in Teams
  const [userEmail, setUserEmail] = useState('');
  const [authChecked, setAuthChecked] = useState(false); // Track if auth check is complete
  const [showDashboard, setShowDashboard] = useState(false); // Toggle between main view and dashboard
  const [dashboardDate, setDashboardDate] = useState(new Date().toISOString().split('T')[0]); // Dashboard date selector
  const [dashboardData, setDashboardData] = useState({ students: [], present: 0, absent: 0 }); // Dashboard consolidated data
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Load dashboard data for selected date
  const loadDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      
      // First, get all classes
      const classesResponse = await fetch(`${API_BASE_URL}/api/attendanceGateway.php?action=classes`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!classesResponse.ok) {
        throw new Error(`Error ${classesResponse.status}: ${classesResponse.statusText}`);
      }
      
      const classesData = await classesResponse.json();
      if (!classesData.success || !classesData.classes) {
        throw new Error('Failed to load classes');
      }
      
      const allClasses = classesData.classes;
      const allStudents = [];
      let totalPresent = 0;
      let totalAbsent = 0;
      
      // For each class, get students and their attendance
      for (const classItem of allClasses) {
        const classId = classItem.crd88_classesid;
        
        // Get students in this class
        const studentsResponse = await fetch(
          `${API_BASE_URL}/api/attendanceGateway.php?action=students&classId=${classId}`,
          { method: 'GET', headers: { 'Accept': 'application/json' } }
        );
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          if (studentsData.success && studentsData.students) {
            // Get attendance for this class and date
            const attendanceResponse = await fetch(
              `${API_BASE_URL}/api/attendanceGateway.php?action=attendance&date=${dashboardDate}&classId=${classId}`,
              { method: 'GET', headers: { 'Accept': 'application/json' } }
            );
            
            const attendanceMap = {};
            if (attendanceResponse.ok) {
              const attendanceData = await attendanceResponse.json();
              if (attendanceData.success && attendanceData.attendance) {
                attendanceData.attendance.forEach(record => {
                  attendanceMap[record.studentId] = record.crd88_status || 1000;
                });
              }
            }
            
            // Add students with their attendance status (excluding excluded student)
            studentsData.students.forEach(student => {
              // Exclude the specified student from calculations
              if (student.new_studentsid === EXCLUDED_STUDENT_ID) return;
              
              const status = attendanceMap[student.new_studentsid] || 1000;
              allStudents.push({
                ...student,
                className: getClassName(classItem),
                status: status,
              });
              
              if (status === 1000) totalPresent++;
              else if (status === 1001) totalAbsent++;
            });
          }
        }
      }
      
      // Sort students by name
      allStudents.sort((a, b) => {
        const nameA = (a.new_fullname || '').toLowerCase();
        const nameB = (b.new_fullname || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      setDashboardData({
        students: allStudents,
        present: totalPresent,
        absent: totalAbsent,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Load dashboard data when dashboard is shown or date changes
  useEffect(() => {
    if (showDashboard) {
      loadDashboardData();
    }
  }, [showDashboard, dashboardDate]);

  // Check if running in Teams and get user authentication
  const checkAuthentication = async () => {
    try {
      // First, check if we're running in Teams
      if (!window.microsoftTeams) {
        setIsInTeams(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      // We're in Teams - mark as such
      setIsInTeams(true);

      // Get user context from Teams
      let userPrincipalName = '';
      try {
        const context = await window.microsoftTeams.app.getContext();
        userPrincipalName = context.user?.userPrincipalName || context.user?.loginHint || '';
      } catch (err) {
        console.error('Could not get Teams context:', err);
        // If we can't get context, user might need to authenticate
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      // Require @acsacademy.edu.sg domain - strict check
      if (userPrincipalName && userPrincipalName.toLowerCase().endsWith('@acsacademy.edu.sg')) {
        setIsAuthenticated(true);
        setUserEmail(userPrincipalName);
      } else {
        // User is not from required domain or not logged in
        setIsAuthenticated(false);
        setUserEmail(userPrincipalName || '');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    } finally {
      setAuthChecked(true);
    }
  };


  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const checkUnsavedChanges = () => {
      if (Object.keys(attendance).length === 0) return false;
      return Object.keys(attendance).some((studentId) => {
        return attendance[studentId] !== originalAttendance[studentId];
      });
    };

    const handleBeforeUnload = (e) => {
      if (checkUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved attendance changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [attendance, originalAttendance]);

  // Get class name for display (defined early so it can be used in loadClasses)
  const getClassName = (classItem) => {
    return classItem.crd88_classid || `Class ${classItem.crd88_code || ''}`;
  };

  // Load classes on mount
  useEffect(() => {
    checkAuthentication();
    loadClasses();
  }, []);

  // Load students and attendance when class or date changes
  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    } else {
      setStudents([]);
      setAttendance({});
      setOriginalAttendance({});
    }
  }, [selectedClass, selectedDate]);

  // Load all classes
  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/attendanceGateway.php?action=classes`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.classes) {
        // Sort classes in descending alphabetical order by class name
        const sortedClasses = [...data.classes].sort((a, b) => {
          const nameA = getClassName(a).toLowerCase();
          const nameB = getClassName(b).toLowerCase();
          return nameB.localeCompare(nameA); // Descending order (Z to A)
        });
        setClasses(sortedClasses);
        if (sortedClasses.length > 0 && !selectedClass) {
          // Auto-select first class (now the last alphabetically)
          const firstClassId = sortedClasses[0].crd88_classesid;
          setSelectedClass(firstClassId);
        }
      } else {
        throw new Error(data.error || 'Failed to load classes');
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      setError(err.message);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Load students for selected class and existing attendance for selected date
  const loadStudents = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch students in class
      const studentsResponse = await fetch(
        `${API_BASE_URL}/api/attendanceGateway.php?action=students&classId=${selectedClass}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!studentsResponse.ok) {
        throw new Error(`Error ${studentsResponse.status}: ${studentsResponse.statusText}`);
      }

      const studentsData = await studentsResponse.json();
      if (!studentsData.success || !studentsData.students) {
        throw new Error(studentsData.error || 'Failed to load students');
      }

      // Sort students by index number (crd88_indexnumber) in ascending order
      const studentsList = studentsData.students.sort((a, b) => {
        const indexA = parseInt(a.crd88_indexnumber) || 0;
        const indexB = parseInt(b.crd88_indexnumber) || 0;
        return indexA - indexB;
      });
      
      setStudents(studentsList);

      // Initialize attendance state with all students as Present (default)
      const initialAttendance = {};
      const initialRemarks = {};
      studentsList.forEach((student) => {
        const studentId = student.new_studentsid;
        initialAttendance[studentId] = DEFAULT_STATUS; // Default to Present
        initialRemarks[studentId] = ''; // Default to empty remarks
      });

      // Fetch existing attendance for the date
      try {
        const attendanceResponse = await fetch(
          `${API_BASE_URL}/api/attendanceGateway.php?action=attendance&date=${selectedDate}&classId=${selectedClass}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          if (attendanceData.success && attendanceData.attendance) {
            // Map existing attendance records
            attendanceData.attendance.forEach((record) => {
              const studentId = record.studentId;
              // Try multiple field names for status
              const status = record.crd88_status ?? record.status ?? record.crd88_present ?? DEFAULT_STATUS;
              if (studentId) {
                // Ensure status is a valid number
                const statusValue = typeof status === 'number' ? status : parseInt(status) || DEFAULT_STATUS;
                initialAttendance[studentId] = statusValue;
                // Load remarks if present
                const remarksText = record.crd88_remarks ?? record.remarks ?? '';
                initialRemarks[studentId] = remarksText || '';
              }
            });
          }
        } else if (attendanceResponse.status === 400) {
          // 400 means no attendance records exist yet, which is fine
          // Just use default values
          console.log('No existing attendance records found for this date/class');
        }
      } catch (attendanceErr) {
        console.warn('Could not load existing attendance:', attendanceErr);
        // Continue with default values
      }

      setAttendance(initialAttendance);
      setRemarks(initialRemarks);
      setOriginalAttendance({ ...initialAttendance }); // Store original state
      setOriginalRemarks({ ...initialRemarks }); // Store original remarks state
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update attendance status for a student
  const updateAttendanceStatus = (studentId, statusValue) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: statusValue,
    }));
    // Clear remarks if status changes to Present
    if (statusValue === 1000) {
      setRemarks((prev) => ({
        ...prev,
        [studentId]: '',
      }));
    }
  };

  // Update remarks for a student
  const updateRemarks = (studentId, remarksText) => {
    setRemarks((prev) => ({
      ...prev,
      [studentId]: remarksText,
    }));
  };

  // Check if a student's attendance has changed
  const hasChanged = (studentId) => {
    const statusChanged = attendance[studentId] !== originalAttendance[studentId];
    const remarksChanged = (remarks[studentId] || '') !== (originalRemarks[studentId] || '');
    return statusChanged || remarksChanged;
  };

  // Calculate summary statistics (excluding excluded student)
  const getSummaryStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      early: 0,
    };

    Object.entries(attendance).forEach(([studentId, status]) => {
      // Exclude the specified student from calculations
      if (studentId === EXCLUDED_STUDENT_ID) return;
      
      if (status === 1000) stats.present++;
      else if (status === 1001) stats.absent++;
      else if (status === 1002) stats.late++;
      else if (status === 1003) stats.early++;
    });

    return stats;
  };

  // Check if there are any unsaved changes
  const hasUnsavedChanges = () => {
    if (Object.keys(attendance).length === 0) return false;
    return Object.keys(attendance).some((studentId) => hasChanged(studentId));
  };

  // Handle date change with unsaved changes check
  const handleDateChange = (newDate) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        'You have unsaved attendance changes. Are you sure you want to change the date?'
      );
      if (!confirmed) {
        return; // Don't change the date
      }
    }
    setSelectedDate(newDate);
  };

  // Handle class change with unsaved changes check
  const handleClassChange = (newClassId) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        'You have unsaved attendance changes. Are you sure you want to change the class?'
      );
      if (!confirmed) {
        return; // Don't change the class
      }
    }
    setSelectedClass(newClassId);
  };


  // Get student name for display
  const getStudentName = (student) => {
    return student.new_fullname || `Student ${student.crd88_indexnumber || ''}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Handle submit button click
  const handleSubmitClick = () => {
    // Always allow submission if there are students
    // The backend will handle creating/updating records as needed
    if (students.length === 0) {
      dispatchToast(
        <Toast>
          <ToastTitle>No Students</ToastTitle>
          <ToastBody>No students to save attendance for.</ToastBody>
        </Toast>,
        { intent: 'info' }
      );
      return;
    }
    setShowConfirmDialog(true);
  };

  // Submit attendance
  const submitAttendance = async () => {
    setShowConfirmDialog(false);
    
    if (!selectedClass || !selectedDate) {
      dispatchToast(
        <Toast>
          <ToastTitle>Error</ToastTitle>
          <ToastBody>Please select a class and date</ToastBody>
        </Toast>,
        { intent: 'error' }
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare attendance records (excluding excluded student)
      const records = students
        .filter(student => student.new_studentsid !== EXCLUDED_STUDENT_ID)
        .map((student) => {
          const studentId = student.new_studentsid;
          const status = attendance[studentId] || DEFAULT_STATUS;
          const remarksText = remarks[studentId] || '';
          return {
            studentId: studentId,
            status: status, // Send status directly (1000=Present, 1001=Absent, 1002=Late, 1003=Early)
            remarks: remarksText, // Include remarks
          };
        });

      const response = await fetch(`${API_BASE_URL}/api/attendanceGateway.php?action=attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          classId: selectedClass,
          records: records,
          createdBy: userEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success toast
        dispatchToast(
          <Toast>
            <ToastTitle>Success</ToastTitle>
            <ToastBody>Attendance saved successfully!</ToastBody>
          </Toast>,
          { intent: 'success' }
        );

        // Update original state to current state (clear unsaved changes)
        setOriginalAttendance({ ...attendance });
        setOriginalRemarks({ ...remarks });
        
        // Reload to show updated data
        await loadStudents();
      } else {
        throw new Error(data.error || data.message || 'Failed to save attendance');
      }
    } catch (err) {
      console.error('Error submitting attendance:', err);
      dispatchToast(
        <Toast>
          <ToastTitle>Error</ToastTitle>
          <ToastBody>{err.message || 'Failed to save attendance'}</ToastBody>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = getSummaryStats();
  // Exclude the specified student from total count
  const totalStudents = students.filter(s => s.new_studentsid !== EXCLUDED_STUDENT_ID).length;
  const selectedClassName = classes.find(c => c.crd88_classesid === selectedClass) 
    ? getClassName(classes.find(c => c.crd88_classesid === selectedClass))
    : '';

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className={styles.authContainer}>
          <Card style={{ padding: '32px', maxWidth: '500px' }}>
            <Spinner size="large" />
            <Text style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}>
              Checking authentication...
            </Text>
          </Card>
        </div>
      </FluentProvider>
    );
  }

  // Show error if not in Teams
  if (!isInTeams) {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className={styles.authContainer}>
          <Card style={{ padding: '32px', maxWidth: '500px' }}>
            <Title1>Teams Required</Title1>
            <Text style={{ marginTop: '16px', display: 'block' }}>
              This application must be accessed through Microsoft Teams.
            </Text>
            <Text style={{ marginTop: '8px', display: 'block', opacity: 0.7 }}>
              Please open this app from within the Teams desktop, web, or mobile app.
            </Text>
          </Card>
        </div>
      </FluentProvider>
    );
  }

  // Show authentication error if wrong domain
  if (!isAuthenticated) {
    return (
      <FluentProvider theme={webLightTheme}>
        <div className={styles.authContainer}>
          <Card style={{ padding: '32px', maxWidth: '500px' }}>
            <Title1>Access Denied</Title1>
            <Text style={{ marginTop: '16px', display: 'block' }}>
              You must be logged in with an @acsacademy.edu.sg account to access this application.
            </Text>
            {userEmail && (
              <Text style={{ marginTop: '8px', display: 'block', opacity: 0.7 }}>
                Current account: {userEmail}
              </Text>
            )}
            <Text style={{ marginTop: '16px', display: 'block', opacity: 0.7 }}>
              Please sign in with an @acsacademy.edu.sg account in Teams.
            </Text>
            <Button 
              appearance="primary" 
              style={{ marginTop: '24px' }}
              onClick={async () => {
                // Try to re-check authentication
                if (window.microsoftTeams) {
                  try {
                    setAuthChecked(false);
                    await checkAuthentication();
                  } catch (err) {
                    console.error('Re-authentication failed:', err);
                  }
                }
              }}
            >
              Retry Authentication
            </Button>
          </Card>
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <Toaster />
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Text className={styles.headerTitle} style={{ color: 'white' }}>
            ACS (A) Attendance
          </Text>
          <button
            className={styles.dashboardToggle}
            onClick={() => setShowDashboard(!showDashboard)}
            title={showDashboard ? 'Switch to Attendance View' : 'Switch to Dashboard View'}
            aria-label={showDashboard ? 'Switch to Attendance View' : 'Switch to Dashboard View'}
          >
            {showDashboard ? <List24Regular /> : <ChartMultiple24Regular />}
          </button>
        </div>

        {/* Dashboard View */}
        {showDashboard ? (
          <div className={styles.dashboardContainer}>
            {/* Date Selector */}
            <Card style={{ padding: '12px', marginBottom: '16px', marginLeft: '12px', marginRight: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Label htmlFor="dashboardDate" required size="small" style={{ fontSize: '12px' }}>
                  Date
                </Label>
                <input
                  id="dashboardDate"
                  type="date"
                  value={dashboardDate}
                  onChange={(e) => setDashboardDate(e.target.value)}
                  className={styles.dateInput}
                  style={{ maxWidth: '200px' }}
                />
              </div>
            </Card>

            {/* Statistics Cards */}
            {loadingDashboard ? (
              <Card style={{ padding: '20px', marginLeft: '12px', marginRight: '12px' }}>
                <Spinner size="large" />
                <Text style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}>
                  Loading dashboard data...
                </Text>
              </Card>
            ) : (
              <>
                <div className={styles.dashboardStats} style={{ marginLeft: '12px', marginRight: '12px' }}>
                  <Card className={styles.dashboardStatCard}>
                    <Text size={200} style={{ opacity: 0.7, display: 'block', marginBottom: '4px' }}>
                      Total Present
                    </Text>
                    <Text size={600} weight="bold" style={{ fontSize: '32px', color: tokens.colorPaletteGreenForeground1 }}>
                      {dashboardData.present}
                    </Text>
                  </Card>
                  <Card className={styles.dashboardStatCard}>
                    <Text size={200} style={{ opacity: 0.7, display: 'block', marginBottom: '4px' }}>
                      Total Absent
                    </Text>
                    <Text size={600} weight="bold" style={{ fontSize: '32px', color: tokens.colorPaletteRedForeground1 }}>
                      {dashboardData.absent}
                    </Text>
                  </Card>
                </div>

                {/* Consolidated Student List */}
                <Card style={{ padding: '16px', marginLeft: '12px', marginRight: '12px' }}>
                  <Title1 size={500} style={{ marginBottom: '16px' }}>
                    All Students ({dashboardData.students.filter(s => s.new_studentsid !== EXCLUDED_STUDENT_ID).length})
                  </Title1>
                  {dashboardData.students.filter(s => s.new_studentsid !== EXCLUDED_STUDENT_ID).length > 0 ? (
                    <div className={styles.dashboardStudentList}>
                      {dashboardData.students.filter(s => s.new_studentsid !== EXCLUDED_STUDENT_ID).map((student) => {
                        const statusLabel = ATTENDANCE_STATUSES.find(s => s.value === student.status)?.label || 'Present';
                        const isPresent = student.status === 1000;
                        const isAbsent = student.status === 1001;
                        
                        return (
                          <div key={student.new_studentsid} className={styles.dashboardStudentItem}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <Text weight="semibold">{student.new_fullname || `Student ${student.crd88_indexnumber || ''}`}</Text>
                                <Text size={200} style={{ opacity: 0.7, display: 'block', marginTop: '2px' }}>
                                  {student.className} {student.crd88_indexnumber && `#${student.crd88_indexnumber}`}
                                </Text>
                              </div>
                              <div style={{
                                padding: '4px 12px',
                                borderRadius: tokens.borderRadiusSmall,
                                backgroundColor: isPresent 
                                  ? tokens.colorPaletteGreenBackground2 
                                  : isAbsent 
                                    ? tokens.colorPaletteRedBackground2 
                                    : tokens.colorNeutralBackground2,
                                color: isPresent
                                  ? tokens.colorPaletteGreenForeground1
                                  : isAbsent
                                    ? tokens.colorPaletteRedForeground1
                                    : tokens.colorNeutralForeground1,
                                fontSize: '12px',
                                fontWeight: 'semibold',
                              }}>
                                {statusLabel}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Text>No students found for this date.</Text>
                  )}
                </Card>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Attendance View */}
            {/* Error Message */}
            {error && (
              <MessageBar intent="error" style={{ marginBottom: '20px' }}>
                <MessageBarTitle>Error</MessageBarTitle>
                <MessageBarBody>
                  {error}
                  <Button
                    appearance="primary"
                    onClick={() => {
                      loadClasses();
                      if (selectedClass) loadStudents();
                    }}
                    style={{ marginLeft: '20px' }}
                  >
                    Retry
                  </Button>
                </MessageBarBody>
              </MessageBar>
            )}

            {/* Controls */}
        <Card style={{ padding: '12px', marginBottom: '16px', marginLeft: '12px', marginRight: '12px', overflow: 'visible', position: 'relative', zIndex: 50 }}>
          <div className={styles.controls}>
            <div className={styles.dateControlGroup}>
              <Label htmlFor="attendanceDate" required size="small" style={{ fontSize: '12px' }}>
                Date
              </Label>
              <input
                id="attendanceDate"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.controlGroup}>
              <Label htmlFor="classDropdown" required size="small" style={{ fontSize: '12px' }}>
                Class
              </Label>
              {loadingClasses ? (
                <Spinner size="small" />
              ) : (
                <div style={{ position: 'relative', zIndex: 10000, isolation: 'isolate' }}>
                  <select
                    id="classDropdown"
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    onClick={(e) => {
                      // Prevent event bubbling that might interfere
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      // Ensure touch events work on mobile
                      e.stopPropagation();
                    }}
                    className={styles.classSelect}
                    style={{
                      width: '100%',
                      WebkitAppearance: 'menulist',
                      MozAppearance: 'menulist',
                      appearance: 'menulist',
                      position: 'relative',
                      zIndex: 10001,
                      touchAction: 'manipulation',
                    }}
                  >
                    <option value="">Select a class...</option>
                    {classes.map((classItem) => {
                      const classId = classItem.crd88_classesid;
                      return (
                        <option key={classId} value={classId}>
                          {getClassName(classItem)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Loading State with Skeleton */}
        {loading && (
          <Card style={{ padding: '20px', marginLeft: '12px', marginRight: '12px' }}>
            <Title1 size={500} style={{ marginBottom: '16px' }}>
              Students
            </Title1>
            <div className={styles.studentList}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className={styles.skeletonRow}>
                  <div className={styles.studentInfo} style={{ flex: 1 }}>
                    <div className={`${styles.skeletonText} ${styles.skeletonTextLarge}`} />
                    <div className={`${styles.skeletonText} ${styles.skeletonTextSmall}`} style={{ marginTop: '4px' }} />
                  </div>
                  <div className={styles.skeletonSelect} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Student List */}
        {!loading && selectedClass && students.length > 0 && (
          <div>
            <div className={styles.studentHeader}>
              <Text size={300} weight="semibold" style={{ fontSize: '14px', flex: 1 }}>
                Students ({totalStudents})
              </Text>
              <Text size={300} weight="semibold" style={{ fontSize: '14px', width: '120px', textAlign: 'right' }}>
                Status
              </Text>
            </div>
            <div className={styles.studentList}>
              {students.filter(s => s.new_studentsid !== EXCLUDED_STUDENT_ID).map((student) => {
                const studentId = student.new_studentsid;
                const currentStatus = attendance[studentId] ?? DEFAULT_STATUS;
                const changed = hasChanged(studentId);
                const studentNumber = student.crd88_indexnumber;

                const currentRemarks = remarks[studentId] || '';
                const showRemarks = currentStatus !== 1000; // Show remarks if not Present

                return (
                  <div
                    key={studentId}
                    className={`${styles.studentRow} ${changed ? styles.studentRowChanged : ''}`}
                    style={{ flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div className={styles.studentInfo}>
                        <Text weight="semibold">{getStudentName(student)}</Text>
                        {studentNumber && (
                          <Text size={200} style={{ opacity: 0.7 }}>
                            #{studentNumber}
                          </Text>
                        )}
                      </div>
                      <div style={{ width: '120px', flexShrink: 0 }}>
                        <select
                          value={currentStatus.toString()}
                          onChange={(e) => {
                            updateAttendanceStatus(studentId, parseInt(e.target.value));
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: tokens.borderRadiusMedium,
                            border: `1px solid ${tokens.colorNeutralStroke1}`,
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            minHeight: '38px',
                            backgroundColor: 'white',
                          }}
                        >
                          {ATTENDANCE_STATUSES.map((status) => (
                            <option key={status.value} value={status.value.toString()}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {showRemarks && (
                      <div style={{ marginTop: '8px', width: '100%' }}>
                        <input
                          type="text"
                          placeholder="Enter remarks..."
                          value={currentRemarks}
                          onChange={(e) => {
                            updateRemarks(studentId, e.target.value);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: tokens.borderRadiusMedium,
                            border: `1px solid ${tokens.colorNeutralStroke1}`,
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            minHeight: '38px',
                            backgroundColor: 'white',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && selectedClass && students.length === 0 && (
          <Card style={{ padding: '20px', marginLeft: '12px', marginRight: '12px' }}>
            <Text>No students found for this class.</Text>
          </Card>
        )}

        {!loading && !selectedClass && (
          <Card style={{ padding: '20px', marginLeft: '12px', marginRight: '12px' }}>
            <Text>Please select a class to view students.</Text>
          </Card>
        )}

        {/* Floating Summary Bar */}
        {!loading && selectedClass && students.length > 0 && (
          <div className={styles.summaryBar}>
            <div className={styles.summaryStats}>
              <div className={styles.statItem}>
                <Text weight="semibold" style={{ fontSize: '12px' }}>{stats.present}</Text>
                <Text style={{ fontSize: '12px' }}>Present</Text>
              </div>
              <span style={{ color: tokens.colorNeutralStroke2, fontSize: '12px' }}>|</span>
              <div className={styles.statItem}>
                <Text weight="semibold" style={{ fontSize: '12px' }}>{stats.absent}</Text>
                <Text style={{ fontSize: '12px' }}>Absent</Text>
              </div>
              <span style={{ color: tokens.colorNeutralStroke2, fontSize: '12px' }}>|</span>
              <div className={styles.statItem}>
                <Text weight="semibold" style={{ fontSize: '12px' }}>{stats.late}</Text>
                <Text style={{ fontSize: '12px' }}>Late</Text>
              </div>
              <span style={{ color: tokens.colorNeutralStroke2, fontSize: '12px' }}>|</span>
              <div className={styles.statItem}>
                <Text weight="semibold" style={{ fontSize: '12px' }}>{stats.early}</Text>
                <Text style={{ fontSize: '12px' }}>Early</Text>
              </div>
            </div>
            <Button
              appearance="primary"
              onClick={handleSubmitClick}
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Saving...' : 'Submit Attendance'}
            </Button>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={(_, data) => setShowConfirmDialog(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Confirm Attendance</DialogTitle>
              <DialogContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  <Text>
                    <strong>Class:</strong> {selectedClassName}
                  </Text>
                  <Text>
                    <strong>Date:</strong> {formatDate(selectedDate)}
                  </Text>
                  <Text style={{ marginTop: '8px' }}>
                    You are about to save/update <strong>{totalStudents}</strong> records.
                  </Text>
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  appearance="secondary"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  onClick={submitAttendance}
                  disabled={isSubmitting}
                >
                  Confirm & Save
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
          </>
        )}
      </div>
    </FluentProvider>
  );
}

export default Attendance;
