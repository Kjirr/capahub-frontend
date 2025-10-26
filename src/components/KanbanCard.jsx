import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const DraggableCard = ({ id, job }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="card bg-base-100 shadow-md"
        >
            <div className="card-body p-4">
                <span className="text-xs font-mono">{job.jobNumber}</span>
                <p className="font-bold">{job.title}</p>
            </div>
        </div>
    );
};