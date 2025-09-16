import React, { createContext, useContext, useState } from 'react';

const UnsavedChangesContext = createContext();

export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
  }
  return context;
};

export const UnsavedChangesProvider = ({ children }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedChangesMessage, setUnsavedChangesMessage] = useState('');

  const checkUnsavedChanges = (callback) => {
    if (hasUnsavedChanges) {
      const message = unsavedChangesMessage || 'You have unsaved changes that will be lost. Click "Save Changes" to save your work before leaving. Are you sure you want to leave?';
      if (window.confirm(message)) {
        callback();
      }
    } else {
      callback();
    }
  };

  const value = {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    unsavedChangesMessage,
    setUnsavedChangesMessage,
    checkUnsavedChanges
  };

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  );
};
