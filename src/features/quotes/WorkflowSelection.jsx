import React from 'react';

/**
 * WorkflowSelection
 * Props:
 * - workflowTemplates: Array<{ id, name, title?, parameters?, params?, workflow?, productionSteps? }>
 * - handleTemplateSelect: (templateId: string) => void
 * - selectedTemplate: object | null
 * - isLoading: boolean
 * - formValues: object
 * - handleFormChange: (name, value, type?) => void
 * - showSelector: boolean (default true)
 */
const WorkflowSelection = ({
  workflowTemplates = [],
  handleTemplateSelect,
  selectedTemplate,
  isLoading,
  formValues = {},
  handleFormChange,
  showSelector = true
}) => {

  const renderParameterInput = (param, idx) => {
    if (!param || !param.name) return null;
    const value = formValues[param.name];
    const label = (
      <label className="label">
        <span className="label-text">{param.label || param.name}</span>
      </label>
    );
    const onChange = (e) => {
      const v =
        param.type === 'boolean'
          ? !!e.target.checked
          : (param.type === 'number' ? Number(e.target.value) : e.target.value);
      handleFormChange(param.name, v, param.type);
    };

    switch (param.type) {
      case 'select':
        return (
          <div key={param.name || idx} className="form-control">
            {label}
            <select className="select select-bordered w-full" value={value ?? ''} onChange={onChange}>
              <option value="">-- kies --</option>
              {Array.isArray(param.options) ? param.options.map((opt) => (
                <option key={String(opt)} value={String(opt)}>{String(opt)}</option>
              )) : null}
            </select>
          </div>
        );
      case 'multiselect':
        return (
          <div key={param.name || idx} className="form-control">
            {label}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.isArray(param.options) ? param.options.map((opt) => {
                const checked = Array.isArray(value) ? value.includes(opt) : false;
                return (
                  <label key={String(opt)} className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const arr = Array.isArray(value) ? [...value] : [];
                        if (e.target.checked) { if (!arr.includes(opt)) arr.push(opt); }
                        else { const i = arr.indexOf(opt); if (i >= 0) arr.splice(i, 1); }
                        handleFormChange(param.name, arr, param.type);
                      }}
                    />
                    <span className="label-text">{String(opt)}</span>
                  </label>
                );
              }) : null}
            </div>
          </div>
        );
      case 'boolean':
        return (
          <div key={param.name || idx} className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox" checked={!!value} onChange={onChange} />
              <span className="label-text">{param.label || param.name}</span>
            </label>
          </div>
        );
      case 'number':
        return (
          <div key={param.name || idx} className="form-control">
            {label}
            <input type="number" className="input input-bordered w-full" value={value ?? ''} onChange={onChange} />
          </div>
        );
      case 'text':
      default:
        return (
          <div key={param.name || idx} className="form-control">
            {label}
            <input type="text" className="input input-bordered w-full" value={value ?? ''} onChange={onChange} />
          </div>
        );
    }
  };

  // --- Parameters: guard all shapes and avoid flatMap
  const paramGroupsRaw = Array.isArray(selectedTemplate?.parameters)
    ? selectedTemplate.parameters
    : (Array.isArray(selectedTemplate?.params) ? selectedTemplate.params : []);
  const parameterGroups = Array.isArray(paramGroupsRaw) ? paramGroupsRaw : [];
  const parameterFields = parameterGroups.reduce((acc, g) => {
    if (g && Array.isArray(g.fields)) acc.push(...g.fields);
    else if (Array.isArray(g)) acc.push(...g);
    return acc;
  }, []);

  // --- Steps/workflow list
  const stepList = Array.isArray(selectedTemplate?.workflow)
    ? selectedTemplate.workflow
    : (Array.isArray(selectedTemplate?.productionSteps) ? selectedTemplate.productionSteps : []);

  const renderDynamicForm = () => {
    if (isLoading) return <div className="text-sm text-gray-500">Laden…</div>;
    if (!selectedTemplate) {
      return <div className="text-sm text-gray-600">Kies eerst een workflow-sjabloon.</div>;
    }
    return (
      <div className="space-y-4">
        {/* Parameters */}
        {parameterFields.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parameterFields.map(renderParameterInput)}
          </div>
        ) : (
          <div className="text-sm text-gray-500">Geen extra parameters voor dit sjabloon.</div>
        )}

        {/* Steps overview */}
        {stepList.length ? (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Productiestappen</h4>
            <ul className="list-disc pl-6 text-sm space-y-1">
              {stepList.map((s, i) => <li key={i}>{typeof s === 'string' ? s : (s?.name || JSON.stringify(s))}</li>)}
            </ul>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {showSelector && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Kies een Workflow Sjabloon</span>
          </label>
          <select
            className="select select-bordered w-full"
            onChange={(e) => handleTemplateSelect(e.target.value)}
            value={selectedTemplate?.id || ''}
          >
            <option value="">-- Selecteer een workflow --</option>
            {(workflowTemplates || []).map(t => <option key={t.id} value={t.id}>{t.name || t.title || `Template ${t.id}`}</option>)}
          </select>
        </div>
      )}

      <div className="mt-4">{renderDynamicForm()}</div>
    </div>
  );
};

export default WorkflowSelection;
