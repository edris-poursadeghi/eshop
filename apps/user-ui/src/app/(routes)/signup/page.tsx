'use client';
import { useMutation } from '@tanstack/react-query';
import GoogleButton from 'apps/user-ui/src/shared/components/google-button';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';

import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
  name: string;
  password: string;
};

function SignUp() {
  const [passwordVisibale, setPasswordVisibale] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState<FormData | null>(null);

  const inputRef = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
        {
          ...userData,
          otp: otp.join(''),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push('/login');
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRef.current.length - 1) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleOtpkeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      return inputRef.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Sign Up
      </p>

      <div className="w-full flex justify-center ">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg ">
          <h3 className="text-3xl font-semibold text-center mb-2 ">
            SignUp to Eshop
          </h3>

          <p className="text-center text-gray-500 mb-4">
            Already have an account{' '}
            <Link href={'/login'} className="text-blue-500">
              Login
            </Link>
          </p>

          <GoogleButton />

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3"> or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="text" className="block text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
                {...register('name', {
                  required: 'Name is required',
                })}
              />

              {errors.name && (
                <p className="text-red-500 text-sm ">
                  {String(errors.name.message)}
                </p>
              )}

              <label htmlFor="email" className="block text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@gamil.com"
                className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />

              {errors.email && (
                <p className="text-red-500 text-sm ">
                  {String(errors.email.message)}
                </p>
              )}

              <label htmlFor="password" className="block text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisibale ? 'text' : 'password'}
                  placeholder="******"
                  className="w-full border p-2 border-gray-300 outline-0 !rounded mb-1"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setPasswordVisibale((p) => !p)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                >
                  {passwordVisibale ? <Eye /> : <EyeOff />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm ">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full text-lg cursor-pointer mt-2 bg-black text-white py-2 rounded-lg"
              >
                {signupMutation.isPending ? 'Sign up ...' : 'Signup'}
              </button>

              {signupMutation.isError &&
                signupMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2 ">
                    {signupMutation.error?.response?.data?.message ||
                      signupMutation.error.message}
                  </p>
                )}
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold">Enter OTP</h3>
              <div className="flex justify-center gap-6">
                {otp.map((digit, index) => {
                  return (
                    <input
                      key={index}
                      type="text"
                      ref={(el) => {
                        if (el) inputRef.current[index] = el;
                      }}
                      maxLength={1}
                      className="size-12 text-center border border-gray-100 outline-none !rounded"
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpkeyDown(index, e)}
                    />
                  );
                })}
              </div>

              <button
                className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg "
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending ? 'Verify...' : 'Verify OTP'}
              </button>

              <p className="text-center text-sm pt-4">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className="text-blue-500 cursor-pointer"
                  >
                    resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>
              {verifyOtpMutation.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2 ">
                    {verifyOtpMutation.error?.response?.data?.message ||
                      verifyOtpMutation.error.message}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
