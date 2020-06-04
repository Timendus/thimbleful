const { read, getLocationHref } = require('./helpers');

describe('Router class', () => {

  beforeEach(async () => {
    await page.goto(URL);
    await page.reload();
  });

  it('routes to the right page', async () => {
    expect(await read('.page.active h2')).toEqual('Welcome!');
    await page.click('a[href="#router"]');
    expect(await read('.page.active h2')).toEqual('Router');
  });

  it('allows for deep links', async () => {
    await page.goto(URL + '#router');
    expect(await read('.page.active h2')).toEqual('Router');
  });

  it('updates the location bar', async () => {
    expect(await getLocationHref()).toEqual(URL);
    await page.click('a[href="#router"]');
    expect(await getLocationHref()).toEqual(URL + '#router');
  });

});
