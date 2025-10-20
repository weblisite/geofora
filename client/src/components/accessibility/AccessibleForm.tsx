/**
 * Accessible Form Components
 * Enhanced form elements with accessibility features
 */

import React, { forwardRef } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { Textarea, TextareaProps } from '@/components/ui/textarea';
import { Label, LabelProps } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectProps } from '@/components/ui/select';
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem, RadioGroupProps } from '@/components/ui/radio-group';
import { useAccessibility } from './AccessibilityProvider';
import { cn } from '@/lib/utils';

// Accessible Input Component
interface AccessibleInputProps extends InputProps {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  screenReaderText?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    label,
    error,
    helpText,
    required = false,
    screenReaderText,
    className,
    id,
    ...props
  }, ref) => {
    const { announceToScreenReader } = useAccessibility();
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (screenReaderText) {
        announceToScreenReader(screenReaderText);
      }
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className={cn(
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            className
          )}
        >
          {label}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            error && 'error',
            className
          )}
          aria-describedby={cn(helpId, errorId)}
          aria-invalid={!!error}
          aria-required={required}
          onChange={handleChange}
          {...props}
        />
        {helpText && (
          <p id={helpId} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {screenReaderText && (
          <span className="sr-only" aria-live="polite">
            {screenReaderText}
          </span>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// Accessible Textarea Component
interface AccessibleTextareaProps extends TextareaProps {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  screenReaderText?: string;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({
    label,
    error,
    helpText,
    required = false,
    screenReaderText,
    className,
    id,
    ...props
  }, ref) => {
    const { announceToScreenReader } = useAccessibility();
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helpId = helpText ? `${textareaId}-help` : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (screenReaderText) {
        announceToScreenReader(screenReaderText);
      }
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <Label
          htmlFor={textareaId}
          className={cn(
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            className
          )}
        >
          {label}
        </Label>
        <Textarea
          ref={ref}
          id={textareaId}
          className={cn(
            error && 'error',
            className
          )}
          aria-describedby={cn(helpId, errorId)}
          aria-invalid={!!error}
          aria-required={required}
          onChange={handleChange}
          {...props}
        />
        {helpText && (
          <p id={helpId} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {screenReaderText && (
          <span className="sr-only" aria-live="polite">
            {screenReaderText}
          </span>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

// Accessible Select Component
interface AccessibleSelectProps extends Omit<SelectProps, 'children'> {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: string;
  helpText?: string;
  required?: boolean;
  placeholder?: string;
  screenReaderText?: string;
}

export const AccessibleSelect = forwardRef<HTMLButtonElement, AccessibleSelectProps>(
  ({
    label,
    options,
    error,
    helpText,
    required = false,
    placeholder = 'Select an option',
    screenReaderText,
    className,
    ...props
  }, ref) => {
    const { announceToScreenReader } = useAccessibility();
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helpId = helpText ? `${selectId}-help` : undefined;

    const handleValueChange = (value: string) => {
      if (screenReaderText) {
        announceToScreenReader(screenReaderText);
      }
      props.onValueChange?.(value);
    };

    return (
      <div className="space-y-2">
        <Label
          htmlFor={selectId}
          className={cn(
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            className
          )}
        >
          {label}
        </Label>
        <Select
          value={props.value}
          onValueChange={handleValueChange}
          {...props}
        >
          <SelectTrigger
            ref={ref}
            id={selectId}
            className={cn(
              error && 'error',
              className
            )}
            aria-describedby={cn(helpId, errorId)}
            aria-invalid={!!error}
            aria-required={required}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {helpText && (
          <p id={helpId} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {screenReaderText && (
          <span className="sr-only" aria-live="polite">
            {screenReaderText}
          </span>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

// Accessible Checkbox Component
interface AccessibleCheckboxProps extends CheckboxProps {
  label: string;
  error?: string;
  helpText?: string;
  screenReaderText?: string;
}

export const AccessibleCheckbox = forwardRef<HTMLButtonElement, AccessibleCheckboxProps>(
  ({
    label,
    error,
    helpText,
    screenReaderText,
    className,
    id,
    ...props
  }, ref) => {
    const { announceToScreenReader } = useAccessibility();
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const helpId = helpText ? `${checkboxId}-help` : undefined;

    const handleCheckedChange = (checked: boolean) => {
      if (screenReaderText) {
        announceToScreenReader(screenReaderText);
      }
      props.onCheckedChange?.(checked);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            ref={ref}
            id={checkboxId}
            className={cn(
              error && 'error',
              className
            )}
            aria-describedby={cn(helpId, errorId)}
            aria-invalid={!!error}
            onCheckedChange={handleCheckedChange}
            {...props}
          />
          <Label
            htmlFor={checkboxId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </Label>
        </div>
        {helpText && (
          <p id={helpId} className="text-sm text-muted-foreground ml-6">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-500 ml-6" role="alert">
            {error}
          </p>
        )}
        {screenReaderText && (
          <span className="sr-only" aria-live="polite">
            {screenReaderText}
          </span>
        )}
      </div>
    );
  }
);

AccessibleCheckbox.displayName = 'AccessibleCheckbox';

// Accessible Radio Group Component
interface AccessibleRadioGroupProps extends RadioGroupProps {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: string;
  helpText?: string;
  required?: boolean;
  screenReaderText?: string;
}

export const AccessibleRadioGroup = forwardRef<HTMLDivElement, AccessibleRadioGroupProps>(
  ({
    label,
    options,
    error,
    helpText,
    required = false,
    screenReaderText,
    className,
    ...props
  }, ref) => {
    const { announceToScreenReader } = useAccessibility();
    const radioGroupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${radioGroupId}-error` : undefined;
    const helpId = helpText ? `${radioGroupId}-help` : undefined;

    const handleValueChange = (value: string) => {
      if (screenReaderText) {
        announceToScreenReader(screenReaderText);
      }
      props.onValueChange?.(value);
    };

    return (
      <div className="space-y-2">
        <Label
          className={cn(
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            className
          )}
        >
          {label}
        </Label>
        <RadioGroup
          ref={ref}
          className={cn(
            error && 'error',
            className
          )}
          aria-describedby={cn(helpId, errorId)}
          aria-invalid={!!error}
          aria-required={required}
          onValueChange={handleValueChange}
          {...props}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`${radioGroupId}-${option.value}`}
                disabled={option.disabled}
              />
              <Label
                htmlFor={`${radioGroupId}-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {helpText && (
          <p id={helpId} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {screenReaderText && (
          <span className="sr-only" aria-live="polite">
            {screenReaderText}
          </span>
        )}
      </div>
    );
  }
);

AccessibleRadioGroup.displayName = 'AccessibleRadioGroup';
