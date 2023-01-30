# facebook-feeds-filter
uBlock Origin scriptlet to filter unwanted feed-units on FB by their category. 

## Install and set up the extension to use this scriptlet on FB

1. Install the uBlock Origin browser extension to use this scriptlet.
2. In Settings/Advanced, tick the checkbox "I am an advanced user", click the "gears", that appears.
3. Add the link to the [raw source of the scriptlet](https://raw.githubusercontent.com/imrehorvath/facebook-feeds-filter/main/facebook-feeds-filter.js "facebook-feeds-filter.js") to the field: "userResourcesLocation", click "Apply changes".
4. On the "My filters" tab, add the below two filters, click "Apply changes".

```
facebook.com##+js(facebook-feeds-filter)
facebook.com##div[role="complementary"] div>span:has(h3[dir="auto"] span:has-text(Sponsored))
```

You may want to filter not just the sponsored feed-units, but others like, engagement, etc. Use the `|` to delimit the categories.

Set the following to filter sponsored and suggested feed-units.

```
facebook.com##+js(facebook-feeds-filter,engagement)
```

Or set it, to filter sponsored, suggested and friend-recommendation feed-units.

```
facebook.com##+js(facebook-feeds-filter,engagement|promotion)
```
