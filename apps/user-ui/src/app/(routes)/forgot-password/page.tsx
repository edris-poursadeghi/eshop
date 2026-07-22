'use client';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';

import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
  password: string;
};

function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  console.log(step);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  console.log(serverError);

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

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`,
        { email }
      );
      return response.data;
    },

    onSuccess: (data, variables, context) => {
      // data     - What your mutationFn returns (response.data)
      // variables - What you passed to mutate() (the { email } object)
      // context  - Optional context object
      setUserEmail(variables.email);
      setStep('otp');
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string }).message ||
        'Invalid OTP. Try again!';
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`,
        { email: userEmail, otp: otp.join('') }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('reset');
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string }).message ||
        'Invalid OTP. Try again!';
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`,
        { email: userEmail, newPassword: password }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('email');
      toast.success(
        `Password reset successfully! Please login with your new passsword.`
      );
      setServerError(null);
      router.push('/');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string }).message ||
        'Invalid OTP. Try again!';
      setServerError(errorMessage);
    },
  });

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

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };
  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot-password
      </p>

      <div className="w-full flex justify-center ">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg ">
          {step === 'email' && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2 ">
                Login to Eshop
              </h3>

              <p className="text-center text-gray-500 mb-4">
                Go back to?
                <Link href={'/login'} className="text-blue-500">
                  Login
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitEmail)}>
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

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"
                >
                  {requestOtpMutation.isPending ? 'Sending OTP ...' : 'Submit'}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
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
                    onClick={() => {
                      if (userEmail)
                        requestOtpMutation.mutate({ email: userEmail });
                    }}
                    className="text-blue-500 cursor-pointer"
                  >
                    resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>
              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </>
          )}

          {step === 'reset' && (
            <>
              <h3 className="text-xl font-semibold">Reset Password</h3>

              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label htmlFor="text" className="block text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type={'password'}
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

                {errors.password && (
                  <p className="text-red-500 text-sm ">
                    {String(errors.password.message)}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full mt-4 text-lg cursor-pointer bg-black text-white py-2"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? 'Resseting...'
                    : 'Reset Password'}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
