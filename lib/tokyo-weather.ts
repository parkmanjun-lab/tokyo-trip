// Adapted from the existing weather app: fixed Tokyo point, JST validation,
// no account/API key, 30-minute local cache. No trip records are stored here.
export const WEATHER_TTL=30*60*1000;
export const WEATHER_CACHE_KEY='tokyo-trip-weather:v1:35.681:139.767:7';
export const WEATHER_SOURCE='https://open-meteo.com/';
export type WeatherPayload={utc_offset_seconds:number,timezone:string,latitude:number,longitude:number,current_units:{temperature_2m:string,apparent_temperature:string},daily_units:{temperature_2m_max:string,temperature_2m_min:string,precipitation_probability_max:string},current:{time:string,temperature_2m:number|null,apparent_temperature:number|null,weather_code:number|null},daily:{time:string[],weather_code:(number|null)[],temperature_2m_max:(number|null)[],temperature_2m_min:(number|null)[],precipitation_probability_max:(number|null)[]}};
export type WeatherEntry={data:WeatherPayload,at:number,cached:boolean};
export type WeatherDay={date:string,code:number|null,min:number|null,max:number|null,rain:number|null};
export const numeric=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
export function validWeatherValue(v:unknown,kind='temp'):v is number{return numeric(v)&&(kind==='rain'?v>=0&&v<=100:v>=-100&&v<=65);}
export function weatherNumber(v:unknown,kind='temp'){return validWeatherValue(v,kind)?Math.round(v).toString():'—';}
export function tokyoIso(now=Date.now()){return new Date(now+9*3600000).toISOString().slice(0,16);}
export function tokyoDay(now=Date.now()){return tokyoIso(now).slice(0,10);}
export function nextTokyoMidnight(now=Date.now()){return Date.parse(tokyoDay(now)+'T00:00:00+09:00')+86400000;}
export function weatherStamp(now:number){return tokyoIso(now).replace('T',' ');}
export function weatherDateLabel(date:string){return `${date.slice(5,7)}.${date.slice(8,10)}`;}
export function weatherApiUrl(){const q=new URLSearchParams({latitude:'35.681',longitude:'139.767',current:'temperature_2m,apparent_temperature,weather_code',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',forecast_days:'7',temperature_unit:'celsius',timezone:'Asia/Tokyo'});return `https://api.open-meteo.com/v1/forecast?${q}`;}
function validDay(value:unknown):value is string{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const ms=Date.parse(value+'T00:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===value;}
export function validateWeatherPayload(input:unknown,now=Date.now()):WeatherPayload{
 const d=input as WeatherPayload;
 if(!d||d.utc_offset_seconds!==32400||d.timezone!=='Asia/Tokyo'||!numeric(d.latitude)||!numeric(d.longitude)||Math.abs(d.latitude-35.681)>.35||Math.abs(d.longitude-139.767)>.35)throw Error('도쿄 날씨의 지역·시간대를 확인할 수 없어요');
 if(d.current_units?.temperature_2m!=='°C'||d.current_units.apparent_temperature!=='°C'||d.daily_units?.temperature_2m_max!=='°C'||d.daily_units.temperature_2m_min!=='°C'||d.daily_units.precipitation_probability_max!=='%')throw Error('날씨 자료의 단위를 확인할 수 없어요');
 const dates=d.daily?.time;
 if(!Array.isArray(dates)||!dates.length||dates.length>7||!dates.every((x,i)=>validDay(x)&&(i===0||Date.parse(x+'T00:00:00Z')===Date.parse(dates[i-1]+'T00:00:00Z')+86400000))||!dates.includes(tokyoDay(now)))throw Error('예보 날짜가 현재 범위와 맞지 않아요');
 for(const key of ['weather_code','temperature_2m_max','temperature_2m_min','precipitation_probability_max'] as const)if(!Array.isArray(d.daily[key])||d.daily[key].length!==dates.length)throw Error('날짜별 예보가 불완전해요');
 return d;
}
export function currentWeatherValid(data:WeatherPayload|undefined,now=Date.now()){
 const value=data?.current?.time;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)||!validDay(value.slice(0,10)))return false;
 const ms=Date.parse(value+'+09:00');return Number.isFinite(ms)&&ms<=now+3600000&&ms>=now-3*3600000;
}
export function weatherCacheValid(entry:WeatherEntry|null|undefined,now=Date.now()){if(!entry||!numeric(entry.at)||entry.at>now||now-entry.at>=WEATHER_TTL||tokyoDay(entry.at)!==tokyoDay(now))return false;try{validateWeatherPayload(entry.data,now);return true;}catch{return false;}}
export function forecastDays(data:WeatherPayload|undefined,now=Date.now()):WeatherDay[]{if(!data)return [];return data.daily.time.map((date,i)=>({date,code:data.daily.weather_code[i],min:data.daily.temperature_2m_min[i],max:data.daily.temperature_2m_max[i],rain:data.daily.precipitation_probability_max[i]})).filter(r=>r.date>=tokyoDay(now));}
export function tripWeatherStatus(date:string,data:WeatherPayload|undefined,now=Date.now()){
 const days=forecastDays(data,now),day=days.find(d=>d.date===date);
 if(day&&(validWeatherValue(day.min)||validWeatherValue(day.max)||condition(day.code)!=='확인 불가'||validWeatherValue(day.rain,'rain')))return {status:'available' as const,day,message:''};
 if(day)return {status:'unknown' as const,day:null,message:'해당 날짜의 예보 값을 확인할 수 없어요'};
 if(!data)return {status:'unknown' as const,day:null,message:'예보를 불러오면 여행 날짜의 제공 여부를 확인할 수 있어요'};
 const last=days.at(-1)?.date;return {status:'unavailable' as const,day:null,message:last&&date>last?'여행 날짜 예보는 아직 제공되지 않아요':'선택한 여행 날짜는 현재 예보 범위 밖이에요'};
}
let pending:Promise<WeatherEntry>|null=null;
let memory:WeatherEntry|null=null;
export async function retrieveTokyoWeather({storage,fetcher=globalThis.fetch,now=Date.now(),clock=Date.now}: {storage?:Pick<Storage,'getItem'|'setItem'>|null,fetcher?:typeof fetch,now?:number,clock?:()=>number}={}):Promise<WeatherEntry>{
 let saved:WeatherEntry|null=null;try{saved=JSON.parse(storage?.getItem(WEATHER_CACHE_KEY)||'null')}catch{}
 const cached=[saved,memory].filter((v):v is WeatherEntry=>weatherCacheValid(v,now)).sort((a,b)=>b.at-a.at)[0];if(cached)return {...cached,cached:true};
 if(pending)return pending;
 pending=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),14000);try{
  const response=await fetcher(weatherApiUrl(),{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error(response.status===429?'날씨 요청 한도에 도달했어요. 잠시 후 다시 확인해주세요':'날씨 제공처에 연결하지 못했어요');
  const payload=await response.json();const receivedAt=clock();const data=validateWeatherPayload(payload,receivedAt);const entry={data,at:receivedAt,cached:false};memory=entry;try{storage?.setItem(WEATHER_CACHE_KEY,JSON.stringify(entry));}catch{}return entry;
 }finally{clearTimeout(timer);}})();
 try{return await pending;}finally{pending=null;}
}

export function condition(code:number|null|undefined){const labels:Record<number,string>={0:'맑음',1:'대체로 맑음',2:'구름 조금',3:'흐림',45:'안개',48:'착빙 안개',51:'약한 이슬비',53:'이슬비',55:'강한 이슬비',56:'어는 이슬비',57:'어는 이슬비',61:'약한 비',63:'비',65:'강한 비',66:'어는 비',67:'강한 어는 비',71:'약한 눈',73:'눈',75:'강한 눈',77:'싸락눈',80:'약한 소나기',81:'소나기',82:'강한 소나기',85:'눈 소나기',86:'강한 눈 소나기',95:'뇌우',96:'우박 동반 뇌우',99:'강한 우박 뇌우'};return numeric(code)?labels[code]||'확인 불가':'확인 불가'}
