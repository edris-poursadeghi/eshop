import React from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { shopCategories } from '../../../utils/category';

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data
      );

      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = (data: any) => {
    const shopData = { ...data, sellerId };

    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Create Account
        </h3>

        <label htmlFor="name" className="block text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          placeholder="shop name"
          className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
          {...register('name', {
            required: 'Name is required',
          })}
        />

        <label htmlFor="bio" className="block text-gray-700 mb-1">
          Bio (Max 100 words)*
        </label>
        <input
          type="text"
          placeholder="shop bio"
          className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
          {...register('bio', {
            required: 'Shop bio is required',
            validate: (value) => {
              countWords(value) <= 100 || "Bio can't exceed 100 words";
            },
          })}
        />

        {errors.bio && (
          <p className="text-red-500 text-sm ">{String(errors.bio.message)}</p>
        )}

        <label htmlFor="address" className="block text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          placeholder="shop Location"
          className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
          {...register('address', {
            required: 'Shop address is required',
          })}
        />

        {errors.address && (
          <p className="text-red-500 text-sm ">
            {String(errors.address.message)}
          </p>
        )}

        <label htmlFor="opening_hours" className="block text-gray-700 mb-1">
          Opening Hours *
        </label>
        <input
          type="text"
          placeholder="e.g, Mon-Fri 9AM - 6PM"
          className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
          {...register('opening_hours', {
            required: 'Opening hours are required',
          })}
        />

        {errors.opening_hours && (
          <p className="text-red-500 text-sm ">
            {String(errors.opening_hours.message)}
          </p>
        )}

        <label htmlFor="url" className="block text-gray-700 mb-1">
          Website
        </label>
        <input
          type="website"
          placeholder="https://example.com"
          className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
          {...register('website', {
            pattern: {
              value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
              message: 'Enter a valid URL',
            },
          })}
        />

        {errors.url && (
          <p className="text-red-500 text-sm ">{String(errors.url.message)}</p>
        )}

        <label htmlFor="email" className="block text-gray-700 mb-1">
          Category *
        </label>
        <select
          className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
          {...register('category', { required: 'Country is requried' })}
        >
          <option value="">Select your Category</option>
          {shopCategories.map((category) => {
            return (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            );
          })}
        </select>

        {errors.category && (
          <p className="text-red-500 text-sm ">
            {String(errors.category.message)}
          </p>
        )}

        <button
          type="submit"
          disabled={shopCreateMutation.isPending}
          className="w-full text-lg cursor-pointer mt-2 bg-black text-white py-2 rounded-lg"
        >
          {shopCreateMutation.isPending ? 'Create ...' : 'Create'}
        </button>

        {shopCreateMutation.isError &&
          shopCreateMutation.error instanceof AxiosError && (
            <p className="text-red-500 text-sm mt-2 ">
              {shopCreateMutation.error?.response?.data?.message ||
                shopCreateMutation.error.message}
            </p>
          )}

        <p className="text-center text-gray-500 mt-4">
          Already have an account{' '}
          <Link href={'/login'} className="text-blue-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default CreateShop;
