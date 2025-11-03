# 도시락 주문 시스템

Supabase 기반 도시락 주문 관리 시스템입니다.

## 프로젝트 구조

```
├── supabase/          # 메인 애플리케이션
│   ├── index.html    # 메인 페이지
│   ├── app.js        # 애플리케이션 로직
│   ├── schema.sql    # 데이터베이스 스키마
│   └── ...
├── netlify.toml      # Netlify 배포 설정
└── README.md         # 프로젝트 설명
```

## Netlify 배포 설정

Netlify 대시보드에서 다음 설정을 사용하세요:

1. **Build settings**:
   - Base directory: `supabase`
   - Build command: (비워두기)
   - Publish directory: `supabase`

2. **자동 배포**: GitHub에 푸시하면 자동으로 배포됩니다.

자세한 내용은 `supabase/README.md`를 참고하세요.

