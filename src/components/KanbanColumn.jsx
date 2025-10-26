import React from 'react';

export const DroppableColumn = ({ id, title, children }) => {
    return (
        <div className="bg-base-200 rounded-lg w-80 flex-shrink-0 flex flex-col">
            <h3 className="p-4 font-bold text-lg sticky top-0 bg-base-200/80 backdrop-blur-sm z-10">{title} ({React.Children.count(children)})</h3>
            <div className="p-2 space-y-2 overflow-y-auto flex-grow min-h-[100px]">
                {children}
            </div>
        </div>
    );
};