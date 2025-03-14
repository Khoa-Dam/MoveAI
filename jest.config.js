module.exports = {
  preset: 'ts-jest', // Sử dụng ts-jest để xử lý TypeScript
  testEnvironment: 'node', // Chạy test trong môi trường Node.js
  testMatch: ['**/*.test.ts'], // Chỉ chạy các file .test.ts
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json' // Đảm bảo đường dẫn tới tsconfig.json đúng
    }
  }
}
