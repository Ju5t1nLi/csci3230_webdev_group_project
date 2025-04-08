const puppeteer = require('puppeteer');
const server_port = 'http://localhost:3001';


describe('App', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should display "Hello, world!" on the home page', async () => {
    fetch(`${server_port}/`,{
      method: 'GET', // rest api request type
      headers: { 'Content-Type': 'application/json' }, //specifying that we are sending json (i dont send anything here)
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return response.json()}) // must parse response into readable format (here we use json)
      .then(response => {
        expect(response != "") //specific for unit test
      })
    return
  });
});