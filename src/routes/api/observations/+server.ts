import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import db from '$lib/db';
import { observationBodySchema } from '$lib/validation/observation';
export const config = { runtime: 'nodejs' };

function badRequest(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

export const GET: RequestHandler = async () => {
  const rows = await db.observation.findMany({
    orderBy: { rate: 'desc' }
  });
  return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return badRequest('Expected application/json');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON');
  }

  const parsed = observationBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input';
    return badRequest(msg);
  }

  const { name, meteors, minutes } = parsed.data;
  const rate = (meteors / minutes) * 60;

  const created = await db.observation.create({
    data: { name, meteors, minutes, rate }
  });

  return json(created, { status: 201 });
};
