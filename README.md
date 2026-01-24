# facebook-feeds-filter
uBlock Origin scriptlet to filter unwanted feed-units on FB by their category. 

## Install and set up the extension to use this scriptlet on FB

1. Install the uBlock Origin browser extension to use this scriptlet.
2. In Settings/Advanced, tick the checkbox "I am an advanced user", click the "gears", that appears.
3. Add the link to the [raw source of the scriptlet](https://raw.githubusercontent.com/imrehorvath/facebook-feeds-filter/main/facebook-feeds-filter.js "facebook-feeds-filter.js") to the field: "userResourcesLocation", click "Apply changes".
4. On the "My filters" tab, add the below two filters, click "Apply changes".

```
facebook.com##+js(facebook-feeds-filter)
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

Currently used categories are:
```
{
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
}
```
