"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Check } from "lucide-react"

interface Agreement {
  status: string
  renterName: string
  renterEmail: string
  make: string
  model: string
  rego: string
  weeklyRent: string | number
  securityDeposit: string | number
  insuranceAccessFee: string | number
}

export default function SignAgreementPage() {
  const { id } = useParams()
  const [agreement, setAgreement] = useState<Agreement | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [done, setDone] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const hasSignature = useRef(false)

  useEffect(() => {
    fetch(`/api/agreements/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.agreement) setAgreement(d.agreement)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [id])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 2
    ctx.lineCap = "round"

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const point = "touches" in e ? e.touches[0] : e
      const x = point.clientX - rect.left
      const y = point.clientY - rect.top
      return { x, y }
    }

    const start = (e: MouseEvent | TouchEvent) => {
      drawing.current = true
      hasSignature.current = true
      const { x, y } = getPos(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return
      e.preventDefault()
      const { x, y } = getPos(e)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    const end = () => {
      drawing.current = false
    }

    canvas.addEventListener("mousedown", start)
    canvas.addEventListener("mousemove", move)
    canvas.addEventListener("mouseup", end)
    canvas.addEventListener("touchstart", start)
    canvas.addEventListener("touchmove", move)
    canvas.addEventListener("touchend", end)

    return () => {
      canvas.removeEventListener("mousedown", start)
      canvas.removeEventListener("mousemove", move)
      canvas.removeEventListener("mouseup", end)
      canvas.removeEventListener("touchstart", start)
      canvas.removeEventListener("touchmove", move)
      canvas.removeEventListener("touchend", end)
    }
  }, [agreement])

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      hasSignature.current = false
    }
  }

  const handleSubmit = async () => {
    if (!agreed || !hasSignature.current) return
    setSubmitting(true)
    setSubmitError("")
    try {
      const dataUrl = canvasRef.current!.toDataURL("image/png")
      const res = await fetch(`/api/agreements/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl: dataUrl }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setSubmitError("Could not submit your signature. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#9496a8] px-4 text-center">
        This agreement link is not valid or has expired. Please contact Pak
        Oz Rentals for a new link.
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#9496a8]">
        Loading agreement...
      </div>
    )
  }

  if (agreement.status === "signed" || done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-[20px] p-10 max-w-[480px] text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#e1f5ee] flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-[#0f6e56]" />
          </div>
          <h2 className="font-bold text-[22px] text-[#1a1a2e] mb-2">
            Agreement Signed!
          </h2>
          <p className="text-[#666] text-[14px]">
            A copy has been emailed to {agreement.renterEmail}. Thank you
            for renting with Pak Oz Rentals.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f8] py-10 px-4">
      <div className="max-w-[700px] mx-auto bg-white rounded-[20px] p-8 shadow-sm">
        <h1 className="font-bold text-[24px] text-[#1a1a2e] mb-1">
          Pak Oz Rentals — Lease Agreement
        </h1>
        <p className="text-[13px] text-[#9496a8] mb-6">
          {agreement.make} {agreement.model} ({agreement.rego})
        </p>

        <div className="bg-[#f8f8ff] rounded-[14px] p-5 mb-6 max-h-[400px] overflow-y-auto text-[13px] text-[#444] leading-relaxed space-y-3">
          <p>
            <strong>Renter:</strong> {agreement.renterName}
          </p>
          <p>
            <strong>Weekly Rent:</strong> ${Number(agreement.weeklyRent).toFixed(2)}
          </p>
          <p>
            <strong>Security Deposit:</strong> $
            {Number(agreement.securityDeposit).toFixed(2)}
          </p>
          <p>
            <strong>Insurance Access Fee:</strong> $
            {Number(agreement.insuranceAccessFee).toFixed(2)}
          </p>
          <p>
            <strong>Minimum Rental Period:</strong> 4 weeks, then
            week-to-week with 1 week&apos;s written notice. Early return
            before 4 weeks: 50% of remaining rent up to the 4-week mark is
            still payable.
          </p>
          <p>
            <strong>Included:</strong> Service &amp; maintenance,
            comprehensive insurance (subject to Insurance Access Fee),
            roadside assistance (not-at-fault), unlimited km, full tank at
            pickup.
          </p>
          <p>
            <strong>Not included:</strong> Fines, tolls, unauthorised
            drivers, and loss of income from breakdown that is the
            Rentee&apos;s fault.
          </p>
          <p>
            <strong>Prohibited use includes:</strong> reckless driving,
            driving under the influence, unauthorised drivers,
            rideshare/hire use without written consent, racing, and driving
            beyond 100km of Brisbane without permission. Loss/damage from
            prohibited use removes the Insurance Access Fee cap.
          </p>
          <p>
            <strong>Damage:</strong> You are responsible for loss/damage
            during the rental (even if not your fault) up to the Insurance
            Access Fee, plus lost rental income during repairs, per
            incident, except where the Owner is negligent or a third party
            is at fault and sufficient details are provided.
          </p>
          <p>
            <strong>Fees:</strong> Key replacement $400, Early return fee
            $400, Refuelling $2.50/litre, Late payment 22% of amount owing.
          </p>
          <p className="text-[11px] text-[#9496a8] italic">
            This is a summary. The full signed PDF agreement (sent to your
            email after signing) contains complete terms and conditions.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-[#7f85f7] w-4 h-4"
          />
          <span className="text-[13px] text-[#444]">
            I have read and agree to the Pak Oz Rentals Vehicle Lease
            Agreement terms above and in the full agreement.
          </span>
        </label>

        <p className="text-[12px] font-semibold text-[#666880] uppercase tracking-wider mb-2">
          Draw your signature below
        </p>
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          className="w-full border-2 border-dashed border-[#e8e8f0] rounded-[10px] bg-[#fafafa] touch-none"
        />
        <button
          type="button"
          onClick={clearSignature}
          className="text-[12px] text-[#7f85f7] mt-2 hover:underline"
        >
          Clear signature
        </button>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 mt-4">
            <p className="text-red-600 text-[13px]">{submitError}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!agreed || submitting}
          className="w-full mt-6 bg-[#7f85f7] text-white rounded-[10px] h-[52px] font-bold text-[15px] disabled:bg-[#b0bec5] hover:bg-[#6b71f0] transition-all"
        >
          {submitting ? "Submitting..." : "Sign & Submit Agreement"}
        </button>
      </div>
    </div>
  )
}
