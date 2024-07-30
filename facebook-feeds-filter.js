/// facebook-feeds-filter.js
(function() {
    const categoriesToHide = '{{1}}';  // Optional argument to filter posts by their category
    const setOfCategoriesToHide = (( ) => {
        if ( categoriesToHide === '' || categoriesToHide === '{{1}}' ) { return new Set(); }
        return new Set(categoriesToHide.split(/\s*\|\s*/).map(s => s.toUpperCase()));
    })();
    const magic = String.fromCharCode(Date.now() % 26 + 97) +
                  Math.floor(Math.random() * 982451653 + 982451653).toString(36);
    const findNestedProperty = (obj, patt, fn, depth) => {
        const helper = (objs, depth) => {
            for ( const o of objs ) {
                const keys = Object.keys(o).filter(k => k.match(patt));
                if ( keys.length === 1 ) {  // We expect a single match
                    return fn(o[keys[0]]);
                }
            }
            if ( depth ) {
                return helper(objs.flatMap(o => Object.values(o).filter(o => typeof o === 'object' && 
                                                                                    o != null)),
                              depth - 1);
            }
            return undefined;
        };
        return helper(new Array(obj), depth);
    };
    const processInsertedFeedUnit = (feedUnit, category) => {
        switch ( category ) {
            case 'ORGANIC':
                // Organic feed units are the regular feed units and gets never filtered
                break;
            case 'SPONSORED':
                // Sponsored feed units gets always filtered
                feedUnit.classList.add(magic);
                break;
            default:
                // Categories like ENGAGEMENT and PROMOTION gets filtered optionally.
                if ( setOfCategoriesToHide.has(category) ) {
                    feedUnit.classList.add(magic);
                }
        }
    };
    const checkWhetherFeedUnit = ( node ) => {
        if ( node instanceof HTMLDivElement ) {
            const keys = Object.keys(node).filter(k => k.startsWith('__reactProps'));
            if ( keys.length === 1 ) {
                const obj = node[keys[0]];
                const root = obj.children &&
                      obj.children.props &&
                      obj.children.props.children &&
                      obj.children.props.children.props &&
                      obj.children.props.children.props.children &&
                      obj.children.props.children.props.children.props;
                if ( root ) {
                    const category = findNestedProperty(root, 
                                                        /feed/, 
                                                        o => findNestedProperty(o, /category/, x => x, 0) || 
                                                            findNestedProperty(o, /story_cat/, x => x, 0),
                                                        4);
                    console.log(`facebook-feeds-filter: category: ${category}`)
                    if ( category ) {
                        processInsertedFeedUnit(node, category);
                    }
                }
            }
        }
    };
    const start = ( ) => {
        const style = document.createElement('style');
        style.innerHTML = `
            .${magic} {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        const observer = new MutationObserver(mutations => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    checkWhetherFeedUnit(node);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };
    if ( document.readyState === 'loading' ) {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
