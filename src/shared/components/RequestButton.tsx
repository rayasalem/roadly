/**
 * Reusable primary CTA for service requests (e.g. "Request service", "Confirm request").
 */
import React from 'react';
import { Button } from './Button';
import type { ButtonProps } from './Button';

export interface RequestButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'outline';
}

export function RequestButton({ variant = 'primary', ...rest }: RequestButtonProps) {
  return <Button variant={variant} {...rest} />;
}
