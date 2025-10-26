import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '@/api';

const DESCRIPTION_MAX_LENGTH = 500;

const CreateJob = ({ showNotification }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: 1000,
    isPublic: false,
    deadline: '',
    quotingDeadline: '',
    properties: {
      productType: 'FLAT_PRINT',
      material: '',
      width_mm: '',
      height_mm: '',
      depth_mm: '',
      length_mm: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    const isPropertyField = [
      'productType',
      'material',
      'width_mm',
      'height_mm',
      'depth_mm',
      'length_mm',
    ].includes(name);

    if (isPropertyField) {
      setFormData((prev) => ({
        ...prev,
        properties: {
          ...prev.properties,
          [name]: val,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: val,
      }));
    }
  };

  const handleDescriptionChange = (e) => {
    if (e.target.value.length <= DESCRIPTION_MAX_LENGTH) {
      handleChange(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createJob(formData);
      showNotification('Opdracht succesvol aangemaakt!');
      navigate('/my-jobs');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    'w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500';
  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Nieuwe Opdracht Plaatsen
        </h1>
        <button
          onClick={() => navigate('/jobs-dashboard')}
          className="btn btn-ghost"
        >
          &larr; Terug naar overzicht
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className={labelClasses}>
              Titel
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className={labelClasses}>
              Omschrijving
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              className={inputClasses}
              rows="5"
              required
            ></textarea>
            <p className="text-right text-sm text-gray-500 mt-1">
              {formData.description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <label htmlFor="quantity" className={labelClasses}>
              Oplage
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="material" className={labelClasses}>
              Materiaal
            </label>
            <input
              id="material"
              name="material"
              type="text"
              value={formData.properties.material}
              onChange={handleChange}
              className={inputClasses}
              placeholder="bv. 150gr MC Gloss"
              required
            />
          </div>
          <div>
            <label htmlFor="deadline" className={labelClasses}>
              Uiterlijke Leverdatum
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="quotingDeadline" className={labelClasses}>
              Deadline Offertes
            </label>
            <input
              id="quotingDeadline"
              name="quotingDeadline"
              type="date"
              value={formData.quotingDeadline}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="productType" className={labelClasses}>
              Producttype
            </label>
            <select
              id="productType"
              name="productType"
              value={formData.properties.productType}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="FLAT_PRINT">Plat Drukwerk (bv. Flyer)</option>
              <option value="BOX">Doos / Verpakking</option>
              <option value="DISPLAY">Display</option>
              <option value="OTHER">Overig</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t">
          {formData.properties.productType === 'FLAT_PRINT' && (
            <>
              <div>
                <label htmlFor="width_mm" className={labelClasses}>
                  Breedte (mm)
                </label>
                <input
                  id="width_mm"
                  name="width_mm"
                  type="number"
                  value={formData.properties.width_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="height_mm" className={labelClasses}>
                  Hoogte (mm)
                </label>
                <input
                  id="height_mm"
                  name="height_mm"
                  type="number"
                  value={formData.properties.height_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
            </>
          )}
          {formData.properties.productType === 'BOX' && (
            <>
              <div>
                <label htmlFor="length_mm" className={labelClasses}>
                  Lengte (mm)
                </label>
                <input
                  id="length_mm"
                  name="length_mm"
                  type="number"
                  value={formData.properties.length_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="width_mm" className={labelClasses}>
                  Breedte (mm)
                </label>
                <input
                  id="width_mm"
                  name="width_mm"
                  type="number"
                  value={formData.properties.width_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="height_mm" className={labelClasses}>
                  Hoogte (mm)
                </label>
                <input
                  id="height_mm"
                  name="height_mm"
                  type="number"
                  value={formData.properties.height_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
            </>
          )}
          {formData.properties.productType === 'DISPLAY' && (
            <>
              <div>
                <label htmlFor="length_mm" className={labelClasses}>
                  Lengte (mm)
                </label>
                <input
                  id="length_mm"
                  name="length_mm"
                  type="number"
                  value={formData.properties.length_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="width_mm" className={labelClasses}>
                  Breedte (mm)
                </label>
                <input
                  id="width_mm"
                  name="width_mm"
                  type="number"
                  value={formData.properties.width_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="height_mm" className={labelClasses}>
                  Hoogte (mm)
                </label>
                <input
                  id="height_mm"
                  name="height_mm"
                  type="number"
                  value={formData.properties.height_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="depth_mm" className={labelClasses}>
                  Diepte (mm)
                </label>
                <input
                  id="depth_mm"
                  name="depth_mm"
                  type="number"
                  value={formData.properties.depth_mm}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              id="isPublic"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="isPublic"
              className="ml-3 block text-sm text-gray-900"
            >
              Plaats deze opdracht ook openbaar op de Marktplaats
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Bezig met plaatsen...' : 'Opdracht Plaatsen'}
        </button>
      </form>
    </div>
  );
};

export default CreateJob;