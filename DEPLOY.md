# Cloudflare 배포 (Workers + D1)

- Worker: `tokyo-trip` → https://tokyo-trip.personal-lab-d0ro.workers.dev
- D1: `tokyo-trip-db` (APAC), id `0f93af8f-74b6-4241-acc0-6937088ab1a4`, 바인딩 `DB`
- 데이터 키: `trip_plans.user_id = 'tokyo-2026-11-29'`

## 다시 배포하기

```bash
npm ci
npm run build
D1_DATABASE_ID=0f93af8f-74b6-4241-acc0-6937088ab1a4 node scripts/build-embedded-worker.mjs
CLOUDFLARE_ACCOUNT_ID=<계정 ID> npx wrangler deploy --config dist/embedded/wrangler.json
```

`build-embedded-worker.mjs`는 `dist/client`의 정적 파일을 Worker 안에 넣습니다.
Claude 클라우드 세션은 프록시가 API 토큰을 넣기 때문에 Workers 정적 자산 업로드(JWT 인증)가 401로 실패합니다. 그래서 이 방법을 씁니다.
토큰을 직접 가진 환경에서는 `npx wrangler deploy --config dist/server/wrangler.json`도 됩니다. 이때는 `dist/server/wrangler.json`의 `name`과 `d1_databases`를 위 값으로 바꿔야 합니다.

## 데이터

백업의 `database/` 폴더는 개인 일정이라 이 저장소에 넣지 않습니다.
빈 D1에 복원할 때는 `restore-into-empty-database.sql`에서 `BEGIN TRANSACTION;`과 `COMMIT;` 줄을 지운 뒤
`npx wrangler d1 execute tokyo-trip-db --remote --file <파일>`로 실행합니다. 데이터가 있는 DB에는 실행하지 않습니다.
