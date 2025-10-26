// src/components/MyProductionTasks.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    getProductionBoard, 
    startProductionTimer,
    stopProductionTimer,
    completeProductionStep,
    getPlannableResources
} from '../api';
import useAuthStore from '@/store/authStore';
import { initiateSocketConnection, subscribeToEvent, unsubscribeFromEvent } from '../socket';
import { format, isToday, addDays, subDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const toDateKey = (val) => { 
    if (!val) return null; 
    const d = new Date(val); 
    return isNaN(d) ? null : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); 
};

const formatSeconds = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [
        h.toString().padStart(2, '0'),
        m.toString().padStart(2, '0'),
        s.toString().padStart(2, '0')
    ].join(':');
};

const ProgressBar = ({ task, liveTotalSeconds }) => {
    const plannedSeconds = (task.plannedDurationHours || 0) * 3600;
    const spentSeconds = liveTotalSeconds ?? task.totalTimeSpentSeconds ?? 0;
    if (plannedSeconds <= 0) return null;
    const percentage = Math.min((spentSeconds / plannedSeconds) * 100, 100);
    return (
        <div className="mt-2">
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-gray-500">Voortgang</span>
                <span className="font-bold text-gray-600">{Math.round(percentage)}%</span>
            </div>
            <progress 
                className="progress progress-primary w-full" 
                value={percentage} 
                max="100"
            ></progress>
        </div>
    );
};

const TaskCard = ({ task, onTimeLogAction }) => {
    const [liveTotalSeconds, setLiveTotalSeconds] = useState(task.totalTimeSpentSeconds);
    useEffect(() => {
        let timerInterval;
        if (task.status === 'IN_PROGRESS' && task.activeLogStartTime) {
            const startTime = new Date(task.activeLogStartTime).getTime();
            timerInterval = setInterval(() => {
                const now = Date.now();
                const elapsedSeconds = (now - startTime) / 1000;
                setLiveTotalSeconds(task.totalTimeSpentSeconds + elapsedSeconds);
            }, 1000);
        } else {
            setLiveTotalSeconds(task.totalTimeSpentSeconds);
        }
        return () => clearInterval(timerInterval);
    }, [task.status, task.activeLogStartTime, task.totalTimeSpentSeconds]);

    const renderButtons = () => {
        switch (task.status) {
            case 'READY_FOR_START':
            case 'PLANNED':
                return <button onClick={() => onTimeLogAction(task.id, 'start')} className="btn btn-success btn-sm w-full">Start Taak</button>;
            case 'IN_PROGRESS':
                return (
                    <div className="flex gap-2 w-full">
                        <button onClick={() => onTimeLogAction(task.id, 'stop')} className="btn btn-warning btn-sm flex-1">Pauzeer</button>
                        <button onClick={() => onTimeLogAction(task.id, 'complete')} className="btn btn-primary btn-sm flex-1">Voltooi</button>
                    </div>
                );
            case 'PAUSED':
                return <button onClick={() => onTimeLogAction(task.id, 'start')} className="btn btn-success btn-sm w-full">Hervat</button>;
            default:
                return null;
        }
    };

    return (
        <div className="card bg-base-100 shadow-md mb-4 relative">
             {task.status === 'READY_FOR_START' && (
                <div className="absolute -top-2 -right-2 z-10">
                    <span className="badge badge-lg badge-success font-bold animate-pulse">KLAAR VOOR START</span>
                </div>
            )}
            <div className="card-body p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="card-title text-base leading-tight">{task.title}</h3>
                        <p className="text-sm text-gray-500">Order: {task.Order?.orderNumber} ({task.Order?.customerCompany})</p>
                    </div>
                     <span className={`badge ${task.status === 'IN_PROGRESS' ? 'badge-primary animate-pulse' : 'badge-ghost'}`}>{task.status}</span>
                </div>
                {task.notes && (
                    <div className="mt-2 p-2 bg-base-200 rounded">
                        <p className="text-sm font-semibold">Instructies:</p>
                        <p className="text-sm whitespace-pre-wrap">{task.notes}</p>
                    </div>
                )}
                {(liveTotalSeconds > 0 || task.plannedDurationHours > 0) && (
                     <div className="text-sm text-gray-600 mt-1">
                        Kloktijd: <strong>{formatSeconds(liveTotalSeconds)}</strong> / Gepland: {formatSeconds(task.plannedDurationHours * 3600)}
                    </div>
                )}
                <ProgressBar task={task} liveTotalSeconds={liveTotalSeconds} />
                <div className="card-actions justify-center mt-4">
                    {renderButtons()}
                </div>
                <div className="mt-2 text-center">
                    <Link to={`/order-details/${task.Order.id}`} target="_blank" className="link link-hover text-sm">
                        Bekijk Order Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ title, tasks, onTimeLogAction }) => {
    return (
        <div className="flex-shrink-0 w-80 md:w-96 bg-base-200 rounded-lg p-4 flex flex-col h-full">
            <h2 className="text-lg font-bold mb-4 px-2 flex-shrink-0">{title} ({tasks.length})</h2>
            <div className="overflow-y-auto pr-2 flex-grow">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard key={task.id} task={task} onTimeLogAction={onTimeLogAction} />
                    ))
                ) : (
                    <div className="text-center text-gray-500 pt-10">
                        <p>Geen taken in deze kolom.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const MyProductionTasks = ({ showNotification }) => {
    const { currentUser } = useAuthStore();
    const [allTasks, setAllTasks] = useState([]);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState(null);

    const fetchBoardData = useCallback(async (date) => {
        setIsLoading(true);
        try {
            const dateParam = format(date, 'yyyy-MM-dd');
            const [allTaskData, resourcesData] = await Promise.all([
                getProductionBoard(dateParam),
                getPlannableResources()
            ]);
            
            setAllTasks(allTaskData || []);
            setResources(resourcesData || []);

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification, currentUser]);

    useEffect(() => {
        fetchBoardData(selectedDate);
    }, [fetchBoardData, selectedDate]);
    
    useEffect(() => {
        initiateSocketConnection();
        const handlePlanningUpdate = () => {
            showNotification('Planning is bijgewerkt!', 'info');
            fetchBoardData(selectedDate); 
        };
        subscribeToEvent('PLANNING_UPDATED', handlePlanningUpdate);
        return () => { unsubscribeFromEvent('PLANNING_UPDATED', handlePlanningUpdate); };
    }, [currentUser, showNotification, fetchBoardData, selectedDate]);

    const handleTimeLogAction = async (taskId, action) => {
        try {
            let actionPromise;
            switch (action) {
                case 'start': actionPromise = startProductionTimer(taskId); break;
                case 'stop': actionPromise = stopProductionTimer(taskId); break;
                case 'complete': actionPromise = completeProductionStep(taskId); break;
                default: throw new Error('Onbekende actie');
            }
            await actionPromise;
        } catch (error) {
            showNotification(`Fout bij uitvoeren actie: ${error.message}`, 'error');
        }
    };
    
    const { visibleTasks, tasksByResource, dailyTasks } = useMemo(() => {
        const plannableResourceIds = new Set(resources.map(r => r.id));
        const visibleTasks = allTasks.filter(step => !step.assignedResourceId || plannableResourceIds.has(step.assignedResourceId));
        
        let tasksToShow = visibleTasks;
        if (currentUser.companyRole !== 'owner') {
            tasksToShow = visibleTasks.filter(t => t.assignedUserId === currentUser.id);
        }

        const selectedDateKey = toDateKey(selectedDate);
        const dailyTasks = tasksToShow.filter(t => toDateKey(t.plannedStartDate) === selectedDateKey);

        const resourceMap = new Map(resources.map(r => [r.id, r.name]));
        const tasksByResource = {};
        dailyTasks.forEach(task => {
            const resourceName = resourceMap.get(task.assignedResourceId) || 'Overig';
            if (!tasksByResource[resourceName]) {
                tasksByResource[resourceName] = { inProgressTasks: [], readyToStartTasks: [], completedTasks: [] };
            }
            if (task.status === 'IN_PROGRESS') {
                tasksByResource[resourceName].inProgressTasks.push(task);
            } else if (['READY_FOR_START', 'PLANNED', 'PAUSED'].includes(task.status)) {
                tasksByResource[resourceName].readyToStartTasks.push(task);
            } else if (task.status === 'COMPLETED') {
                tasksByResource[resourceName].completedTasks.push(task);
            }
        });
        
        return { visibleTasks, tasksByResource, dailyTasks };
    }, [allTasks, resources, currentUser, selectedDate]);

    useEffect(() => {
        if (resources.length > 0 && !activeTab) {
            setActiveTab(resources[0].name);
        } else if (resources.length > 0 && !resources.some(r => r.name === activeTab)) {
            setActiveTab(resources[0].name);
        }
    }, [resources, activeTab]);

    const changeDay = (offset) => {
        setActiveTab(null);
        setSelectedDate(current => addDays(current, offset));
    };

    const goToToday = () => {
        setActiveTab(null);
        setSelectedDate(new Date());
    };

    const getPageTitle = () => {
        const baseTitle = currentUser.companyRole === 'owner' ? 'Totaaloverzicht Taken' : 'Mijn Taken';
        if (isToday(selectedDate)) return `${baseTitle} (Vandaag)`;
        return `${baseTitle} (${format(selectedDate, 'eeee d MMMM', { locale: nl })})`;
    };
    
    const tasksForActiveTab = activeTab ? tasksByResource[activeTab] : null;

    if (isLoading) {
        return <div className="loading-text">Takenbord laden...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="page-title">{getPageTitle()}</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeDay(-1)} className="btn btn-outline btn-sm">‹ Gisteren</button>
                        <button onClick={goToToday} className="btn btn-sm" disabled={isToday(selectedDate)}>Vandaag</button>
                        <button onClick={() => changeDay(1)} className="btn btn-outline btn-sm">Morgen ›</button>
                    </div>
                </div>
                
                {resources.length > 0 && (
                    <div role="tablist" className="tabs tabs-boxed mb-6">
                        {resources.map(resource => (
                            <a key={resource.id} role="tab" className={`tab ${activeTab === resource.name ? 'tab-active' : ''}`} onClick={() => setActiveTab(resource.name)}>
                                {resource.name}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-grow flex justify-center space-x-4 overflow-x-auto pt-2">
                {dailyTasks.length === 0 ? (
                    <div className="text-center text-gray-500 w-full pt-16"><p className="text-xl">Geen taken gepland voor deze dag.</p></div>
                ) : (
                    tasksForActiveTab && (
                        <>
                            <KanbanColumn title="Klaar voor Start" tasks={tasksForActiveTab.readyToStartTasks} onTimeLogAction={handleTimeLogAction} />
                            <KanbanColumn title="In Productie" tasks={tasksForActiveTab.inProgressTasks} onTimeLogAction={handleTimeLogAction} />
                            <KanbanColumn title="Voltooid" tasks={tasksForActiveTab.completedTasks} onTimeLogAction={handleTimeLogAction} />
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default MyProductionTasks;