---
description: スターターキットに新しいオプション機能を追加する
---

## 概要

このワークフローは、スターターキットにカスタマイズ可能なオプション機能を追加する際の手順を定義します。
例: AWS SES メール送信、認証機能、データベース連携など

## 前提条件

- 機能の要件が明確であること
- 必要な AWS サービスや外部サービスが特定されていること

## 手順

### 1. 要件の明確化

ユーザーと以下を確認：

- **機能の目的**: 何を実現するか
- **使用するサービス**: AWS サービス、外部 API など
- **設定の柔軟性**: どの部分をカスタマイズ可能にするか
- **前提条件**: Route53、ドメイン、アカウント設定など

### 2. 実装計画の作成

以下の構成で計画を立てる：

| コンポーネント | 説明 |
|--------------|------|
| CDK Stack | インフラリソースの定義 |
| Next.js API | バックエンド処理 |
| UI コンポーネント | フロントエンド（必要に応じて） |
| 環境変数 | 設定可能なパラメータ |
| ドキュメント | セットアップ・使用方法 |

### 3. CDK Stack の実装

`infra/lib/` に新しい Stack を作成：

```typescript
// infra/lib/[feature]-stack.ts
export class FeatureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: FeatureStackProps) {
        super(scope, id, props);
        // リソース定義
    }
}
```

**設計ポイント:**
- 環境変数でオン/オフ切り替え可能に
- 関連する AWS サービス（Route53、IAM など）との統合
- 必要な IAM ポリシーの作成

### 4. CDK エントリポイントの更新

`infra/bin/app.ts` に条件付きでスタックを追加：

```typescript
// 環境変数が設定されている場合のみデプロイ
if (process.env.FEATURE_ENABLED) {
    new FeatureStack(app, 'FeatureStack', { ... });
}
```

### 5. 環境変数テンプレートの更新

以下のファイルに設定を追加：

- `infra/.env.example` - CDK 用
- `apps/web/.env.local.example` - Next.js 用

**形式:**
```bash
# =============================================================================
# [機能名] Configuration (Optional)
# =============================================================================
# 説明コメント
# FEATURE_VAR=value
```

### 6. Next.js API の実装

`apps/web/src/app/api/[feature]/route.ts` を作成：

- Zod によるバリデーション
- AWS SDK v3 の使用
- 適切なエラーハンドリング
- CORS 対応

### 7. ユーティリティ関数の実装

`apps/web/src/lib/[feature]-client.ts` を作成：

- 再利用可能な関数
- TypeScript 型定義
- JSDoc コメント

### 8. サンプル/デモページの作成

`apps/web/src/app/[feature]/page.tsx` を作成：

- 機能の動作確認用
- 「Demo page」ラベルを表示
- スターターキットのデザインに合わせる

### 9. ドキュメントの作成

`docs/20_development/[feature]-guide.md` を作成：

**必須セクション:**
- 概要
- 前提条件
- セットアップ手順（CDK 自動/手動の両方）
- 使用方法
- API リファレンス
- 料金情報（該当する場合）
- トラブルシューティング

### 10. README の更新

以下を更新：

- 特徴テーブルに機能を追加
- ドキュメントリンクを追加

### 11. ビルド検証

```bash
# Next.js ビルド
cd apps/web && pnpm build

# CDK ビルド
cd infra && pnpm build
```

// turbo

### 12. コミットと CHANGELOG 更新

```bash
# コミット
git add .
git commit -m "feat([feature]): [機能の説明]"

# CHANGELOG 更新
# /changelog ワークフローを実行
```

## チェックリスト

- [ ] CDK Stack を作成した
- [ ] 環境変数テンプレートを更新した
- [ ] Next.js API を実装した
- [ ] ユーティリティ関数を作成した
- [ ] サンプルページを作成した
- [ ] ドキュメントを作成した
- [ ] README を更新した
- [ ] ビルドが成功した
- [ ] コミットした
- [ ] CHANGELOG を更新した

## 参考: 既存の機能実装

| 機能 | Stack | ドキュメント |
|-----|-------|------------|
| AWS SES | `infra/lib/ses-stack.ts` | `docs/20_development/ses-email-guide.md` |
