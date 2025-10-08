import { NextResponse } from 'next/server'
import { getApiDocs } from '@/lib/swagger'

/**
 * GET /api/openapi
 * 返回 OpenAPI 规范 JSON
 */
export async function GET() {
  const spec = getApiDocs()
  return NextResponse.json(spec)
}
