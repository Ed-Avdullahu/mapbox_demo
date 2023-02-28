/**
 * The aegir core namespace contains all of the functions for loading and displaying
 * your venue map, as well as basic interactions.
 */
var aegir = function () {

};
/**
 * Constants for dispatched events
 * @memberof aegir
 * @since 1.2;  Added DID_SELECT_ANNOTATION_POPUP and DID_OPEN_ANNOTATION_POPUP in 1.2.2
 * @public
 * @type {object}
 * @property {string} WILL_ZOOM event fired before the map changes zoom level
 * @property {string} DID_ZOOM event fired after the map has changed zoom level
 * @property {string} DID_SELECT_UNIT event fired when a map unit is clicked
 * @property {string} DID_SELECT_ANNOTATION event fired when a map annotation is clicked
 * @property {string} DID_CHANGE_CAMERA_POSITION event fired when the map's camera changes
 * @property {string} DID_SELECT_ANNOTATION_POPUP event fired when annotation popups are clicked
 * @property {string} DID_OPEN_ANNOTATION_POPUP event fired when annotation popup is displayed
 */
aegir.EVENTS = {
    WILL_ZOOM: "willZoom",
    DID_ZOOM: "didZoom",
    DID_SELECT_UNIT: "didSelectUnit",
    DID_SELECT_ANNOTATION: "didSelectAnnotation",
    DID_CHANGE_CAMERA_POSITION: "didChangeCameraPosition",
    //@since 1.2.2
    DID_SELECT_ANNOTATION_POPUP: "didSelectAnnotationPopup",
    //@since 1.2.2
    DID_OPEN_ANNOTATION_POPUP: "didOpenAnnotationPopup"

};
/**
 * Constants render modes
 * @memberof aegir
 * @since 1.2
 * @private
 */
aegir.RENDER_MODES = {
    VECTOR: "vector",
    RASTER: "raster"
};

/**
 * Constants processing modes
 * @memberof aegir
 * @since 1.2
 * @private
 */
aegir.PROCESSING_MODES = {
    DEFAULT: "default",
    LEGACY: "legacy"
}
/**
 * @callback onCompleteCallback
 * @param {object} response the responseObject
 * @param {string} error error message if anything
 */
/**
 * @callback itemIteratorFunction
 * @param {number} index the step counter
 * @param {object} object the current object
 * @returns {boolean} return false to stop iterating
 */
/**
 * @callback matchingFunction
 * @param {object} item the item to check if a match exists
 * @returns {boolean} true if the item matches requirements, false otherwise
 */

//is this the best way to define constants?
aegir.CLASS_KEY = "class";
aegir.CATEGORY_KEY = "category";
/* ================INSTANCE PROPERTIES================ */
/**
 * Maintain map layers
 * @memberof aegir
 * @private
 */
aegir.LAYERS = {
    map: null,
    annotations: [],
    customStyleLayers: [],

    vectorLayers: [
        ["outlines", aegir.CLASS_KEY, ["floor"], "polyfill"],
        ["walkways", aegir.CLASS_KEY, ["walkway"], "polyfill"],
        ["elevators", aegir.CLASS_KEY, ["elevator"], "polyfill"],
        ["fixtures", aegir.CLASS_KEY, ["floor-fixture"], "polyfill"],
        ["stairwells", aegir.CLASS_KEY, ["stairwell"], "polyfill"],
        ["non_public_units", aegir.CLASS_KEY, ["non-public-unit"], "polyfill"],
        ["open_to_below_units", aegir.CLASS_KEY, ["open-to-below-unit"], "polyfill"],
        ["other_rooms", aegir.CLASS_KEY, ["other-room"], "polyfill"],
        ["rooms", aegir.CLASS_KEY, ["room"], "polyfill"],
        ["water", aegir.CATEGORY_KEY, ["Water"], "polyfill"],
        ["restrooms", aegir.CLASS_KEY, ["restroommen", "restroomwomen", "restroom"], "polyfill"],
        ["openings", aegir.CLASS_KEY, ["walkway-opening", "elevator-opening", "stairwell-opening", "restroom-opening", "non-public-unit-opening", "other-room-opening", "restroomwomen-opening", "restroommen-opening", "room-opening"], "line"]
    ],
    rasterLayers: [
        ["shadows", aegir.CLASS_KEY, ["floor"]]
    ],
    commonLayers: [
        ["icons", ["icon-elevator", "elevator-icon", "icon-stairwell", "stairwell-icon", "icon-restroommen", "restroommen-icon", "icon-restroomwomen", "restroomwomen-icon", "icon-restroom", "restroom-icon"], "icon"],
        ["labels", ["other-room-label", "room-label", "floor-amenity", "open-to-below-unit-label"], "label"]
    ],
    commonBuildingLayers: [
        ["labels", aegir.CLASS_KEY, ["building-label"], "label"],
    ],
    globalLayers: [
        ["background", aegir.CLASS_KEY, ["background"], "polyfill"],
        ["venue", aegir.CLASS_KEY, ["venue"], "polyfill"]
    ],

};

/**
 * Settings
 * @memberof aegir
 * @private
 */
aegir.CONFIG = {
    venueId: null,
    tilesetURL: null,
    commonTilesetURL: null,
    rasterTilesetURL: null,
    artTilesetURL: null,
    rasterBuildingOutlinesURL: null, //TODO: Review if this property is even used
    mapSpritesURL: null,
    mapGlyphsURL: null,
    useDefaultMapProvider: null,
    initialOutdoorFloors: [],
    initialIndoorFloors: [],
    processingMode: null,
    renderMode: null,
    ignoreMapboxClickEvent: false,
    backgroundAlpha: null,
    geojsonSources: [],
    showZoomControls: null,
    showCompassControls: null,
    controlsPosition: null,
    pendingUnitStyles: {},
    mapLoaded: false,
    cameraConfig: {
        center: null,
        minZoom: null,
        maxZoom: null,
        zoomLevel: null,
        bearing: null,
        pitch: null,
        enableScrollZoom: null,
        enableDragRotate: null,
        enableDoubleClickZoom: null,
        enableKeyboardShortcuts: null,
        enableBoxZoom: null,
        enableHash: null
    }

}
/**
 * Default settings
 * @memberof aegir
 * @private
 */
aegir.DEFAULTS = {
    currentCoords: null,
    currentIndoorFloors: [],
    currentOutdoorFloors: [],
    currentBuildings: [],
    activeIndoorFloors: [],
    activeOutdoorFloors: [],
    activeBuildings: [],
    units: [],
    destNodeObjs: [],
    buildingObjs: [],
    outdoorBuildingObjs: [],
    floorObjs: [],
    loadedXML: null,
    style_JSON: null,
    unitData_JSON: null,
    startHlt: null,
    destHlt: null,
    startHltLayer: null,
    destHltLayer: null,
    styleObjs: [],
    wpStyleObjs: [],
    startFloor: null,
    destFloor: null,
    markerType: null,
    markerFunc: null,
    popups: [],
    mapBounds: [],
    processingMode: aegir.PROCESSING_MODES.DEFAULT,
    renderMode: aegir.RENDER_MODES.VECTOR,
    tilesetURLSuffix: "/vector-tiles/{FLOOR}/{z}_{x}_{y}.mvt",
    commonTilesetURLSuffix: "/vector-common/{FLOOR}/{z}_{x}_{y}.mvt",
    buildingOutlinesURLSuffix: "/vector-tiles/{BUILDING}/{z}_{x}_{y}.mvt",
    rasterTilesetURLSuffix: "/raster-tiles/style_default/{FLOOR}/{z}_{x}_{y}_512@2x.png",
    rasterBuildingOutlinesURLSuffix: "/vector-tiles/style_default/{BUILDING}/{z}_{x}_{y}_512.png", //TODO: Review if this property is even used
    artTilesetURLSuffix: "/art-tiles/style_default/{FLOOR}/{z}_{x}_{y}_512@2x.png",
    mapSpritesURLSuffix: "/icons/icons",
    mapGlyphsURL: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    useDefaultMapProvider: true,
    streetMapURL: "mapbox://mapbox.mapbox-streets-v7",
    venueId: null,
    showZoomControls: false,
    showCompassControls: false,
    controlsPosition: "top-right",
    cameraConfig: {
        center: null,
        minZoom: 1.0,
        maxZoom: 21.0,
        zoomLevel: 17.0,
        bearing: 0.0,
        pitch: 0.0,
        enableScrollZoom: true,
        enableDragRotate: true,
        enableDoubleClickZoom: true,
        enableKeyboardShortcuts: true,
        enableBoxZoom: true,
        enableHash: true
    }
};

/* ================PUBLIC API================ */

/**
 * Log something
 * @memberof aegir
 * @public
 * @param {String} msg the message to log
 */
aegir.log = function (msg) {
    if (aegir.debug != undefined && aegir.debug.getSettings().loggingEnabled === true) {
        console.log(msg);
    }
};
/**
 * Log errors to the console
 * @memberof aegir
 * @public
 * @param {String} error the message to log
 */
aegir.error = function (error) {
    console.error(error);
};

/**
 * Log warnings to the console
 * @memberof aegir
 * @public
 * @param {String} warning the message to log
 */
aegir.warn = function (warning) {
    console.warn(warning);
};
/**
 * Get default configuration settings
 * @memberof aegir
 * @public
 * @returns {object} default settings
 */
aegir.getDefaults = function () {
    return (aegir.DEFAULTS);
};

/**
 * Get map layers
 * @memberof aegir
 * @public
 * @returns map layers
 */
aegir.getLayers = function () {
    return (aegir.LAYERS);
};

/**
 * Get current configuration
 * @memberof aegir
 * @since 1.2
 * @public
 * @returns {object} active configuration settings
 */
aegir.getConfig = function () {
    return (aegir.CONFIG);
};
/**
 * Get debug settings
 * @memberof aegir
 * @since 1.2
 * @public
 * @returns {vmDebugConfig} debug settings
 */
aegir.getDebug = function () {
    if (aegir.debug != undefined) {
        return (aegir.debug.getSettings());
    }
    return {};
};

/**
 * Get mapbox map instance
 * @memberof aegir
 * @since 1.2
 * @public
 * @returns {object} mapbox map
 */
aegir.getMap = function () {
    return aegir.getLayers().map;
}
/**
 * Collection of properties to specify map data files to load
 * @typedef {object} vmdFileCollection
 * @property {string} [sitemapURL] Path to the sitemap (for legacy venue map data ONLY)
 * @property {string} [xml] Path to VMD's xml file
 * @property {string} [geojson] Path to VMD's geojson file
 * @property {string} [zipURL] Path to zip file containing venue map data
 */

/**
 * @typedef {object} mapDataLoadConfig
 * @property {string} style Path to the map's style JSON file. <insert info about style properties >
 * @property {string} venueId the venue's id
 */

/**
 * @typedef {object} mapViewLoadConfig
 * @property {!string} venueBaseURL Base url for all venue map data files for a specific venue.
 * @property {boolean} useDefaultMapProvider true to use the embedded Mapbox map provider or false to use a custom map (or none) map provider, e.g. Google maps
 * @property {string} [accessToken] Mapbox access token. Required when useDefaultMapProvider is true.
 * @property {string} [streetMapJSON] Mapbox style for world/street map tiles. Required when useDefaultMapProvider is true.
 * @property {string} [streetMapURL] Mapbox vector tiles source url for world/street map tiles. Required when useDefaultMapProvider is true.
 * @property {string} [mapGlyphsURL] url pointing to font glyph files (in proto-buff format)
 * @property {string} [mapSpritesURL] url pointint to the spritemap files for icons and textures that are referenced in your map view.
 * @property {string} [tilesetURL] Specify a custom location for your venue's vector tiles
 * @property {string} [commonTilesetURL] Specify a custom location for your venue's icon/label vector tiles
 * @property {string} [buildingOutlines] Specify a custom location for your venue's building outlines vector tiles
 * @property {string} [rasterTilesetURL] Specify a custom location for your venue's raster map tiles.
 * @property {string} [rasterBuildingOutlinesURL] Specify a custom location for your venue's building outlines raster tiles
 * @property {string} [artTilesetURL] Specify a custom location for your venue's artistic map tiles.
 * @property {boolean} [showZoomControls] adds map controls for zooming in and out. Defaults to false.
 * @property {boolean} [showCompassControls] add map controls that show the compass. Defaults to false.
 * @property {boolean} [controlsPosition] specificy the position to add map controls. Valid values are  "top-left", "top-right" , "bottom-left" , "bottom-right". Defaults to "top-right".
 */

/**
 * Represents a latitude/longitude pair
 * @typedef {object} location
 * @property {Number} lat
 * @property {Number} lng
 */

/**
 * Represents a bounding rectangle in for a region on the map
 * @typedef {object} vmCoordinateBounds
 * @property {location} sw the southwest point of the rectangle
 * @property {location} ne the northeast point of the rectangle
 */
/**
 * Camera configuration parameters
 * @typedef {object} mapViewCameraConfig
 * @property {location} center the position of  the camera
 * @property {Number} [minZoom] the minimum zoom level of the camera. Defaults to 1.0s
 * @property {Number} [maxZoom] the maximum zoom level of the camera. Defaults to 21.0
 * @property {Number} [zoomLevel] the current zoom level of the camera. Defaults to 17.0
 * @property {Number} [bearing] the bearing of the camera. Defaults to 0.0
 * @property {Number} [pitch] the camera pitch. Defaults to 0.0
 * @property {boolean} [enableScrollZoom] enable zooming the map in/out via the mouse scroll wheel. Defaults to true.
 * @property {boolean} [enableDragRotate] enable rotating the map by dragging with the mouse. Defaults to true.
 * @property {boolean} [enableDoubleClickZoom] enable zooming IN the map by double-clicking. Defaults to true.
 * @property {boolean} [enableKeyboardShortcuts] enable manipulating the camera via keyboard controls. Defaults to true.
 * @property {boolean} [enableBoxZoom] enable zooming the map in/out via dragging a box around the zoom area. Defaults to true.
 * @property {boolean} [enableHash] enable syncing the camera position with a URL hash. Defaults to true.
 */

/**
 * @typedef {object} vmMapBuilding
 * @property {string} id the ID of the building
 * @property {string} name the name of the building
 * @property {string} floors list of floors associated with this building
 * @property {vmCoordinateBounds} bounds the sw/ne bounds of the floor
 * @property {location[]} coordinates a list of coordinates that make up the perimeter of the floor
 * @property {location} center the center point of the building based on its bounds
 */

/**
 * @typedef {object} vmMapBuildingFloor
 * @property {string} id the ID of the floor
 * @property {string} name the naem of the floor
 * @property {string} buildingId the id of the building this floor belongs
 * @property {string} legacyId the legacy id of the floor
 * @property {number} ordinal the floor ordinal
 * @property {vmMapUnit[]} units list of units on this floor
 * @property {vmCoordinateBounds} bounds the sw/ne bounds of the floor
 * @property {location[]} coordinates a list of coordinates that make up the perimeter of the floor
 */

/**
 * @typedef {object} vmMapUnit
 * @property {string} id the id of the unit
 * @property {string} name the label associated with the unit
 * @property {string} floorId the id of the floor this unit is associated with
 * @property {location[]} coordinates a list of coordinates that make up this unit
 * @property {location} centerLocation the calculated center of the unit. This will not be accurate for oddly shaped units.
 * @property {location} [labelLocation] the location of the label for units that have labels
 * @property {location} [iconLocation] the location of the icon for units that have icons
 * @property {location} [hotspotLocation] the location of the hotspot for units that have them
 * @property {string} [icon] the name of the icon for units that have them
 */

/**
 * @typedef {object} ajaxConfig
 * @property {string} [method=GET] the http method for the ajax call
 * @property {string} [payload] the body for PUT/POST calls
 * @property {string} [mimeType]  the mime type for the ajax call
 */

/**
 * @typedef vmPointAnnotation
 * @property {string} id the id of the annotation
 * @property {string} floorId the id of the floor that the annotation is visible on
 * @property {object} [htmlElement] the html element to present for this map annotation
 * @property {location} location the location of the map annotation
 * @property {vmAnnotationPopup} [popup] a popup to display when this annotation is selected
 */

/**
 * @typedef vmAnnotationPopup
 * @property {vmPopupConfig} [options] the config options for this popup
 * @property {object} htmlElement the htmlElement to present for this popup
 */

/**
 * @typedef vmPopupConfig
 * @property {boolean} [closeButton] show or hide an X close button for the popup. Defaults to true.
 * @property {boolean} [closeOnClick] close the popup when user clicks anywere outside of the popup. Defaults to true.
 * @property {string} [anchor]  where to anchor the popup to, relative to its parent annotation. Possible options are 'center' , 'top' , 'bottom' , 'left' , 'right' , 'top-left' , 'top-right' , 'bottom-left' , and  'bottom-right'
 * @property {number} [offset] Additional amount in pixels to offset the popup
 * @property {number} [maxWidth] The maximum width for the popup container
 */

/**
 * This class represents all of the stylistic properties that can be configured for display of a map's style
 * @typedef {object} vmVenueLayerStyle
 * @since 1.2.1
 * @property {string} [fillColor] The fill color for this layer, which will only applies to polygon layers. This property ignored if fillPattern is not null.
 * @property {string} [fillPattern] The name of the fill pattern to use for this layer, which only applies to polygon layers. The fill pattern must exist by the same name as one of the sprites in the map sprite sheet.
 * @property {string} [outlineColor] The outline color for this layer, which only applies to polygon layers.
 * @property {string} [fontName] The name of the font to use for this layer, which only applies to text layers. The font must exist by the same name in your mapview's font glyph url
 * @property {string} [fontSize] The size of the font
 * @property {string} [fontColor] The color of the font
 * @property {string} [fontStrokeColor] The stroke color of the font
 * @property {string} [fontStrokeWidth] The stroke width of the font
 * @property {string} [maxTextWidth] The max width a label can be before it wraps to another line
 * @property {string} [iconName] The name of an image to use for the icon, which only applies to icon layer. This icon must exist by the same name in your mapview’s icon url. This icon name can come directly from your map tile or geojson properties.
 */


/**
 * Load venue map data
 * @memberof aegir
 * @since 1.2
 * @async
 * @param {vmdFileCollection} fileCollection properties for file Loading
 * @param {mapDataLoadConfig} params settings
 * @param {onCompleteCallback} onComplete callback when loading is complete
 */
aegir.loadVenueMapData = function (fileCollection, params, onComplete) {
    console.time("loadVenueMapData");
    var config = aegir.getConfig();
    var success = aegir._configure(params, "venueId", window.venueId, config);
    if (!success) {
        var error = "Missing required property: '" + "venueId'";
        aegir.error(error);
        onComplete(null, error);
        return false;
    }
    if (fileCollection.hasOwnProperty("zipURL")) {
        aegir._loadZip(fileCollection, params, onComplete);
    } else if (fileCollection.hasOwnProperty("sitemapURL") && fileCollection.sitemapURL != null) {
        if (aegir.legacy != undefined) {
            //do legacy/enhanced processing
            aegir._configure(config, "processingMode", aegir.PROCESSING_MODES.LEGACY);
            aegir._configure(config, "renderMode", aegir.RENDER_MODES.RASTER);
            aegir.legacy._loadData(fileCollection.sitemapURL, onComplete);
        } else {
            onComplete(null, "Trying to load a legacy venue, but maps-legacy-sdk is not loaded.");
        }

    } else {
        aegir._configure(config, "processingMode", aegir.PROCESSING_MODES.DEFAULT);
        aegir._configure(config, "renderMode", aegir.RENDER_MODES.VECTOR);
        aegir._loadData(fileCollection.xml, fileCollection.geojson, params, onComplete);
    }
};

/**
 * Load venue map data
 * @memberof aegir
 * @public
 * @async
 * @deprecated since version 1.2. Use aegir.loadVenueMapData() instead.
 * @param {string} xml Path to the VMD's xml file
 * @param {string} geoJSON Path to the VMD's geojson file
 * @param {mapDataLoadConfig} params settings
 * @param {onCompleteCallback} callback callback when loading is Complete
 */
aegir.loadData = function (xml, geoJSON, params, callback) {
    aegir.warn("[DEPRECATED] aegir.loadData() is deprecated in 1.2. Use aegir.loadVenueMapData() instead.");
    var collection = {xml: xml, geojson: geoJSON};
    aegir.loadVenueMapData(collection, params, callback);
};

/**
 * Load venue map data
 * @memberof aegir
 * @public
 * @async
 * @deprecated since version 1.2
 * @param {string} xml Path to the VMD's xml file
 * @param {string} geoJsonUrl Path to the VMD's geojson file
 * @param {mapDataLoadConfig} params settings
 * @param {onCompleteCallback} callback callback when loading is Complete
 */
aegir.retrieveUnitData = function (xml, geoJsonUrl, loadOptions, callback) {
    aegir.warn("[DEPRECATED] aegir.retrieveUnitData() is deprecated in 1.2. Use aegir.loadVenueMapData() instead.");
    var collection = {xml: xml, geojson: geoJsonUrl};
    aegir.loadVenueMapData(collection, loadOptions, callback);
};
/**
 * Load json file
 * @memberof aegir
 * @public
 * @async
 * @deprecated since version 1.2. There is no replacement.
 * @param {string} jsonUrl Path to the json file
 * @param {onCompleteCallback} callback callback for completion
 */
aegir.loadJSON = function (jsonUrl, callback) {
    aegir.warn("[DEPRECATED] aegir.loadJSON() is deprecated in 1.2. There is no replacement");
    aegir._loadJSON(jsonUrl, callback);
};

/**
 * Load XML data file
 * @memberof aegir
 * @public
 * @async
 * @deprecated since version 1.2. There is no replacement.
 * @param {string} xmlUrl Path to the XML file
 * @param {mapDataLoadConfig} loadOptions settings
 * @param {onCompleteCallback} onComplete callback for completion
 */
aegir.loadXML = function (xmlUrl, loadOptions, onComplete) {
    aegir.warn("[DEPRECATED] aegir.loadXML() is deprecated in 1.2. There is no replacement.");
    aegir._loadXML(xmlUrl, loadOptions, onComplete);
};

/**
 * Loads the map view, initialized at the given lat/lng
 * @memberof aegir
 * @public
 * @param {mapViewLoadConfig} loadOptions mapview configuration
 * @param {mapViewCameraConfig} cameraConfig mapview camera initial configuration
 * @param {onCompleteCallback} callback callback when loading is complete
 */
aegir.loadMapView = function (loadOptions, cameraConfig, callback) {
    if (!mapboxgl.supported()) {
        callback(null, "Your browser does not support Mapbox GL");
        return false;
    }
    ;
    var config = aegir.getConfig();
    var defaults = aegir.getDefaults();
    var layers = aegir.getLayers();
    var hasAccessToken = loadOptions.hasOwnProperty("accessToken");
    var hasVenueBaseURL = loadOptions.hasOwnProperty("venueBaseURL");
    var urlProperties = ["rasterTilesetURL"];
    if (config.processingMode == aegir.PROCESSING_MODES.DEFAULT) {
        urlProperties.push("artTilesetURL");
        urlProperties.push("tilesetURL");
        urlProperties.push("commonTilesetURL");
        urlProperties.push("buildingOutlinesURL");
        urlProperties.push("mapSpritesURL");
    }

    var venueBaseURL = loadOptions["venueBaseURL"] || null;
    aegir.each(urlProperties, function (i, propertyName) {
        var ok = aegir._configure(loadOptions, propertyName, venueBaseURL + aegir.DEFAULTS[propertyName + "Suffix"]);
        if (!ok) {
            var error = "Missing required property: '" + propertyName + "', or 'venueBaseURL'";
            aegir.error(error)
            callback(null, error);
            return false;
        }
    });
    aegir._configure(loadOptions, "mapGlyphsURL", defaults.mapGlyphsURL);
    aegir._configure(loadOptions, "defaultMap", defaults.useDefaultMapProvider);
    aegir._configure(config, "useDefaultMapProvider", config.defaultMap); //Map deprecated config.defaultMap to useDefaultMapProvider
    aegir._configure(loadOptions, "initialIndoorFloors", aegir._getBestInitialIndoorFloors());
    aegir._configure(loadOptions, "initialOutdoorFloors", aegir._getBestInitialOutdoorFloors());
    aegir._configure(loadOptions, "showZoomControls", defaults.showZoomControls, config);
    aegir._configure(loadOptions, "showCompassControls", defaults.showCompassControls, config);
    aegir._configure(loadOptions, "controlsPosition", defaults.controlsPosition, config);
    aegir._configure(cameraConfig, "center", defaults.cameraConfig.center, config.cameraConfig); //TODO: Default can be calculated based on venue bounds
    aegir._configure(cameraConfig, "minZoom", defaults.cameraConfig.minZoom, config.cameraConfig);
    aegir._configure(cameraConfig, "maxZoom", defaults.cameraConfig.maxZoom, config.cameraConfig);
    aegir._configure(cameraConfig, "zoomLevel", defaults.cameraConfig.zoomLevel, config.cameraConfig); //TODO: Default can be calculated based on venue bounds
    aegir._configure(cameraConfig, "pitch", defaults.cameraConfig.pitch, config.cameraConfig);
    aegir._configure(cameraConfig, "bearing", defaults.cameraConfig.bearing, config.cameraConfig);
    aegir._configure(cameraConfig, "enableDragRotate", defaults.cameraConfig.enableDragRotate, config.cameraConfig);
    aegir._configure(cameraConfig, "enableScrollZoom", defaults.cameraConfig.enableScrollZoom, config.cameraConfig);
    aegir._configure(cameraConfig, "enableDoubleClickZoom", defaults.cameraConfig.enableDoubleClickZoom, config.cameraConfig);
    aegir._configure(cameraConfig, "enableKeyboardShortcuts", defaults.cameraConfig.enableKeyboardShortcuts, config.cameraConfig);
    aegir._configure(cameraConfig, "enableBoxZoom", defaults.cameraConfig.enableBoxZoom, config.cameraConfig);
    aegir._configure(cameraConfig, "enableHash", defaults.cameraConfig.enableHash, config.cameraConfig);


    if (config.useDefaultMapProvider === true) {
        aegir.log("Initializing mapbox map using default map provider");
        var ok = aegir._configure(loadOptions, "accessToken", null, mapboxgl);
        if (!ok) {
            var error = "Missing required property: 'accessToken'.";
            aegir.error(error)
            callback(null, error);

            return false;
        }
        ok = aegir._configure(loadOptions, "streetMapURL", aegir.DEFAULTS.streetMapURL);
        if (!ok) {
            var error = "Missing required property: '" + "streetMapURL" + "' when useDefaultMapProvider is set to true.";
            aegir.error(error);
            callback(null, error);
            return false;
        }
        ok = aegir._configure(loadOptions, "streetMapJSON", null);
        if (!ok) {
            var error = "Missing required property: '" + "streetMapJSON" + "' when useDefaultMapProvider is set to true.";
            callback(null, error);
            return false;
        }
        aegir._loadJSON(config.streetMapJSON, function (response, error) {

            if (response !== null) {
                layers.map = aegir._createMapboxMap(response);
                aegir._initialLoad(function (response, error) {
                    callback(response, error);
                });
            } else {
                var error = "There was an error (" + error + ") loading " + loadOptions.streetMapJSON;
                aegir.error(error);
                callback(null, error);
            }
        });
    } else {
        aegir.log("Initializing mapbox map using other (or no) map provider");
        layers.map = aegir._createMapboxMap();
        aegir._initialLoad(function (response, error) {
            callback(response, error);
        });
    }
};
/**
 * Loads the map view, initialized at the given lat/lng
 * @memberof aegir
 * @public
 * @deprecated
 * @param {mapViewLoadConfig} loadOptions mapview configuration
 * @param {Number} lat The latitude to initialize the mapview with
 * @param {Number} lng The longintude to initialize the mapview with
 * @param {onCompleteCallback} onComplete callback when loading is complete
 */
aegir.loadMap = function (loadOptions, lat, lng, onComplete) {
    aegir.warn("[DEPRECATED] aegir.loadMap() is deprecated in 1.2. Use aegir.loadMapView() instead.");
    var cameraConfig = {center: {lat: lat, lng: lng}};
    aegir.loadMapView(loadOptions, cameraConfig, onComplete);
};

/**
 * Load Building Outline Layers
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 * @param {onCompleteCallback} callback callback when loading is complete
 */
aegir.loadBldOutline = function (callback) {
    aegir.warn("[DEPRECATED] aegir.loadBldOutline() is deprecated in 1.2. There is no replacement.");
    aegir._loadBuildingOutlines();
};

/**
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 * @param {string} layerId the name of the new layer to add
 * @param {string} outlineLayerId the name of the corresponding outline layer
 * @param {string} layerVisibility the visibility of the layer
 * @param {string} filterParam the filters for the layer
 * @param {string} fillColor the fill color for the layer
 */
aegir.loadAddBuildingOutlines = function (layerId, outlineLayerId, layerVisibility, filterParam, fillColor) {
    aegir.warn("[DEPRECATED] aegir.loadAddBuildingOutlines() is deprecated in 1.2. There is no replacement.");
    aegir._addBuildingOutlines("building_outlines_1", layerId, outlineLayerId, layerVisibility, filterParam, fillColor);
}
/**
 * Load Building Outline Layers
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 */
aegir.loadRasterBldOutline = function () {
    aegir.warn("[DEPRECATED] aegir.loadRasterBldOutline() is deprecated in 1.2. There is no replacement.");
    aegir._loadRasterBuildingOutlines();
};

/**
 * Load global map Layers
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 * @param {onCompleteCallback} callback callback when loading is completed
 */
aegir.loadGlobalLayers = function (callback) {
    aegir.warn("[DEPRECATED] aegir.loadGlobalLayers() is deprecated in 1.2. There is no replacement.");
    aegir._loadGlobalLayers();
    callback("success", null);
};

/**
 * Load map layers for a particular floor
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 * @param {string} floorId the id of the floor to show
 */
aegir.loadLayers = function (floorId) {
    aegir.warn("[DEPRECATED] aegir.loadLayers() is deprecated in 1.2. There is no replacement.");
    aegir._showFloor(floorId);
};

/**
 * Get the lat/lng location for the center of a geojson FEATURE
 * @memberof aegir
 * @public
 * @param {string} featureId the id of the geojson FEATURE
 * @returns {location}
 */
aegir.getCoordinateCenterById = function (featureId) {
    var feature = aegir.coordFinderById(featureId);
    // could be multiple arrays
    // Polygon or MultiPolygon


    //TODO: Refator to use getPermiterCoordinates and centerOfCoordinates
    var coordinates = feature.coordinates[0];

    var minLat, maxLat, minLon, maxLon;
    for (var i = 0; i < coordinates.length; i++) {
        var x = coordinates[i][0], y = coordinates[i][1];
        minLat = (x < minLat || minLat == null) ? x : minLat;
        maxLat = (x > maxLat || maxLat == null) ? x : maxLat;
        minLon = (y < minLon || minLon == null) ? y : minLon;
        maxLon = (y > maxLon || maxLon == null) ? y : maxLon;
    }
    return {lat: (minLat + maxLat) / 2, lng: (minLon + maxLon) / 2};
};


/**
 * Loads map layers for common vector/reaster building features
 * @memberof aegir
 * @public
 * @deprecated since 1.2. There is no replacement.
 * @param {vmMapBuilding} buildingObj the object wth the building properties
 */
aegir.loadCommonBuildingLayers = function (buildingObj) {
    aegir.warn("[DEPRECATED] aegir.loadCommonBuildingLayers() is deprecated in 1.2. There is no replacement.");
    aegir._loadCommonBuildingLayers(buildingObj);
}

/**
 * Force refresh label& icon layers
 * @memberof aegir
 * @public
 * @deprecated since 1.2. There is no replacement.
 */
aegir.refreshBuildingLabelLayers = function () {
    aegir.warn("[DEPRECATED] aegir.refreshBuildingLabelLayers() is deprecated in 1.2. There is no replacement.");
    aegir._refreshBuildingLabelLayers();
}


/**
 * Load label/icon map layers for a particular floor
 * @memberof aegir
 * @public
 * @deprecated since 1.2. There is no replacement.
 * @param {string} floorId the id of the floor
 */
aegir.loadCommonLayers = function (floorId) {
    aegir.warn("[DEPRECATED] aegir.loadCommonLayers() is deprecated in 1.2. There is no replacement.");
    aegir._loadCommonLayers(floorId);
}
/**
 * Load shape map layers for a particular floor
 * @memberof aegir
 * @public
 * @deprecated since 1.2. There is no replacement.
 * @param {string} floorId the id of the floor
 */
aegir.loadVectorLayers = function (floorId) {
    aegir.warn("[DEPRECATED] aegir.loadVectorLayers() is deprecated in 1.2. There is no replacement.");
    aegir._loadVectorLayers(floorId);
}
/**
 * Load map raster layers
 * @memberof aegir
 * @private
 * @deprecated since version 1.2. There is no replacement.
 * @param {string} floorId the id of the floor
 */
aegir.loadRasterLayers = function (floorId) {
    aegir.warn("[DEPRECATED] aegir.loadRasterLayers() is deprecated in 1.2. There is no replacement.");
    aegir._loadRasterLayers(floorId);
}

/**
 * Load outdoor raster layers
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 * @param {string} floorId the id of the outdoor floor
 */
aegir.loadRasterVenueOutdoors = function (floorId) {
    aegir.warn("[DEPRECATED] aegir.loadRasterVenueOutdoors() is deprecated in 1.2. There is no replacement.");
    aegir._loadRasterVenueOutdoors(floorId);
};

/**
 * Hide map layers associated with specific map floors
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 * @param {string[]} selectedFloors list of ids for floors to hide
 */
aegir.hideLayers = function (selectedFloors) {
    aegir.warn("[DEPRECATED] aegir.hideLayers() is deprecated in 1.2. There is no replacement.");
    aegir._hideFloors(selectedFloors, []);
}

/**
 * Initial mapbox setup
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 * @param {onCompleteCallback} callback the callback when everything is complete
 */
aegir.initialLoad = function (callback) {
    aegir.warn("[DEPRECATED] aegir.initialLoad() is deprecated in 1.2. There is no replacement.");
    aegir._initialLoad(callback);
}

/**
 * Search for indoor floors in any building
 * @memberof aegir
 * @public
 * @since 1.2
 * @param {string} floorId the unique id for the floor you are searching for
 * @returns {vmMapBuildingFloor} the matched floor, or null if not found
 */
aegir.findFloorWithId = function (floorId) {
    var floor = null;
    aegir.each(aegir.getBuildings(), function (i, building) {
        var found = false;
        aegir.each(building.floors, function (j, f) {
            if (f.id == floorId) {
                floor = f;
                found = true;
                return false;
            }
        });
        return !found;
    });
    return floor;
}
/**
 * Search for outdoor floors in any building
 * @memberof aegir
 * @public
 * @since 1.2
 * @param {string} floorId the unique id for the floor you are searching for
 * @returns {vmMapBuildingFloor} the matched floor, or null if not found
 */
aegir.findOutdoorFloorWithId = function (floorId) {
    var floor = null;
    aegir.each(aegir.getOutdoorBuildings(), function (i, building) {
        var found = false;
        aegir.each(building.floors, function (j, f) {
            if (f.id == floorId) {
                floor = f;
                found = true;
                return false;
            }
        });
        return !found;
    });
    return floor;
}
/**
 * Add annotation to map
 * @memberof aegir
 * @public
 * @since 1.2
 * @param {vmPointAnnotation} annotation the annotation options
 */
aegir.addAnnotation = function (annotation) {

    var popup = annotation.popup || null;
    var mapboxPopup = null;
    if (popup) {
        var options = popup.options || {};
        mapboxPopup = new mapboxgl.Popup(options);
        var popupHTML = popup.htmlElement || null;
        if (popupHTML) {
            popupHTML.addEventListener("click", function (e) {
                var config = aegir.getConfig();
                config.ignoreMapboxClickEvent = true;
                var evt = new CustomEvent(aegir.EVENTS.DID_SELECT_ANNOTATION_POPUP, {detail: annotation});

                document.dispatchEvent(evt);
                setTimeout(function () {
                    config.ignoreMapboxClickEvent = false;
                }, 100);
                return false;
            });
            mapboxPopup.setDOMContent(popupHTML);

            mapboxPopup.on("open", function () {
                var config = aegir.getConfig();
                config.ignoreMapboxClickEvent = true;
                var evt = new CustomEvent(aegir.EVENTS.DID_OPEN_ANNOTATION_POPUP, {detail: annotation});

                document.dispatchEvent(evt);
                setTimeout(function () {
                    config.ignoreMapboxClickEvent = false;
                }, 100);
                return false;
            });
        }
        else
        {
            aegir.warn("Missing required 'htmlElement' for annotation popup.");
        }
    }

    var htmlElement = annotation.htmlElement || null;
    if (htmlElement != null) {
        htmlElement.addEventListener("click", function (e) {
            var config = aegir.getConfig();
            config.ignoreMapboxClickEvent = true;
            var evt = new CustomEvent(aegir.EVENTS.DID_SELECT_ANNOTATION, {detail: annotation});

            document.dispatchEvent(evt);
            setTimeout(function () {
                config.ignoreMapboxClickEvent = false;
            }, 100);
            return false;
        });
    }

    //check if floor is visible currently
    var marker = new mapboxgl.Marker(htmlElement)
        .setLngLat([annotation.location.lng, annotation.location.lat]);
    if (mapboxPopup) {
        marker.setPopup(mapboxPopup);
    }
    marker.id = annotation.id;
    var layers = aegir.getLayers();

    aegir.each(aegir.getCurrentFloors().concat(aegir.getCurrentOutdoorFloors()), function (i, fid) {
        //only add to map right now if annotation is on a visible floor
        if (fid == annotation.floorId) {
            marker.addTo(layers.map);
            return false;
        }
    });

    if (layers.annotations[annotation.floorId] == null) {
        layers.annotations[annotation.floorId] = [];
    }
    layers.annotations[annotation.floorId].push(marker);
}
/**
 * Remove an annotation from the map
 * @memberof aegir
 * @public
 * @since 1.2
 * @param {vmPointAnnotation} annotation the annotation options
 */
aegir.removeAnnotation = function (annotation) {
    var layers = aegir.getLayers();
    var annotations = layers.annotations[annotation.floorId];
    if (annotations) {
        var ndx = -1;
        aegir.each(annotations, function (i, a) {
            if (a.id == annotation.id) {
                ndx = i;
                a.remove();
                return false;
            }
        });
        //remove from list so it's not re-added when floors change to {annotation.floorId}
        annotations.splice(ndx, 1);
    }
}
/**
 * Handle map selection for wayfinding
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. There is no replacement.
 * @param {object} e the selection event
 */
aegir.selectionHandler = function (e) {
    aegir.warn("[DEPRECATED] aegir.selectionHandler() is deprecated in 1.2. There is no replacement.");
    var location = {lng: e.lngLat.lng, lat: e.lngLat.lat};
    aegir._didTapAtCoordinate(location);
    if (aegir.wf) {
        aegir.wf._didTapAtCoordinateOnFloor(location, e.features[0].layer["source-layer"]);
    }
};

/**
 * Center the map on a set of coordinates
 * @memberof aegir
 * @public
 * @param {number} lng the longitude
 * @param {number} lat the latitude
 * @param {object} params the function to call when map has finished centering
 */
aegir.centerMap = function (lng, lat, params) {
    var layers = aegir.getLayers();
    layers.map.flyTo({
        center: [lng, lat],
        speed: 1,
        easing: function (t) {
            return t;
        }
    });

    layers.map.once("moveend", function () {
        if (params) {
            if (typeof params.callback == "function") {
                params.callback.call(this);
            }
        }
    });
};

/**
 * Initializes map styles
 * @memberof aegir
 * @public
 */
aegir.createStyleObjs = function () {
    aegir.log("[START] Creating style objects")
    //TODO: Need to add default styles!!
    var defaults = aegir.getDefaults();
    if (defaults.style_JSON) {
        var objNames = [];

        if (aegir.wf) {
            aegir.wf._loadStyles();
        }
        aegir.each(defaults.style_JSON.styles, function (styleIndex, style) {
            objNames.push(style["layer-id"]);
        });

        aegir.each(defaults.style_JSON.styles, function (styleIndex, style) {
            var styleName = style["layer-id"];
            if (style["layer-id"].indexOf("[FLOOR]") >= 0) {
                aegir.each(aegir.getBuildings().concat(aegir.getOutdoorBuildings()), function (i, building) {
                    aegir.each(building.floors, function (floorIndex, floorObj) {

                        if (aegir.inArray(styleName, objNames) !== -1) {
                            var styleItem = [];

                            for (var k in style) styleItem[k] = style[k];

                            styleItem["layer-id"] = style["layer-id"].replace("[FLOOR]", floorObj.id);

                            if (aegir.inArray(styleItem["layer-id"], objNames) !== -1) {
                            } else {
                                defaults.styleObjs.push(styleItem);
                            }

                        } else {
                            var styleItem = [];
                            for (var k in style) styleItem[k] = style[k];

                            defaults.styleObjs.push(styleItem);
                        }
                    });
                });

            } else if (style["layer-id"].indexOf("[BUILDING]") >= 0) {

                aegir.each(aegir.getBuildings().concat(aegir.getOutdoorBuildings()), function (buildingIndex, buildingObj) {

                    if (aegir.inArray(styleName, objNames) !== -1) {

                        var styleItem = [];

                        for (var k in style) styleItem[k] = style[k];

                        styleItem["layer-id"] = style["layer-id"].replace("[BUILDING]", buildingObj.id);

                        if (style["text-value"] && style["text-value"].indexOf("{name}") >= 0) {
                            styleItem["text-value"] = style["text-value"].replace("{name}", buildingObj.name);
                        }

                        if (aegir.inArray(styleItem["layer-id"], objNames) !== -1) {
                        } else {
                            defaults.styleObjs.push(styleItem);
                        }

                    } else {
                        var styleItem = [];
                        for (var k in style) styleItem[k] = style[k];

                        defaults.styleObjs.push(styleItem);
                    }
                });
            } else {
                var styleItem = [];
                for (var k in style) styleItem[k] = style[k];

                defaults.styleObjs.push(styleItem);
            }

        });
    }

    aegir.log("[END] Creating style objects");
};

/**
 * Handles automatically hiding and showing floors.
 * @memberof aegir
 * @public
 * @since 1.2
 * @param {string[]} floors the list of ids for floors to change
 */
aegir.changeFloors = function (floors) {
    aegir.changeFloors(floors, aegir.getDefaults().currentOutdoorFloors);
};

/**
 * Handles automatically hiding and showing floors.
 * @memberof aegir
 * @public
 * @since 1.3
 * @param {string[]} indoorFloors the list of ids for floors indoor floors to change
 * @param {string[]} outdoorFloors the list of ids for floors outdoor floors to change
 */
aegir.changeFloors = function(indoorFloors, outdoorFloors)
{
    aegir.log("[START] Changing floors");
    var layers = aegir.getLayers();
    var defaultOutdoorFloors = outdoorFloors || aegir.getDefaults().currentOutdoorFloors;
    //TODO: Move to WF
    if (aegir.wf != undefined) {
        aegir.wf._changeFloors(indoorFloors, defaultOutdoorFloors);
    }
    //NOTE: these input params are floors to KEEP visible
    aegir._hideFloors(indoorFloors, defaultOutdoorFloors);

    var allFloors = indoorFloors.concat(defaultOutdoorFloors);
    aegir.each(allFloors, function (index, floorId) {
        aegir._showFloor(floorId);
    });

    aegir._refreshBuildingLabelLayers();
    aegir.log("[END] Changing floors");
}
/**
 * Handles automatically hiding and showing floors when added to an event. The floorIds are an array of the ids of the floors the event is tied to.
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. Use aegir.changeFloors() instead.
 * @param {string[]} floors the list of ids for floors to change
 */
aegir.floorListener = function (floors) {
    aegir.warn("[DEPRECATED] aegir.floorListener() is deprecated in 1.2. Use aegir.changeFloors() instead.");
    aegir.changeFloors(floors);
};
/**
 * List of floors for the venue
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. You should get floors from each building object instead.
 * @returns {vmMapBuildingFloor[]} the list of floors in the venue, not separated by building
 */
aegir.getFloors = function () {
    aegir.warn("[DEPRECATED] aegir.getFloors() is deprecated in 1.2. You should get floors from each building object instead.");

    var defaults = aegir.getDefaults();
    if (defaults.floorObjs == null) {
        var fullList = [];
        aegir.each(aegir.getBuildings(), function (i, building) {
            aegir.each(building.floors, function (j, floor) {
                fullList.push(floor);
            })
        });
        defaults.floorObjs = fullList;
    }
    return defaults.floorObjs;
};
/**
 * List of units for the venue
 * @memberof aegir
 * @public
 * @deprecated since version 1.2. You should get units from each floor object instead.
 * @returns {vmMapUnit[]} the list of units in the venue, not separated by floor or building
 */
aegir.getUnits = function () {
    aegir.warn("[DEPRECATED] aegir.getUnits() is deprecated in 1.2. You should get units from each floor object instead.");

    var defaults = aegir.getDefaults();
    if (defaults.units == null) {
        var fullList = [];
        aegir.each(aegir.getBuildings(), function (i, building) {
            aegir.each(building.floors, function (j, floor) {
                aegir.each(floor.units, function (k, unit) {
                    fullList.push(unit);
                });
            });
        });
        defaults.units = fullList;
    }
    return defaults.units;
};

/* Return all building Objects */
aegir.getBuildings = function () {
    var defaults = aegir.getDefaults();
    return defaults.buildingObjs;
};
/**
 * List of outdoor buildings for the venue
 * @memberof aegir
 * @public
 * @since 1.2
 * @returns {vmMapBuilding[]} the list of outdoor floors in the venue
 */
aegir.getOutdoorBuildings = function () {
    var defaults = aegir.getDefaults();
    return defaults.outdoorBuildingObjs;
}

/**
 * Get the list of currently active indoor floors
 * @memberof aegir
 * @public
 * @returns {vmMapBuildingFloor[]} list of floors
 */
aegir.getCurrentFloors = function () {
    var defaults = aegir.getDefaults();
    return defaults.currentIndoorFloors;
};
/**
 * Get the list of currently active outdoor floors
 * @memberof aegir
 * @public
 * @returns {vmMapBuildingFloor[]} list of floors
 */
aegir.getCurrentOutdoorFloors = function () {
    var defaults = aegir.getDefaults();
    return defaults.currentOutdoorFloors;
}
/**
 * Find floor with id in the venue, either indoors or outdoors
 * @memberof aegir
 * @public
 * @param {string} floorId the id of the floor to search for
 * @returns {?vmMapBuildingFloor} the matched floor, or null
 */
aegir.findFloorObjForFloorId = function (floorId) {
    return aegir.findFloorWithId(floorId) || aegir.findOutdoorFloorWithId(floorId);
};

//TODO: move to maps-wayfinding-sdk?
/**
 * Get the geojson properties associated with a given feature
 * @memberof aegir
 * @public
 * @param {string} itemId the feature id of the item to search for
 * @return {?object} the geojson object with the given feature id, or null
 */
aegir.nodeFinderById = function (itemId) {
    var defaults = aegir.getDefaults();
    var objToReturn = [];

    if (itemId && defaults.unitData_JSON !== null) {
        aegir.each(defaults.unitData_JSON.features, function (floorKey, floorValue) {
            var roomValueId = floorValue.properties.FEATURE_ID;
            if (itemId == roomValueId) {
                objToReturn = floorValue.properties;
            }
        });
    } else {
        aegir.error("Item not found.");
    }

    return objToReturn;
};

/**
 * Get the geojson geometry information associated with a given feature
 * @memberof aegir
 * @public
 * @param {string} wpId the feature id of the item to search for
 * @return {?object} the geojson object with the given feature id, or null
 */
aegir.coordFinderById = function (wpId) {
    var defaults = aegir.getDefaults();
    var objToReturn = [];

    if (wpId && defaults.unitData_JSON !== null) {
        aegir.each(defaults.unitData_JSON.features, function (floorKey, floorValue) {
            var roomValueId = floorValue.properties.FEATURE_ID;
            if (wpId == roomValueId) objToReturn = floorValue.geometry;
        });
    } else {
        aegir.error("No coordinate found.");
    }

    return objToReturn;
};


/**
 * Simple replacement for jquery's $.ajax fn. This implementation is not full-featured.
 * @memberof aegir
 * @since 1.2
 * @public
 * @param {string} url the endpoint for the ajax call
 * @param {ajaxConfig} options configuration options
 * @param {onCompleteCallback} onSuccess handler for succesful ajax calls
 * @param {onCompleteCallback} onFailure handler for failed ajax calls
 */
aegir.ajax = function (url, options, onSuccess, onFailure) {
    var xobj = new XMLHttpRequest();
    var method = "GET";
    if (options.method != undefined) {
        method = options.method;
    }
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            aegir.log("[END] AJAX: " + url + " status code: " + xobj.status);
            onSuccess(xobj.responseText, null);
        } else if (xobj.readyState == 4 && xobj.status != "200") {
            aegir.log("Ajax onreadystatechange: " + xobj.readyState + ", status: " + xobj.status);

            aegir.error("[END] AJAX: " + url + " status code: " + xobj.status);
            onFailure(null, method + ": " + url + " status code: " + xobj.status);
        } else if (xobj.status == 0 && xobj.readyState == 4) {
            onFailure(null, method + ": " + url + " status code: " + xobj.status);

        }
    };
    if (options.mimeType != undefined) {
        xobj.overrideMimeType("application/json");
    }

    aegir.log("[START] AJAX: " + url + ", method: " + method + ", body: " + (options.payload || ""));

    xobj.open(method, url, true);
    if (options.payload != undefined && options.payload != null) {
        xobj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xobj.send(options.payload);
    } else {
        xobj.send();
    }
}
/**
 * Simple replacement for jquery's $.each fn. This implementation is not full-featured.
 * @memberof aegir
 * @since 1.2
 * @public
 * @param {object} list the list to iterate, or if an object, iterates over object properties
 * @param {itemIteratorFunction} iterator callback to call on each iteration
 */
aegir.each = function (list, iterator) {
    var counter = 0;
    // console.log("Iterating over type " + (typeof list));
    // console.log("Constructor " + list.constructor);
    if (list instanceof Array || list instanceof HTMLCollection || list instanceof NodeList) {
        for (var index = 0; index < list.length; index++) {
            var result = iterator(index, list[index]) || true;
            if (!result) {
                break;
            }
            counter++;
        }
    } else //object properties/associative array iterator
    {
        for (var i in list) {
            var result = iterator(i, list[i]) || true;
            if (!result) {
                break;
            }
            counter++;
        }
    }
}

/**
 * Simple replacement for jquery's $.inArray fn. This implementation is not full-featured.
 * @memberof aegir
 * @since 1.2
 * @public
 * @param {object} needle the object being searched for
 * @param {Array} haystack the array to look
 * @returns {number} if found, the index of the item in the array, else -1
 */
aegir.inArray = function (needle, haystack) {
    for (var i = 0; i < haystack.length; i++) {
        var item = haystack[i];
        if (needle === item) {
            return i;
        }
    }
    return -1;
}

/**
 * Simple replacement for jquery's $.grep fn. This implementation is not full-featured.
 * @memberof aegir
 * @since 1.2
 * @public
 * @param {object[]} items the list to search for
 * @param {matchingFunction} matcher the function to test for matches
 * @returns {object[]} list of items that were matched
 */
aegir.grep = function (items, matcher) {
    var matches = [];
    items = items || [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (matcher(item)) {
            matches.push(item);
        }
    }
    return matches;
}

/**
 * set's the alpha on the map's background layer
 * @memberof aegir
 * @since 1.2
 * @public
 */
aegir.setBackgroundAlpha = function (alpha) {
    aegir.getConfig().backgroundAlpha = alpha;
    var backgroundLayerId = "background";
    var mapboxMap = aegir.getLayers().map;
    var layer = mapboxMap.getLayer(backgroundLayerId)
    if (layer) {
        aegir.log("Setting background alpha to " + alpha);
        mapboxMap.setPaintProperty(backgroundLayerId, "background-opacity", alpha);
    } else {
        aegir.warn("Could not find layer with id '" + backgroundLayerId + "' to set alpha on.");
    }
}

/**
 * @memberof aegir
 * @since 1.3
 * @public
 * @param {string} image path of image
 * @param {string} key key
 */
aegir.setImageForKey = function (imagePath, key) {
    layers = aegir.getLayers();
    layers.map.loadImage(imagePath, function (error, image) {
        if (error) {

        } else {
            layers.map.addImage(key, image);
        }
    });

}
/**
 * @memberof aegir
 * @since 1.2.1
 * @public
 * @ignore
 */
aegir.vmVenueLayerStyle = function () {

    this.hasFillStyle = function () {
        var hasStyle = false;
        if (this.fillColor != null || this.fillPattern != null) {
            hasStyle = true;
        }
        return hasStyle;
    };
    this.hasTextStyle = function () {
        var hasStyle = false;
        if (this.fontSize != null || this.fontColor != null || this.maxTextWidth != null
            || this.fontStrokeWidth != null || this.fontStrokeColor != null || this.fontName != null) {
            hasStyle = true;
        }
        return hasStyle;
    };
    this.hasIconStyle = function () {
        var hasStyle = false;
        if (this.iconName != null ) {
            hasStyle = true;
        }
        return hasStyle;
    };
};

/**
 * @memberof aegir
 * @since 1.2.1
 * @public
 * @param {vmVenueLayerStyle} style the new style for the unit
 * @param {vmMapUnit} unit the unit to apply the style to
 */
aegir.setStyleForUnit = function (style, unit) {

    var floorId = unit.floorId;
    var unitId = unit.id;
    var layers = aegir.getLayers();
    var defaults = aegir.getDefaults();
    var config = aegir.getConfig();
    if (config.mapLoaded !== true || !(defaults.currentIndoorFloors.includes(floorId))) {
        aegir.log("Adding pending style for unit: " + unitId);
        var styleDict = config.pendingUnitStyles[floorId];

        if (styleDict == null) {
            styleDict = {};
        }
        styleDict[unitId] = style;
        config.pendingUnitStyles[floorId] = styleDict;

    } else {
        aegir.log("Applying style immediately for unit: " + unitId);
        if (style.hasFillStyle()) {
            aegir._setStyleForFillLayer(style, unitId, floorId);
        }
        if (style.hasTextStyle()) {
            aegir._setStyleForLabelLayer(style, unitId, floorId);
        }
        if (style.hasIconStyle()){
            aegir._setStyleForIconLayer(style, unitId, floorId);
        }
        if (!style.hasTextStyle() && !style.hasFillStyle()) {
            aegir.warn("Trying to apply invalid style to unit: " + unitId);
        }
    }
}

/**
 * @memberof aegir
 * @since 1.2.1
 * @public
 * @param {vmMapUnit} unit the unit to remove the style from. Style will revert back to default style defined in json config.
 */
aegir.removeStyleForUnit = function (unit) {
    var unitId = unit.id;
    var floorId = unit.floorId;
    var layers = aegir.getLayers();
    var removerLayerPrefixs = ["custom_shape_style", "custom_label_style", ""];

    aegir.each(removerLayerPrefixs, function (index, layerPrefix) {
        var individualStyleLayerId = layerPrefix + "_" + unitId + "_" + floorId;
        var individualStyleLayerOutlineId = individualStyleLayerId + "_outline";

        if (layers.map.getLayer(individualStyleLayerId)) {
            aegir.log("Removing custom style layer: " + individualStyleLayerId);
            layers.map.removeLayer(individualStyleLayerId);
        }
        if (layers.map.getLayer(individualStyleLayerOutlineId)) {
            aegir.log("Removing custom style layer: " + individualStyleLayerOutlineId);
            layers.map.removeLayer(individualStyleLayerOutlineId);
            layers.map.removeSource(individualStyleLayerOutlineId);
        }
    });

    for (var j = layers.customStyleLayers.length - 1; j >= 0; j--) {
        var layer = layers.customStyleLayers[j];
        if (layer.includes(unitId)) {
            layers.customStyleLayers.splice(j, 1);
        }
    }
}
/* ================PRIVATE METHODS================*/

/**
 * Load venue map data from zip file
 * @memberof aegir
 * @since 1.2
 * @private
 * @async
 * @param {vmdFileCollection} fileCollection properties for file Loading
 * @param {mapDataLoadConfig} params settings
 * @param {onCompleteCallback} onComplete callback when loading is complete
 */
aegir._loadZip = function (fileCollection, params, onComplete) {
    if (window.zip == undefined) {
        onComplete(null, "Trying to load a zip file, but zip.js is not loaded.");
        return false;
    }
    aegir.log("[START] Loading venue map from zip: " + fileCollection.zipURL);
    zip.createReader(new zip.HttpReader(fileCollection.zipURL), function (zipReader) {
        aegir.log("[END] Unzipped zip file at " + fileCollection.zipURL);

        zipReader.getEntries(function (entries) {
            var config = aegir.getConfig();
            var sitemap = aegir.grep(entries, function (entry) {
                return entry.filename.startsWith("map_");
            });
            var onProcessingComplete = function (response, errors) {
                zipReader.close(function () {
                    aegir.log("Closed zip file");
                    aegir.log("[END] Processing zip");
                    onComplete(response, errors);
                });
            }
            if (sitemap.length > 0) {
                aegir.log("[START] Processing LEGACY zip");
                aegir._configure(config, "processingMode", aegir.PROCESSING_MODES.LEGACY);
                aegir._configure(config, "renderMode", aegir.RENDER_MODES.RASTER);

                aegir.legacy._processZip(entries, onProcessingComplete);
            } else {
                aegir.log("[START] Processing VMD zip");
                aegir._configure(config, "processingMode", aegir.PROCESSING_MODES.DEFAULT);
                aegir._configure(config, "renderMode", aegir.RENDER_MODES.VECTOR);
                aegir._processZip(params, entries, onProcessingComplete);
            }
        });
    }, function (error) {
        aegir.error("Error getting zip file: " + error);
        onComplete(null, "Error loading zip file: " + error);
    });
}
/**
 * Process contents of a zip file that supposedly has VMD
 * @memberof aegir
 * @since 1.2
 * @private
 * @async
 * @param {mapDataLoadConfig} loadOptions properties for file Loading
 * @param {object[]} entries entries in the zip file
 * @param {onCompleteCallback} onComplete callback when loading is complete
 */
aegir._processZip = function (loadOptions, entries, onComplete) {
    var getFirstMatch = function (regex, zipFileList) {
        var matchingItems = aegir.grep(entries, function (entry) {
            var matches = entry.filename.match(regex);
            return matches != null && matches.length > 0;
        });
        return matchingItems.length > 0 ? matchingItems[0] : null;
    };
    var xml = getFirstMatch(new RegExp(/^.*\.xml$/), entries);
    var geojson = getFirstMatch(new RegExp(/^.*\.geojson$/), entries);

    if (xml != null && geojson != null) {
        var promises = [];
        var promise = new Promise(function (resolve, reject) {
            aegir.log("Getting data for " + xml.filename);

            xml.getData(new zip.TextWriter(), function (data) {
                var xmlData = aegir._processXML(data);
                resolve(xmlData);
            });

        });
        promises.push(promise);
        promise = new Promise(function (resolve, reject) {
            aegir.log("Getting data for " + geojson.filename);
            geojson.getData(new zip.TextWriter(), function (data) {
                var buildings = aegir._processGeoJSON(data)
                resolve(buildings);
            });
        });
        promises.push(promise);

        var loadStylePromise = aegir._createStylePromise(loadOptions.style, loadOptions.venueId);
        promises.push(loadStylePromise);
        aegir.log("[START] Waiting to finish processing VMD zip.")
        Promise.all(promises).then(function (objs) {
            aegir.log("[END] Done processing all building XMLs from VMD zip.");
            var xmlData = objs[0] || [];
            var venueBuildings = objs[1] || []
            var style = objs[2] || {};
            var venueInfo = aegir._getVenueInfo(venueBuildings);
            aegir.getDefaults().buildingObjs = venueBuildings;

            aegir.getDefaults().units = [];
            onComplete(venueInfo, null);
        }, function (error) {
            aegir.error("Error while processing VMD zip file: " + error);
            onComplete(null, "Error while processing VMD zip file: " + error);
        });
    } else {
        aegir.warn("Could not find " + (xml == null ? "XML" : "GeoJSON") + " in zip file.");
        onComplete([], null);
    }
};

/**
 * Load venue map data
 * @memberof aegir
 * @private
 * @async
 * @param {string} xml Path to the VMD's xml file
 * @param {string} geoJSON Path to the VMD's geojson file
 * @param {mapDataLoadConfig} loadOptions settings
 * @param {onCompleteCallback} callback callback when loading is Complete
 */
aegir._loadData = function (xml, geoJsonUrl, loadOptions, callback) {

    var defaults = aegir.getDefaults();
    var venueId = aegir.getConfig().venueId;
    //TODO: Cleanup if possible

    //TODO: It looks like loadMapInstanceDef is only required for Wayfinding?
    //The map will render correctly without calling this
    var promises = [];


    var loadGeojsonPromise = new Promise(function (resolve, reject) {
        aegir.log("[START] Load GEOJSON: venue: " + venueId);

        aegir._loadJSON(geoJsonUrl, function (response, error) {
            if (response !== null) {
                var buildings = aegir._processGeoJSON(response);
                //aegir.getDefaults().units = units;
                aegir.log("[END] Load GEOJSON: venue: " + venueId);

                resolve(buildings);
            } else {
                aegir.error("[END] Load GEOJSON: venue: " + venueId + ", error: " + error);
                resolve("There was an error loading " + geoJsonUrl + ": " + error);
            }
        });
    });
    promises.push(loadGeojsonPromise);
    promises.push(aegir._createStylePromise(loadOptions.style, venueId));
    var loadXmlPromise = new Promise(function (resolve, reject) {
        aegir.log("[START] Load XML: venue: " + venueId);
        aegir._loadXML(xml, loadOptions, function (xmlData, error) {
            if (error !== null) {
                var obj = {};
                obj.error = "There was an error loading " + xml + ": " + error;
                aegir.error("[END] Load XML: venue: " + venueId + ", error: " + error);
                resolve(obj);
            } else {
                xmlData.loadOptions = loadOptions;
                aegir.log("[END] Load XML: venue: " + venueId);
                resolve(xmlData);
            }
        });
    });
    promises.push(loadXmlPromise);
    // if( aegir.wf) {
    //   promises.push( aegir.wf._createInitializationPromise({xml:xml, geojson: geoJsonUrl}, loadOptions));
    // }
    aegir.log("[START] Waiting: venue: " + venueId);

    Promise.all(promises).then(
        function (values) {
            var errorCollection = [];
            // TOOD: Should be able to combine this with the other Promise.all for processing VMD zip

            var venueBuildings = values[0] || [];
            var style = values[1] || {};
            var venueInfo = aegir._getVenueInfo(venueBuildings);
            var xmlData = values[2] || {};
            aegir.getDefaults().buildingObjs = venueBuildings;
            aegir.getDefaults().units = [];
            if (xmlData != null && xmlData.error != null) {
                errorCollection.push(xmlData.error);
            }
            // var initWayfindingResponse = values[3] || null;
            // if( initWayfindingResponse != null) {
            //   //this is an error message
            //   errorCollection.push(initWayfindingResponse);
            // }
            aegir.log("[END] Waiting: venue: " + venueId);

            callback(venueInfo, errorCollection);
        },
        //Note, the only time this should get called is if there is an unhandled exception
        function (error) {
            aegir.error("[END] Waiting: venue: " + venueId + ", error: An unexpected error occurred during loading. - " + error);
            aegir.error(error);
            callback(null, "An unexpected error occurred during loading: " + error);
        });
};

/**
 * Creates the promise that downloads and process the map style
 * @memberof aegir
 * @since 1.2
 * @private
 * @param {string} style The url to the style
 * @param {string} venueId the id of the venue
 * @returns {Promise} a javascript promise
 */
aegir._createStylePromise = function (style, venueId) {
    return new Promise(function (resolve, reject) {
        var defaults = aegir.getDefaults();
        aegir.log("[START] Load STYLE: venue: " + venueId);

        aegir._loadJSON(style, function (response, error) {
            if (response !== null) {
                defaults.style_JSON = JSON.parse(response);
                aegir.log("[END] Load STYLE: venue: " + venueId);
                resolve();
            } else {
                aegir.error("[END] Load STYLE: venue: " + venueId + ", error: " + error);

                resolve("There was an error loading " + style + ": " + error);
            }
        });
    });
}

/**
 * Load json file
 * @memberof aegir
 * @private
 * @async
 * @param {string} jsonUrl Path to the json file
 * @param {onCompleteCallback} callback callback for completion
 */
aegir._loadJSON = function (jsonUrl, callback) {
    aegir.ajax(jsonUrl, {mimeType: "application/json"}, callback, callback);
};

/**
 * Load XML data file
 * @memberof aegir
 * @private
 * @async
 * @param {string} xmlUrl Path to the XML file
 * @param {mapDataLoadConfig} loadOptions settings
 * @param {onCompleteCallback} onComplete callback for completion
 */
aegir._loadXML = function (xmlUrl, loadOptions, onComplete) {
    aegir.ajax(xmlUrl, {},

        function (xml, error) {
            var xmlData = aegir._processXML(xml);
            onComplete(xmlData, null);
        },
        function (response, error) {
            aegir.error("Load xml failure.");
            onComplete(null, error);
        }
    );
};

/**
 * Process geojson
 * @memberof aegir
 * @since 1.2
 * @private
 * @param {string} geojson A geojson string
 * @returns {vmMapBuilding[]} A list of buildings parsed from the geojson
 */
aegir._processGeoJSON = function (geojson) {
    var defaults = aegir.getDefaults();
    var buildings = [];
    var buildingMap = {};
    var floorMap = {};
    defaults.unitData_JSON = JSON.parse(geojson);
    aegir.each(defaults.unitData_JSON.features, function (i, feature) {
        var featureId = feature.properties.FEATURE_ID;
        var className = feature.properties["class"]; //'class' is a reserved word so yuicompressor barfs using normal dot syntax
        if (featureId == feature.properties.UNIT_ID || (featureId.includes("fixture") || featureId.includes("amenity"))) {
            //this is a unit
            var unit = {};
            unit.id = feature.properties.UNIT_ID || featureId,
                unit.name = feature.properties.NAME,
                unit.floorId = feature.properties.FLOOR_ID,
                unit.coordinates = aegir._getPerimeterCoordinates(feature.geometry.coordinates, feature.geometry.type);
            unit.centerLocation = aegir.mapUtil.centerOfCoordinates(unit.coordinates);
            if (floorMap[unit.floorId]) {
                floorMap[unit.floorId].units.push(unit);
            } else {
                aegir.warn("[GEOJSON] Could not find floor with id " + unit.floorId + " for unit " + unit.id);
            }
        } else if (className.endsWith("label") || className.endsWith("icon") || className.startsWith("icon")) {
            var unitId = feature.properties.UNIT_ID;
            var floorId = feature.properties.FLOOR_ID;
            var floor = floorMap[floorId];
            var matches = aegir.grep(floor.units, function (u) {
                return u.id == unitId;
            });
            if (matches.length > 0) {
                var unit = matches[0];
                var location = aegir._getPerimeterCoordinates(feature.geometry.coordinates, feature.geometry.type);
                if (className.endsWith("label")) {
                    unit.labelLocation = location[0];
                } else {
                    unit.iconLocation = location[0];
                    unit.icon = className;
                }
            }
        } else if (className == "roomhotspot") {
            var unitId = feature.properties.UNIT_ID;
            var floorId = feature.properties.FLOOR_ID;
            var floor = floorMap[floorId];
            var matches = aegir.grep(floor.units, function (u) {
                return u.id == unitId;
            });
            if (matches.length > 0) {
                var unit = matches[0];
                var location = aegir._getPerimeterCoordinates(feature.geometry.coordinates, feature.geometry.type);

                unit.hotspotLocation = location[0];
            }
        } else if (featureId == feature.properties.BUILDING_ID) {
            //this is a building
            var building = {};
            building.id = feature.properties.BUILDING_ID;
            building.name = feature.properties.NAME;
            building.floors = [];
            building.coordinates = aegir._getPerimeterCoordinates(feature.geometry.coordinates, feature.geometry.type);
            building.bounds = aegir.mapUtil.coordinateBounds(building.coordinates);
            building.center = aegir.mapUtil.centerOfCoordinates([building.bounds.sw, building.bounds.ne]);
            buildingMap[building.id] = building;

            if (building.id == "venue_outdoors") {
                defaults.outdoorBuildingObjs.push(building);
            } else {
                buildings.push(building);
            }
        } else if (featureId == feature.properties.FLOOR_ID) {
            //this is a floor
            var floor = [];
            floor.buildingId = feature.properties.BUILDING_ID
            floor.id = feature.properties.FLOOR_ID;
            floor.name = feature.properties.NAME;
            floor.units = [];
            floor.coordinates = aegir._getPerimeterCoordinates(feature.geometry.coordinates, feature.geometry.type);
            floor.bounds = aegir.mapUtil.coordinateBounds(floor.coordinates);
            var idPieces = floor.id.split("_");
            var legacyOrdinal = parseInt(idPieces[idPieces.length - 1]);
            //  aegir.log("New floor ordinal: " + feature.properties.FLOOR_ORDINAL);
            var floorOrdinalValue = feature.properties.FLOOR_ORDINAL;
            floor.ordinal = floorOrdinalValue != undefined ? parseInt(floorOrdinalValue) : legacyOrdinal;
            //aegir.log("Floor ordinal for " + floor.id + " is " + floor.ordinal);
            floorMap[floor.id] = floor;

            if (buildingMap[floor.buildingId]) {
                buildingMap[floor.buildingId].floors.push(floor);
            } else {
                aegir.warn("[GEOJSON] Could not find building with id " + floor.buildingId + " for floor " + floor.id);
            }
            //TODO: refactor this -- move each floor into its corresponding building obj
            //  defaults.floorObjs.push(floorItem);
        } else {
            // aegir.warn("[GEOJSON] ignoring feature " + featureId);
            // aegir.log(feature);
        }
    });

    aegir.each(buildings, function (i, building) {
        //sort floors by floor orindal
        building.floors.sort(function (f1, f2) {
            return f1.ordinal - f2.ordinal;
        })
    });

    return buildings;
}

/**
 * Converts a multi-dimentional list of geojson coordinates to a list of {location}
 * @memberof aegir
 * @since 1.2
 * @private
 * @param {object[]} coordinates The coordinates from the geojson
 * @param {string} geometryType The geometry type from the geojson (only Point,Polygon/MultiPolygon are handled)
 * @returns {location[]} the converted list of locations
 */
aegir._getPerimeterCoordinates = function (coordinates, geometryType) {
    var permiterCoordinates = [];
    if (geometryType == "Point") {
        var location = {lat: coordinates[1], lng: coordinates[0]};
        if (location != null) {
            permiterCoordinates.push(location);
        }
    } else if (geometryType == "Polygon" || geometryType == "MultiPolygon") {
        var coordinates2 = coordinates[0];

        aegir.each(coordinates2, function (i, coord) {
            //Polygon is single array
            if (geometryType == "Polygon") {
                var location = aegir._lngLatToLocation(coord);
                if (location != null) {
                    permiterCoordinates.push(location);
                }
            } else if (geometryType == "MultiPolygon") {
                var p = []
                //MultiPolygon should be array of arrays
                aegir.each(coord, function (j, coord2) {
                    var location = aegir._lngLatToLocation(coord2);
                    if (location != null) {
                        p.push(location);
                    }
                });
                permiterCoordinates.push(p)
            }
        });
    } else {
        aegir.warn("Unsupported geometry type: " + geometryType);
    }

    return permiterCoordinates;
}

/**
 * Converts a gejson coordinate pair into a {location}
 * @memberof aegir
 * @since 1.2
 * @private
 * @param {Array} lnglat The geojson lnglat pair
 * @returns {location} a location or null if the lnglat pair is not valid
 */
aegir._lngLatToLocation = function (lnglat) {
    if (lnglat.length == 2) {
        return {
            lat: parseFloat(lnglat[1]),
            lng: parseFloat(lnglat[0])
        };
    } else {
        aegir.warn("Invalid lnglat: ");
        aegir.warn(lnglat);
    }
    return null;
}

/**
 * Process xml data from the VMD
 * @memberof aegir
 * @since 1.2
 * @private
 * @param {string} xml the xml to process The geojson lnglat pair
 * @returns {object} the parsed xml data
 */
aegir._processXML = function (xml) {
    var defaults = aegir.getDefaults();
    var buildings = [];
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml, "text/xml");
    var nodes = xmlDoc.documentElement.childNodes;

    if (aegir.wf) {
        aegir.wf._processXML(xml);
    }
    var coordinatesMatches = xmlDoc.getElementsByTagName("rdf:Description");
    aegir.each(coordinatesMatches, function (objIndex, obj) {

        var $dcType = obj.getAttribute("dc:type");
        if ($dcType !== null && $dcType == "Google Coordinates") {

            aegir.each(obj.childNodes, function (childObjIndex, childObj) {
                if (childObj.tagName == "rdf:Seq") {
                    aegir.each(childObj.childNodes, function (childT2ObjIndex, childT2Obj) {
                        if (childT2Obj.tagName == "rdf:_1") {
                            defaults.mapBounds.neLong = parseFloat(childT2Obj.children[0].attributes[2].nodeValue);
                            defaults.mapBounds.neLat = parseFloat(childT2Obj.children[0].attributes[1].nodeValue);
                        }
                        if (childT2Obj.tagName == "rdf:_4") {
                            defaults.mapBounds.swLong = parseFloat(childT2Obj.children[0].attributes[2].nodeValue);
                            defaults.mapBounds.swLat = parseFloat(childT2Obj.children[0].attributes[1].nodeValue);
                        }
                    });
                }
            });
        }
    });
    return [];
}
/**
 * Determine best initial indoor floors to show in one or more buildings
 * when no floors are specified when calling aegir.loadMap()
 * @memberof aegir
 * @since 1.2
 * @private
 * @returns {string[]} list of floor ids
 */
aegir._getBestInitialIndoorFloors = function () {
    aegir.log("[START] Determining best initial INDOOR floor");
    //should be lowest '0' ordinal floor in the first building
    var config = aegir.getConfig();
    var defaults = aegir.getDefaults();
    var buildings = aegir.getBuildings();
    var targetBuilding = buildings.length > 0 ? buildings[0] : null;
    if (buildings.length > 1) {
        var matches = aegir.grep(buildings, function (building) {
            if (config.procesingMode == aegir.PROCESSING_MODES.LEGACY) {
                //building ids are c[buildingNumber]_otherstuff
                return building.id.startsWith("c1");
            } else {
                //building ids are building_[buildingNumber]
                return building.id == "building_1";
            }
        });

        //if there are no buildings here
        //we default to the first building in the 'buildings' list
        //which is probably in an unreliable order. We could do
        //more here to pick the lowest-indexed building if needed
        if (matches.length > 0) {
            targetBuilding = matches[0];
        }
    }
    aegir.log("Best initial INDOOR building is " + (targetBuilding != null ? targetBuilding.id : "NULL"));
    if (targetBuilding == null) {
        return [];
    }
    var floors = targetBuilding.floors;
    var targetFloor = floors > 0 ? floors[0] : null;
    var zeroOrdinalFloors = aegir.grep(floors, function (floor) {
        return floor.ordinal == 0;
    });
    if (zeroOrdinalFloors.length > 0) {
        targetFloor = zeroOrdinalFloors[0];
    } else //pick lowest positive ordinal
    {
        aegir.each(floors, function (i, floor) {
            if ((targetFloor == null || (parseInt(floor.ordinal) >= 0 && parseInt(floor.ordinal) < parseInt(targetFloor.ordinal)))) {
                targetFloor = floor;
            }
        });
    }
    aegir.log("Best initial indoor floor is " + (targetFloor != null ? targetFloor.id : "NULL"));
    aegir.log("[END] Determining best initial indoor floor");

    return targetFloor != null ? [targetFloor.id] : [];

}

/**
 * Determine best initial outdoor floors to show in one or more buildings
 * when no floors are specified when calling aegir.loadMap()
 * @memberof aegir
 * @since 1.2
 * @private
 * @returns {string[]} list of outdoor floor ids
 */
aegir._getBestInitialOutdoorFloors = function () {
    aegir.log("[START] Determining best initial OUTDOOR floor");
    var config = aegir.getConfig();
    if (config.processingMode == aegir.PROCESSING_MODES.LEGACY) {
        aegir.log("Outdoor floors not supported in legacy mode.");
        aegir.log("[END] Determining best initial OUTDOOR floor");
        return [];
    }
    var defaults = aegir.getDefaults();
    var buildings = aegir.getOutdoorBuildings();
    var targetBuilding = buildings.length > 0 ? buildings[0] : null;

    if (targetBuilding == null) {
        return [];
    }
    aegir.log("Best initial OUTDOOR building is " + (targetBuilding != null ? targetBuilding.id : "NULL"));
    var floors = targetBuilding.floors;
    var targetFloor = floors > 0 ? floors[0] : null;
    if (floors.length > 0) {
        var zeroOrdinalFloors = aegir.grep(floors, function (floor) {
            return floor.ordinal == 0;
        });
        if (zeroOrdinalFloors.length > 0) {
            targetFloor = zeroOrdinalFloors[0];
        } else //pick lowest positive ordinal
        {
            aegir.each(floors, function (i, floor) {
                if ((targetFloor == null || parseInt(floor.ordinal) >= 0 && parseInt(floor.ordinal) < parseInt(targetFloor.ordinal))) {
                    targetFloor = floor;
                }
            });
        }
    }
    aegir.log("Best initial OUTDOOR floor is " + (targetFloor != null ? targetFloor.id : "NULL"));
    aegir.log("[END] Determining best initial OUTDOOR floor");
    return targetFloor != null ? [targetFloor.id] : [];
}

/**
 * Creates the initial Mapbox map object
 * @memberof aegir
 * @since 1.2
 * @private
 * @param {string} streetJson style json for mapbox streets
 * @returns {mapboxgl.Map} mapbox map object
 */
aegir._createMapboxMap = function (streetJson) {
    var config = aegir.getConfig();
    var streetData_JSON = streetJson != undefined ? JSON.parse(streetJson) : null;
    var streetData_style = streetData_JSON != null ? streetData_JSON["styles"] : null;



    if (config.streetMapURL != null) {
        var mapboxTileSource = {

            "url": config.streetMapURL,
            "type": "vector"
        };
        styleJSONObj.sources.mapbox = mapboxTileSource;
        if (streetData_style != null) {
            styleJSONObj.layers = streetData_style;
        }
    }
    var venueBounds = aegir._getVenueBounds();
    var mapboxMap = new mapboxgl.Map({
        center: [-96.83107084983907, 32.79932550194892],
        container: "map",
        hash: true,
        style: {
            "version": 8,
            "name": "Aegir Base Style",
            "sources": {
                "mapbox": {
                    "url": "mapbox://mapbox.mapbox-streets-v7",
                    "type": "vector"
                }
            },
            "glyphs": 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
            "layers": [
                {
                    "description": "",
                    "fields": {
                        "class": "One of: agriculture, cemetery, glacier, grass, hospital, industrial, park, parking, piste, pitch, rock, sand, school, scrub, wood, aboriginal_lands",
                        "type": "OSM tag, more specific than class"
                    },
                    "id": "landuse",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "class": "One of: river, canal, stream, stream_intermittent, ditch, drain",
                        "type": "One of: river, canal, stream, ditch, drain"
                    },
                    "id": "waterway",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {},
                    "id": "water",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "type": "One of: runway, taxiway, apron"
                    },
                    "id": "aeroway",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "class": "One of: fence, hedge, cliff, gate"
                    },
                    "id": "barrier_line",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "extrude": "String. Whether building should be extruded when rendering in 3D. One of: 'true', 'false'",
                        "height": "Number. Height of building or part of building.",
                        "min_height": "Number. Height of bottom of building or part of building, if it does not start at ground level.",
                        "type": "In most cases, values will be that of the primary key from OpenStreetMap tags.",
                        "underground": "Text. Whether building is underground. One of: 'true', 'false'"
                    },
                    "id": "building",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "class": "One of: national_park, wetland, wetland_noveg",
                        "type": "OSM tag, more specific than class"
                    },
                    "id": "landuse_overlay",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "class": "One of: 'motorway', 'motorway_link', 'trunk', 'primary', 'secondary', 'tertiary', 'link', 'street', 'street_limited', 'pedestrian', 'construction', 'track', 'service', 'ferry', 'path', 'golf'",
                        "layer": "Number. Specifies z-ordering in the case of overlapping road segments. Common range is -5 to 5. Available from zoom level 13+.",
                        "oneway": "Text. Whether traffic on the road is one-way. One of: 'true', 'false'.",
                        "structure": "Text. One of: 'none', 'bridge', 'tunnel', 'ford'. Available from zoom level 13+.",
                        "type": "In most cases, values will be that of the primary key from OpenStreetMap tags."
                    },
                    "id": "road",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "admin_level": "The OSM administrative level of the boundary",
                        "disputed": "Number. Disputed boundaries are 1, all others are 0.",
                        "iso_3166_1": "The ISO 3166-1 alpha-2 code(s) of the state(s) a boundary is part of. Format: 'AA' or 'AA-BB'",
                        "maritime": "Number. Maritime boundaries are 1, all others are 0."
                    },
                    "id": "admin",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "code": "ISO 3166-1 Alpha-2 code",
                        "name": "Local name of the country",
                        "name_ar": "Arabic name of the country",
                        "name_de": "German name of the country",
                        "name_en": "English name of the country",
                        "name_es": "Spanish name of the country",
                        "name_fr": "French name of the country",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the country",
                        "name_ru": "Russian name of the country",
                        "name_zh": "Chinese name of the country",
                        "parent": "ISO 3166-1 Alpha-2 code of the administering/parent state, if any",
                        "scalerank": "Number, 1-6. Useful for styling text sizes.",
                        "type": "One of: country, territory, disputed territory, sar"
                    },
                    "id": "country_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "labelrank": "Number, 1-6. Useful for styling text sizes.",
                        "name": "Local or international name of the water body",
                        "name_ar": "Arabic name of the water body",
                        "name_de": "German name of the water body",
                        "name_en": "English name of the water body",
                        "name_es": "Spanish name of the water body",
                        "name_fr": "French name of the water body",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the water body",
                        "name_ru": "Russian name of the water body",
                        "name_zh": "Chinese name of the water body",
                        "placement": "One of: point, line"
                    },
                    "id": "marine_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "abbr": "Abbreviated state name",
                        "area": "The area of the state in kilometers²",
                        "name": "Local name of the state",
                        "name_ar": "Arabic name of the state",
                        "name_de": "German name of the state",
                        "name_en": "English name of the state",
                        "name_es": "Spanish name of the state",
                        "name_fr": "French name of the state",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the state",
                        "name_ru": "Russian name of the state",
                        "name_zh": "Chinese name of the state"
                    },
                    "id": "state_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "capital": "Admin level the city is a capital of, if any. One of: 2, 3, 4, 5, 6, null",
                        "ldir": "A hint for label placement at low zoom levels. One of: N, E, S, W, NE, SE, SW, NW, null",
                        "localrank": "Number. Priority relative to nearby places. Useful for limiting label density.",
                        "name": "Local name of the place",
                        "name_ar": "Arabic name of the place",
                        "name_de": "German name of the place",
                        "name_en": "English name of the place",
                        "name_es": "Spanish name of the place",
                        "name_fr": "French name of the place",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the place",
                        "name_ru": "Russian name of the place",
                        "name_zh": "Chinese name of the place",
                        "name_zh-Hans": "Simplified Chinese name of the place",
                        "scalerank": "Number, 0-9 or null. Useful for styling text & marker sizes.",
                        "type": "One of: city, town, village, hamlet, suburb, neighbourhood, island, islet, archipelago, residential, aboriginal_lands"
                    },
                    "id": "place_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "area": "The area of the water polygon in Mercator meters²",
                        "name": "Local name of the water body",
                        "name_ar": "Arabic name of the water body",
                        "name_de": "German name of the water body",
                        "name_en": "English name of the water body",
                        "name_es": "Spanish name of the water body",
                        "name_fr": "French name of the water body",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the water body",
                        "name_ru": "Russian name of the water body",
                        "name_zh": "Chinese name of the water body",
                        "name_zh-Hans": "Simplified Chinese name of the water body"
                    },
                    "id": "water_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "maki": "One of: airport, airfield, heliport, rocket",
                        "name": "Local name of the airport",
                        "name_ar": "Arabic name of the airport",
                        "name_de": "German name of the airport",
                        "name_en": "English name of the airport",
                        "name_es": "Spanish name of the airport",
                        "name_fr": "French name of the airport",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the airport",
                        "name_ru": "Russian name of the airport",
                        "name_zh": "Chinese name of the airport",
                        "name_zh-Hans": "Simplified Chinese name of the airport",
                        "ref": "A 3-4 character IATA, FAA, ICAO, or other reference code",
                        "scalerank": "Number 1-4. Useful for styling icon sizes."
                    },
                    "id": "airport_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "maki": "One of: rail, rail-metro, rail-light, entrance",
                        "name": "Local name of the station",
                        "name_ar": "Arabic name of the station",
                        "name_de": "German name of the station",
                        "name_en": "English name of the station",
                        "name_es": "Spanish name of the station",
                        "name_fr": "French name of the station",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the station",
                        "name_ru": "Russian name of the station",
                        "name_zh": "Chinese name of the station",
                        "name_zh-Hans": "Simplified Chinese name of the station",
                        "network": "The network(s) that the station serves. Useful for icon styling."
                    },
                    "id": "rail_station_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "elevation_ft": "Integer elevation in feet",
                        "elevation_m": "Integer elevation in meters",
                        "maki": "One of: 'mountain', 'volcano'",
                        "name": "Local name of the peak",
                        "name_ar": "Arabic name of the peak",
                        "name_de": "German name of the peak",
                        "name_en": "English name of the peak",
                        "name_es": "Spanish name of the peak",
                        "name_fr": "French name of the peak",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the peak",
                        "name_ru": "Russian name of the peak",
                        "name_zh": "Chinese name of the peak",
                        "name_zh-Hans": "Simplified Chinese name of the peak"
                    },
                    "id": "mountain_peak_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "localrank": "Number. Priority relative to nearby POIs. Useful for limiting label density.",
                        "maki": "The name of the Maki icon that should be used for the POI",
                        "name": "Local name of the POI",
                        "name_ar": "Arabic name of the POI",
                        "name_de": "German name of the POI",
                        "name_en": "English name of the POI",
                        "name_es": "Spanish name of the POI",
                        "name_fr": "French name of the POI",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the POI",
                        "name_ru": "Russian name of the POI",
                        "name_zh": "Chinese name of the POI",
                        "name_zh-Hans": "Simplified Chinese name of the POI",
                        "ref": "Short reference code, if any",
                        "scalerank": "Number. 1-5. Useful for styling icon sizes and minimum zoom levels.",
                        "type": "The original OSM tag value"
                    },
                    "id": "poi_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "class": "The class of road the junction is on. Matches the classes in the road layer.",
                        "name": "A longer name",
                        "ref": "A short identifier",
                        "reflen": "The number of characters in the ref field.",
                        "type": "The type of road the junction is on. Matches the types in the road layer."
                    },
                    "id": "motorway_junction",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "class": "One of: 'motorway', 'motorway_link', 'trunk', 'primary', 'secondary', 'tertiary', 'link', 'street', 'street_limited', 'pedestrian', 'construction', 'track', 'service', 'ferry', 'path', 'golf'",
                        "iso_3166_2": "Text. The ISO 3166-2 code of the state/province/region the road is in.",
                        "len": "Number. Approximate length of the road segment in Mercator meters.",
                        "localrank": "Number. Used for shield points only. Priority relative to nearby shields. Useful for limiting shield density.",
                        "name": "Local name of the road",
                        "name_ar": "Arabic name of the road",
                        "name_de": "German name of the road",
                        "name_en": "English name of the road",
                        "name_es": "Spanish name of the road",
                        "name_fr": "French name of the road",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the road",
                        "name_ru": "Russian name of the road",
                        "name_zh": "Chinese name of the road",
                        "name_zh-Hans": "Simplified Chinese name of the road",
                        "ref": "Route number of the road",
                        "reflen": "Number. How many characters long the ref tag is. Useful for shield styling.",
                        "shield": "The shield style to use. One of: default, mx-federal, mx-state, us-highway, us-highway-alternate, us-highway-business, us-highway-duplex, us-interstate, us-interstate-business, us-interstate-duplex, us-interstate-truck, us-state"
                    },
                    "id": "road_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "class": "One of: river, canal, stream, stream_intermittent",
                        "name": "Local name of the waterway",
                        "name_ar": "Arabic name of the waterway",
                        "name_de": "German name of the waterway",
                        "name_en": "English name of the waterway",
                        "name_es": "Spanish name of the waterway",
                        "name_fr": "French name of the waterway",
                        "name_ja": "Japanese name of the country",
                        "name_ko": "Korean name of the country",
                        "name_pt": "Portuguese name of the waterway",
                        "name_ru": "Russian name of the waterway",
                        "name_zh": "Chinese name of the waterway",
                        "name_zh-Hans": "Simplified Chinese name of the waterway",
                        "type": "One of: river, canal, stream"
                    },
                    "id": "waterway_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                },
                {
                    "description": "",
                    "fields": {
                        "house_num": "House number"
                    },
                    "id": "housenum_label",
                    "source": "mapbox.mapbox-streets-v7",
                    "source_name": "Mapbox Streets v7"
                }
            ],
            "sprite": "https://web-demo.aegirmaps.com/web-reference-app/aegir_maps/icons/icons"
        },
        version: 8,
        zoom: 17,
        bearing: 0,
        pitch: 0,
        minZoom: 14,
        maxZoom: 22,
        dragRotate: true,
        scrollZoom: true,
        boxZoom: true,
        doubleClickZoom: true,
        keyboard: true

        //,
        // maxBounds: config.useDefaultMapProvider ? null:
        // //restrict panning for venues that don't have a map provider.
        // //otherwise you're just panning white space
        // [venueBounds.sw.lng, venueBounds.sw.lat,
        //   venueBounds.ne.lng, venueBounds.ne.lat]

    });
    mapboxMap.showTileBoundaries = (aegir.getDebug() ? aegir.getDebug().showTileBoundaries : false);
    if (config.showZoomControls) {
        var nav = new mapboxgl.NavigationControl({
            showCompass: config.showCompassControls,
            showZoom: config.showZoomControls
        });
        mapboxMap.addControl(nav, config.controlsPosition);
    }
    return mapboxMap;
}

/**
 * Initialize configuration values my merging user-defined properties with default values
 * @memberof aegir
 * @private
 * @param {object} params source object
 * @param {string} propertyName the name of the property to check for a user-defined value
 * @param {string} defaultValue the default value if it doesnt exist in the source object
 * @param {object} targetObject the destination object to set the property on
 * @returns {boolean} true if user-defined or default value was specified
 */
aegir._configure = function (params, propertyName, defaultValue, targetObject) {
    var config = aegir.getConfig();
    var propertyValue = null;
    if (params.hasOwnProperty(propertyName) && params[propertyName] != null) {
        propertyValue = params[propertyName];
    } else if (defaultValue != null) {
        propertyValue = defaultValue
    } else {
        aegir.warn("Could not find property " + propertyName + " on object, and no default value specified.");
    }
    var target = targetObject || config;
    target[propertyName] = propertyValue;
    if (propertyValue) {
        aegir.log("[CFG] property: " + propertyName + ", value: " + target[propertyName]);
    }

    return propertyValue != null;
}

/**
 * Load Building Outline Layers
 * @memberof aegir
 * @private
 */
aegir._loadBuildingOutlines = function () {
    aegir.log("[START] Loading building outlines");
    var defaults = aegir.getDefaults();
    var layers = aegir.getLayers();
    var config = aegir.getConfig();
    var buildings = aegir.getBuildings();

    aegir.each(buildings, function (i, building) {
        var bldTileset = config.buildingOutlinesURL.replace("{BUILDING}", building.id),
            filterParam = ["==", "feature_id", building.id],
            pushVar = "feature_id",
            layerNamePrefix = "building_outlines_",
            layerNameSuffix = "_outline",
            fillColor = "#ffffff",
            layerVisibility = "visible";

        var sourceId = building.id;
        //todo, replace buildingoutlinesurl building_id
        var bounds = [building.bounds.sw.lng, building.bounds.sw.lat, building.bounds.ne.lng, building.bounds.ne.lat];

        aegir._addTileSource(sourceId, "vector", bldTileset, bounds);

        var buildingId = building.id;
        var layerId = layerNamePrefix + buildingId;
        var outlineLayerId = layerNamePrefix + buildingId + layerNameSuffix;
        aegir.each(defaults.styleObjs, function (index, style) {
            if ((style["layer-id"] == layerId)) {
                if (style["hidden"]) {
                    if (style["hidden"] == "true") {
                        layerVisibility = "none";
                    }
                }
                if (style["fill-color"] != null) {
                    fillColor = style["fill-color"];
                }
            }
        });
        aegir._addBuildingOutlines(buildingId, layerId, outlineLayerId, layerVisibility, filterParam, fillColor);
    });
    aegir.log("[END] Loading building outlines");
}

/**
 * @memberof aegir
 * @private
 * @param {string} layerId the name of the new layer to add
 * @param {string} outlineLayerId the name of the corresponding outline layer
 * @param {string} layerVisibility the visibility of the layer
 * @param {string} filterParam the filters for the layer
 * @param {string} fillColor the fill color for the layer
 */
aegir._addBuildingOutlines = function (sourceId, layerId, outlineLayerId, layerVisibility, filterParam, fillColor) {
    aegir.log("[START] Adding layer " + layerId + ", with filter param: " + filterParam + ", visibility: " + layerVisibility);

    var layers = aegir.getLayers();

    var layer = {
        "id": layerId,
        "type": "fill",
        "source": sourceId,
        "source-layer": sourceId,
        "layout": {
            "visibility": layerVisibility
        },

        "paint": {
            "fill-color": fillColor
        }
    };
    if (filterParam) {
        layer.filter = filterParam;
    }
    layers.map.addLayer(layer);

    var outlineSourceId = "geojson_" + sourceId ;
    var config = aegir.getConfig();
    var source = config.geojsonSources[outlineSourceId];
    if (!source) {
        source = aegir._createOutlineGeojsonSourceForBuilding(sourceId);
        config.geojsonSources[outlineSourceId] = source;
    }
    var outline = aegir._createOutlineLayer(layerId + "_outline", "", "outlines", layerVisibility, fillColor, 1, 2, filterParam, source);

    layers.map.addLayer(outline);
    aegir.log("Adding layer " + outline.id);

    if (outlineLayerId) {
        var outlineLayer = {
            "id": outlineLayerId,
            "type": "line",
            "source": sourceId,
            "source-layer": sourceId,
            "layout": {
                "visibility": layerVisibility
            },
            "paint": {
                "line-color": "#ff0000",
                "line-width": 4
            }
        };
        if (filterParam) {
            outlineLayer.filter = filterParam;
        }
        //  layers.map.addLayer(outlineLayer);
    }
    aegir.log("[END] Add layer " + layerId);
}

/**
 * Load Building Outline Layers
 * @memberof aegir
 * @private
 */
aegir._loadRasterBuildingOutlines = function () {

    var config = aegir.getConfig();
    var defaults = aegir.getDefaults();
    var layers = aegir.getLayers();
    var buildings = aegir.getBuildings();

    aegir.each(buildings, function (i, building) {

        var bounds = [building.bounds.sw.lng, building.bounds.sw.lat, building.bounds.ne.lng, building.bounds.ne.lat];
        var bldTileset = config.rasterBuildingOutlinesURL.replace("{BUILDING}", building.id),
            layerNamePrefix = "building_raster_outlines_";

        var layerId = layerNamePrefix + building.id;
        var sourceId = building.id;
        aegir._addTileSource(sourceId, "raster", bldTileset, bounds);

        layers.map.addLayer({
            "id": layerId,
            "type": "raster",
            "source": sourceId
        });
    });
}

/**
 * Adds map sources with safety check
 * @memberof aegir
 * @private
 */
aegir._addTileSource = function (sourceId, type, tileset, bounds) {
    var map = aegir.getLayers().map;
    if (!map.getSource(sourceId)) {
        aegir.log("[START] Adding tile source: " + sourceId + " of type: " + type + " with bounds: " + bounds + " tileset: " + tileset);
        var sourceDefinition = {
            "type": type,
            "tiles": [tileset],
            "bounds": bounds,
            "minzoom": 1.0,
            "maxzoom": 23.0
        };
        map.addSource(sourceId, sourceDefinition);
        map.getSource(sourceId).on("error", aegir._onMapboxMapError);

        aegir.log("[END] Adding tile source: " + sourceId + " of type: " + type);
    }
}
/**
 * Load global map Layers
 * @memberof aegir
 * @private
 */
aegir._loadGlobalLayers = function () {
    var config = aegir.getConfig();
    var defaults = aegir.getDefaults();
    var layers = aegir.getLayers();
    var bounds = [defaults.mapBounds.swLong, defaults.mapBounds.swLat, defaults.mapBounds.neLong, defaults.mapBounds.neLat];

    aegir.each(layers.globalLayers, function (globalIndex, globalObject) {
        //console.log(objectIndex + " - " + vectorObject[0] + " : " + vectorObject[1] + " : " + vectorObject[2] + " : " + vectorObject[3]);
        var filterParam = [],
            layerId = globalObject[0],
            layerMatcherKey = globalObject[1],
            layerMatcherValues = globalObject[2],
            layerVisibility = "visible",
            fillColor = "#ffffff",
            classString = layerMatcherValues.toString(),
            layerClass = String(classString),
            layerOpacity = 1,
            lineOpacity = 1,
            pushVar = layerMatcherKey;


        if (layerMatcherValues.length > 1) {
            filterParam.push("in");
            filterParam.push(pushVar);

            aegir.each(layerMatcherValues, function (classIndex, className) {
                filterParam.push(className);
            });
        } else {
            filterParam.push("==");
            filterParam.push(pushVar);
            filterParam.push(layerClass);
        }

        var fillColor = "#ffffff",
            fillColorOutline = "#ffffff",
            fillColorSelected = fillColor,
            fillPattern = null,
            layerVisibility = "visible";

        switch (layerId) {

            case "venue":
                aegir.each(defaults.styleObjs, function (index, style) {
                    if ((style["layer-id"] == layerId)) {
                        if (style["hidden"]) {
                            if (style["hidden"] == "true") {
                                layerVisibility = "none";
                            }
                        }
                        if (style["fill-color"] != null) {
                            fillColor = style["fill-color"];
                        }
                    }
                });

                var bldTileset = config.buildingOutlinesURL.replace("{BUILDING}", "venue_outdoors"),
                    filterParam = [],
                    pushVar = "feature_id";
                filterParam.push("==");
                filterParam.push(pushVar);
                filterParam.push("venue_outdoors");

                aegir._addTileSource("venue_outdoors", "vector", bldTileset, bounds);

                //todo: rename this method, it's EXTREMELY CONFUSING
                //this is just adding a generic layer for the venue outdoors
                //that uses the building_outlines tile source
                aegir._addBuildingOutlines("venue_outdoors", layerId, null, layerVisibility, filterParam, fillColor);

                break;
            case "background":
                if (config.useDefaultMapProvider !== true) {
                    aegir.each(defaults.styleObjs, function (index, style) {
                        if (style["layer-id"] == layerId) {
                            layerVisibility = style["hidden"] == "true" ? "none" : "visible";

                            if (style["fill-color"] != null) {
                                fillColor = style["fill-color"];
                            }
                            return false;
                        }

                    });

                    aegir.log("Adding layer " + layerId);
                    layers.map.addLayer({
                        "id": layerId,
                        "type": layerId,
                        "layout": {
                            "visibility": layerVisibility
                        },
                        "paint": {
                            "background-color": fillColor
                        }
                    });

                    aegir.setBackgroundAlpha(config.backgroundAlpha);
                }
                break;
            default:
                break;
        }
    });
}
/**
 * Hide map layers associated with specific map floors
 * @memberof aegir
 * @private
 * @param {string[]} indoorFloors list of ids for indoor floors to NOT hide
 * @param {string[]} outdoorFloors list of ids for outdoor floors to NOT hide
 */
aegir._hideFloors = function (indoorFloors, outdoorFloors) {
    aegir.log("[START] Hiding indoor floors except: " + indoorFloors.join() +" and outdoor floors: " + outdoorFloors.join());
    let defaults = aegir.getDefaults();
    let layers = aegir.getLayers();

    let visibleFloors = defaults.currentIndoorFloors.concat(defaults.currentOutdoorFloors) ;
    let nextFloors = indoorFloors.concat(outdoorFloors);

    let floorsToActuallyHide = [];

    //only hide layers that are currently visible AND won't be visible in the updated floor list
    for( let i = 0; i < visibleFloors.length; i++ )
    {
        let floorId = visibleFloors[i];
        if(!nextFloors.includes(floorId))
        {
            floorsToActuallyHide.push(floorId);
        }
    }

    aegir.each( floorsToActuallyHide, function(floorNdx, floorId){
        aegir.each( layers.map.getStyle().layers , function(ndx, layer){
            //TODO: Standardize layer naming pattern like other ios/Android sdks
            if( layer.id.endsWith(floorId) || layer.id.indexOf("_" + floorId + "_") != -1 ) {
                layers.map.setLayoutProperty(layer.id, "visibility", "none");
            }
        });

        if (aegir.wf) {
            aegir.wf._hideFloor(floorId);
        }

        //remove any annotations on this floor
        var visibleAnnotations = layers.annotations[floorId];
        if (visibleAnnotations != null) {
            aegir.each(visibleAnnotations, function (i, annotation) {
                annotation.remove();
            });
        }
        //hide debug layer bounding boxes
        if (aegir.getDebug().showFloorBoundingBoxes) {

            var floor = aegir.findFloorWithId(floorId) || aegir.findOutdoorFloorWithId(floorId);
            aegir.debug._removeFloorBoundingBox(floor);
        }
    });

    defaults.currentIndoorFloors = indoorFloors;
    defaults.currentOutdoorFloors = outdoorFloors;


    aegir.log("[END] Hiding indoor floors except: " + indoorFloors.join() + " and outdoor floors: " + outdoorFloors.join());

};

aegir._debugLayers = function()
{
    aegir.log("[START]*** DEBUG layers: " );
    var map = aegir.getLayers().map;
    var styleLayers = map.getStyle().layers;
    for( let i = 0; i < styleLayers.length; i++ )
    {
        let layer =  styleLayers[i];
        let visibility = map.getLayoutProperty(layer.id, 'visibility');

        aegir.log("Layer[" + i + "]= " + layer.id + ", visible: " + visibility);
    }
    aegir.log("[END]*** DEBUG layers " );
}
/**
 * Load map layers for a particular floor
 * @memberof aegir
 * @private
 * @param {string} floorId the id of the floor to show
 */
aegir._showFloor = function (floorId) {
    aegir.log("[START] Showing floor: " + floorId);

    var config = aegir.getConfig();
    var layers = aegir.getLayers();
    var floor = aegir.findFloorWithId(floorId) || aegir.findOutdoorFloorWithId(floorId);

    if (aegir.wf) {
        aegir.wf._showFloor(floorId);
    }

    if (config.renderMode == aegir.RENDER_MODES.VECTOR) {
        aegir._loadVectorLayers(floorId);
    }
    //TODO: Need to be able to support art-tiles for multiple outdoor floors. Currently, only works with floor_vo_1
    //  if (config.renderMode == aegir.RENDER_MODES.RASTER || floorId.startsWith("floor_vo_1")) {
    aegir._loadRasterLayers(floorId);
    //  }
    if (config.renderMode == aegir.RENDER_MODES.VECTOR ||
        (config.renderMode == aegir.RENDER_MODES.RASTER && config.processingMode == aegir.PROCESSING_MODES.DEFAULT)) {
        aegir._loadCommonLayers(floorId);
    }
    if (config.renderMode == aegir.RENDER_MODES.VECTOR) {
        aegir._loadPendingStyles(floorId);
        aegir.each(layers.customStyleLayers, function (ndx, layerId) {
            if (layerId.includes(floorId) && layers.map.getLayer(layerId)) {
                aegir.log("Showing custom style layer: " + layerId);
                layers.map.setLayoutProperty(layerId, "visibility", "visible");
            }
        });
    }

    var visibleAnnotations = layers.annotations[floorId];
    if (visibleAnnotations != null) {
        aegir.each(visibleAnnotations, function (i, annotation) {
            annotation.addTo(layers.map);
        });
    }

    if (aegir.getDebug().showFloorBoundingBoxes) {
        aegir.debug._addFloorBoundingBox(floor);
    }
    aegir.log("[END] Showing floor: " + floorId);
}

/**
 * Loads map layers for common vector/reaster building features
 * @memberof aegir
 * @private
 * @param {vmMapBuilding} buildingObj the object wth the building properties
 */
aegir._loadCommonBuildingLayers = function (buildingObj) {
    aegir.log("[START] Loading common building layers for " + buildingObj.id);
    var layers = aegir.getLayers();
    var defaults = aegir.getDefaults();
    var center = aegir.getCoordinateCenterById(buildingObj.id);

    var sourceId = "building_common_" + buildingObj.id;
    var buildingLabelFeature = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "BUILDING_ID": buildingObj.id,
                    "NAME": buildingObj.name,
                    "FEATURE_ID": buildingObj.id,
                    "class": "building-label"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [center.lat, center.lng]
                }
            }
        ]
    }

    //common tile source
    if (!layers.map.getSource(sourceId)) {
        layers.map.addSource(sourceId, {
            'type': 'geojson',
            'data': buildingLabelFeature
        });
    }

    aegir.each(layers.commonBuildingLayers, function (commonIndex, commonObject) {
        var filterParam = [],
            layerKey = "building_" + commonObject[0] + "_" + buildingObj.id,
            layerId = "building_" + commonObject[0] + "_" + buildingObj.id,
            fontName = "Open Sans Regular",
            fontSize = "12",
            textValue = "4",
            fontColor = "#000000",
            fontStrokeColor = "#ffffff",
            fontStrokeWidth = "1.5",
            maxTextWidth = "4",
            layerVisibility = "visible";

        switch (commonObject[3]) {
            case "label":
                filterParam.push("in");
                filterParam.push("class");

                aegir.each(defaults.styleObjs, function (index, style) {
                    if ((style["layer-id"] == layerKey)) {
                        if (style["font-name"]) {
                            fontName = style["font-name"];
                        }

                        if (style["font-size"]) {
                            fontSize = style["font-size"];
                        }

                        if (style["text-value"]) {
                            textValue = style["text-value"];
                        }

                        if (style["font-color"]) {
                            fontColor = style["font-color"];
                        }

                        if (style["font-stroke-color"]) {
                            fontStrokeColor = style["font-stroke-color"];
                        }

                        if (style["font-stroke-width"]) {
                            fontStrokeWidth = style["font-stroke-width"];
                        }

                        if (style["max-text-width"]) {
                            maxTextWidth = style["max-text-width"];
                        }

                        if (style["hidden"]) {
                            if (style["hidden"] == "true") {
                                layerVisibility = "hidden";
                            }
                        }
                    }
                });

                aegir.each(commonObject[2], function (classIndex, className) {
                    filterParam.push(className);
                });

                if (layers.map.getLayer(layerId)) {
                    // layers.map.setLayoutProperty(layerId, "visibility", "visible");
                } else {
                    layers.map.addLayer({
                        "id": layerId,
                        type: "symbol",
                        "source": sourceId,
                        "layout": {
                            "icon-image": layerId,
                            "icon-allow-overlap": true,
                            "text-field": textValue,
                            "text-font": [fontName],
                            "text-size": parseInt(fontSize),
                            "text-max-width": parseInt(maxTextWidth),
                            "text-letter-spacing": 0.05,
                            "visibility": layerVisibility
                        },
                        "filter": filterParam,
                        "paint": {
                            "text-color": fontColor,
                            "text-halo-color": fontStrokeColor,
                            "text-halo-width": parseInt(fontStrokeWidth),
                            "text-opacity": 1
                        }
                    });
                }
                var buildings = aegir.getBuildings();
                if (defaults.currentIndoorFloors.length > 0) {
                    aegir.each(defaults.currentIndoorFloors, function (floorIndex, indoorFloorId) {
                        var floor = aegir.findFloorWithId(indoorFloorId);
                        var tmpLayerId = "building_" + "labels" + "_" + floor.buildingId;
                        if (layers.map.getLayer(tmpLayerId)) {
                            layers.map.setLayoutProperty(tmpLayerId, "visibility", "none");
                        }
                    });
                }

                break;
        }

    });

    aegir.log("[END] Loading common building layers");

}

/**
 * Force refresh label& icon layers
 * @memberof aegir
 * @private
 */
aegir._refreshBuildingLabelLayers = function () {
    var buildings = aegir.getBuildings();
    //There will never be buildig labels displayed for venues with only 1 building
    if (buildings.length <= 1) {
        return;
    }

    var layers = aegir.getLayers();
    var defaults = aegir.getDefaults();
    aegir.each(buildings, function (buildingIndex, building) {
        layers.map.setLayoutProperty("building_" + "labels" + "_" + building.id, "visibility", "visible");
    });
    if (defaults.currentIndoorFloors.length > 0) {
        aegir.each(defaults.currentIndoorFloors, function (floorIndex, indoorFloorId) {
            var floor = aegir.findFloorWithId(indoorFloorId);
            if (floor != null) {
                layers.map.setLayoutProperty("building_" + "labels" + "_" + floor.buildingId, "visibility", "none");
            }
        });
    }
}

/**
 * Load label/icon map layers for a particular floor
 * @memberof aegir
 * @private
 * @param {string} floorId the id of the floor
 */
aegir._loadCommonLayers = function (floorId) {
    aegir.log("[START] Loading common layers for floor " + floorId);
    var config = aegir.getConfig();
    var layers = aegir.getLayers();
    var defaults = aegir.getDefaults();
    var floor = aegir.findFloorWithId(floorId) || aegir.findOutdoorFloorWithId(floorId);
    if( !floor )
    {
        aegir.warn("Trying to load layers for invalid floor: " + floorId);
        return;
    }
    var bounds = [floor.bounds.sw.lng, floor.bounds.sw.lat, floor.bounds.ne.lng, floor.bounds.ne.lat];
    var commonTileset = config.commonTilesetURL.replace("{FLOOR}", floorId);
    var tileset = config.tilesetURL.replace("{FLOOR}", floorId);

    // common tile source
    aegir._addTileSource("common_" + floorId, "vector", commonTileset, bounds);

    //todo: cleanup/simplify
    aegir.each(layers.commonLayers, function (commonIndex, commonObject) {
        var filterParam = [],
            iconImage,
            layerKey = "floor_" + commonObject[0] + "_" + floorId,
            layerId = "floor_" + commonObject[0] + "_" + floorId,
            fontName = "Open Sans Regular",
            fontSize = "12",
            textValue = "4",
            fontColor = "#000000",
            fontStrokeColor = "#ffffff",
            fontStrokeWidth = "1.5",
            maxTextWidth = "4",
            layerVisibility = "visible";

        switch (commonObject[2]) {
            case "icon":
                aegir.each(commonObject[1], function (classIndex, className) {
                    filterParam = ["==", "class", className];

                    aegir.each(defaults.styleObjs, function (index, style) {
                        if ((style["layer-id"] == layerKey)) {
                            if (style["icon-name"]) {
                                iconImage = style["icon-name"];
                            }
                            if (style["hidden"]) {
                                if (style["hidden"] == "true") {
                                    layerVisibility = "hidden";
                                }
                            }
                        }
                    });
                    var finalLayerId = layerId + "_ " + className + "_icon";
                    if (layers.map.getLayer(finalLayerId)) {
                        layers.map.setLayoutProperty(finalLayerId, "visibility", "visible");
                    } else {
                        aegir.log("Adding icon layer " + finalLayerId + " with icon-image " + iconImage);
                        layers.map.addLayer({
                            "id": finalLayerId,
                            "type": "symbol",
                            "source": "common_" + floorId,
                            "source-layer": floorId,
                            "filter": filterParam,
                            "layout": {
                                "icon-image": iconImage,
                                "visibility": layerVisibility
                            }
                        });
                    }
                });
                break;

            case "label":
                filterParam.push("in");
                filterParam.push("class");

                aegir.each(defaults.styleObjs, function (index, style) {
                    if ((style["layer-id"] == layerKey)) {
                        if (style["font-name"]) {
                            fontName = style["font-name"];
                        }

                        if (style["font-size"]) {
                            fontSize = style["font-size"];
                        }

                        if (style["text-value"]) {
                            textValue = style["text-value"];
                        }

                        if (style["font-color"]) {
                            fontColor = style["font-color"];
                        }

                        if (style["font-stroke-color"]) {
                            fontStrokeColor = style["font-stroke-color"];
                        }

                        if (style["font-stroke-width"]) {
                            fontStrokeWidth = style["font-stroke-width"];
                        }

                        if (style["max-text-width"]) {
                            maxTextWidth = style["max-text-width"];
                        }

                        if (style["hidden"]) {
                            if (style["hidden"] == "true") {
                                layerVisibility = "hidden";
                            }
                        }
                    }
                });

                aegir.each(commonObject[1], function (classIndex, className) {
                    filterParam.push(className);
                });

                if (layers.map.getLayer(layerId)) {
                    layers.map.setLayoutProperty(layerId, "visibility", "visible");
                    if (defaults.currentOutdoorFloors.length > 0) {
                        aegir.each(defaults.currentOutdoorFloors, function (floorIndex, outdoorFloorId) {
                            var outdoorFloor = aegir.findOutdoorFloorWithId(outdoorFloorId);
                            aegir.each(defaults.currentIndoorFloors, function (floorIndex, indoorFloorId) {
                                var indoorFloor = aegir.findFloorWithId(indoorFloorId);
                                if (indoorFloor != null && outdoorFloor.ordinal != indoorFloor.ordinal) {
                                    layers.map.setPaintProperty("floor_" + commonObject[0] + "_" + outdoorFloorId, "text-opacity", 0.2);
                                } else {
                                    layers.map.setPaintProperty("floor_" + commonObject[0] + "_" + outdoorFloorId, "text-opacity", 1);
                                }
                            });
                        });
                    }
                } else {
                    layers.map.addLayer({
                        "id": layerId,
                        "type": "symbol",
                        "source": "common_" + floorId,
                        "source-layer": floorId,
                        "layout": {
                            "icon-image": layerId,
                            "icon-allow-overlap": true,
                            "text-field": textValue,
                            "text-font": [fontName],
                            "text-size": parseInt(fontSize),
                            "text-max-width": parseInt(maxTextWidth),
                            "text-letter-spacing": 0.05,
                            "visibility": layerVisibility
                        },
                        "filter": filterParam,
                        "paint": {
                            "text-color": fontColor,
                            "text-halo-color": fontStrokeColor,
                            "text-halo-width": parseInt(fontStrokeWidth),
                            "text-opacity": 1
                        }
                    });
                    if (defaults.currentOutdoorFloors.length > 0) {
                        aegir.each(defaults.currentOutdoorFloors, function (floorIndex, outdoorFloorId) {
                            var outdoorFloor = aegir.findOutdoorFloorWithId(outdoorFloorId);
                            aegir.each(defaults.currentIndoorFloors, function (floorIndex, indoorFloorId) {
                                var indoorFloor = aegir.findFloorWithId(indoorFloorId);
                                if (indoorFloor != null && outdoorFloor.ordinal != indoorFloor.ordinal) {
                                    layers.map.setPaintProperty("floor_" + commonObject[0] + "_" + outdoorFloorId, "text-opacity", 0.2);
                                }
                            });
                        });
                    }
                }

                break;
        }

    });


    aegir.log("[END] Loading common layers for floor " + floorId);
}


/**
 * Load shape map layers for a particular floor
 * @memberof aegir
 * @private
 * @param {string} floorId the id of the floor
 */
aegir._loadVectorLayers = function (floorId) {
    //This WHOLE method needs to be cleaned up aLOT
    var config = aegir.getConfig();
    var layers = aegir.getLayers();
    var defaults = aegir.getDefaults();
    var floor = aegir.findFloorWithId(floorId) || aegir.findOutdoorFloorWithId(floorId);
    if( !floor )
    {
        aegir.warn("Trying to load layers for invalid floor: " + floorId);
        return;
    }
    var bounds = [floor.bounds.sw.lng, floor.bounds.sw.lat, floor.bounds.ne.lng, floor.bounds.ne.lat];
    var tileset = config.tilesetURL.replace("{FLOOR}", floorId);

    // vector tile source
    aegir._addTileSource("tiles_" + floorId, "vector", tileset, bounds);

    var outlineSourceId = "geojson_" + floorId;
    //note for some reason you can't give id's to mapbox geojson sources that get addded via addSource ( I think )
    //so we have to manually maintain these special data sources
    var source = config.geojsonSources[outlineSourceId];
    if (!source) {
        source = aegir._createOutlineGeojsonSourceForFloor(floorId);
        config.geojsonSources[outlineSourceId] = source;
    }


    if (defaults.styleObjs) {

        //todo: Cleanup/simplify
        aegir.each(layers.vectorLayers, function (objectIndex, vectorObject) {
            //console.log(objectIndex + " - " + vectorObject[0] + " : " + vectorObject[1] + " : " + vectorObject[2] + " : " + vectorObject[3]);

            var filterParam = [],
                layerName = vectorObject[0],
                layerMatcherKey = vectorObject[1],
                layerMatcherValues = vectorObject[2],
                layerType = vectorObject[3],
                classString = layerMatcherValues.toString(),
                layerId = "floor_" + layerName + "_" + floorId,
                layerKey = "floor_" + layerName + "_" + floorId,
                layerKeySelected = "floor_selected_unit_" + floorId,
                layerClass = String(classString),
                layerOpacity = 1,
                lineOpacity = 1,
                pushVar = layerMatcherKey,
                //Note: Old vector tile generator used to only use lower-case property names
                //but new version keeps property name the same case as the input values
                floorFilter = ["any", ["==", "FLOOR_ID", floorId], ["==", "floor_id", floorId]];

            aegir.log("Updating vector layers " + layerName + " on " + floorId);

            if (layerMatcherValues.length > 0) {
                filterParam.push(layerMatcherValues.length == 1 ? "==" : "in");
                filterParam.push(pushVar);

                aegir.each(layerMatcherValues, function (classIndex, className) {
                    filterParam.push(className);
                });
            }
            filterParam = ["all", filterParam, floorFilter]
            var fillColor = "#ffffff",
                fillColorOutline = "#ffffff",
                fillColorSelected = fillColor,
                fillPattern = null,
                layerVisibility = "visible";

            if (layerType === "polyfill") {

                aegir.each(defaults.styleObjs, function (index, style) {
                    if ((style["layer-id"] === layerKey)) {
                        if (style["fill-color"] != null) {
                            fillColor = style["fill-color"];
                            fillColorOutline = style["fill-color"];
                            fillColorSelected = fillColor;
                        }
                        if (style["fill-pattern"] != null) {
                            fillPattern = style["fill-pattern"];
                        }
                        if (style["outline-color"] != null) {
                            fillColorOutline = style["outline-color"];
                        } else {
                            fillColorOutline = fillColor;
                        }

                        if (style["hidden"] === "true") {
                            layerVisibility = "none";
                        }
                    }

                    if ((style["layer-id"] === layerKeySelected)) {
                        fillColorSelected = style["fill-color"];
                    }
                });


                if (layers.map.getLayer(layerId)) {
                    aegir.log("Setting visiblity to " + layerVisibility + " for " + layerName);
                    layers.map.setLayoutProperty(layerId, "visibility", layerVisibility);
                    layers.map.setLayoutProperty(layerId + "_outline", "visibility", layerVisibility);


                    var matches = aegir.grep( defaults.currentOutdoorFloors, function( id){
                        //find the outdoor floor that has the same ordinal as the indoor floor
                        aegir.log("Looking for outdoor floor with id " + id);
                        var outdoorFloor = aegir.findOutdoorFloorWithId(id);

                        return outdoorFloor != null && outdoorFloor.ordinal === floor.ordinal;
                    });
                    //set each matching outdoor floor to visible
                    aegir.each(matches, function(f, id){
                        var outdoorLayerId = "floor_" + layerName + "_" + id;
                        var outdoorLayerOutlineId = outdoorLayerId + "_outline";
                        layers.map.setPaintProperty(outdoorLayerId, "fill-opacity", 1.0);
                        layers.map.setPaintProperty(outdoorLayerOutlineId, "line-opacity", 1.0);
                    });
                    // Change opacity of outdoor layer when current floor is not same ordinal as outdoor floor.
                    // aegir.each(defaults.currentOutdoorFloors, function (floorIndex, outdoorFloorId) {
                    //     var outdoorFloor = aegir.findOutdoorFloorWithId(outdoorFloorId);
                    //     aegir.each(defaults.currentIndoorFloors, function (floorIndex, indoorFloorId) {
                    //         var outdoorLayerId = "floor_" + layerName + "_" + outdoorFloorId;
                    //         var outdoorLayerOutlineId = outdoorLayerId + "_outline";
                    //         var sameOrdinal = outdoorFloor.ordinal === indoorFloor.ordinal;
                    //         var opacity =  sameOrdinal ? 1.0 : 0.2;
                    //         if( layerVisibility === "visible") {
                    //             layers.map.setLayoutProperty(outdoorLayerId, "visibility", sameOrdinal? layerVisibility: "none" );
                    //             layers.map.setLayoutProperty(outdoorLayerOutlineId + "_outline", "visibility", sameOrdinal? layerVisibility: "none");
                    //         }
                    //         layers.map.setPaintProperty(outdoorLayerId, "fill-opacity", opacity);
                    //         layers.map.setPaintProperty(outdoorLayerOutlineId, "line-opacity", opacity);
                    //
                    //     });
                    // });

                } else {

                    // Change opacity of outdoor layer when current floor is not same ordinal as outdoor floor.
                    aegir.each(defaults.currentOutdoorFloors, function (floorIndex, outdoorFloorId) {
                        var outdoorFloor = aegir.findOutdoorFloorWithId(outdoorFloorId);
                        aegir.each(defaults.currentIndoorFloors, function (floorIndex, indoorFloorId) {
                            var indoorFloor = aegir.findFloorWithId(indoorFloorId);
                            if (indoorFloor != null && outdoorFloor.ordinal !== indoorFloor.ordinal) {
                                var outdoorLayerId = "floor_" + layerName + "_" + outdoorFloorId;
                                var outdoorLayerOutlineId = outdoorLayerId + "_outline";
                                if (layers.map.getLayer(outdoorLayerId)) {
                                    layers.map.setPaintProperty(outdoorLayerId, "fill-opacity", 0.2);
                                }
                                if (layers.map.getLayer(outdoorLayerOutlineId)) {
                                    layers.map.setPaintProperty(outdoorLayerOutlineId, "line-opacity", 0.2);
                                }
                            }
                        });
                    });


                    aegir.log("Adding layer " + layerId + " with filter: " + filterParam);
                    if (fillPattern !== null) {
                        layers.map.addLayer({
                            "id": layerId,
                            "metadata": {"floorId": floorId, "layerType": layerType},
                            "type": "fill",
                            "source": "tiles_" + floorId,
                            "source-layer": floorId,
                            "layout": {
                                "visibility": layerVisibility
                            },
                            "filter": filterParam,
                            "paint": {
                                "fill-pattern": fillPattern,
                                "fill-opacity": layerOpacity
                            }
                        });
                    } else {
                        layers.map.addLayer({
                            "id": layerId,
                            "metadata": {"floorId": floorId, "layerType": layerType},
                            "type": "fill",
                            "source": "tiles_" + floorId,
                            "source-layer": floorId,
                            "layout": {
                                "visibility": layerVisibility
                            },
                            "filter": filterParam,
                            "paint": {
                                "fill-color": fillColor,
                                "fill-opacity": layerOpacity
                            }
                        });
                    }

                    var outline = aegir._createOutlineLayer(layerId + "_outline", floorId, layerName, layerVisibility, fillColorOutline, lineOpacity, 2, filterParam, source);
                    layers.map.addLayer(outline);
                    aegir.log("Adding layer " + outline.id);
                }

                if (layerName != "outlines") {
                    if (layers.map.getLayer(layerId + "_highlighted")) {
                        layers.map.setLayoutProperty(layerId + "_highlighted", "visibility", "visible");
                        layers.map.setLayoutProperty(layerId + "_highlighted_outline", "visibility", "visible");
                    } else {
                        aegir.log("Adding layer " + layerId + "_highlighted");

                        layers.map.addLayer({
                            "id": layerId + "_highlighted",
                            "metadata": {"floorId": floorId, "layerId": layerId},
                            "type": "fill",
                            "source": "tiles_" + floorId,
                            "source-layer": floorId,
                            "paint": {
                                "fill-color": fillColorSelected
                            },
                            "filter": ["==", "feature_id", ""]
                        });


                        aegir.log("Adding layer " + layerId + "_highlighted_outline");

                        layers.map.addLayer({
                            "id": layerId + "_highlighted_outline",
                            "metadata": {"floorId": floorId, "layerId": layerId},
                            "type": "line",
                            "source": "tiles_" + floorId,
                            "source-layer": floorId,
                            "paint": {
                                "line-color": fillColorSelected,
                                "line-width": 2
                            },
                            "filter": ["==", "feature_id", ""]
                        });
                    }
                }

            } else if (layerType === "line") {
                aegir.each(defaults.styleObjs, function (index, style) {
                    if ((style["layer-id"] == layerKey)) {
                        fillColor = style["line-color"] || fillColor;
                    }
                });

                if (layers.map.getLayer(layerId)) {
                    layers.map.setLayoutProperty(layerId, "visibility", layerVisibility);
                } else {
                    aegir.log("Adding layer " + layerId);

                    layers.map.addLayer({
                        "id": layerId,
                        "metadata": {"floorId": floorId},
                        "type": "line",
                        "source": "tiles_" + floorId,
                        "source-layer": floorId,
                        "layout": {
                            "line-join": "round",
                            "line-cap": "round",
                            "visibility": layerVisibility
                        },
                        "filter": filterParam,
                        "paint": {
                            "line-color": fillColor,
                            "line-width": 1
                        }
                    });
                    if (layerType !== "line") {
                        var outline = aegir._createOutlineLayer(layerId, floorId, "", layerVisibility, fillColor, 1.0, 1, filterParam);
                        layers.map.addLayer(outline);
                        aegir.log("Adding layer " + outline.id);

                    }
                }
            }
        });
    }
}
/**
 * Create outline shape geojson sources for a particular building
 * @memberof aegir
 * @private
 * @param {string} buildingId the id of the building
 */
//Note: Manually creating geojson outline shapes is a workaround for a bug
//in vector tiles currently being generated. They are getting their shapes closed
//along the tile boundaries which is causing lines to show up in rendered tiles.
// To work around this, we generate the outline shapes manually until this issue
//is resolved in VMMS.
aegir._createOutlineGeojsonSourceForBuilding = function (buildingId) {
    aegir.log("[START] Creating geojson source for " + buildingId);
    var features = [];
    var source = {

        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": features
        }
    };

    var building = null;
    aegir.each(aegir.getBuildings(), function (i, b) {
        if (b.id == buildingId) {
            building = b;
            return false;
        }
    });
    aegir.each(aegir.getDefaults().unitData_JSON.features, function (i, feature) {
        var featureBuildingId = feature.properties.BUILDING_ID;
        var featureId = feature.properties.FEATURE_ID;

        feature.properties.feature_id = featureId;
        feature.properties.building_id = featureBuildingId;
        features.push(feature);

    });
    aegir.log("[END] Geojson source for building " + buildingId + "has " + features.length + " features");
    return source;
}
/**
 * Create outline shape geojson sources for a particular floor
 * @memberof aegir
 * @private
 * @param {string} floorId the id of the floor
 */
//Note: Manually creating geojson outline shapes is a workaround for a bug
//in vector tiles currently being generated. They are getting their shapes closed
//along the tile boundaries which is causing lines to show up in rendered tiles.
// To work around this, we generate the outline shapes manually until this issue
//is resolved in VMMS.
aegir._createOutlineGeojsonSourceForFloor = function (floorId) {
    aegir.log("[START] Creating geojson source for " + floorId);
    var features = [];
    var source = {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": features
        }
    };

    var floor = aegir.findFloorObjForFloorId(floorId);
    aegir.each(aegir.getDefaults().unitData_JSON.features, function (i, feature) {
        var featureFloorId = feature.properties.FLOOR_ID;
        var unitId = feature.properties.UNIT_ID;
        var featureId = feature.properties.FEATURE_ID;
        if (featureFloorId && (featureFloorId == featureId || (unitId == featureId && floorId == featureFloorId))) {
            features.push(feature);
        }
    });
    aegir.log("[END] Geojson source for floor " + floorId + "has " + features.length + " features");

    return source;
}

/**
 * Create outline layer
 * @memberof aegir
 * @private
 */
aegir._createOutlineLayer = function (layerId, floorId, layerType, layerVisibility, lineColor, lineOpacity, lineWidth, filterParam, source) {
    aegir.log("Creating outline layer " + layerId + " with visibility: " + layerVisibility + " with filter params: " + filterParam);
    var outlineFeatures = [];
    var outline = {
        "id": layerId,
        "metadata": {"floorId": floorId, "layerType": layerType},
        "type": "line",
        "source": source,
        "layout": {
            "visibility": layerVisibility
        },
        "filter": filterParam,
        "paint": {
            "line-color": lineColor,
            "line-width": lineWidth,
            "line-opacity": lineOpacity
        }
    }

    return outline;
}
/**
 * Load map raster layers
 * @memberof aegir
 * @private
 * @param {string} floorId the id of the floor
 */
aegir._loadRasterLayers = function (floorId) {
    aegir.log("[START] load raster layers for floor " + floorId);
    var config = aegir.getConfig();
    var layers = aegir.getLayers();
    var floor = aegir.findFloorWithId(floorId) || aegir.findOutdoorFloorWithId(floorId);
    if( !floor )
    {
        aegir.warn("Trying to load layers for invalid floor: " + floorId);
        return;
    }
    var tilesetURL = config.renderMode == aegir.RENDER_MODES.VECTOR ? config.artTilesetURL : config.rasterTilesetURL;

    if (tilesetURL !== null && tilesetURL !== "") {
        var defaults = aegir.getDefaults();

        var bounds = [floor.bounds.sw.lng, floor.bounds.sw.lat, floor.bounds.ne.lng, floor.bounds.ne.lat];
        var rasterTileset = tilesetURL.replace("{FLOOR}", floorId);

        var layerId = floorId,
            layerVisibility = "visible",
            layerName = "",
            sourceId = floorId,
            layerKey = floorId;
        if( config.renderMode == aegir.RENDER_MODES.VECTOR) {
            if ( floorId.includes("vo")) {
                layerName = "outdoors";
                sourceId = layerName;
                layerKey = layerName;
                layerId = "floor_" + layerName + "_" + floorId;
            } else {
                layerName = "shadows";
                sourceId = "floor_" + layerName + "_" + floorId;
                layerKey = "floor_" + layerName + "_" + floorId;
                layerId = "floor_" + layerName + "_" + floorId;
            }

        }
        var foundStyleLayer = false;
        aegir.each(defaults.styleObjs, function (index, style) {
            if ((style["layer-id"] == layerKey)) {

                if (style["hidden"]) {

                    if (style["hidden"] == "true") {
                        layerVisibility = "none";
                    }
                    else {
                        foundStyleLayer = true;
                    }

                }
            }
        });

        if( foundStyleLayer === true)
        {
            aegir._addTileSource(sourceId, "raster", rasterTileset, bounds);

            // //TODO: Add bounds for raster source
            // if (!layers.map.getSource(sourceId)) {
            //   layers.map.addSource(sourceId, {
            //     "type": "raster",
            //     "tiles": [rasterTileset],
            //     "tileSize": 512
            //
            //   });
            //   layers.map.getSource(sourceId).on("error", aegir._onMapboxMapError);
            // }
            if (layers.map.getLayer(layerId)) {
                layers.map.setLayoutProperty(layerId, "visibility", layerVisibility);
            } else {

                aegir.log("Adding layer " + layerId + ", visibility: " + layerVisibility);

                layers.map.addLayer({
                    "id": layerId,
                    "type": "raster",
                    "source": sourceId,
                    "minzoom": 1,
                    "maxzoom": 23,
                    "layout": {
                        "visibility": layerVisibility
                    }
                });
            }
        }
    }

    aegir.log("[END] load raster layers for floor " + floorId);

};

/**
 * Load outdoor raster layers
 * @memberof aegir
 * @private
 * @since 1.2
 * @param {string} floorId the id of the outdoor floor
 */
aegir._loadRasterVenueOutdoors = function (floorId) {
    var config = aegir.getConfig();
    var layers = aegir.getLayers();

    if (config.artTilesetURL !== null && config.artTilesetURL !== "") {
        var defaults = aegir.getDefaults();
        var rasterOutdoorTileset = config.artTilesetURL.replace("{FLOOR}", floorId);

        var layerVisibility = "visible",
            layerKey = "outdoors";
        var matches = aegir.grep( defaults.styleObjs, function( obj ){
            return obj["layer-id"] === layerKey;
        });

        var styleLayer = matches.length > 0 ? matches[0]: null;
        if( styleLayer )
        {
            layerVisibility = styleLayer["hidden"] === "true" ? "none": layerVisiblity;
        }

        var sourceId = layerKey,
            layerId = floorId;
        //todo: Add bounds for raster tile source
        if (!layers.map.getSource(sourceId)) {
            layers.map.addSource(sourceId, {
                type: "raster",
                "tiles": [rasterOutdoorTileset],
                "tileSize": 512

            });

        }
        if (layers.map.getLayer(layerId)) {
            layers.map.setLayoutProperty(layerId, "visibility", layerVisibility);
        } else {
            layers.map.addLayer({
                "id": layerId,
                "type": "raster",
                "source": sourceId,
                "minzoom": 1,
                "maxzoom": 23,
                "layout": {
                    "visibility": layerVisibility
                }
            });
        }
    }
    if (aegir.procesingMode != aegir.PROCESSING_MODES.LEGACY) {
        aegir._loadCommonLayers(floorId);
    }
}

/**
 * Called when internal mapbox map is done loading
 * @memberof aegir
 * @private
 * @since 1.2
 */
aegir._mapboxMapDidFinishLoading = function () {
    aegir.log("[END] Mapbox load complete, configuring Mapbox map");
    var defaults = aegir.getDefaults();
    var layers = aegir.getLayers();
    var config = aegir.getConfig();
    config.mapLoaded = true;
    if (config.processingMode == aegir.PROCESSING_MODES.DEFAULT) {
        aegir._loadGlobalLayers();
        aegir.each(config.initialOutdoorFloors, function (index, floorId) {
            aegir._showFloor(floorId);
        });

        if (config.renderMode == aegir.RENDER_MODES.RASTER) {
            aegir._loadRasterBuildingOutlines();
        }
        aegir._loadBuildingOutlines();
    } else if (config.processingMode == aegir.PROCESSING_MODES.LEGACY) {
        //legacy specific setup
    }

    aegir.each(config.initialIndoorFloors, function (index, floorId) {
        aegir._showFloor(floorId);
    });

    // add building labels above building outlines
    if (config.processingMode == aegir.PROCESSING_MODES.DEFAULT) {
        aegir.each(aegir.getBuildings(), function (index, building) {
            aegir._loadCommonBuildingLayers(building);
        });
    }

    if (aegir.getDebug().showVenueBoundingBox) {
        aegir.debug._addVenueBoundingBox();
    }
    if (aegir.getDebug().showBuildingBoundingBoxes) {
        aegir.debug._addBuildingBoundingBoxes(aegir.getBuildings());
    }
};

/**
 * Called when internal mapbox map throws any error
 * @memberof aegir
 * @private
 * @since 1.2
 * @param {object} error the error object
 */
aegir._mapboxMapDidError = function (error) {
    if (error.tile != null && error.tile.state == "errored") {
        //ignore these
    } else {
        aegir.error(error);
    }
};

/**
 * Called when internal mapbox fires a click event
 * @memberof aegir
 * @private
 * @since 1.2
 * @param {object} e the event object
 */
aegir._mapboxMapDidTapAtCoordinate = function (e) {
    var location = {lng: e.lngLat.lng, lat: e.lngLat.lat};
    aegir.log("Tapped at (" + location.lat + "," + location.lng + ")");
    var config = aegir.getConfig();
    if (config.ignoreMapboxClickEvent === true) {
        aegir.log("Ingoring click event");
        return;
    }
    var mode = config.processingMode;
    var selectedUnit = null;
    if (mode == aegir.PROCESSING_MODES.DEFAULT) {
        aegir._didTapAtCoordinate(location);
    } else if (mode == aegir.PROCESSING_MODES.LEGACY) {
        aegir.legacy._didTapAtCoordinate(location);
    }
}
/**
 * Called when internal mapbox's camera changes
 * @memberof aegir
 * @private
 * @since 1.2
 * @param {object} e the event object
 */
aegir._mapboxMapDidChangeCameraPosition = function (e) {
    //  aegir.log("[START] aegir._mapboxMapDidChangeCameraPosition()");
    var mapboxMapView = e.target;
    var newCameraConfig = {
        location: mapboxMapView.getCenter(),
        zoom: mapboxMapView.getZoom(),
        bearing: mapboxMapView.getBearing(),
        tilt: mapboxMapView.getPitch()
    };
    var evt = new CustomEvent(aegir.EVENTS.DID_CHANGE_CAMERA_POSITION, {detail: newCameraConfig});
    document.dispatchEvent(evt);
    //  aegir.log("[END] aegir._mapboxMapDidChangeCameraPosition()");
}
/**
 * Handle user clicks/taps
 * @memberof aegir
 * @private
 * @since 1.2
 * @param {location} location the location of the click
 */
aegir._didTapAtCoordinate = function (location) {
    var found = false;
    var possibleSelectedUnit = null;
    var checkFloor = null;
    var defaults = aegir.getDefaults();
    aegir.each(defaults.currentIndoorFloors, function (i, floorId) {
        var floor = aegir.findFloorWithId(floorId);
        if (floor == null) {
            //BUG: This means an invalid floor id is in the currentIndoorFloors list
            return true;
        }
        var hitTest = aegir.mapUtil.pointIsInPolygon(location, floor.coordinates);
        if (hitTest) {
            checkFloor = floor;
            return false;
        }
    });
    if (checkFloor == null) {
        aegir.each(defaults.currentOutdoorFloors, function (i, floorId) {
            var floor = aegir.findOutdoorFloorWithId(floorId);

            var hitTest = aegir.mapUtil.pointIsInPolygon(location, floor.coordinates);
            if (hitTest) {
                checkFloor = floor;
                return false;
            }
        });
    }

    if (checkFloor != null) {
        var closestPointFeature = null;
        var closestPointFeatureDistance = Infinity;
        aegir.each(checkFloor.units, function (i, unit) {
            if( !unit.name ) return false;

            if (!unit.id.includes("walkway") &&
                aegir.mapUtil.pointIsInPolygon(location, unit.coordinates)) {
                possibleSelectedUnit = unit;
                found = true;
                return false;
            } else if (unit.id.includes("fixture") || unit.id.includes("amenity")) {
                var distance = aegir.mapUtil.distanceBetweenPoints(location, unit.coordinates[0]);
                if (distance < 15 && (closestPointFeature == null || distance < closestPointFeatureDistance)) {
                    closestPointFeatureDistance = distance;
                    closestPointFeature = unit;
                }
            }
        });
    }
    if (possibleSelectedUnit == null && closestPointFeature != null) {
        possibleSelectedUnit = closestPointFeature;
    }
    if (possibleSelectedUnit != null) {
        aegir.log("Tapped unit " + possibleSelectedUnit.id);
        evt = new CustomEvent(aegir.EVENTS.DID_SELECT_UNIT, {detail: possibleSelectedUnit});
        document.dispatchEvent(evt);

        return false;
    }
}

/**
 * Initial mapbox setup
 * @memberof aegir
 * @private
 * @param {onCompleteCallback} callback the callback when everything is complete
 */
aegir._initialLoad = function (callback) {
    var defaults = aegir.getDefaults();
    var layers = aegir.getLayers();
    var config = aegir.getConfig();

    layers.map.once("load", aegir._mapboxMapDidFinishLoading)
        .on("error", aegir._mapboxMapDidError)
        .on("click", aegir._mapboxMapDidTapAtCoordinate)
        .on("move", aegir._mapboxMapDidChangeCameraPosition)

    if (config.showZoomControls) {
        aegir._tryAttachZoomHandlers();
        var map = aegir.getLayers().map;
        map.on("zoomend", function (e) {
            var evt = new CustomEvent(aegir.EVENTS.DID_ZOOM, {
                detail: {
                    zoom: e.target.getZoom()
                }
            });
            document.dispatchEvent(evt);

            return false;
        });
    }
    aegir.createStyleObjs();

    aegir.each(config.initialIndoorFloors, function (index, floorId) {
        aegir.getCurrentFloors().push(floorId);
    });

    aegir.each(config.initialOutdoorFloors, function (index, floorId) {
        aegir.getCurrentOutdoorFloors().push(floorId);
    });

    //TODO: What if failure?
    callback("success", null);
};
/**
 * Retry attaching zoom handlers until success
 * @memberof aegir
 * @private
 * @param {vmMapBuilding[]} buildings the buildings
 * @returns {boolean} true if attached sucessfully
 */
aegir._tryAttachZoomHandlers = function () {
    aegir.log("Trying to attach zoom handlers");
    setTimeout(function () {
        if (!aegir._attachZoomHandlers()) {
            aegir._tryAttachZoomHandlers();
        } else {
            aegir.log("Succesfully attached zoom handlers.");
        }
    }, 250);
}
/**
 * Attach click handlers to zoom controls
 * @memberof aegir
 * @private
 * @param {vmMapBuilding[]} buildings the buildings
 * @returns {boolean} true if attached sucessfully
 */
aegir._attachZoomHandlers = function () {

    var zoomIn = document.getElementsByClassName("mapboxgl-ctrl-zoom-in");
    var zoomOut = document.getElementsByClassName("mapboxgl-ctrl-zoom-out");

    if (zoomIn.length == 0 || zoomOut.length == 0) return false;

    var map = aegir.getLayers().map;
    zoomIn[0].addEventListener("click", function (e) {
        var currentZoom = map.getZoom();
        var evt = new CustomEvent(aegir.EVENTS.WILL_ZOOM, {
            detail: {
                zoomStart: currentZoom,
                zoomEnd: currentZoom + 1
            }
        });
        document.dispatchEvent(evt);
        return false;
    });

    zoomOut[0].addEventListener("click", function (e) {

        var currentZoom = map.getZoom();
        var evt = new CustomEvent(aegir.EVENTS.WILL_ZOOM, {
            detail: {
                zoomStart: currentZoom,
                zoomEnd: currentZoom - 1
            }
        });
        document.dispatchEvent(evt);

        return false;
    });

    return true;

}
/**
 * Gets the bounds of the venue
 * @memberof aegir
 * @private
 * @returns {vmCoordinateBounds} the bounds of the venue
 */
aegir._getVenueBounds = function () {
    var allBuildingBounds = [];
    aegir.each(aegir.getBuildings().concat(aegir.getOutdoorBuildings()), function (i, building) {
        allBuildingBounds.push(building.bounds);
    });
    return aegir.mapUtil.unionOfCoordinateBounds(allBuildingBounds);
};

/**
 * Determines venue center and whether or not it's geolocated
 * based on the buildings located within
 * @memberof aegir
 * @private
 * @param {vmMapBuilding[]} buildings the buildings
 * @returns {object} venue information
 */
aegir._getVenueInfo = function (buildings) {
    aegir.log("[START] Getting venue info");

    var geolocated = false;
    var buildingCoordinates = [];
    aegir.each(buildings, function (i, building) {
        buildingCoordinates.push(building.center);
    });

    var venueCenter = aegir.mapUtil.centerOfCoordinates(buildingCoordinates);
    var nullIslandBoundary = aegir.mapUtil.coordinateBounds([{lat: -1, lng: -1}, {lat: 1, lng: 1}]);

    var venue = {
        center: venueCenter,
        geolocated: venueCenter != null && !aegir.mapUtil.boundsContainsPoint(nullIslandBoundary, venueCenter)
    };
    if (!venue.geolocated) {
        aegir.log("Venue is not geolocated, using default center of 0,0");
    }

    console.timeEnd("loadVenueMapData");
    aegir.log("[END] Getting venue info");

    //legacy properties
    venue.center_lat = venue.center.lat;
    venue.center_lng = venue.center.lng;
    return venue;
}

aegir._onMapboxMapError = function (error) {

}
//TODO: Move this to its own javascript file that can get concatenated during build
/**
 * Collection of map utility functions
 * @namespace aegir.mapUtil
 */
aegir.mapUtil = {};

/**
 * Converts degrees to radians
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {number} degrees the degree value
 * @returns value converted to radians
 */
aegir.mapUtil.degreesToRadians = function (degrees) {
    return (degrees / 180.0 * Math.PI);
}

/**
 * Converts radians to degrees
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {number} radians the radian value
 * @returns value converted to degrees
 */
aegir.mapUtil.radiansToDegrees = function (radians) {
    return (radians * (180.0 / Math.PI));
}
/**
 * Calculates the distance between two coordinates
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {location} start first coordinate
 * @param {location} end second coordinate
 * @returns distance calculated in METERS
 */
aegir.mapUtil.distanceBetweenPoints = function (start, end) {
    var R_METERS = 6378137;
    var dlon = aegir.mapUtil.degreesToRadians(end.lng - start.lng);
    var dlat = aegir.mapUtil.degreesToRadians(end.lat - start.lat);
    var a = Math.pow(Math.sin(dlat / 2.0), 2) +
        Math.cos(aegir.mapUtil.degreesToRadians(start.lat)) * Math.cos(aegir.mapUtil.degreesToRadians(end.lat)) *
        Math.pow(Math.sin(dlon / 2.0), 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R_METERS * c;
    return d;
}

/**
 * Finds the sw/ne of a list of coordinates, then calculates the center
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {location[]} coordinates the list of coordinates
 * @returns {number} the center
 */
aegir.mapUtil.centerOfCoordinates = function (coordinates) {
    var bounds = aegir.mapUtil.coordinateBounds(coordinates);
    return {
        lat: (bounds.sw.lat + bounds.ne.lat) / 2.0,
        lng: (bounds.sw.lng + bounds.ne.lng) / 2.0
    };
}
/**
 * Finds the sw/ne of a list of coordinates
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {location[]} coordinates the list of coordinates
 * @returns {vmCoordinateBounds} the bounding box
 */
aegir.mapUtil.coordinateBounds = function (coordinates) {
    var sw = {lat: Infinity, lng: Infinity};
    var ne = {lat: -Infinity, lng: -Infinity};
    var update = function(cLat, cLng)
    {
        if (!isNaN(cLat) && !isNaN(cLng)) {
            if (cLat < sw.lat) {
                sw.lat = cLat;
            }
            if (cLat > ne.lat) {
                ne.lat = cLat;
            }
            if (cLng < sw.lng) {
                sw.lng = cLng;
            }
            if (cLng > ne.lng) {
                ne.lng = cLng;
            }
        }
    }
    aegir.each(coordinates, function (i, coord) {
        if( Array.isArray(coord))
        {
            aegir.each(coord, function(j, c){
                update(c.lat, c.lng)

            });
        }
        else
        {
            update(coord.lat, coord.lng)
        }

    });
    return {sw: sw, ne: ne};
}

/**
 * Check if a point falls inside of a polygon or not
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {!location} point the point to check
 * @param {!location[]} vertices the points that make up the polygon
 * @returns {boolean} true if the given point falls within the boundaries of the polygon
 */
aegir.mapUtil.pointIsInPolygon = function (point, vertices) {
    //aegir.log("Checking if point is in polygon with vertices length: " + vertices.length)

    var nvert = vertices.length;
    var i = j = 0;
    var c = false;
    var verti, vertj;
    if( vertices.length > 0 && Array.isArray(vertices[0]))
    {
        //multipolygon
        return aegir.mapUtil.pointIsInMultiPolygon(point, vertices)
    }

    for (i = 0, j = nvert - 1; i < nvert; j = i++) {
        verti = vertices[i];
        vertj = vertices[j];
        if (((verti.lng > point.lng) != (vertj.lng > point.lng)) &&
            (point.lat < (vertj.lat - verti.lat) * (point.lng - verti.lng) / (vertj.lng - verti.lng) + verti.lat)) {
            c = !c;
        }
    }
    return c;
}
aegir.mapUtil.pointIsInMultiPolygon = function( point, multipolygon)
{
    //aegir.log("Checking if point is in multipolygon with vertices length: " + multipolygon.length)
    for( var i = 0; i < multipolygon.length ; i++  )
    {
        var inside = aegir.mapUtil.pointIsInPolygon(point, multipolygon[i])
        if( inside )
        {
            return true;
        }
    }
    return false;
}

/**
 * Calculates the heading (bearing) between two coordinates.
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {location} p1 the first coordinate
 * @param {location} p2 the second coordinate
 * @returns {number} calculated heading in DEGREES
 */
aegir.mapUtil.headingBetweenPoints = function (p1, p2) {
    var lonDistanceRadians = aegir.mapUtil.degreesToRadians(p2.lng - p1.lng);
    var X = Math.cos(aegir.mapUtil.degreesToRadians(p2.lat)) * Math.sin(lonDistanceRadians);
    var Y = Math.cos(aegir.mapUtil.degreesToRadians(p1.lat)) *
        Math.sin(aegir.mapUtil.degreesToRadians(p2.lat)) -
        Math.sin(aegir.mapUtil.degreesToRadians(p1.lat)) * Math.cos(aegir.mapUtil.degreesToRadians(p2.lat)) *
        Math.cos(lonDistanceRadians);
    var heading = aegir.mapUtil.radiansToDegrees(Math.atan2(X, Y));
    if (heading < 0) heading += 2 * aegir.mapUtil.degreesToRadians(Math.PI);

    return heading;
}

/**
 * Combine multiple coordinate bounds into a single one
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {vmCoordinateBounds[]} bounds a list of boudns to merge
 * @returns {vmCoordinateBounds} the merged bounds
 */
aegir.mapUtil.unionOfCoordinateBounds = function (bounds) {
    var coords = [];
    aegir.each(bounds, function (i, b) {
        coords.push(b.sw);
        coords.push(b.ne);
    });

    return aegir.mapUtil.coordinateBounds(coords);
}

/**
 * Check if a point is within a geographic boundary
 * @memberof aegir.mapUtil
 * @since 1.2
 * @public
 * @param {vmCoordinateBounds} bounds the rectangular bounds to check
 * @param {location} location the location to check
 * @returns {boolean} true if the point falls within the specified bounds, false otherwise
 */
aegir.mapUtil.boundsContainsPoint = function (bounds, location) {
    return bounds != null && location != null &&
        location.lat > bounds.sw.lat && location.lat < bounds.ne.lat &&
        location.lng > bounds.sw.lng && location.lng < bounds.ne.lng;
}

/**
 * Load any pending styles that weren't immediately applied when using aegir.setStyleForUnit();
 * @memberof aegir
 * @since 1.2.1
 * @private
 * @param {string} floorId the id of the floor to load pending styles for
 */
aegir._loadPendingStyles = function (floorId) {
    aegir.log("[START] Load pending styles for floor: " + floorId);
    var defaults = aegir.getDefaults();
    var config = aegir.getConfig();
    var floor = aegir.findFloorWithId(floorId) || aegir.findOutdoorFloorWithId(floorId);
    var styleDict = config.pendingUnitStyles[floorId];
    if (styleDict != null) {
        for (var unitId in styleDict) {
            var style = styleDict[unitId];
            aegir.each(floor.units, function (i, unit) {
                if (unit.id == unitId) {
                    aegir.setStyleForUnit(style, unit);

                    return false;
                }
            });
        }

        config.pendingUnitStyles[floorId] = null;
    }
    aegir.log("[END] Load pending styles for floor: " + floorId);

}
/**
 * @memberof aegir
 * @since 1.2.1
 * @private
 * @param {vmVenueLayerStyle} style the style that will be applied
 * @param {string} unitId the id of the unit to apply the style to
 * @param {string} floorId the id of the floor where the unit is
 */
aegir._setStyleForFillLayer = function (style, unitId, floorId) {

    aegir.log("[START] Setting custom fill style for layer: " + unitId);
    var layers = aegir.getLayers();
    var defaults = aegir.getDefaults();
    var config = aegir.getConfig();
    var fillColor = "#ffffff",
        fillPattern = null,
        fillColorOutline = "#ffffff",
        layerVisibility = "visible";

    if (style.hidden === "true") {
        layerVisibility = "none";
    }

    if (!(defaults.currentIndoorFloors.includes(floorId))) {
        layerVisibility = "none";
    }
    if (style.fillColor != null) {
        fillColor = style.fillColor;
        fillColorOutline = style.fillColor;
    }
    if (style.fillPattern != null) {
        fillPattern = style.fillPattern;
    }

    if (style.outlineColor != null) {
        fillColorOutline = style.outlineColor;
    }
    var customFillStylePrefix = "custom_shape_style";

    // layerSource
    var sourceId = "tiles_" + floorId;
    var outlineSourceId = "geojson_" + floorId;
    var source = config.geojsonSources[outlineSourceId];
    // layer
    var individualStyleLayerId = customFillStylePrefix + "_" + unitId + "_" + floorId;
    var filterParam = ["==", "feature_id", unitId];

    // get position to insert
    var aboveLayerId = floorId;
    if (layers.vectorLayers.length > 0) {
        var vectorLastObj = layers.vectorLayers[layers.vectorLayers.length - 1];
        aboveLayerId = "floor_" + vectorLastObj[0] + "_" + floorId;
    }
    var aboveLayer = layers.map.getLayer(aboveLayerId);

    if (aboveLayer != null) {

        if (layers.map.getSource(sourceId)) {
            if (layers.map.getLayer(individualStyleLayerId)) {
                //    layers.map.setLayoutProperty(individualStyleLayerId, "visibility", layerVisibility);
            } else {

                var individualStyleLayerOutlineId = individualStyleLayerId + "_outline";
                var outline = aegir._createOutlineLayer(individualStyleLayerOutlineId, floorId, "", layerVisibility, fillColorOutline, 1, 2, filterParam, source);
                layers.map.addLayer(outline, aboveLayerId);

                aegir.log("Adding custom style layer: " + individualStyleLayerId + ", visibility: " + layerVisibility);
                var layer = {
                    "id": individualStyleLayerId,
                    "metadata": {"floorId": floorId},
                    "type": "fill",
                    "source": sourceId,
                    "source-layer": floorId,
                    "minzoom": 1,
                    "maxzoom": 23,
                    "filter": filterParam,
                    "layout": {
                        "visibility": layerVisibility,
                    },
                    "paint": {}
                };
                if (fillPattern != null) {
                    layer.paint["fill-pattern"] = fillPattern;
                } else {
                    layer.paint["fill-color"] = fillColor;
                }
                layers.map.addLayer(layer, individualStyleLayerOutlineId);

                layers.customStyleLayers.push(individualStyleLayerId);
                layers.customStyleLayers.push(individualStyleLayerOutlineId);
            }
        }

    } else {
        aegir.warn("Could not find expected layer: " + aboveLayerId + " to insert custom style layer above.");
    }

    aegir.log("[END] Setting custom fill style for layer: " + unitId);

}

/// TODO: to add more style properties
// optimize code
/**
 * @memberof aegir
 * @since 1.2.1
 * @private
 * @param {vmVenueLayerStyle} style the style that will be applied
 * @param {string} unitId the id of the unit to apply the style to
 * @param {string} floorId the id of the floor where the unit is
 */
aegir._setStyleForLabelLayer = function (style, unitId, floorId) {

    aegir.log("[START] Setting custom label style for layer: " + unitId);

    var layers = aegir.getLayers();
    var defaults = aegir.getDefaults();
    var config = aegir.getConfig();
    var commonTileset = config.commonTilesetURL.replace("{FLOOR}", floorId);


    var fillColor = "#ffffff",
        fillColorOutline = "#ffffff";
    var filterParam = [],
        iconImage,
        fontName = "Open Sans Regular",
        fontSize = "12",
        textValue = "{name}",
        fontColor = "red",
        fontStrokeColor = "#ffffff",
        fontStrokeWidth = "1.5",
        maxTextWidth = "4",
        layerVisibility = "visible",
        pushVar = "class";

    var customFillStylePrefix = "custom_label_style";

    var layerKey = "floor_" + "labels" + "_" + floorId;


    // layerSource
    var sourceId = "common_" + floorId;

    // layer
    var individualStyleLayerId = customFillStylePrefix + "_" + unitId + "_" + floorId;


    if (style.fontName) {
        fontName = style.fontName;
    }

    if (style.fontSize) {
        fontSize = style.fontSize;
    }

    if (style.textValue) {
        textValue = style.textValue;
    }

    if (style.fontColor) {
        fontColor = style.fontColor;
    }

    if (style.fontStrokeColor) {
        fontStrokeColor = style.fontStrokeColor;
    }

    if (style.fontStrokeWidth) {
        fontStrokeWidth = style.fontStrokeWidth;
    }

    if (style.maxTextWidth) {
        maxTextWidth = style.maxTextWidth;
    }

    if (style.hidden) {
        if (style.hidden == "true") {
            layerVisibility = "hidden";
        }
    }
    if (!(defaults.currentIndoorFloors.includes(floorId))) {
        layerVisibility = "none";
    }

    var classFilter = [];
    classFilter.push("in");
    classFilter.push("class");
    aegir.each(layers.commonLayers, function (commonIndex, commonObject) {
        if (commonObject[0] == "labels") {
            aegir.each(commonObject[1], function (classIndex, className) {
                classFilter.push(className);
            });
        }
    });

    var unitFilter = [];
    unitFilter.push("==");
    unitFilter.push("unit_id");
    unitFilter.push(unitId);
    filterParam.push("all", classFilter, unitFilter);

    // get position to insert

    //  var mapLayers = layers.map.getStyle().layers;

    var aboveLayerId = floorId;
    if (layers.commonLayers.length > 0) {
        var commonLastObj = layers.commonLayers[layers.commonLayers.length - 1];
        aboveLayerId = "floor_" + commonLastObj[0] + "_" + floorId;
    }
    var aboveLayer = layers.map.getLayer(aboveLayerId);

    if (aboveLayer != null) {

        if (layers.map.getSource(sourceId)) {
            if (layers.map.getLayer(individualStyleLayerId)) {
                //    layers.map.setLayoutProperty(individualStyleLayerId, "visibility", layerVisibility);
            } else {
                aegir.log("Adding custom style layer: " + individualStyleLayerId + ", visibility: " + layerVisibility);
                layers.map.addLayer({
                    "id": individualStyleLayerId,
                    "metadata": {"floorId": floorId},
                    type: "symbol",
                    "source": sourceId,
                    "source-layer": floorId,
                    "minzoom": 1,
                    "maxzoom": 23,
                    "filter": filterParam,
                    "visibility": layerVisibility,
                    "layout": {
                        "icon-image": individualStyleLayerId,
                        "icon-allow-overlap": true,
                        "text-field": textValue,
                        "text-font": [fontName],
                        "text-size": parseInt(fontSize),
                        "text-max-width": parseInt(maxTextWidth),
                        "text-letter-spacing": 0.05,
                        "visibility": layerVisibility
                    },
                    "paint": {
                        "text-color": fontColor,
                        "text-halo-color": fontStrokeColor,
                        "text-halo-width": parseInt(fontStrokeWidth),
                        "text-opacity": 1
                    }
                }, aboveLayerId);

                layers.map.moveLayer(aboveLayerId, individualStyleLayerId);
                layers.customStyleLayers.push(individualStyleLayerId);
            }
        }
    }
    aegir.log("[END] Setting custom label style for layer: " + unitId);

}

/// TODO: to add more style properties
// optimize code
/**
 * @memberof aegir
 * @since 1.3
 * @private
 * @param {vmVenueLayerStyle} style the style that will be applied
 * @param {string} unitId the id of the unit to apply the style to
 * @param {string} floorId the id of the floor where the unit is
 */
aegir._setStyleForIconLayer = function (style, unitId, floorId) {

    aegir.log("[START] Setting custom icon style for layer: " + unitId);

    var layers = aegir.getLayers();
    var defaults = aegir.getDefaults();
    var config = aegir.getConfig();
    var commonTileset = config.commonTilesetURL.replace("{FLOOR}", floorId);



    var filterParam = [],
        iconImage,
        layerVisibility = "visible",
        pushVar = "class";

    var customIconStylePrefix = "custom_icon_style";

    var layerKey = "floor_" + "icons" + "_" + floorId;


    // layerSource
    var sourceId = "common_" + floorId;

    // layer
    var individualStyleLayerId = customIconStylePrefix + "_" + unitId + "_" + floorId;


    if (style.hidden) {
        if (style.hidden == "true") {
            layerVisibility = "hidden";
        }
    }
    if (!(defaults.currentIndoorFloors.includes(floorId))) {
        layerVisibility = "none";
    }

    var classFilter = [];
    classFilter.push("in");
    classFilter.push("class");
    aegir.each(layers.commonLayers, function (commonIndex, commonObject) {
        if (commonObject[0] == "icons") {
            aegir.each(commonObject[1], function (classIndex, className) {
                classFilter.push(className);
            });
        }
    });

    var unitFilter = [];
    unitFilter.push("==");
    unitFilter.push("unit_id");
    unitFilter.push(unitId);
    filterParam.push("all", classFilter, unitFilter);

    // get position to insert

    //  var mapLayers = layers.map.getStyle().layers;

    var aboveLayerId = floorId;
    if (layers.commonLayers.length > 0) {
        var commonLastObj = layers.commonLayers[layers.commonLayers.length - 1];
        aboveLayerId = "floor_" + commonLastObj[0] + "_" + floorId;
    }
    var aboveLayer = layers.map.getLayer(aboveLayerId);

    if (aboveLayer != null) {

        if (layers.map.getSource(sourceId)) {
            if (layers.map.getLayer(individualStyleLayerId)) {
                //    layers.map.setLayoutProperty(individualStyleLayerId, "visibility", layerVisibility);
            } else {
                aegir.log("Adding custom style layer: " + individualStyleLayerId + ", visibility: " + layerVisibility);
                layers.map.addLayer({
                    "id": individualStyleLayerId,
                    "metadata": { "floorId": floorId },
                    type: "symbol",
                    "source": sourceId,
                    "source-layer": floorId,
                    "filter": filterParam,
                    "visibility": layerVisibility,
                    "layout": {
                        "icon-image": style.iconName,
                        "visibility": layerVisibility
                    },

                }, aboveLayerId);

                // layers.map.moveLayer(aboveLayerId, individualStyleLayerId);
                layers.customStyleLayers.push(individualStyleLayerId);
            }
        }
    }
    aegir.log("[END] Setting custom icon style for layer: " + unitId);
}


//polyfills
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}
