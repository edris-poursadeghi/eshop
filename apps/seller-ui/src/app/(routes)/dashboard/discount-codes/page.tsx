'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import { ChevronRight, PlusIcon, TrashIcon, X } from 'lucide-react';
import Link from 'next/link';
import Input from 'packages/components/input';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function Page() {
  const [showModal, setShowModal] = useState(true);
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-discount-codes`
      );

      return res?.data?.discountCodes || [];
    },
  });

  console.log({ discountCodes });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: '',
      discountType: 'percent',
      discountValue: '',
      discountCode: '',
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationKey: ['create-discount-code'],
    mutationFn: async (data: FormData) => {
      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/create-discount-code`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-discounts'] });
      reset();
      setShowModal(false);
    },
  });

  const handleDeleteClick = async (discount: any) => {
    console.log(`handleDeleteClick`);
  };

  const onSubmit = async (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error('You can only create a maximum of 5 discount codes.');
      return;
    }
    createDiscountCodeMutation.mutate(data);
  };
  return (
    <div className="text-white w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-semibold">Discount Codes</h2>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => {
            setShowModal(true);
          }}
        >
          <PlusIcon size={18} /> Create Discount
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center text-white">
        <Link href={`/`} className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts ...</p>
        ) : (
          <table className=" w-full space-y-2">
            <thead>
              <tr className="border-b border-gray-800">
                <th className=" p-3 text-left">Title</th>
                <th className=" p-3 text-left">Type</th>
                <th className=" p-3 text-left">Value</th>
                <th className=" p-3 text-left">Code</th>
                <th className=" p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((discount: any) => (
                <tr
                  key={discount.id}
                  className="text-white border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{discount.public_name}</td>
                  <td className="p-3">
                    {discount.discountType === 'percent'
                      ? 'Percentage (%)'
                      : 'Flat ($)'}
                  </td>
                  <td className="p-3">
                    {discount.discountType === 'percent'
                      ? `${discount.discountValue}%`
                      : `$${discount.discountValue.toFixed(3)}`}
                  </td>
                  <td className="p-3">{discount.discountCode}</td>
                  <td className="p-3 flex items-center">
                    {' '}
                    <button
                      onClick={() => handleDeleteClick(discount)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </td>

                  <td className="p-3">{discount.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {discountCodes.length === 0 && !isLoading && (
          <p className="text-gray-400 text-center pt-5">
            No discount codes found.
          </p>
        )}
      </div>

      {/* Create Discount modal */}

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl text-white">Create Discount Code</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-300 transition"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              <div className="mt-4">
                <Input
                  label="Title (Public Name)"
                  placeholder="flash back offer"
                  {...register('public_name', {
                    required: 'Title is requried!',
                  })}
                />
                {errors.public_name && (
                  <p className="text-red-500 text-xs ">
                    {errors.public_name?.message as string}
                  </p>
                )}
              </div>

              {/* Discount Type */}
              <div className="mt-4">
                <label> Discount Type</label>
                <Controller
                  name="discountType"
                  control={control}
                  // rules={{ required: 'Discount Type is requried' }}
                  render={({ field }) => {
                    return (
                      <select
                        {...field}
                        className="w-full border p-2  border-gray-700 outline-none bg-transparent !rounded mb-1"
                        /*    {...register('discountType', {
                          required: 'category is requried',
                        })} */
                      >
                        <option value="percentage" className="bg-gray-700">
                          Percentage (%)
                        </option>
                        <option value="flat" className="bg-gray-700">
                          Flat Amount ($)
                        </option>
                      </select>
                    );
                  }}
                />

                {errors.discountType && (
                  <p className="text-red-500 text-sm ">
                    {String(errors.discountType.message)}
                  </p>
                )}
              </div>

              {/* Discount Value */}
              <div className="mt-4">
                <Input
                  label="Discount Value"
                  type="number"
                  placeholder="12"
                  className="outline-none"
                  min={1}
                  {...register('discountValue', {
                    required: 'Value is requried!',
                  })}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-xs ">
                    {errors.discountValue?.message as string}
                  </p>
                )}
              </div>

              {/* Discount Value */}
              <div className="mt-4">
                <Input
                  label="Discount Code"
                  placeholder="flash_back_offer"
                  className="outline-none"
                  {...register('discountCode', {
                    required: 'Value is requried!',
                  })}
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-xs ">
                    {errors.discountCode?.message as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={createDiscountCodeMutation.isPending}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2"
              >
                <PlusIcon size={18} />
                {createDiscountCodeMutation.isPending
                  ? 'Creating Code...'
                  : 'Create Code'}
              </button>

              {createDiscountCodeMutation.isError &&
                createDiscountCodeMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2 ">
                    {createDiscountCodeMutation.error?.response?.data
                      ?.message || createDiscountCodeMutation.error.message}
                  </p>
                )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
