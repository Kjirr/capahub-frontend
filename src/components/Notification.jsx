import React from 'react';

const Notification = ({ message, type }) => {
    const baseClasses = "p-4 mb-4 mx-auto max-w-4xl rounded-md text-white";
    const typeClasses = { success: "bg-green-500", error: "bg-red-500", info: "bg-blue-500" };
    return <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>{message}</div>;
};

export default Notification;