(function(win, doc) {

    var CardinalDirection = {
        NORTH : 0,
        EAST : 1,
        SOUTH : 2,
        WEST : 3
    };

    var CLASS_DISABLED = 'disabled';

    var CardinalDirectionToNextButtonClass = {
        0: 'nextButtonNorth',
        1: 'nextButtonEast',
        2: 'nextButtonSouth',
        3: 'nextButtonWest'
    };

    L.Control.NextButtons = L.Control.extend({
        onAdd: function(map) {
            var self = this;
            var container = L.DomUtil.create('div', 'leaflet-control-nextButtons leaflet-control');

            map.on('dragend', this.onDragEnd, this);
            map.on('resize', this.onMapResize, this);
            map.on('zoomend', this.onZoomEnd, this);
            map.on('moveend', this.onMoveEnd, this);

            var nButton = L.DomUtil.create('button',
                'leaflet-control-nextButtons-button leaflet-control-nextButtons-button-north nextButtonNorth',
                container);
            var eButton = L.DomUtil.create('button',
                'leaflet-control-nextButtons-button leaflet-control-nextButtons-button-east nextButtonEast',
                container);
            var sButton = L.DomUtil.create('button',
                'leaflet-control-nextButtons-button leaflet-control-nextButtons-button-south nextButtonSouth',
                container);
            var wButton = L.DomUtil.create('button',
                'leaflet-control-nextButtons-button leaflet-control-nextButtons-button-west nextButtonWest',
                container);

            var bind = L.Util.bind;

            L.DomEvent
                    .on(nButton, 'click', bind(this._onNorthButtonClick, self))
                    .on(sButton, 'click', bind(this._onSouthButtonClick, self))
                    .on(eButton, 'click', bind(this._onEastButtonClick, self))
                    .on(wButton, 'click', bind(this._onWestButtonClick, self))
                    ;

            this._buttons = [nButton, eButton, sButton, wButton];

            // TODO: this is a hideous hack. Clean this up.
            window.setTimeout(function() {
                self.updateNextButtons();
            }, 1);
            return container;
        },

        onMapResize: function() {
            this.updateNextButtons();
        },

        selectNextMarker: function(cardinalDirection) {
            var marker = this._mapCardinalDirectionToNearestMoreMarker[cardinalDirection];
            if (marker) {
                this._map.panTo(marker.getLatLng())
            }
        },

        _onNorthButtonClick: function(evt) {
            this.selectNextMarker(CardinalDirection['NORTH']);
        },

        _onSouthButtonClick: function(evt) {
            this.selectNextMarker(CardinalDirection['SOUTH']);
        },

        _onEastButtonClick: function(evt) {
            this.selectNextMarker(CardinalDirection['EAST']);
        },

        _onWestButtonClick: function(evt) {
            this.selectNextMarker(CardinalDirection['WEST']);
        },

        onDragEnd: function(evt) {
            this.updateNextButtons();
        },

        onZoomEnd: function(evt) {
            this.updateNextButtons();
        },

        onMoveEnd: function(evt) {
            this.updateNextButtons();
        },

        computeMoreMarkers: function() {
            var self = this;

            var safeBounds = this.getSafeZoneBounds();

            var mapCardinalDirectionToNearestMoreMarker = {};
            var mapCardinalDirectionToNearestMoreDistance = {};

            this.options.markerLayer.eachLayer(function(marker) {
                var markerlatLng = marker.getLatLng();
                var markerContianerPoint = self._map.latLngToContainerPoint(markerlatLng);
                var isInSafeZone = safeBounds.contains(markerContianerPoint);

                if (!isInSafeZone) {
                    var center = safeBounds.getCenter();
                    var centerToMarkerVector = markerContianerPoint.subtract(center);
                    var absDistanceX = Math.abs(centerToMarkerVector.x);
                    var absDistanceY = Math.abs(centerToMarkerVector.y);
                    var distance = center.distanceTo(markerContianerPoint);
                    var cardinalDirection;

                    if (absDistanceX > absDistanceY) {
                        cardinalDirection = centerToMarkerVector.x < 0 ? CardinalDirection.WEST : CardinalDirection.EAST;
                    } else {
                        cardinalDirection = centerToMarkerVector.y < 0 ? CardinalDirection.NORTH : CardinalDirection.SOUTH;
                    }

                    var nearestSoFarMarker = mapCardinalDirectionToNearestMoreMarker[cardinalDirection];
                    var nearestSoFarDistance = mapCardinalDirectionToNearestMoreDistance[cardinalDirection];
                    if (nearestSoFarMarker === undefined || distance < nearestSoFarDistance) {
                        mapCardinalDirectionToNearestMoreMarker[cardinalDirection] = marker;
                        mapCardinalDirectionToNearestMoreDistance[cardinalDirection] = distance;
                    }
                }
            });
            
            this._mapCardinalDirectionToNearestMoreMarker = mapCardinalDirectionToNearestMoreMarker;
        },

        updateNextButtons: function() {
            var self = this;
            this.computeMoreMarkers();

            // TODO: Optimization Opportunity: For each direction, we're iterating over
            // all markers one for each direction.  Instead, iterate over all markers
            // once and calculate the nearest for each CardinalDirection in a single
            // pass.
            // TODO: using Object.keys breaks IE9.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
            for (var key in CardinalDirection) {
                var cardinalDirection = CardinalDirection[key];
                var hasNext = cardinalDirection in self._mapCardinalDirectionToNearestMoreMarker;
                var childClass = CardinalDirectionToNextButtonClass[cardinalDirection];
                var btn = doc.getElementsByClassName(childClass)[0];
                var isEnabled = self._nextButtonsEnabled;
                hasNext && isEnabled ? this._enableButton(btn) : this._disableButton(btn);
            }
        },

        _enableButton: function(button) {
            L.DomUtil.removeClass(button, CLASS_DISABLED);
        },

        _disableButton: function(button) {
            L.DomUtil.addClass(button, CLASS_DISABLED);
        },

        getSafeZonePaddingTopLeft: function() {
            var paddingTopLeft = this.options.paddingTopLeft || {x: 0, y: 0};
            return L.point(paddingTopLeft.x, paddingTopLeft.y);
        },

        getSafeZonePaddingBottomRight: function() {
            var paddingBottomRight = this.options.paddingBottomRight || {x: 0, y: 0};
            return L.point(paddingBottomRight.x, paddingBottomRight.y);
        },

        getSafeZoneBounds: function() {
            var min = this.getSafeZonePaddingTopLeft();
            var max = this._map.getSize().subtract(this.getSafeZonePaddingBottomRight());
            return L.bounds(min, max);
        },

        initialize: function(options) {
            L.extend(this.options, options);
            this._mapCardinalDirectionToNearestMoreMarker = null;
            this._mapCardinalDirectionToNearestMoreMarker = {};
            this._nextButtonsEnabled = true;
        }
    });

    L.Map.addInitHook(function () {
        if (this.options.nextButtons) {
            this.nextButtons = L.control.nextButtons();
            this.addControl(this.nextButtons);
        }
    });

    L.control.nextButtons = function (options) {
        return new L.Control.NextButtons(options);
    };
})(window, document);