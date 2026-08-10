'use client';

import { ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ImagePlaceHolder from '../../../shared/components/image-placeholder';
import Input from 'packages/components/input';
import ColorSelector from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custom-specifications';
import CustomPropperties from 'packages/components/custom-propperties';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';

import RichTextEditor from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/size-selector';

function Page() {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/product/api/get-categories');
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch('category');
  const regularPrice = watch('regular_price');

  const subcategory = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  console.log(categories, subCategoriesData);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];

    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }

    setImages(updatedImages);
    setValue('images', updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    console.log(images, index);

    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      console.log(updatedImages);
      return updatedImages;
    });

    setValue('images', images);
  };

  const videoUrlPattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/;

  const handleSaveDraft = () => {};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="text-white w-full mx-auto p-8 shadow-md rounded-lg "
    >
      {/* Heading & Breadcram */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white ">
        Create Product
      </h2>

      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashbard</span>
        <ChevronRight size={20} className="opacity-[0.8]" />
        <span>Create Product</span>
      </div>

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left side - Image upload section */}
        <div className="md:w-[35%]">
          {images.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 * 850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                setOpenImageModal={setOpenImageModal}
                size="765 * 850"
                small
                key={index}
                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        {/* Right side - form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product Title Input */}

            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register('title', { required: 'Title is requried!' })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs ">
                  {errors.title?.message as string}
                </p>
              )}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description"
                  {...register('description', {
                    required: 'Title is requried!',
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs ">
                    {errors.title?.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple,flagship"
                  {...register('tags', {
                    required: 'seperate related products tags with a coma, ',
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs ">
                    {errors.tags?.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register('slug', {
                    required: 'Slug is required',
                    minLength: {
                      value: 3,
                      message: 'Slug must be at least 3 characters',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Slug must not exceed 50 characters',
                    },
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        'Slug can only contain lowercase letters, numbers, and hyphens',
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs ">
                    {errors.slug?.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register('brand')}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs ">
                    {errors.brand?.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <CustomPropperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On delivery *
                </label>

                <select
                  className="w-full border outline-none border-gray-700 bg-transparent p-2"
                  {...register('cash_on_delivery', {
                    required: 'Cash on Delivery is required',
                  })}
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs ">
                    {errors.cash_on_delivery?.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4">
              Category *
              {isLoading ? (
                <p className="text-gray-400">loading category</p>
              ) : isError ? (
                <p className="text-red-500">Faild to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is requried' }}
                  render={({ field }) => {
                    return (
                      <select
                        {...field}
                        className="w-full border p-2  border-gray-700 outline-0 bg-black !rounded mb-1"
                        {...register('category', {
                          required: 'category is requried',
                        })}
                      >
                        <option value="">Select your Category</option>
                        {categories.map((category: string) => {
                          return (
                            <option
                              className="bg-black"
                              key={category}
                              value={category}
                            >
                              {category}
                            </option>
                          );
                        })}
                      </select>
                    );
                  }}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-sm ">
                  {String(errors.category.message)}
                </p>
              )}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Subcategory *{' '}
                </label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: 'Subcategory is requried' }}
                  render={({ field }) => {
                    return (
                      <select
                        {...field}
                        className="w-full border p-2  border-gray-700 outline-0 bg-black !rounded mb-1"
                        {...register('subcategory', {
                          required: 'subcategory is requried',
                        })}
                      >
                        <option value="">Select your Subcategory</option>
                        {subcategory.map((subcategory: string) => {
                          return (
                            <option
                              className="bg-black"
                              key={subcategory}
                              value={subcategory}
                            >
                              {subcategory}
                            </option>
                          );
                        })}
                      </select>
                    );
                  }}
                />
                {errors.subcategory && (
                  <p className="text-red-500 text-sm ">
                    {String(errors.subcategory.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detaild_description"
                  control={control}
                  rules={{
                    required: 'Detailed is requried',
                    validate: (value) => {
                      const wordCount = value
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 100 ||
                        'Description must be at least 100 words!'
                      );
                    },
                  }}
                  render={({ field }) => {
                    return (
                      <RichTextEditor
                        onChange={field.onChange}
                        value={field.value}
                      />
                    );
                  }}
                />
                {errors.detaild_description && (
                  <p className="text-red-500 text-sm ">
                    {String(errors.detaild_description.message)}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/watch?v=example"
                  {...register('video_url', {
                    pattern: {
                      value: videoUrlPattern,
                      message: 'Please enter a valid YouTube or Vimeo URL',
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs ">
                    {errors.video_url?.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="20$"
                  {...register('regular_price', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Price must be at least 1' },
                    validate: (value) => {
                      return !isNaN(value) || 'Price must be a number';
                    },
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs ">
                    {errors.regular_price?.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="15$"
                  {...register('sale_price', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Sale Price must be at least 1' },
                    validate: (value) => {
                      if (!isNaN(value)) return 'Sale Price must be a number';
                      if (regularPrice && value >= regularPrice) {
                        return 'Sale Price must be less than Regular Price';
                      }
                      return true;
                    },
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs ">
                    {errors.regular_price?.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register('stock', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Stock must be at least 1' },
                    max: {
                      value: 1000,
                      message: 'Stock must be less than 1000',
                    },
                    validate: (value) => {
                      if (!isNaN(value)) return 'Stock must be a number';
                      if (!Number.isInteger(value)) {
                        return 'Stock must be an integer';
                      }
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs ">
                    {errors.stock?.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <label> Select Discount Codes (Optional)</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {loading ? 'Creating ...' : 'Create'}
        </button>
      </div>
    </form>
  );
}

export default Page;
