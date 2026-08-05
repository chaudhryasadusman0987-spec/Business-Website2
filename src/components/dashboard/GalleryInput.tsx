"use client"

import { Plus, Trash2 } from "lucide-react"
import ImageInput from "./ImageInput"

// Editor for a vehicle's extra photos — the shots shown in the detail modal's
// gallery, alongside the main card photo. Each slot is a plain ImageInput, so
// the admin can paste a link or upload from their phone exactly as they do
// everywhere else in the dashboard.

export default function GalleryInput({
  value,
  onChange,
  max = 8,
}: {
  value: string[]
  onChange: (next: string[]) => void
  /** Guard rail — photos are stored inline, so a huge gallery bloats the row. */
  max?: number
}) {
  const setAt = (i: number, v: string) =>
    onChange(value.map((img, idx) => (idx === i ? v : img)))

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div className="flex flex-col gap-2.5">
      {value.map((img, i) => (
        <div key={i} className="flex items-start gap-2">
          <ImageInput
            value={img}
            onChange={(v) => setAt(i, v)}
            placeholder={`Photo ${i + 2} link (https://…)`}
          />
          <button
            type="button"
            onClick={() => removeAt(i)}
            title="Remove this photo"
            className="w-8 h-8 rounded-[8px] flex items-center justify-center border border-[#f0d0d0] text-[#c0392b] hover:bg-[#fdecea] transition-colors flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {value.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...value, ""])}
          className="inline-flex items-center gap-1.5 self-start text-[11px] font-medium border border-dashed border-[#c8c9e8] rounded-[6px] h-[30px] px-3 text-[#534ab7] bg-[#f8f8ff] hover:border-[#7f85f7] transition-colors"
        >
          <Plus size={12} /> Add photo
        </button>
      ) : (
        <span className="text-[10px] text-[#9496a8]">
          Maximum {max} extra photos.
        </span>
      )}
    </div>
  )
}
