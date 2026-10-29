"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

export interface SignaturePadHandle {
  isEmpty: () => boolean
  clear: () => void
  toBlob: () => Promise<Blob | null>
}

// On-screen signature for handover / return checklists. Pointer events cover
// mouse, pen and touch; touch-action: none stops the page scrolling while the
// customer signs on a phone or tablet.
const SignaturePad = forwardRef<SignaturePadHandle, { height?: number }>(function SignaturePad(
  { height = 160 },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawn = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = height * ratio
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(ratio, ratio)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 2.2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    let drawing = false
    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const down = (e: PointerEvent) => {
      drawing = true
      drawn.current = true
      canvas.setPointerCapture(e.pointerId)
      const { x, y } = pos(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
    const move = (e: PointerEvent) => {
      if (!drawing) return
      const { x, y } = pos(e)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    const up = () => {
      drawing = false
    }
    canvas.addEventListener("pointerdown", down)
    canvas.addEventListener("pointermove", move)
    canvas.addEventListener("pointerup", up)
    canvas.addEventListener("pointercancel", up)
    return () => {
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      canvas.removeEventListener("pointerup", up)
      canvas.removeEventListener("pointercancel", up)
    }
  }, [height])

  useImperativeHandle(ref, () => ({
    isEmpty: () => !drawn.current,
    clear: () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      drawn.current = false
    },
    toBlob: () =>
      new Promise((resolve) => {
        const canvas = canvasRef.current
        if (!canvas) return resolve(null)
        canvas.toBlob(resolve, "image/png")
      }),
  }))

  return (
    <canvas
      ref={canvasRef}
      style={{ height, touchAction: "none" }}
      className="w-full border-2 border-dashed border-[#e8e8f0] rounded-[10px] bg-white cursor-crosshair"
    />
  )
})

export default SignaturePad
