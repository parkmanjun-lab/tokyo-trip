import { getDb } from '../../../db';
import { readTrip, writeTrip } from '../../../db/trip-store';
import { tripSchema } from '../../../lib/trip-schema';
import { z } from 'zod';
import { TRIP_KEY } from '../../../lib/trip-access';
import { withReviewIndex } from '../../../lib/review-index';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff'};
function reply(data:unknown,status=200){return Response.json(data,{status,headers});}
export async function GET(){
  try{const started=performance.now();const snapshot=withReviewIndex(await readTrip(getDb(),TRIP_KEY));return Response.json(snapshot,{headers:{...headers,'Server-Timing':`trip;dur=${(performance.now()-started).toFixed(1)}`}});}catch(e){console.error('trip-read',e);return reply({error:'저장된 여행을 불러오지 못했어요. 잠시 뒤 다시 시도해주세요'},503);}
}
export async function PUT(request:Request){
  if(request.headers.get('origin')!==new URL(request.url).origin || request.headers.get('sec-fetch-site')==='cross-site') return reply({error:'허용되지 않은 요청입니다'},403);
  if(!request.headers.get('content-type')?.includes('application/json')) return reply({error:'올바른 형식으로 저장해주세요'},415);
  if(Number(request.headers.get('content-length')||0)>400000) return reply({error:'저장할 내용이 너무 많아요'},413);
  let body;
  try {const text=await request.text();if(text.length>400000)return reply({error:'저장할 내용이 너무 많아요'},413);body=JSON.parse(text);}catch{return reply({error:'입력 내용을 확인해주세요'},400);}
  const parsed=z.object({trip:tripSchema,version:z.number().int().min(1)}).strict().safeParse(body);
  if(!parsed.success) return reply({error:'입력 내용을 확인해주세요. 제목은 180자, 메모는 3,000자 이내로 적어주세요'},400);
  try {const saved=await writeTrip(getDb(),TRIP_KEY,parsed.data.trip,parsed.data.version);if(!saved)return reply({error:'다른 창에서 일정이 바뀌었어요. 입력 내용을 복사한 뒤 최신 내용을 불러와주세요',conflict:true},409);return reply(withReviewIndex(saved));}catch(e){console.error('trip-save',e);return reply({error:'저장하지 못했어요. 입력 내용은 그대로 두었으니 다시 시도해주세요'},503);}
}
