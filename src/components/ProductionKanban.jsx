import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DroppableColumn } from './KanbanColumn'; // We splitsen de kolom op voor de duidelijkheid
import { DraggableCard } from './KanbanCard'; // En de kaart

const ProductionKanban = ({ showNotification, navigateTo }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [columns, setColumns] = useState([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [templatesData, jobsData] = await Promise.all([
                apiRequest('/production-step-templates', 'GET'),
                apiRequest('/productions/board-data', 'GET')
            ]);

            // Voeg een 'Werkvoorbereiding' kolom toe aan het begin
            const columnDefinitions = [
                { id: 'WORK_PREPARATION', name: 'Werkvoorbereiding' },
                ...templatesData.map(t => ({ id: t.id, name: t.name }))
            ];
            setColumns(columnDefinitions);
            setJobs(jobsData);

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getTaskColumnId = (job) => {
        if (!job.productionSteps || job.productionSteps.length === 0) {
            return 'WORK_PREPARATION';
        }
        const activeStep = job.productionSteps.find(step => ['PENDING', 'IN_PROGRESS'].includes(step.status));
        if (activeStep) {
            const column = columns.find(c => c.name === activeStep.title);
            return column ? column.id : 'WORK_PREPARATION';
        }
        // Als alle stappen voltooid zijn, hoort de taak nergens meer thuis op dit actieve bord.
        // We kunnen hem hier filteren of in een 'Voltooid' kolom plaatsen. Voor nu filteren we.
        return null;
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }
        
        // TODO: In de volgende stap voegen we hier de API-call toe om de statuswijziging op te slaan.
        showNotification(`Opdracht verplaatst naar een nieuwe kolom (nog niet opgeslagen)`, 'info');
    };

    const sensors = useSensors(useSensor(PointerSensor));

    if (isLoading) return <div className="loading-text">Planbord laden...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Productie Planbord</h1>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="flex space-x-4 overflow-x-auto p-4">
                    <SortableContext items={jobs.map(j => j.id)}>
                        {columns.map(column => (
                            <DroppableColumn id={column.id} title={column.name} key={column.id}>
                                {jobs
                                    .filter(job => getTaskColumnId(job) === column.id)
                                    .map(job => (
                                        <DraggableCard id={job.id} job={job} key={job.id} />
                                    ))
                                }
                            </DroppableColumn>
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
        </div>
    );
};

export default ProductionKanban;