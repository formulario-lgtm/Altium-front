import { describe, expect, it } from 'vitest';
import { fieldErrorsToMap, toApiError, toApiErrorFromResponse } from './errors';

describe('toApiErrorFromResponse', () => {
  it('maps Problem Details validation payloads', () => {
    const response = new Response(
      JSON.stringify({
        type: 'about:blank',
        title: 'Validation failed',
        status: 400,
        detail: 'One or more fields are invalid',
        code: 'VALIDATION_ERROR',
        requestId: 'req_front_1',
        errors: [{ field: 'email', code: 'IS_EMAIL', message: 'email must be an email' }],
      }),
      {
        status: 400,
        headers: { 'content-type': 'application/problem+json', 'x-request-id': 'req_front_1' },
      },
    );

    const apiError = toApiErrorFromResponse(response, {
      type: 'about:blank',
      title: 'Validation failed',
      status: 400,
      detail: 'One or more fields are invalid',
      code: 'VALIDATION_ERROR',
      requestId: 'req_front_1',
      errors: [{ field: 'email', code: 'IS_EMAIL', message: 'email must be an email' }],
    });

    expect(apiError.kind).toBe('validation');
    expect(apiError.code).toBe('VALIDATION_ERROR');
    expect(apiError.message).toBe('Revisa los campos marcados.');
    expect(apiError.fieldErrors).toHaveLength(1);
    expect(fieldErrorsToMap(apiError)).toEqual({ email: 'email must be an email' });
  });

  it('maps 401/403/404/500 statuses', () => {
    expect(
      toApiErrorFromResponse(new Response(null, { status: 401 }), {
        title: 'Unauthorized',
        status: 401,
      }).kind,
    ).toBe('unauthorized');
    expect(
      toApiErrorFromResponse(new Response(null, { status: 403 }), {
        title: 'Forbidden',
        status: 403,
      }).kind,
    ).toBe('forbidden');
    expect(
      toApiErrorFromResponse(new Response(null, { status: 404 }), {
        title: 'Not Found',
        status: 404,
      }).kind,
    ).toBe('not_found');
    expect(
      toApiErrorFromResponse(new Response(null, { status: 500 }), {
        title: 'Internal',
        status: 500,
      }).kind,
    ).toBe('server');
  });
});

describe('toApiError', () => {
  it('maps timeout errors without leaking internals', () => {
    const apiError = toApiError(new DOMException('Request timed out after 10ms', 'TimeoutError'));
    expect(apiError.kind).toBe('timeout');
    expect(apiError.message).not.toContain('stack');
  });

  it('maps abort/cancellation errors', () => {
    const apiError = toApiError(new DOMException('Aborted', 'AbortError'));
    expect(apiError.kind).toBe('cancelled');
    expect(apiError.code).toBe('CANCELLED');
  });

  it('maps generic network failures', () => {
    const apiError = toApiError(new TypeError('Failed to fetch'));
    expect(apiError.kind).toBe('network');
  });
});
