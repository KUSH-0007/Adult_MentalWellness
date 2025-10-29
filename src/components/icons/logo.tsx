import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <BrainCircuit className={cn('h-8 w-8 text-primary', className)} />
  );
}
