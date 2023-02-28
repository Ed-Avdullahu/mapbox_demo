/**
 * The aegir.legacy namespace contains all of the functions for supporting legacy
 * venue map data files in your web application. Include the maps-legacy-sdk
 * javascript file in your application and legacy venue map data files will be handled
 * seamlessly. There is no additional work required.
 * @since 1.2
 */
aegir.legacy = {};
/**
 * Loads legacy venue map data containing sitemap and multiple building xmls
 * @memberof aegir.legacy
 * @since 1.2
 * @private
 * @async
 * @param {string} sitemap the url for the sitemap
 * @param {onCompleteCallback} function to execute when loading is complete
 */
aegir.legacy._loadData = function(sitemap, onComplete) {
    var defaults = aegir.getDefaults();
    var config = aegir.getConfig();
    var loadSiteMapPromise = new Promise( function(resolve, reject)  {
        aegir.log("[START] Load Sitemap XML: venue: " + config.venueId);
        aegir.legacy._loadSitemap(sitemap, function(response, error ) {
            var loadObj = [];
            if (error !== null) {
                loadObj.error = "There was an error loading " + sitemap + ": " + error;
                aegir.error("[END] Load Sitemap XML: venue: " + config.venueId + ", error: " + error);

                resolve(loadObj);
            } else {
                // Add map data properties to pass into aegir.loadMap().
                //todo: parse from xml
                aegir.log("[END] Load Sitemap XML: venue: " + config.venueId);

                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response,"text/xml");
                var buildings = xmlDoc.getElementsByTagName("building");
                aegir.log("Parsed " + buildings.length + " buildings from sitemap.");
                var buildingXmls = [];
                aegir.each(buildings, function(i, building){

                    var buildingXmlURL = sitemap.replace(/\/[^\/]*$/, "/" + building.id + ".xml");
                    buildingXmls.push({
                        id: building.getAttribute("id"),
                        url:buildingXmlURL
                    } );
                });
                resolve(buildingXmls);
            }});

    });

    aegir.log("[START] Waiting for siteMap: venue: " + config.venueId);

    Promise.all([loadSiteMapPromise]).then(function(values){
            aegir.log("[END] Waiting for siteMap: venue: " + config.venueId);

            var v1 = values[0];
            if( v1["error"] != null )
            {
                aegir.error("[END] Waiting for siteMap: venue: " + config.venueId + ", error: An unexpected error occurred during loading. - " + v1.error);

                onComplete(null, [v1.error]);
            }
            else {
                aegir.legacy._processBuildings(v1,  onComplete);
            }},
        function(error )
        {
            aegir.error("[END] Waiting for siteMap: venue: " + config.venueId + ", error: An unexpected error occurred during loading. - " + error);
        });
};

/**
 * Process list of legacy building XML files
 * @memberof aegir.legacy
 * @since 1.2
 * @private
 * @async
 * @param {object[]} buildings list of objects with building id/xml url properties
 * @param {onCompleteCallback} function to execute when loading is complete
 */
aegir.legacy._processBuildings = function( buildings, onComplete) {
    var promises = [];
    aegir.each( buildings, function(i, building){
        aegir.log("[START] Load Building XML: building: " + building.id);

        var promise = new Promise( function(resolve, reject){
            aegir.ajax( building.url, {}, function( xml )
                {
                    var obj = {};
                    var building = aegir.legacy._processXML(xml);
                    if( building == null )
                    {
                        obj.error = "There was an error loading building " + building.id;
                        aegir.error("[END] Load Building XML: building: " + building.id );
                    }
                    else
                    {
                        // Add map data properties to pass into aegir.loadMap().
                        //  obj.loadOptions = loadOptions;

                        obj = building;
                        aegir.log("[END] Load Building XML: building: " + building.id);
                    }
                    resolve(obj);
                },
                function(error){
                    resolve(null, error);
                } );
        });

        promises.push(promise);
    });

    //wait for all buildings to be done loading and parsed
    aegir.log("[START] Waiting for buildings: venue: " + aegir.getConfig().venueId);

    Promise.all(promises).then(
        function(result){aegir.legacy._didFinishProcessingBuildings(result, onComplete)},
        function(error){aegir.legacy._didFailProcessingBuildings(error, onComplete);}
    );
};

/**
 * Called when failed to process legacy building XMLs
 * @memberof aegir.legacy
 * @since 1.2
 * @private
 * @type {onCompleteCallback}
 */
aegir.legacy._didFailProcessingBuildings = function ( error, onComplete )
{
    aegir.error("[END] Waiting for buildings: venue: " + aegir.getConfig().venueId + ", error: An unexpected error occurred during loading. - " + error);
    console.timeEnd("loadVenueMapData");

    onComplete(null, "An unexpected error occurred while loading one or more buildings: " + error)
}
/**
 * Called when successfully processed legacy building XMLs
 * @memberof aegir.legacy
 * @since 1.2
 * @private
 * @type {onCompleteCallback}
 */
aegir.legacy._didFinishProcessingBuildings = function(buildings, onComplete)
{
    aegir.log("[END] Done processing all building XMLs.");
    var venueBuildings = [];
    aegir.each(buildings, function(i, building) {
        venueBuildings.push(building);
        building.floors.sort( function(f1,f2){
            return f1.ordinal - f2.ordinal;
        });
    });
    aegir.getDefaults().buildingObjs = venueBuildings;
    aegir.log("Done processing " + venueBuildings.length + " building XMLs.");
    var venueInfo = aegir._getVenueInfo(venueBuildings);

    //create dummy style json
    var styleJSON = {
        "id": "style_default",
        "name": "Legacy Default Style",
        "version": 1.1,
        "styles": [{
            "layer-id":"[FLOOR]",
            "hidden":"false"
        }]
    };
    aegir.getDefaults().style_JSON = styleJSON;
    onComplete(venueInfo, null);
}

/**
 * Process legacy zip file ( should contain a sitemap and one or more building XMLs)
 * @memberof aegir.legacy
 * @since 1.2
 * @private
 * @async
 * @param {object[]} entries list of entries from the zip file
 * @param {onCompleteCallback} onComplete function to execute when processing is complete
 */
aegir.legacy._processZip = function( entries, onComplete )
{
    var regex = new RegExp(/^c\d+_bldg_[a-z]+\.xml$/);
    var buildingXmls = aegir.grep( entries, function(entry){
        var matches =  entry.filename.match(regex);
        return matches != null && matches.length > 0;
    });
    if( buildingXmls.length > 0 )
    {
        var promises = [];
        aegir.each(buildingXmls, function(i, buildingXmlFile){
            var promise = new Promise( function(resolve, reject) {
                aegir.log("Getting data for " + buildingXmlFile.filename);
                buildingXmlFile.getData(new zip.TextWriter(), function(xml) {
                    aegir.log("Read building xml of length " + xml.length);
                    var building = aegir.legacy._processXML(xml);

                    aegir.log("Loaded building " + building.id + " from xml in zip file.");
                    resolve(building);
                }, function(i,total){
                    //aegir.log("Read " + i + "/" + total);
                });
            });
            promises.push(promise);
        });
        aegir.log("[START] Waiting to finish processing " + promises.length + " building XMLs from legacy zip.")
        Promise.all(promises).then(
            function(result){aegir.legacy._didFinishProcessingBuildings(result, onComplete)},
            function(error){aegir.legacy._didFailProcessingBuildings(error, onComplete);}
        );
    }
    else
    {
        aegir.warn("No legacy building XMLs found in zip file.");
        onComplete([], null);
    }
}

/**
 * Download the sitemap from the specified url
 * @memberof aegir.legacy
 * @since 1.2
 * @private
 * @async
 * @param {string} siteMapURL the url to the sitemap xml file
 * @param {onCompleteCallback} callback the function to execute when processing is finished
 */
aegir.legacy._loadSitemap = function(sitemapURL, callback){
    aegir.ajax(sitemapURL, {}, function(xml, error){
        callback( xml, null);
    }, function(response, error){
        callback(null, error);
    });
}
/**
 * Process legacy building XML data
 * @memberof aegir.legacy
 * @since 1.2
 * @private
 * @param {string} xml the building xml
 * @returns {vmMapBuilding} a building object
 */
aegir.legacy._processXML = function(xml)
{
    var defaults = aegir.getDefaults();

    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml,"text/xml");
    var nodes  = xmlDoc.documentElement.childNodes;
    var buildingNode = xmlDoc.getElementsByTagName("building")[0];
    var buildingName = buildingNode.getAttribute("title");
    var buildingId = buildingNode.getAttribute("id");
    var floorMap = {};
    var building ={};
    building.id = buildingId;
    building.name = buildingName;
    building.floors = [];

    //get the floor list from the building
    var floorNodes = xmlDoc.getElementsByTagName("floor");
    aegir.each(floorNodes, function(floorIndex,floorNode){
        var floor = [];
        floor.buildingId = building.id;
        floor.legacyId = floorNode.getAttribute("id");
        floor.id = floor.buildingId + "_"+ floorNode.getAttribute("id");
        floor.name = floorNode.getAttribute("title");
        floor.ordinal = floorIndex;
        floor.units = [];
        floorMap[floor.id] = floor;
        building.floors.push(floor);
    });

    var buildingBounds = {
        sw: {lat: Infinity, lng: Infinity},
        ne: {lat: Infinity, lng: Infinity}
    };
    //get the bounding box of the building
    var coordinatesMatches = xmlDoc.getElementsByTagName("rdf:Description");
    aegir.each(coordinatesMatches, function(objIndex, obj) {

        var $dcType = obj.getAttribute("dc:type");
        aegir.log("[START] Processing xml element with description: " + $dcType);
        if ($dcType !== null && $dcType == "Google Bounding Box Coordinates") {

            aegir.each(obj.childNodes, function(childObjIndex, childObj) {
                if (childObj.tagName == "rdf:Seq") {
                    aegir.each(childObj.childNodes, function(childT2ObjIndex, childT2Obj) {
                        if (childT2Obj.tagName == "rdf:_1") {
                            buildingBounds.ne.lng = parseFloat(childT2Obj.children[0].attributes[2].nodeValue);
                            buildingBounds.ne.lat = parseFloat(childT2Obj.children[0].attributes[1].nodeValue);
                        }
                        if (childT2Obj.tagName == "rdf:_4") {
                            buildingBounds.sw.lng= parseFloat(childT2Obj.children[0].attributes[2].nodeValue);
                            buildingBounds.sw.lat = parseFloat(childT2Obj.children[0].attributes[1].nodeValue);
                        }
                    });
                }
            });
        }
        else if( $dcType !=  null && $dcType == "Google Hotspot Coordinates")
        {
            var floorId = buildingId + "_" + obj.getAttribute("rdf:about");
            var floor = floorMap[floorId];
            if( floor == null ) {
                aegir.warn("Invalid floor in hotspot list: " + floorId);
                return false;
            }
            aegir.log("[START] Processing hotspots for floor : " + floorId);

            aegir.each(obj.childNodes, function(i, a) {
                aegir.each( a.childNodes, function(j, b ){
                    aegir.each( b.childNodes, function(k, c) {
                        if( c.tagName == "geo:Point")
                        {
                            var unitId = c.getAttribute("lokfp:hotspotId").replace("rh_", "r_");
                            var hotspotLocation = {
                                lat: parseFloat( c.getAttribute("geo:lat")),
                                lng: parseFloat( c.getAttribute("geo:long"))
                            };
                            var unit = {};
                            unit.id = unitId;
                            unit.name = unitId.replace("r_", "");
                            unit.floorId = floorId;
                            unit.centerLocation = hotspotLocation;
                            unit.hotspotLocation = hotspotLocation;
                            unit.coordinates = null;
                            floor.units.push(unit);
                        }
                    });
                });
            });

            aegir.log("[END] Processing hotspots for floor: " + floorId + ", total: " + floor.units.length);
        }
        aegir.log("[END] Processing xml element with description: " + $dcType);
    });

    building.bounds = buildingBounds;
    building.center = aegir.mapUtil.centerOfCoordinates([building.bounds.sw, building.bounds.ne]);
    aegir.each( building.floors, function(i, floor){
        aegir.log("[LEGACY] Setting floor bounds to match building bounds for floor " + floor.id + ", building " + building.id);
        floor.bounds = building.bounds;
    });
    return building;
};

/**
 * Handle clicks at the given lat/lng
 * @memberof aegir.legacy
 * @since 1.2
 * @private
 * @param {location} location the location of the tap
 */
aegir.legacy._didTapAtCoordinate = function ( location )
{
    aegir.log("[START] aegir.legacy._didTapAtCoordinate()")
    //todo:
    var winner = null;
    var bestDistance = Infinity;
    var MAX_DISTANCE = 15;//meters

    aegir.each( aegir.getDefaults().currentIndoorFloors, function(i,floorId){
        var floor = aegir.findFloorWithId(floorId);
        aegir.each( floor.units, function( j, unit){
            //aegir.log("Checking unit " + unit.id);
            if(unit.centerLocation != null )
            {
                var distance = aegir.mapUtil.distanceBetweenPoints(location, unit.centerLocation);
                //aegir.log("Calculated distance is " + distance );
                if( isNaN(bestDistance) ||  distance < bestDistance && distance < MAX_DISTANCE )
                {
                    bestDistance = distance;
                    winner = unit;
                }
            }
            else
            {
                aegir.log("Unit " + unit.id + " has no hotspot location. Nothing to check.");
            }
        });
    });
    if( winner != null )
    {
        var evt = new CustomEvent("didSelectUnit", {detail: winner});
        document.dispatchEvent(evt);
    }
    aegir.log("[END] aegir.legacy._didTapAtCoordinate()")

}
