
import { useState, useCallback } from 'react';
import { useLazyComponent } from './useLazyComponent';

export const useLazyModal = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  dependencies: any[] = []
) => {
  const [isOpen, setIsOpen] = useState(false);
  const { component: LazyModal, loadComponent, loading } = useLazyComponent(importFn);

  const openModal = useCallback(async () => {
    if (!LazyModal && !loading) {
      await loadComponent();
    }
    setIsOpen(true);
  }, [LazyModal, loading, loadComponent]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    LazyModal,
    isOpen,
    openModal,
    closeModal,
    loading
  };
};
