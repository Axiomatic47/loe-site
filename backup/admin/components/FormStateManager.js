import { useState, useEffect } from 'react';

const useFormState = (initialData) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateFormData = (newData) => {
    setFormData(newData);
    setHasUnsavedChanges(true);
  };

  const resetFormState = (newData) => {
    setFormData(newData);
    setHasUnsavedChanges(false);
  };

  return {
    formData,
    hasUnsavedChanges,
    updateFormData,
    resetFormState,
    setHasUnsavedChanges
  };
};

export default useFormState;