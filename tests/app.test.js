const puppeteer = require('puppeteer');
const server_port = 'http://localhost:3001';

describe('Trip API Endpoints', () => {
  let browser;
  let page;

  beforeAll(async () => {
    
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('GET /api/trips', () => {
    test('should return array of trips with expected structure', async () => {
      const response = await fetch(`${server_port}/trips`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        .then(pre_formatted_response => {
          expect(pre_formatted_response.status).toBe(200);
          return pre_formatted_response.json()});
      console.log(response)
      expect(Array.isArray(response)).toBe(true);
      
      if (response.length > 0) {
        expect(response[0]).toMatchObject({
          id: expect.any(Number),
          title: expect.any(String),
          user: expect.any(String),
          created_at: expect.any(String)
        });
      }
    });

    // test('should return empty array when no trips exist', async () => {
    //   // Clear database before this specific test
    //   await page.evaluate(async (url) => {
    //     await fetch(`${server_port}/api/trips`, {
    //       method: 'DELETE'
    //     });
    //   }, server_port);

    //   const response = await page.evaluate(async (url) => {
    //     const res = await fetch(`${url}/api/trips`);
    //     return await res.json();
    //   }, server_port);

    //   expect(response).toEqual([]);
    // });
  });
});