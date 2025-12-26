# Changelog

すべての重要な変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/spec/v2.0.0.html) に準拠しています。

> **Note**: このリポジトリは [i-Willink-Inc/next-amplify-starter-kit](https://github.com/i-Willink-Inc/next-amplify-starter-kit) からフォークされています。
> 以下の変更はフォーク元からの差分を記載しています。

---

## [Unreleased]

### ✨ 新機能

- feat(ses): AWS SES メール送信機能を追加 (27cb578)
  - CDK SES Stack（Email/Domain Identity、Route53 DKIM 自動設定）
  - Next.js API Route（/api/contact）
  - サンプル問い合わせページ（/contact）
  - 詳細なドキュメント（ses-email-guide.md）

### 📚 ドキュメント

- docs(workflows): オプション機能追加ワークフローを追加 (65eb9a9)
- docs(workflows): release, changelog, commit, pr-review ワークフローを追加 (4010acc)

---

## フォーク元との差分

このリポジトリは以下の追加機能を持っています：

| 機能 | 説明 | ドキュメント |
|-----|------|------------|
| AWS SES | メール送信機能（問い合わせフォーム対応） | [ses-email-guide.md](docs/20_development/ses-email-guide.md) |

---

[Unreleased]: https://github.com/yutaro-shirai/next-amplify-starter-kit/compare/upstream/main...HEAD
