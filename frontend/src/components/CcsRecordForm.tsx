import { useState, useEffect } from 'react';
import { NumberInput } from './NumberInput';

interface CcsRecordFormProps {
  onSubmit: (data: CcsRecordData) => void;
  loading: boolean;
  sessionKey: string; // Unique key for this form session (e.g., "ccs-1-2" for section 1, shift 2)
}

export interface CcsRecordData {
  bafIn: number;
  bafOut: number;
  crmIn: number;
  crmOut: number;
  shippedOut: number;
  tuggerIn: number;
  tuggerOff: number;
  totalTrucksIn: number;
  totalTrucksOut: number;
  totalMovements: number;
  totalTrucks: number;
  hook: number;
  downTime: number;
  movedOfShipping: number;
  slitterOn: number;
  slitterOff: number;
  coilsHatted: number;
  issues: string;
}

const getInitialFormData = (sessionKey: string): CcsRecordData => {
  const savedData = localStorage.getItem(`form-draft-${sessionKey}`);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch {
      // If parsing fails, return default values
    }
  }
  return {
    bafIn: 0,
    bafOut: 0,
    crmIn: 0,
    crmOut: 0,
    shippedOut: 0,
    tuggerIn: 0,
    tuggerOff: 0,
    totalTrucksIn: 0,
    totalTrucksOut: 0,
    totalMovements: 0,
    totalTrucks: 0,
    hook: 0,
    downTime: 0,
    movedOfShipping: 0,
    slitterOn: 0,
    slitterOff: 0,
    coilsHatted: 0,
    issues: '',
  };
};

export const CcsRecordForm = ({ onSubmit, loading, sessionKey }: CcsRecordFormProps) => {
  const [formData, setFormData] = useState<CcsRecordData>(() => getInitialFormData(sessionKey));

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`form-draft-${sessionKey}`, JSON.stringify(formData));
  }, [formData, sessionKey]);

  const updateField = (field: keyof CcsRecordData, value: number | string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Clear saved draft after successful submission
    localStorage.removeItem(`form-draft-${sessionKey}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BAF Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          BAF Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberInput
            label="BAF In"
            value={formData.bafIn}
            onChange={(val) => updateField('bafIn', val)}
          />
          <NumberInput
            label="BAF Out"
            value={formData.bafOut}
            onChange={(val) => updateField('bafOut', val)}
          />
        </div>
      </div>

      {/* CRM Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          CRM Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberInput
            label="CRM In"
            value={formData.crmIn}
            onChange={(val) => updateField('crmIn', val)}
          />
          <NumberInput
            label="CRM Out"
            value={formData.crmOut}
            onChange={(val) => updateField('crmOut', val)}
          />
          <NumberInput
            label="Shipped Out"
            value={formData.shippedOut}
            onChange={(val) => updateField('shippedOut', val)}
          />
        </div>
      </div>

      {/* Tugger Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tugger Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberInput
            label="Tugger In"
            value={formData.tuggerIn}
            onChange={(val) => updateField('tuggerIn', val)}
          />
          <NumberInput
            label="Tugger Off"
            value={formData.tuggerOff}
            onChange={(val) => updateField('tuggerOff', val)}
          />
        </div>
      </div>

      {/* Trucks Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Truck Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberInput
            label="Total Trucks In"
            value={formData.totalTrucksIn}
            onChange={(val) => updateField('totalTrucksIn', val)}
          />
          <NumberInput
            label="Total Trucks Out"
            value={formData.totalTrucksOut}
            onChange={(val) => updateField('totalTrucksOut', val)}
          />
          <NumberInput
            label="Total Movements"
            value={formData.totalMovements}
            onChange={(val) => updateField('totalMovements', val)}
          />
          <NumberInput
            label="Total Trucks"
            value={formData.totalTrucks}
            onChange={(val) => updateField('totalTrucks', val)}
          />
        </div>
      </div>

      {/* Operations Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Operations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberInput
            label="Hook"
            value={formData.hook}
            onChange={(val) => updateField('hook', val)}
          />
          <NumberInput
            label="Down Time (hours)"
            value={formData.downTime}
            onChange={(val) => updateField('downTime', val)}
            step={0.5}
            max={24}
          />
          <NumberInput
            label="Moved of Shipping"
            value={formData.movedOfShipping}
            onChange={(val) => updateField('movedOfShipping', val)}
          />
        </div>
      </div>

      {/* Slitter Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Slitter Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberInput
            label="Slitter On"
            value={formData.slitterOn}
            onChange={(val) => updateField('slitterOn', val)}
          />
          <NumberInput
            label="Slitter Off"
            value={formData.slitterOff}
            onChange={(val) => updateField('slitterOff', val)}
          />
          <NumberInput
            label="Coils Hatted"
            value={formData.coilsHatted}
            onChange={(val) => updateField('coilsHatted', val)}
          />
        </div>
      </div>

      {/* Issues Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Issues & Notes
        </h3>
        <textarea
          value={formData.issues}
          onChange={(e) => updateField('issues', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter any issues, observations, or notes for this shift..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Saving...' : 'Save CCS Record'}
        </button>
      </div>
    </form>
  );
};
