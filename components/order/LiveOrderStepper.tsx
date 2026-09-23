'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

interface LiveOrderStepperProps {
  status: OrderStatus;
  orderType?: 'delivery' | 'pickup' | 'dine_in';
  createdAt?: string;
  updatedAt?: string;
}

const steps = [
  {
    key: 'pending',
    label: 'Order Placed',
    desc: 'Sent to restaurant kitchen',
    icon: Clock,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    desc: 'Accepted by manager',
    icon: CheckCircle2,
  },
  {
    key: 'preparing',
    label: 'In the Kitchen',
    desc: 'Chef is crafting your meal',
    icon: ChefHat,
  },
  {
    key: 'out_for_delivery',
    label: 'On the Way',
    desc: 'Rider en route to you',
    icon: Bike,
  },
  {
    key: 'delivered',
    label: 'Delivered / Ready',
    desc: 'Bon appétit!',
    icon: PackageCheck,
  },
];

export default function LiveOrderStepper({
  status,
  orderType = 'delivery',
  createdAt,
  updatedAt,
}: LiveOrderStepperProps) {
  if (status === 'cancelled') {
    return (
      <div className="p-6 bg-rose-950/40 border border-rose-800/60 rounded-3xl text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-rose-900/60 text-rose-400 flex items-center justify-center mx-auto">
          <XCircle className="w-7 h-7" />
        </div>
        <h4 className="font-serif text-lg font-bold text-white">Order Cancelled</h4>
        <p className="text-xs text-rose-300">
          This order has been cancelled. If you have questions, please contact support.
        </p>
      </div>
    );
  }

  const getStepIndex = (st: OrderStatus) => {
    switch (st) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
            Live Kitchen & Delivery Tracker
          </span>
        </div>
        {updatedAt && (
          <span className="text-[11px] text-slate-500 font-mono">
            Updated: {new Date(updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Stepper track */}
      <div className="relative">
        <div className="hidden sm:block absolute top-6 left-8 right-8 h-1 bg-slate-800 -z-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            let iconBox = 'bg-slate-950 border-slate-800 text-slate-600';
            if (isCompleted) {
              iconBox = 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20';
            } else if (isCurrent) {
              iconBox =
                'bg-amber-400 text-slate-950 border-amber-300 shadow-xl shadow-amber-400/30 scale-110 ring-4 ring-amber-400/20 animate-pulse';
            }

            return (
              <div
                key={step.key}
                className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2"
              >
                <div
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${iconBox}`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h5
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-amber-400'
                        : isCompleted
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </h5>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
