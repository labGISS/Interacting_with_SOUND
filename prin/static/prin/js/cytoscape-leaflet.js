(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('leaflet')) :
  typeof define === 'function' && define.amd ? define(['leaflet'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.CytoscapeLeaflet = factory(global.L));
}(this, (function (L) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var L__default = /*#__PURE__*/_interopDefaultLegacy(L);

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var createClass = _createClass;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var defineProperty = _defineProperty;

  // Simple, internal Object.assign() polyfill for options objects etc.
  var assign = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
    for (var _len = arguments.length, srcs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      srcs[_key - 1] = arguments[_key];
    }

    srcs.forEach(function (src) {
      Object.keys(src).forEach(function (k) {
        return tgt[k] = src[k];
      });
    });
    return tgt;
  };

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  /** @typedef {import('cytoscape')} cytoscape */

  /** @typedef {import('./map-handler').MapHandlerOptions} MapHandlerOptions */

  /**
   * @param {MouseEvent} event
   * @see https://github.com/cytoscape/cytoscape.js/blob/master/src/extensions/renderer/base/load-listeners.js
   */

  function isMultSelKeyDown(event) {
    return event.shiftKey || event.metaKey || event.ctrlKey; // maybe event.altKey
  }

  var DEFAULT_FIT_PADDING = [50, 50];
  var DEFAULT_ANIMATION_DURATION = 500;
  var HIDDEN_CLASS = 'cytoscape-map__hidden';
  var DEFAULT_MAP_MOVE_DELAY = 0;
  var DEFAULT_LAYOUT = {
    name: 'preset'
  };
  var MapHandler = /*#__PURE__*/function () {
    /** @type cytoscape.Core */

    /** @type L.MapOptions */

    /** @type MapHandlerOptions */

    /** @type HTMLElement */

    /** @type L.Map */

    /** @type boolean | undefined */

    /** @type boolean | undefined */

    /** @type boolean | undefined */

    /** @type cytoscape.NodePositionMap | undefined */

    /** @type number | undefined */

    /** @type cytoscape.Position | undefined */

    /** @type boolean */
    // onMapMoveStartBound = this.onMapMoveStart.bind(this);

    /**
     * @param {cytoscape.Core} cy
     * @param {L.MapOptions} mapOptions
     * @param {MapHandlerOptions} options
     */
    function MapHandler(cy, mapOptions, options) {
      classCallCheck(this, MapHandler);

      defineProperty(this, "cy", void 0);

      defineProperty(this, "mapOptions", void 0);

      defineProperty(this, "options", void 0);

      defineProperty(this, "mapContainer", void 0);

      defineProperty(this, "map", void 0);

      defineProperty(this, "originalAutoungrabify", void 0);

      defineProperty(this, "originalUserZoomingEnabled", void 0);

      defineProperty(this, "originalUserPanningEnabled", void 0);

      defineProperty(this, "originalPositions", void 0);

      defineProperty(this, "originalZoom", void 0);

      defineProperty(this, "originalPan", void 0);

      defineProperty(this, "panning", false);

      defineProperty(this, "onGraphContainerMouseDownBound", this.onGraphContainerMouseDown.bind(this));

      defineProperty(this, "onGraphContainerMouseMoveBound", this.onGraphContainerMouseMove.bind(this));

      defineProperty(this, "onGraphContainerWheelBound", this.onGraphContainerWheel.bind(this));

      defineProperty(this, "onMapMoveBound", this.onMapMove.bind(this));

      defineProperty(this, "onMapMoveEndBound", this.onMapMoveEnd.bind(this));

      defineProperty(this, "onGraphAddBound", this.onGraphAdd.bind(this));

      defineProperty(this, "onGraphResizeBound", this.onGraphResize.bind(this));

      defineProperty(this, "onGraphDragFreeBound", this.onGraphDragFree.bind(this));

      defineProperty(this, "saveLayoutPositionAsLatLngBound", this.saveLayoutPositionAsLatLng.bind(this));

      this.cy = cy;
      this.mapOptions = mapOptions;
      this.options = options;

      if (!(this.options.getPosition instanceof Function)) {
        throw new Error('getPosition should be a function');
      }

      if (this.options.setPosition && !(this.options.setPosition instanceof Function)) {
        throw new Error('setPosition should be a function');
      } // Cytoscape config


      this.originalAutoungrabify = this.cy.autoungrabify();
      this.originalUserZoomingEnabled = this.cy.userZoomingEnabled();
      this.originalUserPanningEnabled = this.cy.userPanningEnabled();
      this.cy.userZoomingEnabled(false);
      this.cy.userPanningEnabled(false); // Cytoscape events

      var graphContainer =
      /** @type HTMLElement */
      this.cy.container(); // graphContainer.addEventListener('mousedown', this.onGraphContainerMouseDownBound);
      // graphContainer.addEventListener('mousemove', this.onGraphContainerMouseMoveBound);

      this.cy.on('tapstart', this.onGraphContainerMouseDownBound);
      graphContainer.addEventListener('wheel', this.onGraphContainerWheelBound);
      this.cy.on('add', this.onGraphAddBound);
      this.cy.on('resize', this.onGraphResizeBound);
      this.cy.on('dragfree', this.onGraphDragFreeBound);
      this.cy.on('cxttap', "node", function (event) {
        event.target.unlock();
      }); // this.cy.on('layoutstart layoutready layoutstop ready render destroy pan dragpan zoom pinchzoom scrollzoom viewport resize', (evt) => {
      //   console.log(evt.type);
      // })
      //
      // this.cy.one('render', (evt) => {
      //   console.log(evt);
      // })
      // Map container

      this.mapContainer = document.createElement('div');
      this.mapContainer.style.position = 'absolute';
      this.mapContainer.style.top = '0px';
      this.mapContainer.style.left = '0px';
      this.mapContainer.style.width = '100%';
      this.mapContainer.style.height = '100%';
      graphContainer.insertBefore(this.mapContainer, this.cy.renderer().data.canvasContainer); // Leaflet instance

      this.map = new L__default['default'].Map(this.mapContainer, this.mapOptions);
      this.fit(undefined, {
        padding: DEFAULT_FIT_PADDING,
        animate: false
      }); // Map events

      this.map.on('move', this.onMapMoveBound); // this.map.on('movestart', this.onMapMoveStartBound);

      this.map.on('moveend', this.onMapMoveEndBound); // Cytoscape unit viewport

      this.originalZoom = this.cy.zoom();
      this.originalPan = _objectSpread({}, this.cy.pan());
      var zoom = 1;
      var pan = {
        x: 0,
        y: 0
      };

      if (this.options.animate) {
        var _this$options$animati;

        this.cy.animate({
          zoom: zoom,
          pan: pan
        }, {
          duration: (_this$options$animati = this.options.animationDuration) !== null && _this$options$animati !== void 0 ? _this$options$animati : DEFAULT_ANIMATION_DURATION,
          easing: 'linear'
        });
      } else {
        this.cy.viewport(zoom, pan);
      } // Cytoscape positions


      this.enableGeographicPositions();
    }

    createClass(MapHandler, [{
      key: "destroy",
      value: function destroy() {
        // Cytoscape events
        var graphContainer =
        /** @type HTMLElement */
        this.cy.container(); // graphContainer.removeEventListener('mousedown', this.onGraphContainerMouseDownBound);
        // graphContainer.removeEventListener('mousemove', this.onGraphContainerMouseMoveBound);

        graphContainer.removeEventListener('wheel', this.onGraphContainerWheelBound);
        this.cy.off('tapstart', this.onGraphContainerMouseDownBound);
        this.cy.off('add', this.onGraphAddBound);
        this.cy.off('resize', this.onGraphResizeBound);
        this.cy.off('dragfree', this.onGraphDragFreeBound); // Cytoscape config

        this.cy.autoungrabify(this.originalAutoungrabify);
        this.cy.userZoomingEnabled(this.originalUserZoomingEnabled);
        this.cy.userPanningEnabled(this.originalUserPanningEnabled);
        this.originalAutoungrabify = undefined;
        this.originalUserZoomingEnabled = undefined;
        this.originalUserPanningEnabled = undefined; // Map events

        this.map.off('move', this.onMapMoveBound); // this.map.off('dragstart', this.onMapDragStartBound);

        this.map.off('dragend'); // Map instance

        this.map.remove();
        this.map = undefined; // Map container

        this.mapContainer.remove();
        this.mapContainer = undefined; // Cytoscape unit viewport

        if (this.options.animate) {
          var _this$options$animati2;

          this.cy.animate({
            zoom: this.originalZoom,
            pan: this.originalPan
          }, {
            duration: (_this$options$animati2 = this.options.animationDuration) !== null && _this$options$animati2 !== void 0 ? _this$options$animati2 : DEFAULT_ANIMATION_DURATION,
            easing: 'linear'
          });
        } else {
          this.cy.viewport(this.originalZoom, this.originalPan);
        }

        this.originalZoom = undefined;
        this.originalPan = undefined; // Cytoscape positions

        this.disableGeographicPositions();
        this.cy = undefined;
        this.options = undefined;
      }
      /**
       * @param {cytoscape.NodeCollection} nodes
       * @param {L.FitBoundsOptions} options
       */

    }, {
      key: "fit",
      value: function fit() {
        var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cy.nodes();
        var options = arguments.length > 1 ? arguments[1] : undefined;
        var bounds = this.getNodeLngLatBounds(nodes);

        if (!bounds.isValid()) {
          return;
        }

        this.map.fitBounds(bounds, options);
      }
      /**
       * Save each node current layout position as the current geographical position.
       * Node's position is saved into its scratch, as <i>leaflet</i> namespace and <i>currentGeoposition<i> LatLng object
       * @param {cytoscape.NodeCollection} nodes
       */

    }, {
      key: "saveLayoutPositionAsLatLng",
      value: function saveLayoutPositionAsLatLng() {
        var _this = this;

        var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cy.nodes();
        nodes.forEach(function (node) {
          // if (!(node.scratch('leaflet') && node.scratch('leaflet')['currentGeoposition'])) {
          node.scratch('leaflet', {
            currentGeoposition: _this.map.containerPointToLatLng(node.position())
          }); // }
        });
      }
      /**
       * Delete layout geographic position from each node's scratch
       * @param nodes
       */

    }, {
      key: "deleteLatLngLayoutPosition",
      value: function deleteLatLngLayoutPosition() {
        var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cy.nodes();
        nodes.forEach(function (node) {
          if (node.scratch('leaflet') && node.scratch('leaflet').currentGeoposition) {
            delete node.scratch('leaflet').currentGeoposition;
          }
        });
      }
      /**
       * Update nodes positions (calling node.position() method)
       * and (optionally) hide nodes without geographical position
       * @private
       */

    }, {
      key: "updateNodePosition",
      value: function updateNodePosition() {
        var _this2 = this;

        var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cy.nodes();
        nodes.forEach(function (node) {
          // let wasLocked = node.locked();
          // if (wasLocked) node.unlock();
          node.unlock();

          var position = _this2.getGeographicPosition(node);

          if (position) {
            node.position(position); // if (this.getNodeLngLat(node)) { // nodes that have native geographical positions cannot be dragged

            node.lock(); // }
          } // hide nodes without position


          if (!position && _this2.options.hideNonPositional) {
            // const nodesWithoutPosition = nodes.filter(node => !positions[node.id()]);
            node.addClass(HIDDEN_CLASS).style('display', 'none');
          }
        });
      }
      /**
       * @return {cytoscape.LayoutOptions}
       * @param {*} [customOptions]
       */

    }, {
      key: "getLayout",
      value: function getLayout() {
        var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
        return assign(DEFAULT_LAYOUT, this.options.layout, customOptions);
      }
      /**
       * @private
       */

    }, {
      key: "enableGeographicPositions",
      value: function enableGeographicPositions() {
        var _this3 = this;

        var nodes = this.cy.nodes();
        this.originalPositions = Object.fromEntries(nodes.map(function (node) {
          return [node.id(), _objectSpread({}, node.position())];
        })); // const positions = /** @type cytoscape.NodePositionMap */ (Object.fromEntries(
        //   /** @type [string, cytoscape.Position | undefined][] */ (nodes.map(node => {
        //     return [node.id(), this.getGeographicPosition(node)];
        //   })).filter(([_id, position]) => {
        //     return !!position;
        //   })
        // ));
        // this.cy.elements().makeLayout(this.getLayout({
        //   fit: false,
        //   animate: this.options.animate,
        //   animationDuration: this.options.animationDuration ?? DEFAULT_ANIMATION_DURATION,
        //   animationEasing: 'ease-out-cubic',
        // }))
        //     // .one('layoutstop', this.saveLayoutPositionAsLatLngBound)
        //     .run();

        this.cy.nodes().forEach(function (node) {
          if (_this3.getNodeLngLat(node)) {
            node.lock();
          }
        });
        this.updateNodePosition(nodes);
      }
      /**
       * @private
       * @param {cytoscape.NodeCollection | undefined} nodes
       */

    }, {
      key: "updateGeographicPositions",
      value: function updateGeographicPositions() {
        var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cy.nodes();
        // const positions = /** @type cytoscape.NodePositionMap */ (Object.fromEntries(
        //   /** @type [string, cytoscape.Position | undefined][] */ (nodes.map(node => {
        //     return [node.id(), this.getGeographicPosition(node)];
        //   })).filter(([_id, position]) => {
        //     return !!position;
        //   })
        // ));
        //
        // // update only positions which have changed, for cytoscape-edgehandles compatibility
        // const currentPositions = /** @type cytoscape.NodePositionMap */ (Object.fromEntries(nodes.map(node => {
        //   return [node.id(), { ...node.position() }];
        // })));
        // const updatedPositions = /** @type cytoscape.NodePositionMap */ (Object.fromEntries(
        //   Object.entries(positions).filter(([id, position]) => {
        //     const currentPosition = currentPositions[id];
        //     return !this.arePositionsEqual(currentPosition, position);
        //   })
        // ));
        //
        // // hide nodes without position
        // const nodesWithoutPosition = nodes.filter(node => !positions[node.id()]);
        // nodesWithoutPosition.addClass(HIDDEN_CLASS).style('display', 'none');
        // this.cy.nodes().forEach((node) => {
        //   if (this.getGeographicPosition(node)) {
        //     node.lock();
        //   }
        // });
        this.updateNodePosition(nodes); // if (this.options.runLayoutOnViewport) {
        //   console.log("Layout on viewport");
        //   this.cy.layout(this.getLayout({
        //     fit: false,
        //     animate: false
        //   })).run();
        // }
      }
      /**
       * @private
       */

    }, {
      key: "disableGeographicPositions",
      value: function disableGeographicPositions() {
        var nodes = this.cy.nodes(); // show nodes without position

        if (this.options.hideNonPositional) {
          var nodesWithoutPosition = nodes.filter(function (node) {
            return node.hasClass(HIDDEN_CLASS);
          });
          nodesWithoutPosition.removeClass(HIDDEN_CLASS).style('display', null);
        }

        nodes.forEach(function (node) {
          // if (this.originalPositions && this.originalPositions[node.id()]) {
          //   node.position(this.originalPositions[node.id()]);
          //   node.unlock();
          // }
          node.unlock();
        });
        this.cy.fit(); // this.cy.layout(this.getLayout({
        //   fit: false,
        //   animate: this.options.animate,
        //   animationDuration: this.options.animationDuration ?? DEFAULT_ANIMATION_DURATION,
        //   animationEasing: 'ease-in-cubic',
        //   stop: () => {
        //     // show nodes without position
        //     const nodesWithoutPosition = nodes.filter(node => node.hasClass(HIDDEN_CLASS));
        //     nodesWithoutPosition.removeClass(HIDDEN_CLASS).style('display', null);
        //   }
        // })).run();

        this.cy.one('layoutstop', function (evt) {
          evt.cy.nodes().unlock();
        });
        this.originalPositions = undefined;
      }
      /**
       * @private
       * @param {cytoscape.EventObject} cyEventObject
       */

    }, {
      key: "onGraphContainerMouseDown",
      value: function onGraphContainerMouseDown(cyEventObject) {
        var _this4 = this;

        var originalEvent = cyEventObject.originalEvent;

        if (originalEvent.buttons === 1 && !isMultSelKeyDown(originalEvent) && !this.cy.renderer().hoverData.down) {
          this.cy.renderer().hoverData.dragging = true; // cytoscape-lasso compatibility

          this.saveLayoutPositionAsLatLng(cyEventObject.cy.nodes());
          this.dispatchMapEvent(originalEvent);
          this.cy.one('tapdrag', this.onGraphContainerMouseMoveBound); // this.cy.nodes('#London-NewYork1').on('position', (evt) => {
          //   let data = {
          //     position: evt.target.position(),
          //     rendered: evt.target.renderedPosition(),
          //     relative: evt.target.relativePosition()
          //   }
          //
          //   if (evt.target.scratch('leaflet')) {
          //     data['geoposition'] = evt.target.scratch('leaflet').currentGeoposition;
          //   }
          //
          //   console.table(data);
          // });

          cyEventObject.cy.one('tapend', function (cyUpEventObject) {
            // this.deleteLatLngLayoutPosition(cyUpEventObject.cy.nodes());
            // this.updateGeographicPositions(cyUpEventObject.cy.nodes());
            // console.warn("TAPEND");
            // setTimeout(()=>{
            //   this.cy.nodes('#London-NewYork1').off('position');
            // }, 500);
            if (!_this4.panning) {
              return;
            }

            _this4.panning = false; // prevent unselecting in Cytoscape mouseup

            _this4.cy.renderer().hoverData.dragged = true;
          });
        }
      }
      /**
       * @private
       * @param {cytoscape.EventObject} cyEventObject
       */

    }, {
      key: "onGraphContainerMouseMove",
      value: function onGraphContainerMouseMove(cyEventObject) {
        var originalEvent = cyEventObject.originalEvent;

        if (originalEvent.buttons === 1 && !isMultSelKeyDown(originalEvent) && !this.cy.renderer().hoverData.down) {
          this.panning = true;
          cyEventObject.preventDefault();
          this.dispatchMapEvent(originalEvent);
        }
      }
      /**
       * @private
       * @param {MouseEvent} event
       */

    }, {
      key: "onGraphContainerWheel",
      value: function onGraphContainerWheel(event) {
        this.dispatchMapEvent(event);
      }
      /**
       * @private
       */

    }, {
      key: "onMapMove",
      value: function onMapMove() {
        this.updateGeographicPositions();
      }
    }, {
      key: "onMapMoveEnd",
      value: function onMapMoveEnd() {
        var _this5 = this;

        // console.log("moveend");
        setTimeout(function () {
          _this5.cy.nodes().forEach(function (node) {
            if (!_this5.getNodeLngLat(node)) {
              // console.log("unlock");
              // this.updateNodePosition(node);
              node.unlock();
            }
          });
        }, this.options.delayOnMove || DEFAULT_MAP_MOVE_DELAY);
      }
      /**
       * @private
       * @param {cytoscape.EventObject} event
       */

    }, {
      key: "onGraphAdd",
      value: function onGraphAdd(event) {
        if (!event.target.isNode()) {
          return;
        }

        var node =
        /** @type cytoscape.NodeSingular */
        event.target;
        this.originalPositions[node.id()] = _objectSpread({}, node.position());
        var nodes = this.cy.collection().merge(node);
        this.updateGeographicPositions(nodes);
      }
      /**
       * @private
       */

    }, {
      key: "onGraphResize",
      value: function onGraphResize() {
        this.map.invalidateSize(false);
      }
      /**
       * @private
       * @param {cytoscape.EventObject} event
       */

    }, {
      key: "onGraphDragFree",
      value: function onGraphDragFree(event) {
        var node =
        /** @type cytoscape.NodeSingular */
        event.target;

        if (this.options.setPosition) {
          var lngLat = this.map.containerPointToLatLng(node.position());
          this.options.setPosition(node, lngLat);
        }

        var nodes = this.cy.collection().merge(node);
        this.updateGeographicPositions(nodes);
      }
      /**
       * @private
       * @param {MouseEvent} event
       */

    }, {
      key: "dispatchMapEvent",
      value: function dispatchMapEvent(event) {
        if (event.target === this.mapContainer || this.mapContainer.contains(event.target)) {
          return;
        }

        var clonedEvent = new event.constructor(event.type, event);
        this.map.getContainer().dispatchEvent(clonedEvent);
      }
      /**
       * @private
       * @param {cytoscape.NodeSingular} node
       * @return {L.LatLng | undefined}
       */

    }, {
      key: "getNodeLngLat",
      value: function getNodeLngLat(node) {
        var lngLatLike = this.options.getPosition(node);

        if (!lngLatLike) {
          return;
        }

        var lngLat;

        try {
          lngLat = L__default['default'].latLng(lngLatLike);
        } catch (e) {
          return;
        }

        return lngLat;
      }
      /**
       * @private
       * @param {cytoscape.NodeCollection} nodes
       * @return {L.LatLngBounds}
       */

    }, {
      key: "getNodeLngLatBounds",
      value: function getNodeLngLatBounds() {
        var _this6 = this;

        var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cy.nodes();
        var bounds = nodes.reduce(function (bounds, node) {
          var lngLat = _this6.getNodeLngLat(node);

          if (!lngLat) {
            return bounds;
          }

          return bounds.extend(lngLat);
        }, L__default['default'].latLngBounds([]));
        return bounds;
      }
      /**
       * @private
       * @param {cytoscape.NodeSingular} node
       * @return {cytoscape.Position | undefined}
       */

    }, {
      key: "getGeographicPosition",
      value: function getGeographicPosition(node) {
        var lngLat = this.getNodeLngLat(node) || node.scratch('leaflet') && node.scratch('leaflet').currentGeoposition;

        if (!lngLat) {
          return;
        }

        var position = this.map.latLngToContainerPoint(lngLat);
        return position;
      }
      /**
       * @private
       * @param {cytoscape.Position} position1
       * @param {cytoscape.Position} position2
       * @return {boolean}
       */

    }, {
      key: "arePositionsEqual",
      value: function arePositionsEqual(position1, position2) {
        return position1.x === position2.x && position1.y === position2.y;
      }
    }]);

    return MapHandler;
  }();

  function register(cytoscape) {
    if (!cytoscape) {
      return;
    }

    cytoscape('core', 'L', function (mapConfig, config) {
      return new MapHandler(this, mapConfig, config);
    });
  }

  if (typeof window.cytoscape !== 'undefined') {
    register(window.cytoscape);
  }

  return register;

})));
//# sourceMappingURL=cytoscape-leaflet.js.map
