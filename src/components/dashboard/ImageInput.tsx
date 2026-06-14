"use client"

import { useRef, useState } from "react"
import { ImagePlus, Link2, Loader2, X } from "lucide-react"

// Downscale + re-encode an uploaded image entirely in the browser, then return
// a compact JPEG data URL. Storing the image inline (in KV via the catalog
// overrides) keeps things dependency-free — no blob storage / tokens needed.
// Resizing keeps the data URL small enough for KV and fast page loads.
async function fileToResizedDataUrl(
  file: File,
  max = 1000,
  quality = 0.82,
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error("Could not read image"))
    i.src = dataUrl
  })

  let { width, height } = img
  if (width > max || height > max) {
    const scale = Math.min(max / width, max / height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL("image/jpeg", quality)
}

export default function ImageInput({
  value,
  onChange,
  placeholder = "Paste image link (https://…)",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)

  const isUploaded = value.startsWith("data:")

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setErr(false)
    try {
      onChange(await fileToResizedDataUrl(file))
    } catch {
      setErr(true)
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="flex items-start gap-3">
      {/* preview */}
      <div className="relative w-[68px] h-[52px] rounded-[8px] overflow-hidden bg-[#f0f0ff] flex items-center justify-center flex-shrink-0">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImagePlus size={18} className="text-[#b0b4fb]" />
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear image"
            className="absolute top-0.5 right-0.5 bg-black/55 hover:bg-black/75 rounded-full p-0.5"
          >
            <X size={11} className="text-white" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {/* URL field */}
        <div className="relative">
          <Link2
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9496a8]"
          />
          <input
            type="text"
            value={isUploaded ? "" : value}
            placeholder={isUploaded ? "Uploaded image ✓" : placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-[210px] text-[12px] border border-[#e8e8f0] rounded-[6px] pl-7 pr-2 h-[34px] text-[#666] focus:border-[#7f85f7] outline-none"
          />
        </div>

        {/* upload button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 text-[11px] font-medium border border-[#e8e8f0] rounded-[6px] h-[30px] px-2 text-[#534ab7] bg-[#f8f8ff] hover:border-[#7f85f7] transition-colors disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Processing…
            </>
          ) : (
            <>
              <ImagePlus size={12} /> Upload from device
            </>
          )}
        </button>
        {err && (
          <span className="text-[10px] text-red-500">
            Couldn&apos;t read that image — try another file.
          </span>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  )
}
