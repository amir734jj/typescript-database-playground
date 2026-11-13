import type { ComponentProps } from "preact";
import type { UseFormRegisterReturn } from "react-hook-form";

export function FormField({
  id,
  label,
  error,
  help,
  registration,
  ...inputProps
}: ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  help?: string;
  registration: UseFormRegisterReturn;
}) {
  const describedBy =
    [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div class="mb-3">
      <label class="form-label" for={id}>
        {label}
      </label>
      <input
        {...inputProps}
        {...registration}
        id={id}
        class={`form-control ${error ? "is-invalid" : ""}`}
        aria-invalid={!!error}
        aria-describedby={describedBy}
      />
      {help && (
        <div id={`${id}-help`} class="form-text">
          {help}
        </div>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <div id={id} class="invalid-feedback" role="alert">
      {message}
    </div>
  ) : null;
}
