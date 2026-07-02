import { NextResponse } from "next/server";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { status: 201, ...init });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function internalError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function apiErrorResponse(error: unknown, fallbackMessage = "Internal server error") {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
