/// facebook-feeds-filter.js
(function() {
    const categoriesToHide = '{{1}}';  // Optional argument to filter posts by their category
    const setOfCategoriesToHide = (() => {
        if (categoriesToHide === '' || categoriesToHide === '{{1}}') return new Set();
        return new Set(categoriesToHide.split(/\s*\|\s*/).map(s => s.toUpperCase()));
    })();
    const categoryMap = {
        UNKNOWN: 0,
        ORGANIC: 1,
        ENGAGEMENT: 2,
        FIXED_POSITION: 3,
        PROMOTION: 4,
        SPONSORED: 5,
        END_OF_FEED_CONTENT: 6,
        FB_STORIES: 7,
        HIGH_VALUE_PROMOTION: 8,
        FB_STORIES_ENGAGEMENT: 9,
        SHOWCASE: 10,
        FB_SHORTS: 11,
        TRENDING: 12,
        ENGAGEMENT_QP: 13,
        MULTI_FB_STORIES_TRAY: 14,
        END_OF_FEED_REELS: 15,
        FB_SHORTS_FALLBACK: 16,
        FRIENDLY_FEED_MID_CARD: 17,
        FRIENDLY_FEED_PROMOTION: 18,
        INJECTED_STORY: 19,
        LIMITED_PERSONALIZATION_NOTICE: 20
    };
    const categoryMapEntries = Object.entries(categoryMap);
    const magic = String.fromCharCode(Date.now() % 26 + 97) +
                  Math.floor(Math.random() * 982451653 + 982451653).toString(36);
    const sha256 = async (message) => {
        // Source: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
        const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        const hashHex = hashArray
            .map(b => b.toString(16).padStart(2, "0"))
            .join(""); // convert bytes to hex string
        return hashHex;
    };
    const fromObfuscatedCategory = async (node, enc, postId) => {
        const b = await sha256(postId);
        const d = categoryMapEntries;
        for (let i = 0; i < d.length; i++) {
            let f = d[i], g = f[0];
            f = f[1];
            f = await sha256(b.concat(f));
            if (f === enc)
                return {node: node, category: g};
        }
        return undefined;
    };
    const findNestedProperty = (obj, patt, fn, depth) => {
        const helper = (objs, depth) => {
            for (const obj of objs) {
                const keys = Object.keys(obj).filter(key => key.match(patt));
                if (keys.length === 1)      // We expect a single match
                    return fn(obj[keys[0]]);
            }
            if (depth > 0)
                return helper(
                    objs.flatMap(obj =>
                                Object.values(obj).filter(val =>
                                    typeof val === 'object' && val != null)),
                    depth - 1);
            return undefined;
        };
        return helper(new Array(obj), depth);
    };
    const processInsertedFeedUnit = (feedUnit, category) => {
        switch (category) {
            case 'ORGANIC':
                // Organic feed units are the regular feed units and never gets filtered
                break;
            case 'SPONSORED':
                // Sponsored feed units always gets filtered
                feedUnit.classList.add(magic);
                break;
            default:
                // The rest of the categories only gets filtered when requested by the user
                if (setOfCategoriesToHide.has(category))
                    feedUnit.classList.add(magic);
        }
    };
    const checkWhetherFeedUnit = (node) => {
        if (!(node instanceof HTMLDivElement))
            return;
        const keys = Object.keys(node).filter(key => key.startsWith('__reactProps'));
        if (keys.length != 1)
            return;
        const obj = node[keys[0]];
        let down = undefined;
        try {
            down = obj.children.props.children.props.children.props;
        } catch(e) {}
        if (!down)
            return;
        const feed = findNestedProperty(down, /feed/, x => x, 4);
        if (!feed)
            return;
        // Old, simple case of category representation
        const category = findNestedProperty(feed, /category/, x => x, 0);
        if (category && category in categoryMap) {
            processInsertedFeedUnit(node, category);
            return;
        }
        // Newer, more convoluted case of category representation
        const enc = findNestedProperty(feed, 
                                        /cat.*[sS]ens/,
                                        x => findNestedProperty(x, /enc/, x => x, 0),
                                        0);
        const postId = findNestedProperty(feed, /post_id/, x => x, 2);
        if (enc && postId) {
            fromObfuscatedCategory(node, enc, postId).then(ctx => {
                if (ctx && ctx.category in categoryMap)
                    processInsertedFeedUnit(ctx.node, ctx.category);
            });
        } else if(!enc) {
            const category = findNestedProperty(feed, 
                                            /cat.*[sS]ens/,
                                            x => findNestedProperty(x, /cat/, x => x, 0),
                                            0);
            if (category && category in categoryMap)
                processInsertedFeedUnit(node, category);
        }
    };
    const start = () => {
        const style = document.createElement('style');
        style.innerHTML = `.${magic} {display: none !important;}`;
        document.head.appendChild(style);
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    checkWhetherFeedUnit(node);
                });
            });
        });
        observer.observe(document.body, {childList: true, subtree: true});
    };
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', start, {once: true});
    else
        start();
})();
