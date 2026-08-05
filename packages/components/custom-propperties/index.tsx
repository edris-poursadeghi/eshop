import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import Input from '../input';
import { PlusIcon, X } from 'lucide-react';

function CustomPropperties({ control, errors }: any) {
  const [propperties, setProperties] = useState<
    { label: string; value: string[] }[]
  >([]);

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name={`customProperties`}
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(propperties);
            }, [propperties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...propperties, { label: newLabel, value: [] }]);
              setNewLabel('');
            };

            const addValue = (index: number) => {
              if (!newValue.trim()) return;
              const updatedProperties = [...propperties];
              updatedProperties[index].value.push(newValue);
              setProperties(updatedProperties);
              setNewValue('');
            };

            const removeProperty = (index: number) => {
              setProperties(propperties.filter((_, i) => i !== index));
            };

            return (
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Custom Properties
                </label>

                <div className="flex flex-col gap-3">
                  {/* Existing  Properties */}
                  {propperties.map((propperty, index) => {
                    return (
                      <div
                        key={index}
                        className="border border-gray-700 p-3 rounded-lg bg-gray-900"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">
                            {propperty.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProperty(index)}
                          >
                            <X size={18} className="text-red-500" />
                          </button>
                        </div>

                        {/* add value to property */}

                        <div className="flex items-center mt-2 gap-2 ">
                          <input
                            type="text"
                            name=""
                            placeholder="Enter value ... "
                            onChange={(e) => setNewValue(e.target.value)}
                            className="border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full"
                          />

                          <button
                            type="button"
                            className="px-3 py-1 bg-blue-500 text-white rounded-md "
                            onClick={() => addValue(index)}
                          >
                            Add
                          </button>
                        </div>

                        {/* Show values */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {propperty.value.map((value, i) => {
                            return (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-700 text-white rounded-md"
                              >
                                {value}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add new property */}
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Enter property label (e.g./ Material , Warranty)"
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />

                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center justify-center"
                      onClick={addProperty}
                    >
                      <PlusIcon size={16} /> Add
                    </button>
                  </div>
                </div>
                {errors?.customProperties && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.customProperties.message as string}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export default CustomPropperties;
