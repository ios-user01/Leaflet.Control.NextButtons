# L.Control.NextButtons

`L.Control.NextButtons` is a [Leaflet](http://leafletjs.com/) plugin that shows "next" buttons when markers are on that side, beyond the bounds of the given map.

This is a dumbed down approach to what we use at Pinterest for [place pins](http://blog.pinterest.com/post/67622502341/introducing-place-pins-for-the-explorer-in-all-of-us). This assumes no external libraries other than Leaflet exist. So, **we're not using any libraries that abstract cross-browser behavior**. If that's a problem, file an [issue](https://github.com/pinterest/Leaflet.Control.NextButtons/issues). This should be solid in IE9 and up.

## Instructions

All you need to do is instantiate a new `L.Control.nextButtons` object and pass it a valid `markerLayer`.

For example:

```js
var map = new L.Map('map', {
    layers: [layer],
    center: [37.7833, -122.4167],
    zoom: 13,
    zoomControl: true
});

var markerLayer = L.featureGroup().addTo(map);

L.marker([37.8044, -122.2708]).addTo(markerLayer);
L.marker([37.7833, -122.4167]).addTo(markerLayer);

var nextButtons = new L.control.nextButtons({
    markerLayer: markerLayer
}).addTo(map);
```

That's it.

The styles for the buttons can be set by styling `.leaflet-control-nextButtons-button`. If you'd like to style an individual button, you can do something like: `.leaflet-control-nextButtons-button-north`.

By default, buttons with the `disabled` class are hidden. We're using next to no styles so they will be easy to override.

## Options

* `markerLayer` is a **required** option. It should point to the marker layer that contains markers used for the calculations.
* `paddingTopLeft` is an optional object that has numerical values for `x` and `y`. These are pixels and correspond to the [leaflet docs](http://leafletjs.com/reference.html#map-paddingtopleft). Example: `{x: 50, y: 70}`. Default is `{x: 0, y: 0}`.
* `paddingBottomRight` is an optional object that has numerical values for `x` and `y`. These are pixels and correspond to the [leaflet docs](http://leafletjs.com/reference.html#map-paddingtopleft). Example: `{x: 0, y: 0}`. Default is `{x: 0, y: 0}`.

## Authors

* Chris Danford ([@chrisdanford](https://github.com/chrisdanford))
* Connor Montgomery ([@connor](https://github.com/connor))
