import { Controller } from 'react-hook-form';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function SizeSelector({ control, errors }: any) {
  // value: (2) ['XS', 'L']
  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1">Sizes</label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => {
          console.log(field);

          return (
            <div className="flex flex-wrap gap-2">
              {sizes.map((size, i) => {
                const isSelected = (field.value || []).includes(size);
                console.log({ isSelected });

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      field.onChange(
                        isSelected
                          ? field.value.filter((s: string) => s !== size)
                          : [...(field.value || []), size]
                      );
                    }}
                    className={`px-3 py-1 rounded-lg font-poppins transition-colors ${
                      isSelected
                        ? 'bg-gray-700 text-white border-[#ffffff6b]'
                        : 'bg-gray-900 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
      {errors.sizes && (
        <p className="text-red-500 text-xs ">
          {errors.sizes?.message as string}
        </p>
      )}
    </div>
  );
}

export default SizeSelector;
