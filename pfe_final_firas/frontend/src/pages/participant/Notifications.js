import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    // Fetch notifications
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Notifications
      </h1>
      <div className="bg-white rounded-lg shadow">
        <ul className="divide-y divide-gray-200">
          {notifications?.map((notification) => (
            <li key={notification._id} className="p-4 hover:bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {notification.title}
              </h3>
              <p className="text-gray-600">
                {notification.message}
              </p>
            </li>
          ))}
          {(!notifications || notifications.length === 0) && (
            <li className="p-4 text-center text-gray-500">
              Aucune notification
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
