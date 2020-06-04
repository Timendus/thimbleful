module.exports = {

  getClassList: async (selector) => {
    return Object.values(await page.evaluate(selector => {
      return document.querySelector(selector).classList;
    }, selector));
  },

  read: async (selector) => {
    const element = await page.$(selector);
    return element.evaluate(e => e.innerText);
  },

  getLocationHref: () => {
    return page.evaluate(() => {
      return document.location.href;
    });
  }

};
