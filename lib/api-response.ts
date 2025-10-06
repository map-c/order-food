import { NextResponse } from 'next/server'

/**
 * 成功响应格式
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

/**
 * 错误响应格式
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

/**
 * API 响应类型
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * 返回成功响应
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  )
}

/**
 * 返回错误响应
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  )
}

/**
 * 常见错误响应
 */
export const CommonErrors = {
  notFound: (resource: string) =>
    errorResponse('NOT_FOUND', `${resource}不存在`, 404),

  badRequest: (message: string) =>
    errorResponse('BAD_REQUEST', message, 400),

  unauthorized: () =>
    errorResponse('UNAUTHORIZED', '未授权访问', 401),

  forbidden: () =>
    errorResponse('FORBIDDEN', '无权限操作', 403),

  internalError: (message: string = '服务器内部错误') =>
    errorResponse('INTERNAL_ERROR', message, 500),

  validationError: (message: string) =>
    errorResponse('VALIDATION_ERROR', message, 422),
}
