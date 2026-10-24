import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { requestNotificationPermission, processBrowserNotifications } from '../services/notificationService';

export const NotificationManager: React.FC = () => {
  const { bookings } = useApp();

  useEffect(() => {
    // Request permission once on load
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    // Poll for notifications
    const checkNotifications = () => {
      processBrowserNotifications(bookings);
    };

    const interval = setInterval(checkNotifications, 30000); // Check every 30s
    checkNotifications(); // Initial check

    return () => clearInterval(interval);
  }, [bookings]);

  return null;
};
