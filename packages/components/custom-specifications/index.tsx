import React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import Input from '../input';
import { PlusCircle, TrashIcon } from 'lucide-react';

function CustomSpecifications({ control, errors }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_specifications',
  });

  console.log(fields);

  return (
    <div>
      <label className="block font-semibold text-gray-300 mb-1">
        CustomSpecifications
      </label>

      <div className="flex flex-col gap-3">
        {fields.map((item, index) => {
          return (
            <div key={index} className="flex gap-2 items-center">
              <Controller
                name={`custom_specifications.${index}.name`}
                control={control}
                rules={{ required: 'specification name is required' }}
                render={({ field }) => {
                  return (
                    <Input
                      label="Spesification Name"
                      placeholder="e.g., Battery Life, weight , material"
                      {...field}
                    />
                  );
                }}
              />

              <Controller
                name={`custom_specifications.${index}.value`}
                control={control}
                rules={{ required: 'value name is required' }}
                render={({ field }) => {
                  return (
                    <Input
                      label="value"
                      placeholder="e.g., 4000mAh, 1.5kg , Plastic"
                      {...field}
                    />
                  );
                }}
              />

              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => remove(index)}
              >
                <TrashIcon size={20} />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
          onClick={() => append({ name: '', value: '' })}
        >
          <PlusCircle size={20} /> Add Spesification
        </button>
      </div>
      {errors?.custom_specifications && (
        <p className="text-red-500 text-xs mt-1">
          {errors?.custom_specifications.message as string}
        </p>
      )}
    </div>
  );
}

export default CustomSpecifications;
