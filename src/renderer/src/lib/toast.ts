import { toast } from 'sonner'

export function toastSuccess(message: string, description?: string): void {
  toast.success(message, { description, duration: 3000 })
}

export function toastError(message: string, description?: string): void {
  toast.error(message, { description, duration: 4000 })
}

export function toastWarning(message: string, description?: string): void {
  toast.warning(message, { description, duration: 4000 })
}

export function toastInfo(message: string, description?: string): void {
  toast.info(message, { description, duration: 3000 })
}

export function toastPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
): Promise<T> {
  toast.promise(promise, messages)
  return promise
}
