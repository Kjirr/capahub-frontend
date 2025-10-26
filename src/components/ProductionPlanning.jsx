import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  getPlannableResources,
  getProductionBoard,
  updateProductionStep,
  getUnplannedSteps,
} from '@/api';
import { initiateSocketConnection, subscribeToEvent, unsubscribeFromEvent, disconnectSocket } from '../socket';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  subDays,
  isSameWeek,
} from 'date-fns';
import { nl } from 'date-fns/locale';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const EditStepModal = ({ step, isOpen, onClose, onSave, showNotification }) => {
    const [plannedDurationHours, setPlannedDurationHours] = useState(step?.plannedDurationHours || 0);
    const [status, setStatus] = useState(step?.status || 'PENDING');

    useEffect(() => {
        setPlannedDurationHours(step?.plannedDurationHours || 0);
        setStatus(step?.status || 'PENDING');
    }, [step]);

    if (!isOpen || !step) return null;

    const handleSave = async () => {
        const newDuration = Number(plannedDurationHours);
        if (status !== 'COMPLETED' && (isNaN(newDuration) || newDuration <= 0)) {
            showNotification('Voer een geldige duur in (groter dan 0).', 'error');
            return;
        }
        
        const payload = {
            plannedDurationHours: newDuration,
            status: status,
        };

        await onSave(step.id, payload);
    };
    
    const plannerSelectableStatuses = [
        'PENDING', 
        'PLANNED', 
        'READY_FOR_START', 
        'PAUSED',
        'COMPLETED' 
    ];

    return createPortal(
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Taak Bewerken: {step.title}</h3>
                <p className="py-2 text-sm">Order: {step.Order?.orderNumber}</p>
                
                <div className="form-control w-full mt-4">
                    <label className="label">
                        <span className="label-text">Geplande duur in uren</span>
                    </label>
                    <input
                        type="number"
                        value={plannedDurationHours}
                        onChange={(e) => setPlannedDurationHours(e.target.value)}
                        className="input input-bordered w-full"
                        step="0.1"
                    />
                </div>

                <div className="form-control w-full mt-4">
                    <label className="label">
                        <span className="label-text">Status</span>
                    </label>
                    <select 
                        className="select select-bordered w-full"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {!plannerSelectableStatuses.includes(step.status) && <option value={step.status} disabled>{step.status}</option>}
                        {plannerSelectableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="modal-action">
                    <button onClick={onClose} className="btn btn-ghost">Annuleren</button>
                    <button onClick={handleSave} className="btn btn-primary">Opslaan</button>
                </div>
            </div>
        </div>,
        document.body
    );
};


const statusStyles = {
  PENDING:          { label: 'Wachtend',     borderColor: 'border-l-gray-400' },
  READY_FOR_START:  { label: 'Klaar voor start', borderColor: 'border-l-teal-400' },
  PLANNED:          { label: 'Gepland',     borderColor: 'border-l-blue-500' },
  IN_PROGRESS:      { label: 'In Productie', borderColor: 'border-l-orange-500' },
  COMPLETED:        { label: 'Voltooid',     borderColor: 'border-l-green-500' },
  PAUSED:           { label: 'Gepauzeerd',    borderColor: 'border-l-yellow-500' },
  default:          { label: 'Onbekend',      borderColor: 'border-l-gray-700' }
};

const WorkloadIndicator = ({ plannedHours, capacityHours }) => {
  if (!capacityHours || capacityHours <= 0) {
    return null;
  }
  const percentage = Math.min((plannedHours / capacityHours) * 100, 100);
  const isOverbooked = plannedHours > capacityHours;
  let bgColorClass = 'bg-green-500';
  if (percentage >= 80 && percentage < 100) {
    bgColorClass = 'bg-yellow-500';
  } else if (percentage >= 100) {
    bgColorClass = 'bg-red-500';
  }
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
        <span className="font-semibold">Werkdruk</span>
        <span className={`font-bold ${isOverbooked ? 'text-red-600' : ''}`}>
          {plannedHours.toFixed(1)} / {capacityHours} uur
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${bgColorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const formatSeconds = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h.toString().padStart(2, '0'), m.toString().padStart(2, '0'), s.toString().padStart(2, '0')].join(':');
};

const ProgressBar = ({ task, liveTotalSeconds }) => {
    const plannedSeconds = (task.plannedDurationHours || 0) * 3600;
    const spentSeconds = liveTotalSeconds ?? task.totalTimeSpentSeconds ?? 0;
    if (plannedSeconds <= 0 || !['PLANNED', 'READY_FOR_START', 'IN_PROGRESS', 'PAUSED', 'COMPLETED'].includes(task.status)) {
        return null;
    }
    const percentage = Math.min((spentSeconds / plannedSeconds) * 100, 100);
    const remainingSeconds = Math.max(0, plannedSeconds - spentSeconds);
    return (
        <div className="mt-2">
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-gray-500">Voortgang</span>
                <span className="font-bold text-gray-600">{Math.round(percentage)}%</span>
            </div>
            <progress className="progress progress-primary w-full" value={percentage} max="100"></progress>
            <div className="text-xs text-gray-500 mt-1 text-right">
                Resterend: {formatSeconds(remainingSeconds)}
            </div>
        </div>
    );
};

const toDateKey = (val) => { if (!val) return null; const d = new Date(val); return isNaN(d) ? null : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const makeContainerId = (isoDate, resourceId) => `${isoDate}__${resourceId || 'unassigned'}`;
const parseContainerId = (id) => { const [isoDate, resourceIdStr] = String(id).split('__'); const resourceId = resourceIdStr === 'unassigned' ? null : resourceIdStr; return { isoDate, resourceId }; };

const DraggableStepCard = ({ step, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(step.id), data: { type: 'item', step } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 100 : 'auto' };
  
  const [liveTotalSeconds, setLiveTotalSeconds] = useState(step.totalTimeSpentSeconds);

  useEffect(() => {
      let timerInterval;
      if (step.status === 'IN_PROGRESS' && step.activeLogStartTime) {
          const startTime = new Date(step.activeLogStartTime).getTime();
          timerInterval = setInterval(() => {
              const now = Date.now();
              const elapsedSeconds = (now - startTime) / 1000;
              setLiveTotalSeconds(step.totalTimeSpentSeconds + elapsedSeconds);
          }, 1000);
      } else {
          setLiveTotalSeconds(step.totalTimeSpentSeconds);
      }
      return () => clearInterval(timerInterval);
  }, [step.status, step.activeLogStartTime, step.totalTimeSpentSeconds]);

  const displayStatus = (step.assignedResourceId && step.status === 'PENDING') ? 'PLANNED' : step.status;
  const currentStyle = statusStyles[displayStatus] || statusStyles.default;
  const isCompleted = step.status === 'COMPLETED';

  return (
    <div ref={setNodeRef} style={style} className={`card bg-base-100 shadow mb-2 w-full touch-none border-l-4 ${currentStyle.borderColor} ${isCompleted ? 'opacity-60 bg-base-200' : ''}`}>
      {step.status === 'READY_FOR_START' && (
        <div className="absolute -top-2 -right-2 z-10">
            <span className="badge badge-lg badge-success font-bold animate-pulse">KLAAR VOOR START</span>
        </div>
      )}
      <div className="card-body p-3">
        <div className="flex-row flex items-start gap-2">
          <div className="cursor-grab pt-1" {...attributes} {...listeners}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
                {isCompleted && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                )}
                 <p className={`font-bold text-sm ${isCompleted ? 'line-through' : ''}`}>{step.title}</p>
            </div>
            <p className="text-xs opacity-70">Order: {step.Order?.orderNumber}</p>
            <p className="text-xs opacity-70">Duur: {Number(step.plannedDurationHours).toFixed(1)} uur</p>
          </div>
          {!isCompleted && (
            <button onClick={() => onEdit(step)} className="btn btn-ghost btn-xs btn-square">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
          )}
        </div>
        {(liveTotalSeconds > 0) && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-2 pl-7">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{formatSeconds(liveTotalSeconds)}</span>
            </div>
        )}
        <div className="pl-7">
          <ProgressBar task={step} liveTotalSeconds={liveTotalSeconds} />
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ id, title, subtitle, items, children, isUnassigned = false, headerContent = null }) => { 
    const { setNodeRef } = useDroppable({ id, data: { type: 'container', id } }); 
    const bgColor = isUnassigned ? 'bg-gray-200' : 'bg-gray-100'; 
    return ( 
        <div className={`flex-shrink-0 w-72 ${bgColor} rounded-lg flex flex-col h-full`}> 
            <div className="p-3 border-b">
                <h2 className="font-bold leading-tight">{title}</h2>
                {subtitle && <h3 className="text-sm font-semibold text-gray-500 leading-tight">{subtitle}</h3>}
                {headerContent} 
            </div>
            <SortableContext items={items.map(i => String(i.id))} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="flex-grow p-3 pt-4 overflow-y-auto min-h-[5rem]">
                    {children}
                </div>
            </SortableContext> 
        </div> 
    ); 
};

const ProductionPlanning = ({ showNotification }) => {
  const [plannableResources, setPlannableResources] = useState([]);
  const [allSteps, setAllSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeItem, setActiveItem] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const [triggerReload, setTriggerReload] = useState(0);
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const weekInterval = useMemo(() => ({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) }), [currentDate]);
  const weekDays = useMemo(() => eachDayOfInterval(weekInterval), [weekInterval]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);

  const handleOpenModal = (step) => {
      setEditingStep(step);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingStep(null);
  };

  const handleSaveStep = async (stepId, payload) => {
      try {
          await updateProductionStep(stepId, payload);
          showNotification?.('Taak succesvol bijgewerkt!', 'success');
          handleCloseModal();
      } catch (error) {
          showNotification?.(`Opslaan mislukt: ${error.message}`, 'error');
      }
  };


  const loadBoardData = useCallback(async () => {
      setIsLoading(true);
      try {
        const [resourcesData, boardData, unplannedData] = await Promise.all([ 
            getPlannableResources(), 
            getProductionBoard(format(currentDate, 'yyyy-MM-dd')), 
            getUnplannedSteps() 
        ]);
        
        const resources = resourcesData || [];
        setPlannableResources(resources);
        
        if (!selectedResourceId && resources.length > 0) {
          setSelectedResourceId(resources[0].id);
        } else if (resources.length > 0 && !resources.some(r => r.id === selectedResourceId)) {
          setSelectedResourceId(resources[0].id);
        } else if (resources.length === 0) {
          setSelectedResourceId(null);
        }

        const combinedSteps = [...(boardData || []), ...(unplannedData || [])];
        setAllSteps(combinedSteps);
      } catch (error) {
        showNotification?.(`Fout bij laden van borddata: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
  }, [currentDate, showNotification, selectedResourceId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData, triggerReload]);

  useEffect(() => {
      initiateSocketConnection();
      const handlePlanningUpdate = () => {
          showNotification('Planning is live bijgewerkt!', 'info');
          setTriggerReload(c => c + 1);
      };
      subscribeToEvent('PLANNING_UPDATED', handlePlanningUpdate);
      return () => {
          unsubscribeFromEvent('PLANNING_UPDATED', handlePlanningUpdate);
          disconnectSocket();
      };
  }, [showNotification]);

  const handleDragStart = (event) => { setActiveItem(allSteps.find(s => s.id === event.active.id) || null); };

  const handleDragEnd = async ({ active, over }) => {
    setActiveItem(null);
    if (!over || !over.data.current || active.id === over.id) return;
    if (over.data.current?.type === 'container') {
        const { isoDate, resourceId } = parseContainerId(over.id);
        const stepToUpdate = allSteps.find(s => s.id === active.id);
        const newStatus = (stepToUpdate.status === 'PENDING' && resourceId) ? 'PLANNED' : stepToUpdate.status;
        const payload = {
            plannedStartDate: new Date(isoDate).toISOString(),
            assignedResourceId: resourceId,
            status: newStatus,
        };
        try {
            await updateProductionStep(active.id, payload);
            showNotification?.('Taak succesvol verplaatst!', 'success');
        } catch (error) {
            showNotification?.(`Verplaatsen mislukt: ${error.message}`, 'error');
        }
    }
  };
  
  // --- START WIJZIGING: Filteren van taken op basis van planbare resources ---
  const { visibleSteps, unassignedSteps } = useMemo(() => {
    const plannableResourceIds = new Set(plannableResources.map(r => r.id));
    
    // Filter ALLE taken: toon alleen taken die of niet toegewezen zijn, of toegewezen zijn aan een PLANBARE resource
    const visibleSteps = allSteps.filter(step => {
        return !step.assignedResourceId || plannableResourceIds.has(step.assignedResourceId);
    });

    // De 'Nog toe te wijzen' kolom bevat alleen de taken uit de zichtbare lijst die geen resource ID hebben
    const unassignedSteps = visibleSteps.filter(s => !s.assignedResourceId);

    return { visibleSteps, unassignedSteps };
  }, [allSteps, plannableResources]);
  // --- EINDE WIJZIGING ---
  
  const selectedResource = useMemo(() => plannableResources.find(r => r.id === selectedResourceId), [plannableResources, selectedResourceId]);

  const dailyWorkload = useMemo(() => {
    if (!selectedResource) return {};
    const workload = {};
    visibleSteps.forEach(step => { // Gebruik nu 'visibleSteps'
      if (String(step.assignedResourceId) === String(selectedResource.id)) {
        const dateKey = toDateKey(step.plannedStartDate);
        if (dateKey) {
          if (!workload[dateKey]) {
            workload[dateKey] = 0;
          }
          workload[dateKey] += Number(step.plannedDurationHours) || 0;
        }
      }
    });
    return workload;
  }, [visibleSteps, selectedResource]);

  if (isLoading && !selectedResource && plannableResources.length > 0) return <div className="text-center p-10">Planning laden...</div>;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <h1 className="page-title">Fabrieksplanning</h1>
              <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="btn btn-ghost btn-sm">‹ Vorige Week</button>
                  <button onClick={() => setCurrentDate(new Date())} className="btn btn-ghost btn-sm" disabled={isSameWeek(currentDate, new Date(), { weekStartsOn: 1 })}>Vandaag</button>
                  <span className="font-bold text-center w-48">{format(weekInterval.start, 'd MMM')} - {format(weekInterval.end, 'd MMM yyyy')}</span>
                  <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="btn btn-ghost btn-sm">Volgende Week ›</button>
              </div>
          </div>
          <div role="tablist" className="tabs tabs-boxed bg-base-200 mb-4 flex-shrink-0 justify-center">
              {plannableResources.map(resource => ( <a key={resource.id} role="tab" className={`tab ${selectedResourceId === resource.id ? 'tab-active font-bold' : ''}`} onClick={() => setSelectedResourceId(resource.id)}>{resource.name}</a> ))}
          </div>
          <div className="flex flex-grow overflow-x-auto">
              <div className="flex gap-4 h-full pb-4 px-4">
                  <KanbanColumn id={makeContainerId(format(new Date(), 'yyyy-MM-dd'), null)} title="Nog toe te wijzen" subtitle={`${unassignedSteps.length} taken`} items={unassignedSteps} isUnassigned={true}>
                      {unassignedSteps.map((step) => <DraggableStepCard key={step.id} step={step} onEdit={handleOpenModal} />)}
                  </KanbanColumn>
                  {selectedResource && weekDays.map((day) => {
                      const isoDate = format(day, 'yyyy-MM-dd');
                      const dayTitle = format(day, 'eeee d', { locale: nl });
                      const cid = makeContainerId(isoDate, selectedResource.id);
                      const stepsInCell = visibleSteps.filter(s => toDateKey(s.plannedStartDate) === isoDate && String(s.assignedResourceId) === String(selectedResource.id));
                      const headerContent = (
                        <WorkloadIndicator
                          plannedHours={dailyWorkload[isoDate] || 0}
                          capacityHours={selectedResource?.dailyCapacityHours ? Number(selectedResource.dailyCapacityHours) : 0}
                        />
                      );
                      return ( 
                        <KanbanColumn key={cid} id={cid} title={dayTitle} subtitle={selectedResource.name} items={stepsInCell} headerContent={headerContent}>
                            {stepsInCell.map((step) => <DraggableStepCard key={step.id} step={step} onEdit={handleOpenModal} />)}
                        </KanbanColumn> 
                      );
                  })}
              </div>
          </div>
      </div>
      <EditStepModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveStep}
          step={editingStep}
          showNotification={showNotification}
      />
      {createPortal(<DragOverlay>{activeItem ? <DraggableStepCard step={activeItem} /> : null}</DragOverlay>, document.body)}
    </DndContext>
  );
};

export default ProductionPlanning;