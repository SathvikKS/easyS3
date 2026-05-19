import * as React from 'react'
import { Check, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Connection, ConnectionFormValues } from '@/lib/types'

type AddConnectionDialogProps = {
  open: boolean
  initialValues?: Connection | null
  onOpenChange: (open: boolean) => void
  onSave: (values: ConnectionFormValues) => void | Promise<void>
}

type FieldDef = {
  key: keyof ConnectionFormValues
  label: string
  placeholderNew: string
  placeholderEdit: string
  mono: boolean
}

const FIELDS: FieldDef[] = [
  {
    key: 'name',
    label: 'Connection Name',
    placeholderNew: 'My Production Bucket',
    placeholderEdit: 'My Production Bucket',
    mono: false
  },
  {
    key: 'endpoint',
    label: 'Endpoint / Base URL',
    placeholderNew: 'https://s3.amazonaws.com',
    placeholderEdit: 'https://s3.amazonaws.com',
    mono: true
  },
  {
    key: 'key',
    label: 'Access Key ID',
    placeholderNew: 'AKIAIOSFODNN7EXAMPLE',
    placeholderEdit: 'Leave blank to keep existing',
    mono: true
  },
  {
    key: 'secret',
    label: 'Secret Access Key',
    placeholderNew: '••••••••••••••••••••••',
    placeholderEdit: 'Leave blank to keep existing',
    mono: true
  },
  {
    key: 'bucket',
    label: 'Default Bucket (opt.)',
    placeholderNew: 'my-bucket',
    placeholderEdit: 'my-bucket',
    mono: false
  },
  {
    key: 'region',
    label: 'Region',
    placeholderNew: 'us-east-1',
    placeholderEdit: 'us-east-1',
    mono: false
  }
]

const buildInitialForm = (initialValues?: Connection | null): ConnectionFormValues => ({
  name: initialValues?.name ?? '',
  endpoint: initialValues?.endpoint ?? '',
  key: '',
  secret: '',
  bucket: initialValues?.bucket ?? '',
  region: initialValues?.region ?? ''
})

export function AddConnectionDialog({
  open,
  initialValues,
  onOpenChange,
  onSave
}: AddConnectionDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <AddConnectionDialogBody
          initialValues={initialValues}
          onCancel={() => onOpenChange(false)}
          onSave={async (values) => {
            await onSave(values)
            onOpenChange(false)
          }}
        />
      )}
    </Dialog>
  )
}

type DialogBodyProps = {
  initialValues?: Connection | null
  onCancel: () => void
  onSave: (values: ConnectionFormValues) => Promise<void>
}

function AddConnectionDialogBody({
  initialValues,
  onCancel,
  onSave
}: DialogBodyProps): React.JSX.Element {
  const isEdit = !!initialValues
  const [form, setForm] = React.useState<ConnectionFormValues>(() =>
    buildInitialForm(initialValues)
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [isTesting, setIsTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<{
    success: boolean
    error?: string
    buckets?: number | null
  } | null>(null)

  const set = (k: keyof ConnectionFormValues, v: string): void => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await onSave(form)
    } catch (err) {
      setIsSaving(false)
      setSaveError(err instanceof Error ? err.message : 'Failed to save connection')
    }
  }

  const handleTest = async (): Promise<void> => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await window.api.connections.testConnect(form)
      setTestResult(result)
    } catch (err) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Test failed'
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? `Edit — ${initialValues?.name}` : 'New S3 Connection'}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-foreground/80">{field.label}</Label>
            <Input
              type={field.key === 'secret' ? 'password' : 'text'}
              value={form[field.key]}
              onChange={(e) => set(field.key, e.target.value)}
              placeholder={isEdit ? field.placeholderEdit : field.placeholderNew}
              className={cn('h-9', field.mono && 'font-mono text-[12px]')}
              disabled={isSaving}
            />
          </div>
        ))}
      </div>
      {testResult && (
        <div
          className={cn(
            'rounded-md px-3 py-2 text-[12.5px]',
            testResult.success
              ? 'bg-[color:var(--success-soft)] text-[color:var(--success)]'
              : 'bg-destructive/10 text-destructive'
          )}
        >
          {testResult.success
            ? `Connected — ${testResult.buckets ?? 0} bucket${testResult.buckets === 1 ? '' : 's'}`
            : (testResult.error ?? 'Connection failed')}
        </div>
      )}
      <DialogFooter className="border-t pt-3.5">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="outline" size="sm" disabled={isTesting || isSaving} onClick={handleTest}>
          {isTesting ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
          <span>Test Connection</span>
        </Button>
        <Button size="sm" disabled={isSaving} onClick={handleSave}>
          {isSaving ? <RefreshCw className="animate-spin" /> : <Check />}
          <span>{isEdit ? 'Save Changes' : 'Save & Connect'}</span>
        </Button>
      </DialogFooter>
      {saveError && (
        <p className="px-1 text-[12px] text-destructive">{saveError}</p>
      )}
    </DialogContent>
  )
}
