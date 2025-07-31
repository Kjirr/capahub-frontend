// src/components/ProductionKanban.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Een kaart voor een enkele productiestap (nu met useSortable)
const KanbanCard = ({ step }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
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
            className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow cursor-grab border-l-4 border-primary touch-none"
        >
            <div className="card-body p-4">
                <p className="font-bold">{step.title}</p>
                <p className="text-sm text-base-content/70">{step.job.jobNumber} - {step.job.title}</p>
            </div>
        </div>
    );
};

// Een kolom op het Kanban-bord
const KanbanColumn = ({ columnId, title, steps }) => (
    <div className="bg-base-200 rounded-lg p-4 w-full md:w-1/3 flex-shrink-0">
        <h3 className="font-bold text-lg mb-4 px-2">{title}</h3>
        <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 min-h-[200px] p-2 rounded-md">
                {steps.map(step => (
                    <KanbanCard key={step.id} step={step} />
                ))}
                {steps.length === 0 && (
                    <div className="text-center text-sm text-base-content/50 pt-10">
                        Leeg
                    </div>
                )}
            </div>
        </SortableContext>
    </div>
);


const ProductionKanban = ({ showNotification, currentUser }) => {
    const [boardData, setBoardData] = useState({ pending: [], in_progress: [], completed: [] });
    const [isLoading, setIsLoading] = useState(true);
    const columns = ['pending', 'in_progress', 'completed'];

    const fetchBoardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/productions/board-data');
            // Zorg ervoor dat alle kolommen bestaan, zelfs als ze leeg zijn
            const sanitizedData = {
                pending: data.pending || [],
                in_progress: data.in_progress || [],
                completed: data.completed || []
            };
            setBoardData(sanitizedData);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchBoardData();
        }
    }, [currentUser, fetchBoardData]);

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const { id: stepId } = active;
        const { id: newStatus } = over;
        const oldStatus = active.data.current.sortable.containerId;

        // Als de status niet verandert, doe niets (of handel hersorteren af)
        if (oldStatus === newStatus) return;

        // Optimistische UI update
        const stepToMove = boardData[oldStatus].find(s => s.id === stepId);
        setBoardData(prev => {
            const newBoardData = { ...prev };
            newBoardData[oldStatus] = prev[oldStatus].filter(s => s.id !== stepId);
            newBoardData[newStatus] = [...prev[newStatus], stepToMove];
            return newBoardData;
        });

        // API call
        try {
            await apiRequest(`/productions/steps/${stepId}`, 'PUT', { status: newStatus });
            showNotification('Status succesvol bijgewerkt!', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
            // Bij een fout, zet de UI terug
            fetchBoardData();
        }
    };
    
    if (isLoading) return <div className="loading-text">Productieplanning laden...</div>;

    return (
        <div className="page-container">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Productieplanning</h1>
                    <p className="page-subtitle">Visueel overzicht van uw productielijn. Sleep de kaarten om de status te wijzigen.</p>
                </div>
            </div>
            
            <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
                <div className="flex flex-col md:flex-row gap-6">
                    <KanbanColumn columnId="pending" title="Te Doen" steps={boardData.pending} />
                    <KanbanColumn columnId="in_progress" title="In Uitvoering" steps={boardData.in_progress} />
                    <KanbanColumn columnId="completed" title="Voltooid" steps={boardData.completed} />
                </div>
            </DndContext>
        </div>
    );
};

export default ProductionKanban;