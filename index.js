/*
Autor: @fenixbinario
w3: fenixbinairo.com
*/
const puppeteer = require('puppeteer'); // v13.0.0 or later
const fs = require('fs'); 

//save cookie function
const saveCookie = async (page) => {
    const cookies = await page.cookies();
    const cookieJson = JSON.stringify(cookies, null, 2);
    await fs.writeFile('cookies.json', cookieJson);
}

//load cookie function
const loadCookie = async (page) => {
    /*
    const cookieJson = await fs.readFile('cookies.json', 'utf8' , (err) => { 
        if (err) throw err; 
        console.log('The Cookies has been READED!'); 
      });
    ;
    console.log(cookieJson);
    */
    const cookies = JSON.parse(await fs.readFile('./cookies.json', (err) => { 
        if (err) throw err; 
        console.log('The Cookies has been READED!'); 
      }));
    await page.setCookie(...cookies);
}

(async () => {
    const browser = await puppeteer.launch({
      headless : false
    });

    const page = await browser.newPage();
    //await loadCookie(page); //load cookie
    const timeout = 15000;
    //await page.setUserAgent('user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1280,
            height: 1024
        })
    }
    {
        const targetPage = page;
        await targetPage.setUserAgent('user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

        const promises = [];
        
        promises.push(targetPage.waitForNavigation());
        await targetPage.goto('https://www.tiktok.com/tag/viral?lang=en');
        const cookies = await targetPage.cookies();
        /*
        fs.writeFile('cookies.json', JSON.stringify(cookies),'utf8', (err) => { 
            if (err) throw err; 
            console.log('The Cookies has been saved!'); 
          });
        */
        await page.screenshot({path: __dirname + '/public/tiktok.png'});
        await Promise.all(promises);
    }


// Using ‘page.mouse’ to trace a 100x100 square.
await page.mouse.move(0, 0);
await page.mouse.down();
await page.mouse.move(0, 1000);
await page.mouse.move(100, 100);
await page.mouse.move(1000, 0);
await page.mouse.move(0, 2000);
await page.mouse.up();
//end
await page.waitForSelector('div > .tiktok-yz6ijl-DivWrapper');
const enlaces = await page.evaluate(() => {
    
      const elementos = document.querySelectorAll('div > .tiktok-yz6ijl-DivWrapper > a:first-child');
      const links = [];
      for (let elemento of elementos)
          links.push(elemento.href);
          //console.log(elemento.href);
      return links;
      });
      console.log(enlaces);

      
      const videos = [];
      for (let enlace of enlaces) {
        await page.goto(enlace);
        await page.waitForSelector('.tiktok-j2a19r-SpanText');
      
        var video = await page.evaluate ( () => {
        const tmp = {};
            tmp.title = document.querySelector( '.tiktok-j2a19r-SpanText').innerText;
            const autor = document.querySelector('.tiktok-1b6v967-StyledLink > span');
                if(autor != null){
                    tmp.autor = document.querySelector('.tiktok-1b6v967-StyledLink > span').innerText;
                    tmp.autorUrl = document.querySelector('.tiktok-1b6v967-StyledLink').href;
                }
        
            const audio = document.querySelector('.tiktok-1ihjiz6-StyledLink');
            if(audio != null){
                tmp.audio = audio.innerText;
                tmp.audioUrl = audio.href;
                }

            const like_count = document.querySelector('[data-e2e="like-count"]');
            if(like_count != null)
            {
                tmp.like_count = like_count.innerText;
            }
            

            const comment_count = document.querySelector('[data-e2e="comment-count"]');
            if (comment_count != null) {
                tmp.comment_count = comment_count.innerText;
            }

            const share_count =  document.querySelector('[data-e2e="share-count"]');
            if (share_count != null) {
                tmp.share_count = share_count.innerHTML;
            }

            tmp.url = '';
            tmp.duration = '';
            tmp.hashtags = '';

            return tmp;
        });

        video.url = enlace;

        
        const tags = await page.evaluate ( () => {
            const hashtags = [];
            const tag = document.querySelectorAll('.tiktok-f9vo34-StrongText');
            for( let hashtag of tag){
                hashtags.push(hashtag.innerText);
            }
            return hashtags;
        });
        
        const duration = await page.evaluate ( () => {
            const duration = document.querySelector('.tiktok-15xowx1-DivSeekBarTimeContainer');
            if (duration != null) {
                const d = duration.innerText;
                
                return d.slice(d.indexOf('/') + 1 );
                //return  duration.innerText;
            }
        });
        video.hashtags = tags;
        video.duration = duration;
        videos.push(video);
        console.log(video);

    }
    console.log(videos);
    fs.writeFile('tiktok.json', JSON.stringify(videos),'utf8', (err) => { 
        if (err) throw err; 
        console.log('The file has been saved!'); 
      }); 

    await browser.close();

    async function waitForSelectors(selectors, frame, options) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame, options);
        } catch (err) {
          console.error(err);
        }
      }
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }

    async function scrollIntoViewIfNeeded(selectors, frame, timeout) {
      const element = await waitForSelectors(selectors, frame, { visible: false, timeout });
      if (!element) {
        throw new Error(
          'The element could not be found.'
        );
      }
      await waitForConnected(element, timeout);
      const isInViewport = await element.isIntersectingViewport({threshold: 0});
      if (isInViewport) {
        return;
      }
      await element.evaluate(element => {
        element.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'auto',
        });
      });
      await waitForInViewport(element, timeout);
    }

    async function waitForConnected(element, timeout) {
      await waitForFunction(async () => {
        return await element.getProperty('isConnected');
      }, timeout);
    }

    async function waitForInViewport(element, timeout) {
      await waitForFunction(async () => {
        return await element.isIntersectingViewport({threshold: 0});
      }, timeout);
    }

    async function waitForSelector(selector, frame, options) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to waitForSelector');
      }
      let element = null;
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (element) {
          element = await element.waitForSelector(part, options);
        } else {
          element = await frame.waitForSelector(part, options);
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('>>'));
        }
        if (i < selector.length - 1) {
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('|'));
      }
      return element;
    }

    async function waitForElement(step, frame, timeout) {
      const count = step.count || 1;
      const operator = step.operator || '>=';
      const comp = {
        '==': (a, b) => a === b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
      };
      const compFn = comp[operator];
      await waitForFunction(async () => {
        const elements = await querySelectorsAll(step.selectors, frame);
        return compFn(elements.length, count);
      }, timeout);
    }

    async function querySelectorsAll(selectors, frame) {
      for (const selector of selectors) {
        const result = await querySelectorAll(selector, frame);
        if (result.length) {
          return result;
        }
      }
      return [];
    }

    async function querySelectorAll(selector, frame) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to querySelectorAll');
      }
      let elements = [];
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (i === 0) {
          elements = await frame.$$(part);
        } else {
          const tmpElements = elements;
          elements = [];
          for (const el of tmpElements) {
            elements.push(...(await el.$$(part)));
          }
        }
        if (elements.length === 0) {
          return [];
        }
        if (i < selector.length - 1) {
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
        }
      }
      return elements;
    }

    async function waitForFunction(fn, timeout) {
      let isActive = true;
      const timeoutId = setTimeout(() => {
        isActive = false;
      }, timeout);
      while (isActive) {
        const result = await fn();
        if (result) {
          clearTimeout(timeoutId);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }

    async function changeSelectElement(element, value) {
      await element.select(value);
      await element.evaluateHandle((e) => {
        e.blur();
        e.focus();
      });
    }

    async function changeElementValue(element, value) {
      await element.focus();
      await element.evaluate((input, value) => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    }

    async function typeIntoElement(element, value) {
      const textToType = await element.evaluate((input, newValue) => {
        if (
          newValue.length <= input.value.length ||
          !newValue.startsWith(input.value)
        ) {
          input.value = '';
          return newValue;
        }
        const originalValue = input.value;
        input.value = '';
        input.value = originalValue;
        return newValue.substring(originalValue.length);
      }, value);
      await element.type(textToType);
    }
})().catch(err => {
    console.error(err);
    process.exit(1);
});
