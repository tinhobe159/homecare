import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only trigger shortcuts when not typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.contentEditable === 'true') {
        return;
      }

      // Ctrl/Cmd + key combinations
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case '1':
            event.preventDefault();
            navigate('/admin');
            break;
          case '2':
            event.preventDefault();
            navigate('/admin/customers');
            break;
          case '3':
            event.preventDefault();
            navigate('/admin/caregivers');
            break;
          case '4':
            event.preventDefault();
            navigate('/admin/appointments');
            break;
          case '5':
            event.preventDefault();
            navigate('/admin/services');
            break;
          case '6':
            event.preventDefault();
            navigate('/admin/packages');
            break;
          case 'n':
            event.preventDefault();
            // Trigger "New" action based on current page
            const path = window.location.pathname;
            if (path.includes('/customers')) {
              // Trigger add customer modal
              const addButton = document.querySelector('[data-action="add-customer"]');
              if (addButton) addButton.click();
            } else if (path.includes('/caregivers')) {
              // Trigger add caregiver modal
              const addButton = document.querySelector('[data-action="add-caregiver"]');
              if (addButton) addButton.click();
            }
            break;
          case 's':
            event.preventDefault();
            // Save current form
            const saveButton = document.querySelector('[data-action="save"]');
            if (saveButton) saveButton.click();
            break;
          case 'f':
            event.preventDefault();
            // Focus search field
            const searchInput = document.querySelector('[data-action="search"]');
            if (searchInput) searchInput.focus();
            break;
          case 'b':
            event.preventDefault();
            // Go back
            window.history.back();
            break;
          default:
            break;
        }
      }

      // Function keys
      switch (event.key) {
        case 'F1':
          event.preventDefault();
          showHelp();
          break;
        case 'F2':
          event.preventDefault();
          // Edit mode
          const editButton = document.querySelector('[data-action="edit"]');
          if (editButton) editButton.click();
          break;
        case 'F5':
          event.preventDefault();
          // Refresh data
          window.location.reload();
          break;
        case 'Escape':
          // Close modals or clear selections
          const modal = document.querySelector('.modal');
          if (modal) {
            const closeButton = modal.querySelector('[data-action="close"]');
            if (closeButton) closeButton.click();
          }
          break;
        default:
          break;
      }
    };

    const showHelp = () => {
      const helpContent = `
        Keyboard Shortcuts:
        
        Navigation:
        Ctrl/Cmd + 1: Dashboard
        Ctrl/Cmd + 2: Customers
        Ctrl/Cmd + 3: Caregivers
        Ctrl/Cmd + 4: Appointments
        Ctrl/Cmd + 5: Services
        Ctrl/Cmd + 6: Packages
        
        Actions:
        Ctrl/Cmd + N: New item
        Ctrl/Cmd + S: Save
        Ctrl/Cmd + F: Search
        Ctrl/Cmd + B: Go back
        F1: Show this help
        F2: Edit mode
        F5: Refresh
        Escape: Close modal/clear selection
      `;
      
      alert(helpContent);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;
