module.exports = {

  getClassList: async (selector) => {
    return Object.values(await page.evaluate(selector => {
      return document.querySelector(selector).classList;
    }, selector));
  }

};
