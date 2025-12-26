# Changelog

すべての重要な変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/spec/v2.0.0.html) に準拠しています。

## [Unreleased]

### ✨ 新機能

- feat(ses): AWS SES メール送信機能を追加 (27cb578)
  - CDK SES Stack（Email/Domain Identity、Route53 DKIM 自動設定）
  - Next.js API Route（/api/contact）
  - サンプル問い合わせページ（/contact）
  - 詳細なドキュメント（ses-email-guide.md）

### 📚 ドキュメント

- docs(workflows): release, changelog, commit, pr-review ワークフローを追加 (4010acc)

### 🐛 バグ修正

- fix(ci): pnpm バージョンを packageManager フィールドから取得するよう修正 (#25)
- fix(amplify): pnpm モノレポ互換性を追加 (#23)

---

## [1.0.0] - 2024-12-26

### ✨ 新機能

- feat(infra): AMPLIFY_APP_NAME, REPO_OWNER, REPO_NAME 環境変数をサポート (#22)
- feat: Amplify への独自ドメイン設定機能を追加 (#21)
- feat: .env ファイルによる環境変数管理をサポート (#18)
- feat: デュアルトークンモード対応（Secrets Manager + 環境変数） (#16)
- feat: Phase 4 CI/CD パイプライン構築 (#11)
- feat: Phase 3 IaC による Amplify 環境構築 (#10)
- feat: Phase 2 Next.js アプリケーション実装 (#9)
- feat: Phase 1.5 Devcontainer 基盤構成 (#8)
- feat: Phase 1 モノレポ基盤セットアップ (#7)

### ♻️ リファクタリング

- refactor: BuildSpec 一元化と Secrets Manager 廃止 (#15)

### 📚 ドキュメント

- docs: 全パターンの検証手順書を追加 (#20)
- docs: 最新実装に合わせて開発者・運用者ドキュメントを更新 (#19)
- docs: README を開発者・運用者向けに拡充 (#14)
- docs: デュアルデプロイパターン対応 (#13)
- docs: Phase 5 ドキュメント整備と公開 (#12)
- docs: Devcontainer 利用ガイドを追加
- docs: ドキュメント管理ルールを策定し、ディレクトリ構造を整備
- docs: プロジェクト計画書を拡充

---

[Unreleased]: https://github.com/i-Willink-Inc/next-amplify-starter-kit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/i-Willink-Inc/next-amplify-starter-kit/releases/tag/v1.0.0
