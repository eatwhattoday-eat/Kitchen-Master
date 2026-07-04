#!/usr/bin/env python3
"""Replace problematic images via Baidu image search using Playwright."""
import json, os, time, base64
from playwright.sync_api import sync_playwright
from urllib.parse import quote

FACES_FILE = "fix_list.json"
IMAGE_DIR = 'cook-vite/public/images'

def search_and_download(page, dish_name, filepath):
    """Search Baidu Images, download best match."""
    query = f'{dish_name} 成品 美食'
    url = f'https://image.baidu.com/search/index?tn=baiduimage&word={quote(query)}'

    try:
        page.goto(url, timeout=15000, wait_until='domcontentloaded')
        time.sleep(2)

        # Scroll to load lazy images
        page.evaluate('window.scrollTo(0, 300)')
        time.sleep(0.5)
        page.evaluate('window.scrollTo(0, 800)')
        time.sleep(0.5)

        # Get image src URLs
        img_urls = page.evaluate("""() => {
            const urls = [];
            document.querySelectorAll('img.main_img, img[src*="http"]').forEach(img => {
                const src = img.src || img.getAttribute('data-imgurl');
                if (src && src.startsWith('http')) urls.push(src);
            });
            return urls;
        }""")

        # Try the data-objurl from img elements too
        data_urls = page.evaluate("""() => {
            const urls = [];
            document.querySelectorAll('.imgbox img, .imgitem img, [data-objurl]').forEach(el => {
                const u = el.getAttribute('data-objurl');
                if (u) urls.push(u);
            });
            return urls;
        }""")

        all_urls = img_urls + data_urls

        tested = 0
        for u in all_urls:
            if not u or not u.startswith('http'):
                continue
            low = u.lower()
            if any(w in low for w in ['favicon', 'logo', 'baidu_logo', 'icon.gif']):
                continue
            tested += 1
            if tested > 10:
                break

            # Download via browser fetch
            try:
                response = page.evaluate("""
                    async (url) => {
                        try {
                            const r = await fetch(url);
                            if (!r.ok) return null;
                            const blob = await r.blob();
                            return new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.onerror = () => resolve(null);
                                reader.readAsDataURL(blob);
                            });
                        } catch(e) { return null; }
                    }
                """, u)
                if response and response.startswith('data:'):
                    b64 = response.split(',', 1)[1]
                    with open(filepath, 'wb') as f:
                        f.write(base64.b64decode(b64))
                    size = os.path.getsize(filepath)
                    if size >= 3000:
                        return True
                    # Too small, try next
                    os.remove(filepath)
            except Exception:
                continue

    except Exception as e:
        print(f'    Error: {e}')
    return False


def main():
    problems = json.load(open(FACES_FILE))
    print(f'Images to replace: {len(problems)}')

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
        ctx = browser.new_context(
            viewport={'width': 1440, 'height': 900},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            locale='zh-CN'
        )
        page = ctx.new_page()
        replaced = 0; failed = 0

        for i, item in enumerate(problems):
            idx = item['index']
            name = item['name']
            filename = f'{idx:04d}.jpg'
            filepath = os.path.join(IMAGE_DIR, filename)

            bak = filepath + '.badbak'
            if not os.path.exists(bak):
                try: os.rename(filepath, bak)
                except: pass

            ok = search_and_download(page, name, filepath)

            if ok:
                replaced += 1
                try: os.remove(bak)
                except: pass
                status = 'OK'
            else:
                failed += 1
                if os.path.exists(bak):
                    try: os.rename(bak, filepath)
                    except: pass
                status = 'FAIL'

            print(f'  [{i+1:04d}/{len(problems)}] [{idx:04d}] {status:4s} {name[:35]}')

            if (i+1) % 20 == 0:
                print(f'  >> {i+1}/{len(problems)} — ok:{replaced} fail:{failed}')
            if (i+1) % 100 == 0:
                time.sleep(2)

        browser.close()

    print(f'\n=== Summary ===')
    print(f'Replaced: {replaced} / Failed: {failed} / Total: {len(problems)}')

if __name__ == '__main__':
    main()
