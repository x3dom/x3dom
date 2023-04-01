/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DBoundedObject ### */
x3dom.registerNodeType(
    "X3DBoundedObject",
    "Grouping",
    defineClass( x3dom.nodeTypes.X3DChildNode,

        /**
         * Constructor for X3DBoundedObject
         * @constructs x3dom.nodeTypes.X3DBoundedObject
         * @x3d 3.3
         * @component Grouping
         * @status full
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the basis for all node types that have bounds specified as part of
         * the definition. The bboxCenter and bboxSize fields specify a bounding box that encloses the grouping node's
         * children. This is a hint that may be used for optimization purposes.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.X3DBoundedObject.superClass.call( this, ctx );

            /**
             * Flag to enable/disable rendering
             * @var {x3dom.fields.SFBool} render
             * @memberof x3dom.nodeTypes.X3DBoundedObject
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool( ctx, "render", true );

            /**
             * Flag to enable/disable rendering, alias for render
             * @var {x3dom.fields.SFBool} visible
             * @memberof x3dom.nodeTypes.X3DBoundedObject
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "visible", true );

            /**
             * Center of the bounding box
             * @var {x3dom.fields.SFVec3f} bboxCenter
             * @memberof x3dom.nodeTypes.X3DBoundedObject
             * @initvalue 0,0,0
             * @range [-inf, inf]
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f( ctx, "bboxCenter", 0, 0, 0 );

            /**
             * Size of the bounding box
             * @var {x3dom.fields.SFVec3f} bboxSize
             * @memberof x3dom.nodeTypes.X3DBoundedObject
             * @initvalue -1,-1,-1
             * @range [0, inf] or -1
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f( ctx, "bboxSize", -1, -1, -1 );

            /**
             * Flag to enable display of the bounding box
             * @var {x3dom.fields.SFVec3f} bboxDisplay
             * @memberof x3dom.nodeTypes.X3DBoundedObject
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "bboxDisplay", false );

            /**
            * Size of additional margin around the bounding box scaled up by the diameter.
            * @var {x3dom.fields.SFFloat} bboxMargin
            * @memberof x3dom.nodeTypes.X3DBoundedObject
            * @initvalue 0.01
            * @range [-inf, inf]
            * @field x3dom
            * @instance
            */
            this.addField_SFFloat( ctx, "bboxMargin", 0.01 );

            /**
             * Color of the bounding box
             * @var {x3dom.fields.SFColor} bboxColor
             * @memberof x3dom.nodeTypes.X3DBoundedObject
             * @initvalue 1, 1, 0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor( ctx, "bboxColor", 1, 1, 0 );

            this._graph = {
                boundedNode  : this,    // backref to node object
                localMatrix  : x3dom.fields.SFMatrix4f.identity(),   // usually identity
                globalMatrix : null,    // new x3dom.fields.SFMatrix4f();
                volume       : new x3dom.fields.BoxVolume(),     // local bbox
                lastVolume   : new x3dom.fields.BoxVolume(),     // local bbox
                worldVolume  : new x3dom.fields.BoxVolume(),     // global bbox
                center       : new x3dom.fields.SFVec3f( 0, 0, 0 ),  // center in eye coords
                coverage     : -1,       // currently approx. number of pixels on screen
                needCulling  : true      // to be able to disable culling per node
            };

            this._render = true;
            this._bboxNode = null;
            this._bboxColor = new x3dom.fields.SFColor();
        },
        {
            fieldChanged : function ( fieldName )
            {
                // TODO; wait for sync traversal to invalidate en block
                if ( this._vf.hasOwnProperty( fieldName ) )
                {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            },

            nodeChanged : function ()
            {
                // TODO; wait for sync traversal to invalidate en block
                this.invalidateVolume();
                //this.invalidateCache();
            },

            parentAdded : function ( parent )
            {
                // some default behavior if not overwitten
                this.invalidateVolume();
                //this.invalidateCache();
            },

            getVolume : function ()
            {
                var vol = this._graph.volume;

                if ( !this.volumeValid() && ( this._vf.bboxDisplay || this.renderFlag && this.renderFlag() ) )
                {
                    for ( var i = 0, n = this._childNodes.length; i < n; i++ )
                    {
                        var child = this._childNodes[ i ];
                        // render could be undefined, but undefined != true
                        if ( !child || child.renderFlag && child.renderFlag() !== true && !child._vf.bboxDisplay )
                        {continue;}

                        var childVol = child.getVolume();

                        if ( childVol && childVol.isValid() )
                        {vol.extendBounds( childVol.min, childVol.max );}
                    }
                }

                if ( !vol.equals( this._graph.lastVolume ) )
                {
                    this._graph.lastVolume = x3dom.fields.BoxVolume.copy( vol );

                    var event = {
                        target : this._xmlNode,
                        type   : "volumechanged",   // event only called onxxx if used as old-fashioned attribute
                        volume : x3dom.fields.BoxVolume.copy( vol )
                    };

                    this.callEvtHandler( "onvolumechanged", event );
                }

                return vol;
            },

            invalidateVolume : function ()
            {
                var graph = this._graph;

                graph.volume.invalidate();

                // also clear cache
                graph.worldVolume.invalidate();
                graph.globalMatrix = null;

                // set parent volumes invalid, too
                for ( var i = 0, n = this._parentNodes.length; i < n; i++ )
                {
                    var node = this._parentNodes[ i ];
                    if ( node )
                    {node.invalidateVolume();}
                }
            },

            invalidateCache : function ()
            {
                var graph = this._graph;

                //if (graph.volume.isValid() &&
                //    graph.globalMatrix == null && !graph.worldVolume.isValid())
                //    return;     // stop here, we're already done

                graph.worldVolume.invalidate();
                graph.globalMatrix = null;

                // clear children's cache, too
                //for (var i=0, n=this._childNodes.length; i<n; i++) {
                //    var node = this._childNodes[i];
                //    if (node)
                //        node.invalidateCache();
                //}
            },

            cacheInvalid : function ()
            {
                return ( this._graph.globalMatrix == null ||
                    !this._graph.worldVolume.isValid() );
            },

            volumeValid : function ()
            {
                return this._graph.volume.isValid();
            },

            graphState : function ()
            {
                return this._graph;
            },

            forceUpdateCoverage : function ()
            {
                return false;
            },

            renderFlag : function ()
            {
                //sync
                if ( this._render !== this._vf.render )
                //render changed
                {
                    this._vf.visible = this._vf.render;
                    this._render = this._vf.visible;
                }
                else if ( this._render !== this._vf.visible )
                //visible changed
                {
                    this._vf.render = this._vf.visible;
                    this._render = this._vf.visible;
                }
                //nothing changed
                return this._render;
            },

            getBboxNode : function ()
            {
                if ( this._bboxNode == null )
                {
                    var bbDom = x3dom.bboxDom.cloneNode( true );
                    this._bboxNode = this._nameSpace.setupTree( bbDom, this._xmlNode.parentElement );
                }
                var bbox = this._graph.volume;
                bboxNode = this._bboxNode;
                bboxNode._vf.translation = bbox.center;
                var size = bbox.max.subtract( bbox.min );
                var margin = bbox.diameter * this._vf.bboxMargin;
                bboxNode._vf.scale.set( size.x + margin, size.y + margin, size.z + margin );
                bboxNode.fieldChanged( "scale" );
                if ( !this._bboxColor.equals( this._vf.bboxColor, 0.01 ) )
                {
                    this._bboxColor.setValues( this._vf.bboxColor );
                    var mat = this._bboxNode._cf.children.nodes[ 0 ]._cf.appearance.node._cf.material.node;
                    mat._vf.emissiveColor = this._bboxColor.multiply( 0.8 );
                    mat._vf.diffuseColor = this._bboxColor.multiply( 0.2 );
                    mat.fieldChanged( "emissiveColor" );
                }
                return this._bboxNode;
            },

            collectBbox : function ( transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes )
            {
                if ( this._vf.bboxDisplay )
                {
                    var bboxNode = this.getBboxNode();
                    bboxNode.collectDrawableObjects( transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes );
                }
            }
        }
    )
);

x3dom.bboxDom = new DOMParser().parseFromString(
    "<Transform>" +
        "<Shape isPickable='false'>" +
        "  <Appearance>" +
        //    "<LineProperties lineWidthScaleFactor='0'></LineProperties>" +
        "   <Material transparency='0.6' specularColor='0.3 0.3 0.3' diffuseColor='0 0.5 0' emissiveColor='1 0.5 0'></Material>" +
        "   </Appearance>" +
        "  <Box size='1 1 1'></Box>" +
        // "<IndexedLineSet coordIndex='0 1 -1 1 2 -1 2 3 -1 3 0 -1 6 7 -1 7 4 -1 4 5 -1 5 6 -1 0 6 -1 1 7 -1 2 4 -1 3 5 -1'>" +
        //   "<Color color='0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0'/>" +
        //   "<Coordinate point='-0.5 -0.5 0.5 0.5 -0.5 0.5 0.5 0.5 0.5 -0.5 0.5 0.5 0.5 0.5 -0.5 -0.5 0.5 -0.5 -0.5 -0.5 -0.5 0.5 -0.5 -0.5'/>" +
        // "</IndexedLineSet>" +
        "</Shape>" +
    "</Transform>",
    "text/xml" ).children[ 0 ];