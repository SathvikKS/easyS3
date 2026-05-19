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
  onSave: (values: ConnectionFormValues) => void
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
          onSave={(values) => {
            onSave(values)
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
  onSave: (values: ConnectionFormValues) => void
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

  const set = (k: keyof ConnectionFormValues, v: string): void => setForm((f) => ({ ...f, [k]: v }))

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
            />
          </div>
        ))}
      </div>
      <DialogFooter className="border-t pt-3.5">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        {!isEdit && (
          <Button variant="outline" size="sm">
            <RefreshCw />
            <span>Test Connection</span>
          </Button>
        )}
        <Button size="sm" onClick={() => onSave(form)}>
          <Check />
          <span>{isEdit ? 'Save Changes' : 'Save & Connect'}</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
