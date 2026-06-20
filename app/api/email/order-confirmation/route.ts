import { NextResponse } from "next/server"
import { type OrderEmailInput } from "@/lib/order-email"
import { sendOrderEmail, validateOrderInput } from "@/lib/send-order-email"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  // `txid` é ignorado aqui (versão sem webhook/idempotência).
  const { txid: _txid, ...order } = body ?? {}
  const validationError = validateOrderInput(order as Partial<OrderEmailInput>)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const result = await sendOrderEmail(order as OrderEmailInput)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ ok: true, id: result.id ?? null })
}
