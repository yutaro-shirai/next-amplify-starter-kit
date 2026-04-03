import '@testing-library/jest-dom/vitest';

// Mock environment variables for testing
process.env.AWS_REGION = 'ap-northeast-1';
process.env.SES_FROM_EMAIL = 'test@example.com';
process.env.SES_TO_EMAIL = 'recipient@example.com';
