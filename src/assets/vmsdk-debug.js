/**
 * The aegir.debug namespace allows configuration of settings for debugging vm-sdk related items in your application.
 * @namespace aegir.debug
 */
aegir.debug = {}

/**
 * @typedef vmDebugConfig
 * @property {boolean} loggingEnabled enables debug messages in the console. Defaults to false.
 * @property {boolean} showBuildingBoundingBoxes Shows a rectangle around venue builidings. Defautts to false.
 * @property {boolean} showFloorBoundingBoxes  Shows a rectangle around floors. Defaults to false.
 * @property {boolean} showVenueBoundingBox Shows a rectangle around the entire venue. Defaults to false.
 * @property {boolean} showTileBoundaries Shows a rectangle around map tiles and other debug information. Defaults to false.
 */
/**
 * Debug settings
 * @memberof aegir.debug
 * @private
 */
aegir.debug.settings = {
    loggingEnabled: false,
    showVenueBoundingBox: false,
    showBuildingBoundingBoxes: false,
    showFloorBoundingBoxes: false,
    showTileBoundaries: false
    //other debug properties in the future
};
/**
 * @memberof aegir.debug
 * @returns {vmDebugConfig} debug settings
 */
aegir.debug.getSettings = function()
{
    return aegir.debug.settings;
}

/**
 * Creates a geojson layer that represents the a rectangular region on the map
 * @memberof aegir.debug
 * @private
 * @param {vmCoordinateBounds} bbox the bounding box
 * @returns {object} the configured layer, or null if the bounding box is invalid
 */
aegir.debug._createBoundingBox = function(bbox)
{
    if( bbox == null || bbox.sw == null || bbox.ne == null )
    {
        aegir.warn("[DEBUG] Error creating bounding box for layer.");
        return null;
    }
    var debugLayer =
        {
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [bbox.sw.lng, bbox.sw.lat],
                                [bbox.sw.lng, bbox.ne.lat],
                                [bbox.ne.lng, bbox.ne.lat],
                                [bbox.ne.lng, bbox.sw.lat],
                                [bbox.sw.lng, bbox.sw.lat]
                            ]
                        },
                        "properties": {

                        }
                    }]
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#ff0000",
                "line-width": 4
            }
        }

    return debugLayer;
}

/**
 * Adds a bounding box for a floor if possible
 * @memberof aegir.debug
 * @private
 * @param {vmMapBuildingFloor} floor the floor
 */
aegir.debug._addFloorBoundingBox = function(floor)
{
    if( floor != null )
    {
        var debugLayer = aegir.debug._createBoundingBox(floor.bounds);
        if( debugLayer != null )
        {
            debugLayer.id = "floor_bounding_box_" + floor.id;
            debugLayer.paint["line-color"] = "#0000ff";
            aegir.log("[DEBUG] Adding debug layer " + debugLayer.id);
            if( aegir.getLayers().map.getLayer(debugLayer.id) == null ) {
                aegir.getLayers().map.addLayer(debugLayer);
            }
        }
        else {
            aegir.warn("[DEBUG] Cannot add bounding box for floor " + floor.id);
        }
    }
    else {
        aegir.warn("[DEBUG] Cannot add floor bounding box for NULL floor")
    }
}

/**
 * Removes the bounding box map layers for a floor and the corresponding map data source
 * @memberof aegir.debug
 * @private
 * @param {vmMapBuildingFloor} floor the floor
 */
aegir.debug._removeFloorBoundingBox = function(floor)
{
    if( floor != null )
    {
        var id = "floor_bounding_box_" + floor.id
        aegir.log("[DEBUG] Removing debug layer " + id )
        aegir.getLayers().map.removeLayer(id);
        aegir.getLayers().map.removeSource(id);
    }
    else {
        aegir.warn("[DEBUG] Cannot remove floor bounding box for NULL floor")
    }
}

/**
 * Adds a bounding box for a list of buildings, if possible
 * @memberof aegir.debug
 * @private
 * @param {vmMapBuilding[]} buildings the the buildings
 */
aegir.debug._addBuildingBoundingBoxes = function(buildings)
{
    var defaults = aegir.getDefaults();
    aegir.each(buildings, function (index, building) {
        var debugLayer = aegir.debug._createBoundingBox(building.bounds);
        if( debugLayer != null )
        {
            debugLayer.id = "building_bounding_box_" + building.id;
            debugLayer.paint["line-color"] = "#ff0000";
            aegir.log("[DEBUG] Adding debug layer " + debugLayer.id);
            if( aegir.getLayers().map.getLayer(debugLayer.id) == null ) {
                aegir.getLayers().map.addLayer(debugLayer);
            }
        }
        else
        {
            aegir.warn("[DEBUG] Cannot add bounding box for building " + building.id);
        }
    });
}
/**
 * Adds a bounding box for the venue boudns
 * @memberof aegir.debug
 * @private
 */
aegir.debug._addVenueBoundingBox = function()
{
    var buildings = aegir.getBuildings().concat( aegir.getOutdoorBuildings());
    var venueBounds = aegir._getVenueBounds( buildings );
    var debugLayer = aegir.debug._createBoundingBox(venueBounds);
    if( debugLayer != null )
    {
        debugLayer.id = "venue_bounding_box";
        debugLayer.paint["line-color"] = "#f46e42";
        aegir.log("[DEBUG] Adding debug layer " + debugLayer.id);
        if( aegir.getLayers().map.getLayer(debugLayer.id) == null ) {
            aegir.getLayers().map.addLayer(debugLayer);
        }
    }
    else
    {
        aegir.warn("[DEBUG] Cannot add bounding box for venue");
    }

}
