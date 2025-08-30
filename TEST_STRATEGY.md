# Kagi Building Management System - Comprehensive Test Strategy

## Executive Summary

This document outlines a state-of-the-art testing strategy for the Kagi building management system, covering unit, integration, end-to-end, performance, and security testing approaches.

## Test Architecture

```
┌─────────────────────────────────────────┐
│          End-to-End Tests (E2E)         │
│         Playwright / Cypress            │
├─────────────────────────────────────────┤
│        Integration Tests                │
│     API Testing (Supertest)             │
├─────────────────────────────────────────┤
│         Unit Tests                      │
│   Vitest (Frontend) / Jest (Backend)    │
└─────────────────────────────────────────┘
```

## 1. Frontend Testing Strategy

### 1.1 Unit Testing (Vitest)

**Setup:**
```bash
pnpm add -D vitest @vue/test-utils @testing-library/vue happy-dom
```

**Configuration (vite.config.js):**
```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    },
    setupFiles: ['./tests/setup.js']
  }
})
```

### 1.2 Component Testing Examples

**Store Testing (Pinia):**
```javascript
// tests/stores/auth.test.js
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should handle login correctly', async () => {
    const store = useAuthStore()
    await store.login('test@example.com')
    
    expect(store.isAuthenticated).toBe(true)
    expect(store.user.email).toBe('test@example.com')
  })

  it('should handle role-based access', () => {
    const store = useAuthStore()
    store.user = { role: 'admin' }
    
    expect(store.isAdmin).toBe(true)
    expect(store.isMansionAdmin).toBe(false)
  })
})
```

**Component Testing:**
```javascript
// tests/components/FacilityBooking.test.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import FacilityBooking from '@/components/FacilityBooking.vue'

describe('FacilityBooking', () => {
  it('should validate booking times', async () => {
    const wrapper = mount(FacilityBooking, {
      props: {
        facility: { id: 1, name: 'Gym', maxDuration: 2 }
      }
    })

    // Set invalid duration (> 2 hours)
    await wrapper.find('[data-test="start-time"]').setValue('10:00')
    await wrapper.find('[data-test="end-time"]').setValue('13:00')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error-message').text())
      .toContain('Maximum duration is 2 hours')
  })

  it('should check availability before booking', async () => {
    const checkAvailability = vi.fn().mockResolvedValue(false)
    
    const wrapper = mount(FacilityBooking, {
      global: {
        provide: {
          checkAvailability
        }
      }
    })

    await wrapper.find('form').trigger('submit')
    
    expect(checkAvailability).toHaveBeenCalled()
    expect(wrapper.find('.error-message').text())
      .toContain('Time slot not available')
  })
})
```

### 1.3 End-to-End Testing (Playwright)

**Setup:**
```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

**Test Example:**
```javascript
// tests/e2e/booking-flow.spec.js
import { test, expect } from '@playwright/test'

test.describe('Facility Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as resident
    await page.goto('/login')
    await page.fill('[data-test="email"]', 'resident@example.com')
    await page.click('[data-test="magic-link-btn"]')
    
    // Simulate magic link click
    await page.goto('/auth/verify?token=test-token')
  })

  test('should complete booking successfully', async ({ page }) => {
    // Navigate to bookings
    await page.click('[data-test="nav-bookings"]')
    
    // Select facility
    await page.click('[data-test="facility-gym"]')
    
    // Select date and time
    await page.fill('[data-test="booking-date"]', '2024-12-25')
    await page.fill('[data-test="start-time"]', '10:00')
    await page.fill('[data-test="end-time"]', '11:00')
    
    // Submit booking
    await page.click('[data-test="submit-booking"]')
    
    // Verify success
    await expect(page.locator('[data-test="success-message"]'))
      .toContainText('Booking confirmed')
    
    // Verify in my bookings
    await page.click('[data-test="my-bookings"]')
    await expect(page.locator('[data-test="booking-item"]'))
      .toContainText('Gym - Dec 25, 10:00-11:00')
  })

  test('should prevent double booking', async ({ page }) => {
    // Create first booking
    await page.goto('/bookings/new')
    await page.selectOption('[data-test="facility"]', 'gym')
    await page.fill('[data-test="date"]', '2024-12-25')
    await page.fill('[data-test="time"]', '10:00')
    await page.click('[data-test="submit"]')
    
    // Try to book same slot
    await page.goto('/bookings/new')
    await page.selectOption('[data-test="facility"]', 'gym')
    await page.fill('[data-test="date"]', '2024-12-25')
    await page.fill('[data-test="time"]', '10:00')
    await page.click('[data-test="submit"]')
    
    // Verify error
    await expect(page.locator('[data-test="error"]'))
      .toContainText('Time slot already booked')
  })
})
```

## 2. Backend Testing Strategy

### 2.1 Unit Testing (Jest)

**Setup:**
```bash
cd backend
npm install --save-dev jest supertest @types/jest
```

**Configuration (jest.config.js):**
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/index.js'
  ],
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setup.js']
}
```

### 2.2 API Integration Tests

**Database Testing with Test Containers:**
```javascript
// tests/integration/booking.test.js
const { GenericContainer } = require('testcontainers')
const request = require('supertest')
const app = require('../helpers/testApp')

describe('Booking API Integration', () => {
  let postgresContainer
  let prisma

  beforeAll(async () => {
    // Start PostgreSQL container
    postgresContainer = await new GenericContainer('postgres:14')
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'kagi_test'
      })
      .withExposedPorts(5432)
      .start()

    // Connect Prisma to test database
    process.env.DATABASE_URL = 
      `postgresql://test:test@localhost:${postgresContainer.getMappedPort(5432)}/kagi_test`
    
    // Run migrations
    await exec('npx prisma migrate deploy')
    
    // Seed test data
    await seedTestData()
  })

  afterAll(async () => {
    await postgresContainer.stop()
  })

  test('should handle concurrent bookings correctly', async () => {
    // Simulate concurrent booking attempts
    const bookingPromises = Array(5).fill().map(() => 
      request(app)
        .post('/api/bookings')
        .send({
          facilityId: 'gym-1',
          date: '2024-12-25',
          startTime: '10:00',
          endTime: '11:00'
        })
    )

    const results = await Promise.all(bookingPromises)
    
    // Only one should succeed
    const successful = results.filter(r => r.status === 201)
    const conflicts = results.filter(r => r.status === 409)
    
    expect(successful).toHaveLength(1)
    expect(conflicts).toHaveLength(4)
  })
})
```

### 2.3 Contract Testing (Pact)

```javascript
// tests/contract/user-service.pact.test.js
const { Pact } = require('@pact-foundation/pact')
const { like, term } = require('@pact-foundation/pact/src/dsl/matchers')

describe('User Service Contract', () => {
  const provider = new Pact({
    consumer: 'Frontend',
    provider: 'UserService',
    port: 1234
  })

  beforeAll(() => provider.setup())
  afterAll(() => provider.finalize())

  test('get user by id', async () => {
    await provider.addInteraction({
      state: 'user exists',
      uponReceiving: 'a request for user',
      withRequest: {
        method: 'GET',
        path: '/api/users/123',
        headers: {
          Authorization: term({
            matcher: 'Bearer .*',
            generate: 'Bearer token'
          })
        }
      },
      willRespondWith: {
        status: 200,
        body: like({
          id: '123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'resident'
        })
      }
    })

    // Test implementation
    const response = await getUserById('123')
    expect(response.data.id).toBe('123')
  })
})
```

## 3. Performance Testing

### 3.1 Load Testing (k6)

```javascript
// tests/performance/booking-load.js
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Spike to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    errors: ['rate<0.05'],           // Error rate under 5%
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
  },
}

export default function () {
  // Login
  const loginRes = http.post('http://localhost:3333/api/auth/magic-link', {
    email: `user${Math.random()}@example.com`
  })
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  })
  
  // Create booking
  const bookingRes = http.post('http://localhost:3333/api/bookings', {
    facilityId: 'gym',
    date: '2024-12-25',
    startTime: `${9 + Math.floor(Math.random() * 10)}:00`,
    endTime: `${10 + Math.floor(Math.random() * 10)}:00`
  })
  
  check(bookingRes, {
    'booking created': (r) => [201, 409].includes(r.status),
  })
  
  errorRate.add(bookingRes.status >= 400)
  
  sleep(1)
}
```

### 3.2 Frontend Performance Testing

```javascript
// tests/performance/lighthouse.js
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'seo'],
    port: chrome.port
  }
  
  const runnerResult = await lighthouse(url, options)
  
  // Assert performance metrics
  const { performance, accessibility, seo } = runnerResult.lhr.categories
  
  expect(performance.score).toBeGreaterThan(0.9) // 90+ score
  expect(accessibility.score).toBeGreaterThan(0.9)
  expect(seo.score).toBeGreaterThan(0.9)
  
  await chrome.kill()
  return runnerResult.lhr
}

test('Dashboard performance', async () => {
  const results = await runLighthouse('http://localhost:5173/dashboard')
  
  // Check specific metrics
  const metrics = results.audits.metrics.details.items[0]
  expect(metrics.firstContentfulPaint).toBeLessThan(1500) // Under 1.5s
  expect(metrics.interactive).toBeLessThan(3000) // Under 3s
})
```

## 4. Security Testing

### 4.1 Automated Security Testing

```javascript
// tests/security/owasp-zap.js
const ZapClient = require('zaproxy')

const zapOptions = {
  proxy: 'http://localhost:8080',
  targetUrl: 'http://localhost:3333'
}

async function runSecurityScan() {
  const zap = new ZapClient(zapOptions.proxy)
  
  // Spider the application
  await zap.spider.scan(zapOptions.targetUrl)
  
  // Run active scan
  await zap.ascan.scan(zapOptions.targetUrl)
  
  // Get results
  const alerts = await zap.core.alerts()
  
  // Check for high-risk vulnerabilities
  const highRiskAlerts = alerts.filter(a => a.risk === 'High')
  expect(highRiskAlerts).toHaveLength(0)
  
  return alerts
}
```

### 4.2 Dependency Scanning

```json
// package.json
{
  "scripts": {
    "security:check": "npm audit --audit-level=moderate",
    "security:snyk": "snyk test",
    "security:licenses": "license-checker --onlyAllow 'MIT;Apache-2.0;BSD'"
  }
}
```

## 5. Testing Best Practices

### 5.1 Test Data Management

```javascript
// tests/fixtures/factory.js
const { Factory } = require('fishery')
const { faker } = require('@faker-js/faker')

const UserFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: faker.helpers.arrayElement(['resident', 'guest']),
  mansionId: faker.datatype.uuid(),
  createdAt: faker.date.past()
}))

const BookingFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  facilityId: faker.datatype.uuid(),
  userId: faker.datatype.uuid(),
  date: faker.date.future(),
  startTime: '10:00',
  endTime: '11:00',
  status: 'confirmed'
}))

// Usage
const testUser = UserFactory.build({ role: 'admin' })
const testBookings = BookingFactory.buildList(5)
```

### 5.2 Test Isolation

```javascript
// tests/helpers/database.js
class TestDatabase {
  async setup() {
    await this.prisma.$executeRaw`
      CREATE SCHEMA IF NOT EXISTS test_${process.pid}
    `
    process.env.DATABASE_URL = 
      `${process.env.DATABASE_URL}?schema=test_${process.pid}`
  }

  async teardown() {
    await this.prisma.$executeRaw`
      DROP SCHEMA IF EXISTS test_${process.pid} CASCADE
    `
  }

  async reset() {
    const tables = await this.prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'test_${process.pid}'
    `
    
    for (const { tablename } of tables) {
      await this.prisma.$executeRaw`
        TRUNCATE TABLE test_${process.pid}.${tablename} CASCADE
      `
    }
  }
}
```

## 6. Continuous Integration

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: |
          cd frontend
          pnpm install
      
      - name: Run unit tests
        run: |
          cd frontend
          pnpm test:unit --coverage
      
      - name: Run component tests
        run: |
          cd frontend
          pnpm test:components
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json

  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: kagi_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run migrations
        run: |
          cd backend
          npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/kagi_test
      
      - name: Run tests
        run: |
          cd backend
          npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/kagi_test
          JWT_SECRET: test-secret
      
      - name: Run security audit
        run: |
          cd backend
          npm audit --audit-level=moderate

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start services
        run: |
          docker-compose up -d
          npm run wait-on http://localhost:3333/health
          npm run wait-on http://localhost:5173
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run k6 load tests
        uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/performance/booking-load.js
          cloud: true
        env:
          K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}
```

## 7. Testing Metrics & KPIs

### Coverage Targets
- **Unit Tests**: ≥ 80% coverage
- **Integration Tests**: ≥ 70% coverage
- **E2E Tests**: Critical user paths 100%

### Performance Targets
- **API Response Time**: p95 < 200ms
- **Page Load Time**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Lighthouse Score**: > 90

### Quality Gates
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

## 8. Test Reporting

### Allure Reporter Setup
```bash
npm install --save-dev @wdio/allure-reporter allure-commandline
```

```javascript
// wdio.conf.js
exports.config = {
  reporters: [
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }]
  ]
}
```

### Test Results Dashboard
```javascript
// tests/reports/dashboard.js
const TestRailAPI = require('testrail-api')

class TestReporter {
  async reportResults(results) {
    const testrail = new TestRailAPI({
      host: 'https://kagi.testrail.io',
      user: process.env.TESTRAIL_USER,
      password: process.env.TESTRAIL_PASS
    })

    await testrail.addResultsForCases(runId, {
      results: results.map(r => ({
        case_id: r.testId,
        status_id: r.passed ? 1 : 5,
        comment: r.error?.message,
        elapsed: r.duration
      }))
    })
  }
}
```

## Conclusion

This comprehensive testing strategy ensures:
- **Quality**: High code coverage and thorough testing
- **Performance**: Consistent performance under load
- **Security**: Proactive vulnerability detection
- **Reliability**: Automated regression prevention
- **Maintainability**: Clear test organization and documentation

Regular test execution and monitoring will maintain system quality and catch issues early in the development cycle.