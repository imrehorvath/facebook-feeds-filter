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
        FB_SHORTS_FALLBACK: 16
    };
    const magic = String.fromCharCode(Date.now() % 26 + 97) +
                  Math.floor(Math.random() * 982451653 + 982451653).toString(36);
    const sha256 = async text => {
        // Source: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
        const textUint8 = new TextEncoder().encode(text);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", textUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        return hashHex;
    };
    const fromObfuscatedCategory = async (node, enc, post_id) => {
        const b = await sha256(post_id);
        const d = Object.entries(categoryMap);
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
            for (const o of objs) {
                const keys = Object.keys(o).filter(k => k.match(patt));
                if (keys.length === 1)      // We expect a single match
                    return fn(o[keys[0]]);
            }
            if (depth)
                return helper(objs.flatMap(
                        o => Object.values(o).filter(
                            o => typeof o === 'object' && o != null)),
                        depth - 1);
            return undefined;
        };
        return helper(new Array(obj), depth);
    };
    const processInsertedFeedUnit = (feedUnit, category) => {
        switch (category) {
            case 'ORGANIC':
                // Organic feed units are the regular feed units and gets never filtered
                break;
            case 'SPONSORED':
                // Sponsored feed units gets always filtered
                feedUnit.classList.add(magic);
                break;
            default:
                // Categories like ENGAGEMENT and PROMOTION gets filtered optionally.
                if (setOfCategoriesToHide.has(category))
                    feedUnit.classList.add(magic);
        }
    };
    const checkWhetherFeedUnit = node => {
        if (!(node instanceof HTMLDivElement))
            return;
        const ks = Object.keys(node).filter(k => k.startsWith('__reactProps'));
        if (ks.length != 1)
            return;
        const o = node[ks[0]];
        let down = undefined;
        try {
            down = o.children.props.children.props.children.props;
        } catch(e) {}
        if (!down)
            return;
        const feed = findNestedProperty(down, /feed/, x => x, 4);
        if (!feed)
            return;
        const enc = findNestedProperty(feed, 
                                        /cat.*[sS]ens/,
                                        x => findNestedProperty(x, /enc/, x => x, 0),
                                        0);
        const post_id = findNestedProperty(feed, /post_id/, x => x, 2);
        if (enc && post_id) {
            fromObfuscatedCategory(node, enc, post_id).then(ctx => {
                if (ctx)
                    processInsertedFeedUnit(ctx.node, ctx.category);
            });
        } else if(!enc) {
            const category = findNestedProperty(feed, 
                                            /cat.*[sS]ens/,
                                            x => findNestedProperty(x, /cat/, x => x, 0),
                                            0);
            if (category)
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, {once: true});
    } else {
        start();
    }
})();
