'use client'

interface SuccessModalProps {
  title: string
  message: string
  buttonText?: string
  onClose?: () => void
  busy?: boolean
}

export default function SuccessModal({
  title,
  message,
  buttonText = 'ดำเนินการต่อ',
  onClose,
  busy = false
}: SuccessModalProps) {
  return (
    <div className="animated-alert-backdrop">
      <div className="animated-alert-card relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white p-8 text-center shadow-2xl md:p-10">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400" />

        <div className="animated-alert-icon mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
          <svg className="h-12 w-12 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
          </svg>
        </div>

        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.25em] text-emerald-600">Success</p>
        <h2 className="text-2xl font-black text-slate-900 md:text-3xl">{title}</h2>
        <p className="mt-3 leading-7 text-slate-500">{message}</p>

        {busy ? (
          <div className="mt-7 flex items-center justify-center gap-3 text-sm font-bold text-indigo-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            กำลังพาคุณไปยังหน้าถัดไป...
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mt-7 w-full cursor-pointer rounded-2xl bg-slate-900 px-5 py-3.5 font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-600"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}
