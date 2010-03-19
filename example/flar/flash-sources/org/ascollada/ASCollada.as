/*
 * Copyright 2007 (c) Tim Knip, ascollada.org.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
 
package org.ascollada 
{
	/**
	 * 
	 */
	public class ASCollada 
	{	
		public static const DAE_PROFILE_COMMON_ELEMENT:String = "profile_COMMON";
		public static const DAE_DATA_ELEMENT:String = "data";
		
		// COLLADA Versioning information
		public static const DAE_NAMESPACE_ATTRIBUTE:String = "xmlns";
		public static const DAE_SCHEMA_LOCATION:String =	"http://www.collada.org/2005/11/COLLADASchema";
		public static const DAE_VERSION_ATTRIBUTE:String = "version";
		public static const DAE_SCHEMA_VERSION:String =		"1.4.1";
		
		// COLLADA 1.4 elements
		public static const DAE_LIBRARY_ANIMATION_ELEMENT:String = "library_animations";
		public static const DAE_LIBRARY_ANIMATION_CLIP_ELEMENT:String = "library_animation_clips";
		public static const DAE_LIBRARY_CAMERA_ELEMENT:String = "library_cameras";
		public static const DAE_LIBRARY_CONTROLLER_ELEMENT:String = "library_controllers";
		public static const DAE_LIBRARY_EFFECT_ELEMENT:String = "library_effects";
		public static const DAE_LIBRARY_FFIELDS_ELEMENT:String = "library_force_fields";
		public static const DAE_LIBRARY_GEOMETRY_ELEMENT:String = "library_geometries";
		public static const DAE_LIBRARY_IMAGE_ELEMENT:String = "library_images";
		public static const DAE_LIBRARY_LIGHT_ELEMENT:String = "library_lights";
		public static const DAE_LIBRARY_MATERIAL_ELEMENT:String = "library_materials";
		public static const DAE_LIBRARY_NODE_ELEMENT:String = "library_nodes";
		public static const DAE_LIBRARY_PMATERIAL_ELEMENT:String = "library_physics_materials";
		public static const DAE_LIBRARY_PMODEL_ELEMENT:String = "library_physics_models";
		public static const DAE_LIBRARY_PSCENE_ELEMENT:String = "library_physics_scenes";
		public static const DAE_LIBRARY_VSCENE_ELEMENT:String = "library_visual_scenes";
		
		public static const DAE_INSTANCE_ANIMATION_ELEMENT:String = "instance_animation";
		public static const DAE_INSTANCE_CAMERA_ELEMENT:String = "instance_camera";
		public static const DAE_INSTANCE_CONTROLLER_ELEMENT:String = "instance_controller";
		public static const DAE_INSTANCE_EFFECT_ELEMENT:String = "instance_effect";
		public static const DAE_INSTANCE_GEOMETRY_ELEMENT:String = "instance_geometry";
		public static const DAE_INSTANCE_LIGHT_ELEMENT:String = "instance_light";
		public static const DAE_INSTANCE_MATERIAL_ELEMENT:String = "instance_material";
		public static const DAE_INSTANCE_NODE_ELEMENT:String = "instance_node";
		public static const DAE_INSTANCE_VSCENE_ELEMENT:String = "instance_visual_scene";
		
		public static const DAE_ANIMCLIP_ELEMENT:String = "animation_clip";
		public static const DAE_BIND_ELEMENT:String = "bind";
		public static const DAE_BIND_VERTEX_INPUT:String = "bind_vertex_input";
		public static const DAE_BIND_TEXTURE_SURFACE_ELEMENT:String = "bind_texture_surface";
		public static const DAE_BINDMATERIAL_ELEMENT:String = "bind_material";
		public static const DAE_COLOR_ELEMENT:String = "color";
		public static const DAE_CONTROL_VERTICES_ELEMENT:String = "control_vertices";
		public static const DAE_EFFECT_ELEMENT:String = "effect";
		public static const DAE_MIP_LEVELS:String	= "mip_levels";
		public static const DAE_MIPMAP_GENERATE:String = "mipmap_generate";
		public static const DAE_SAMPLER_ELEMENT:String = "sampler";
		public static const DAE_SKELETON_ELEMENT:String = "skeleton";
		public static const DAE_TARGETS_ELEMENT:String = "targets";
		public static const DAE_TECHNIQUE_COMMON_ELEMENT:String = "technique_common";
		public static const DAE_VIEWPORT_RATIO:String = "viewport_ratio";
		public static const DAE_VSCENE_ELEMENT:String = "visual_scene";
		public static const DAE_WEIGHTS_ELEMENT:String = "vertex_weights";
		public static const DAE_VERTEXCOUNT_ELEMENT:String = "vcount";
		
		public static const DAE_INITASNULL_ELEMENT:String = "init_as_null";
		public static const DAE_INITASTARGET_ELEMENT:String = "init_as_target";
		public static const DAE_INITCUBE_ELEMENT:String = "init_cube";
		public static const DAE_INITVOLUME_ELEMENT:String = "init_volume";
		public static const DAE_INITPLANAR_ELEMENT:String = "init_planar";
		public static const DAE_INITFROM_ELEMENT:String = "init_from";
		public static const DAE_ALL_ELEMENT:String = "all";
		public static const DAE_PRIMARY_ELEMENT:String = "primary";
		public static const DAE_FACE_ELEMENT:String = "face";
		public static const DAE_ORDER_ELEMENT:String = "order";
		
		public static const DAE_FXCMN_ANNOTATE_ELEMENT:String = "annotate";
		public static const DAE_FXCMN_BIND_ELEMENT:String = "bind";
		public static const DAE_FXCMN_BOOL_ELEMENT:String = "bool";
		public static const DAE_FXCMN_CODE_ELEMENT:String = "code";
		public static const DAE_FXCMN_COMPILERTARGET_ELEMENT:String = "compiler_target";
		public static const DAE_FXCMN_COMPILEROPTIONS_ELEMENT:String = "compiler_options";
		public static const DAE_FXCMN_INT_ELEMENT:String = "int";
		public static const DAE_FXCMN_HALF_ELEMENT:String = "half";
		public static const DAE_FXCMN_HALF2_ELEMENT:String = "half2";
		public static const DAE_FXCMN_HALF3_ELEMENT:String = "half3";
		public static const DAE_FXCMN_HALF4_ELEMENT:String = "half4";
		public static const DAE_FXCMN_HALF4X4_ELEMENT:String = "half4x4";
		public static const DAE_FXCMN_FLOAT_ELEMENT:String = "float";
		public static const DAE_FXCMN_FLOAT2_ELEMENT:String = "float2";
		public static const DAE_FXCMN_FLOAT3_ELEMENT:String = "float3";
		public static const DAE_FXCMN_FLOAT4_ELEMENT:String = "float4";
		public static const DAE_FXCMN_FLOAT4X4_ELEMENT:String = "float4x4";
		public static const DAE_FXCMN_HINT_ELEMENT:String = "technique_hint";
		public static const DAE_FXCMN_INCLUDE_ELEMENT:String = "include";
		public static const DAE_FXCMN_SURFACE_ELEMENT:String = "surface";
		public static const DAE_FXCMN_SAMPLER1D_ELEMENT:String = "sampler1D";
		public static const DAE_FXCMN_SAMPLER2D_ELEMENT:String = "sampler2D";
		public static const DAE_FXCMN_SAMPLER3D_ELEMENT:String = "sampler3D";
		public static const DAE_FXCMN_SAMPLERCUBE_ELEMENT:String = "samplerCUBE";
		public static const DAE_FXCMN_SEMANTIC_ELEMENT:String = "semantic";
		public static const DAE_FXCMN_SETPARAM_ELEMENT:String = "setparam";
		public static const DAE_FXCMN_NEWPARAM_ELEMENT:String = "newparam";
		public static const DAE_FXCMN_STRING_ELEMENT:String = "string";
		public static const DAE_FXCMN_NAME_ELEMENT:String = "name";
		
		public static const DAE_FXCMN_VERTEX_SHADER:String = "VERTEX";
		public static const DAE_FXCMN_FRAGMENT_SHADER:String = "FRAGMENT";
		
		public static const DAE_FXSTD_CONSTANT_ELEMENT:String = "constant";
		public static const DAE_FXSTD_LAMBERT_ELEMENT:String = "lambert";
		public static const DAE_FXSTD_PHONG_ELEMENT:String = "phong";
		public static const DAE_FXSTD_BLINN_ELEMENT:String = "blinn";
		public static const DAE_FXSTD_COLOR_ELEMENT:String = "color";
		public static const DAE_FXSTD_FLOAT_ELEMENT:String = "float";
		public static const DAE_FXSTD_TEXTURE_ELEMENT:String = "texture";
		public static const DAE_FXSTD_TEXTURE_ATTRIBUTE:String = "texture";
		public static const DAE_FXSTD_TEXTURESET_ATTRIBUTE:String = "texcoord";
		
		public static const DAE_FXSTD_STATE_ALPHA_ELEMENT:String = "alpha";
		public static const DAE_FXSTD_STATE_BACK_ELEMENT:String = "back";
		public static const DAE_FXSTD_STATE_DEST_ELEMENT:String = "dest";
		public static const DAE_FXSTD_STATE_DESTALPHA_ELEMENT:String = "dest_alpha";
		public static const DAE_FXSTD_STATE_DESTRGB_ELEMENT:String = "dest_rgb";
		public static const DAE_FXSTD_STATE_FACE_ELEMENT:String = "face";
		public static const DAE_FXSTD_STATE_FAIL_ELEMENT:String = "fail";
		public static const DAE_FXSTD_STATE_FUNC_ELEMENT:String = "func";
		public static const DAE_FXSTD_STATE_FRONT_ELEMENT:String = "front";
		public static const DAE_FXSTD_STATE_MASK_ELEMENT:String = "mask";
		public static const DAE_FXSTD_STATE_MODE_ELEMENT:String = "mode";
		public static const DAE_FXSTD_STATE_REF_ELEMENT:String = "ref";
		public static const DAE_FXSTD_STATE_RGB_ELEMENT:String = "rgb";
		public static const DAE_FXSTD_STATE_SRC_ELEMENT:String = "src";
		public static const DAE_FXSTD_STATE_SRCALPHA_ELEMENT:String = "src_alpha";
		public static const DAE_FXSTD_STATE_SRCRGB_ELEMENT:String = "src_rgb";
		public static const DAE_FXSTD_STATE_VALUE:String = "value";
		public static const DAE_FXSTD_STATE_ZFAIL_ELEMENT:String = "zfail";
		public static const DAE_FXSTD_STATE_ZPASS_ELEMENT:String = "zpass";
		
		public static const DAE_CONTROLLER_SKIN_ELEMENT:String = "skin";
		public static const DAE_CONTROLLER_MORPH_ELEMENT:String = "morph";
		
		public static const DAE_CAMERA_PERSP_ELEMENT:String = "perspective";
		public static const DAE_CAMERA_ORTHO_ELEMENT:String = "orthographic";
		
		public static const DAE_RGB_ZERO_ELEMENT:String = "RGB_ZERO";
		public static const DAE_A_ONE_ELEMENT:String = "A_ONE";
		
		public static const DAE_ASPECT_CAMERA_PARAMETER:String = "aspect_ratio";
		public static const DAE_XFOV_CAMERA_PARAMETER:String = "xfov";	
		public static const DAE_YFOV_CAMERA_PARAMETER:String = "yfov";	
		public static const DAE_ZNEAR_CAMERA_PARAMETER:String = "znear";	
		public static const DAE_ZFAR_CAMERA_PARAMETER:String = "zfar";	
		public static const DAE_XMAG_CAMERA_PARAMETER:String = "xmag";	
		public static const DAE_YMAG_CAMERA_PARAMETER:String = "ymag";
		
		public static const DAE_AMBIENT_MATERIAL_PARAMETER:String = "ambient";
		public static const DAE_BUMP_MATERIAL_PARAMETER:String = "bump";
		public static const DAE_DIFFUSE_MATERIAL_PARAMETER:String = "diffuse";
		public static const DAE_EMISSION_MATERIAL_PARAMETER:String = "emission";
		public static const DAE_TRANSPARENCY_MATERIAL_PARAMETER:String = "transparency";
		public static const DAE_TRANSPARENT_MATERIAL_PARAMETER:String = "transparent";
		public static const DAE_OPAQUE_MATERIAL_ATTRIBUTE:String = "opaque";
		public static const DAE_REFLECTIVE_MATERIAL_PARAMETER:String = "reflective";
		public static const DAE_REFLECTIVITY_MATERIAL_PARAMETER:String = "reflectivity";
		public static const DAE_INDEXOFREFRACTION_MATERIAL_PARAMETER:String = "index_of_refraction";
		public static const DAE_SHININESS_MATERIAL_PARAMETER:String = "shininess";
		public static const DAE_SPECULAR_MATERIAL_PARAMETER:String = "specular";
		
		public static const DAE_LIGHT_AMBIENT_ELEMENT:String = "ambient";		
		public static const DAE_LIGHT_POINT_ELEMENT:String = "point";
		public static const DAE_LIGHT_DIRECTIONAL_ELEMENT:String = "directional";
		public static const DAE_LIGHT_SPOT_ELEMENT:String = "spot";
		
		public static const DAE_COLOR_LIGHT_PARAMETER:String = "color";
		public static const DAE_CONST_ATTENUATION_LIGHT_PARAMETER:String = "constant_attenuation";
		public static const DAE_LIN_ATTENUATION_LIGHT_PARAMETER:String = "linear_attenuation";
		public static const DAE_QUAD_ATTENUATION_LIGHT_PARAMETER:String = "quadratic_attenuation";
		public static const DAE_FALLOFFEXPONENT_LIGHT_PARAMETER:String = "falloff_exponent";
		public static const DAE_FALLOFFANGLE_LIGHT_PARAMETER:String = "falloff_angle";
		
		public static const DAE_BINDSHAPEMX_SKIN_PARAMETER:String = "bind_shape_matrix";
		
		public static const DAE_CONTRIBUTOR_ASSET_ELEMENT:String = "contributor";
		public static const DAE_AUTHOR_ASSET_PARAMETER:String = "author";
		public static const DAE_AUTHORINGTOOL_ASSET_PARAMETER:String = "authoring_tool";
		public static const DAE_CREATED_ASSET_PARAMETER:String = "created";
		public static const DAE_COMMENTS_ASSET_PARAMETER:String = "comments";
		public static const DAE_COPYRIGHT_ASSET_PARAMETER:String = "copyright";
		public static const DAE_KEYWORDS_ASSET_PARAMETER:String = "keywords";
		public static const DAE_MODIFIED_ASSET_PARAMETER:String = "modified";
		public static const DAE_REVISION_ASSET_PARAMETER:String = "revision";
		public static const DAE_SOURCEDATA_ASSET_PARAMETER:String = "source_data";
		public static const DAE_SUBJECT_ASSET_PARAMETER:String = "subject";
		public static const DAE_TITLE_ASSET_PARAMETER:String = "title";
		public static const DAE_UNITS_ASSET_PARAMETER:String = "unit";
		public static const DAE_UP:String = "up_axis";
		
		public static const DAE_PHYSICS_STATIC_FRICTION:String = 					"static_friction";
		public static const DAE_PHYSICS_DYNAMIC_FRICTION:String = 				"dynamic_friction";
		public static const DAE_PHYSICS_RESTITUTION:String = 						"restitution";
		
		// COLLADA 1.4 attributes
		public static const DAE_CLOSED_ATTRIBUTE:String = "closed";
		public static const DAE_CLOSEDU_ATTRIBUTE:String = "closed_u";
		public static const DAE_CLOSEDV_ATTRIBUTE:String = "closed_v";
		public static const DAE_COUNT_ATTRIBUTE:String = "count";
		public static const DAE_DEGREE_ATTRIBUTE:String = "degree";
		public static const DAE_UDEGREE_ATTRIBUTE:String = "udegree";
		public static const DAE_VDEGREE_ATTRIBUTE:String = "vdegree";
		public static const DAE_END_ATTRIBUTE:String = "end";
		public static const DAE_ID_ATTRIBUTE:String = "id";
		public static const DAE_MATERIAL_ATTRIBUTE:String = "material";
		public static const DAE_METERS_ATTRIBUTE:String = "meter";
		public static const DAE_METHOD_ATTRIBUTE:String = "method";
		public static const DAE_NAME_ATTRIBUTE:String = "name";
		public static const DAE_OFFSET_ATTRIBUTE:String = "offset";
		public static const DAE_PLATFORM_ATTRIBUTE:String = "platform";
		public static const DAE_PROFILE_ATTRIBUTE:String = "profile";
		public static const DAE_REF_ATTRIBUTE:String = "ref";
		public static const DAE_SEMANTIC_ATTRIBUTE:String = "semantic";
		public static const DAE_INDEX_ATTRIBUTE:String = "index";
		public static const DAE_INPUT_SEMANTIC_ATTRIBUTE:String = "input_semantic";
		public static const DAE_INPUT_SET_ATTRIBUTE:String = "input_set";
		public static const DAE_SET_ATTRIBUTE:String = "set";
		public static const DAE_SID_ATTRIBUTE:String = "sid";
		public static const DAE_START_ATTRIBUTE:String = "start";
		public static const DAE_STRIDE_ATTRIBUTE:String = "stride";
		public static const DAE_SOURCE_ATTRIBUTE:String = "source";
		public static const DAE_SURFACE_ATTRIBUTE:String = "surface";
		public static const DAE_SYMBOL_ATTRIBUTE:String = "symbol";
		public static const DAE_TARGET_ATTRIBUTE:String = "target";
		public static const DAE_TEXTURE_ATTRIBUTE:String = "texture";
		public static const DAE_TYPE_ATTRIBUTE:String = "type";
		public static const DAE_URL_ATTRIBUTE:String = "url";
		public static const DAE_STAGE_ATTRIBUTE:String = "stage";
		public static const DAE_VALUE:String = "value";
		
		public static const DAE_MIP_ATTRIBUTE:String = "mip";
		public static const DAE_SLICE_ATTRIBUTE:String = "slice";
		public static const DAE_FACE_ATTRIBUTE:String = "face";
		
		// COLLADA 1.4 types
		public static const DAE_FLOAT_TYPE:String = "float";
		public static const DAE_IDREF_TYPE:String = "IDREF";
		public static const DAE_MATRIX_TYPE:String = "float4x4";
		public static const DAE_NAME_TYPE:String = "Name";
		
		public static const DAE_IMAGE_INPUT:String = "IMAGE";
		public static const DAE_TEXTURE_INPUT:String = "TEXTURE";
		public static const DAE_WEIGHT_MORPH_INPUT:String = "MORPH_WEIGHT";
		public static const DAE_WEIGHT_MORPH_INPUT_DEPRECATED:String = "WEIGHT";
		public static const DAE_TARGET_MORPH_INPUT:String = "MORPH_TARGET";
		public static const DAE_TARGET_MORPH_INPUT_DEPRECATED:String = "TARGET";
		
		public static const DAE_TIME_TARGET:String = "TIME";
		
		public static const DAE_JOINT_NODE_TYPE:String = "JOINT";
		public static const DAE_NODE_NODE_TYPE:String = "NODE";
		
		// spline inputs
		public static const DAE_CVS_SPLINE_INPUT:String = "POSITION";
		//public static const DAE_INTERPOLATION_SPLINE_INPUT:String = "INTERPOLATION";
		//public static const DAE_IN_TANGENT_SPLINE_INPUT:String = "IN_TANGENT";
		//public static const DAE_OUT_TANGENT_SPLINE_INPUT:String = "OUT_TANGENT";
		//public static const DAE_CONTINUITY_SPLINE_INPUT:String = "CONTINUITY";
		//public static const DAE_LINEAR_STEPS_SPLINE_INPUT:String = "LINEAR_STEPS";
		public static const DAE_KNOT_SPLINE_INPUT:String = "KNOTS";
		public static const DAE_WEIGHT_SPLINE_INPUT:String = "WEIGHTS";
		
		
		// Collada 1.4 physics
		public static const DAE_PHYSICS_MATERIAL_ELEMENT:String = "physics_material";
		public static const DAE_PHYSICS_MODEL_ELEMENT:String = "physics_model";
		public static const DAE_PHYSICS_SCENE_ELEMENT:String = "physics_scene";
		public static const DAE_INSTANCE_PHYSICS_MATERIAL_ELEMENT:String = "instance_physics_material";
		public static const DAE_INSTANCE_PHYSICS_MODEL_ELEMENT:String = "instance_physics_model";
		public static const DAE_INSTANCE_PHYSICS_SCENE_ELEMENT:String = "instance_physics_scene";
		public static const DAE_INSTANCE_RIGID_BODY_ELEMENT:String = "instance_rigid_body";
		public static const DAE_INSTANCE_RIGID_CONSTRAINT_ELEMENT:String = "instance_rigid_constraint";
		public static const DAE_INSTANCE_FORCE_FIELD_ELEMENT:String = "instance_force_field";
		public static const DAE_TIME_STEP_ATTRIBUTE:String = "time_step";
		public static const DAE_GRAVITY_ATTRIBUTE:String = "gravity";
		public static const DAE_RESTITUTION_ATTRIBUTE:String = "restitution";
		public static const DAE_STATIC_FRICTION_ATTRIBUTE:String = "static_friction";
		public static const DAE_DYNAMIC_FRICTION_ATTRIBUTE:String = "dynamic_friction";
		public static const DAE_VELOCITY_ELEMENT:String = "velocity";
		public static const DAE_ANGULAR_VELOCITY_ELEMENT:String = "angular_velocity";
		public static const DAE_BODY_ATTRIBUTE:String = "body";
		public static const DAE_CONSTRAINT_ATTRIBUTE:String = "constraint";
		public static const DAE_MASS_FRAME_ELEMENT:String = "mass_frame";
		public static const DAE_LIMITS_ELEMENT:String = "limits";
		public static const DAE_LINEAR_ELEMENT:String = "linear";
		public static const DAE_ANGULAR_ELEMENT:String = "angular";
		public static const DAE_SWING_CONE_AND_TWIST_ELEMENT:String = "swing_cone_and_twist";
		public static const DAE_CONVEX_HULL_OF_ATTRIBUTE:String = "convex_hull_of";
		public static const DAE_HEIGHT_ELEMENT:String = "height";
		
		// Physics extension. Currently in prototype phase.
		public static const DAE_MIN_ELEMENT:String = "min";
		public static const DAE_MAX_ELEMENT:String = "max";
		public static const DAE_SHAPE_ELEMENT:String = "shape";
		public static const 	DAE_RIGID_BODY_ELEMENT:String = "rigid_body";
		public static const DAE_DYNAMIC_ELEMENT:String = "dynamic";
		public static const DAE_HOLLOW_ELEMENT:String = "hollow";
		public static const DAE_MASS_ELEMENT:String = "mass";
		public static const DAE_BOX_ELEMENT:String = "box";
		public static const DAE_SPHERE_ELEMENT:String = "sphere";
		public static const DAE_CAPSULE_ELEMENT:String = "capsule";
		public static const DAE_CYLINDER_ELEMENT:String = "cylinder";
		public static const DAE_ELLIPSOID_ELEMENT:String = "ellipsoid";
		public static const DAE_TAPERED_CAPSULE_ELEMENT:String = "tapered_capsule";
		public static const DAE_TAPERED_CYLINDER_ELEMENT:String = "tapered_cylinder";
		public static const DAE_PLANE_ELEMENT:String = "plane";
		public static const DAE_FORMAT_ELEMENT:String = "format";
		public static const DAE_FORMAT_HINT_ELEMENT:String = "format_hint";
		public static const DAE_PRECISION_ELEMENT:String = "precision";
		public static const DAE_OPTION_ELEMENT:String = "option";
		public static const DAE_HALF_EXTENTS_ELEMENT:String = "half_extents";
		public static const DAE_EQUATION_ELEMENT:String = "equation";
		public static const DAE_SIZE_ELEMENT:String = "size";
		public static const DAE_RADIUS_ELEMENT:String = "radius";
		public static const DAE_RADIUS1_ELEMENT:String = "radius1";
		public static const DAE_RADIUS2_ELEMENT:String = "radius2";
		public static const DAE_CONVEX_MESH_ELEMENT:String = "convex_mesh";
		public static const DAE_INERTIA_ELEMENT:String = "inertia";
		public static const DAE_DENSITY_ELEMENT:String = "density";
		public static const DAE_CENTER_OF_MASS_ELEMENT:String = "center_of_mass";
		public static const DAE_DYNAMICS_ELEMENT:String = "dynamics";
		public static const DAE_RIGID_CONSTRAINT_ELEMENT:String = "rigid_constraint";
		public static const DAE_FORCE_FIELD_ELEMENT:String = "force_field";
		public static const DAE_ATTACHMENT_ELEMENT:String = "attachment";
		public static const DAE_REF_ATTACHMENT_ELEMENT:String = "ref_attachment";
		public static const DAE_ROT_LIMIT_MIN_ELEMENT:String = "rot_limit_min";
		public static const DAE_ROT_LIMIT_MAX_ELEMENT:String = "rot_limit_max";
		public static const DAE_TRANS_LIMIT_MIN_ELEMENT:String = "trans_limit_min";
		public static const DAE_TRANS_LIMIT_MAX_ELEMENT:String = "trans_limit_max";
		public static const DAE_ENABLED_ELEMENT:String = "enabled";
		public static const DAE_INTERPENETRATE_ELEMENT:String = "interpenetrate";
		public static const DAE_SPRING_ELEMENT:String = "spring";
		public static const DAE_STIFFNESS_ELEMENT:String = "stiffness";
		public static const DAE_DAMPING_ELEMENT:String = "damping";
		public static const DAE_TARGET_VALUE:String = "target_value";
		public static const DAE_ANNOTATE_ELEMENT:String = "annotate";
		public static const DAE_TRUE_KEYWORD:String	= "true";
		public static const DAE_FALSE_KEYWORD:String = "false";
		
		// COLLADA 1.4.1 <format_hint> elements
		public static const DAE_FORMAT_HINT_RGB_VALUE:String = "RGB";
		public static const DAE_FORMAT_HINT_RGBA_VALUE:String = "RGBA";
		public static const DAE_FORMAT_HINT_L_VALUE:String = "L";
		public static const DAE_FORMAT_HINT_LA_VALUE:String = "LA";
		public static const DAE_FORMAT_HINT_D_VALUE:String = "D";
		public static const DAE_FORMAT_HINT_XYZ_VALUE:String = "XYZ";
		public static const DAE_FORMAT_HINT_XYZW_VALUE:String = "XYZW";
		public static const DAE_FORMAT_HINT_SNORM_VALUE:String = "SNORM";
		public static const DAE_FORMAT_HINT_UNORM_VALUE:String = "UNORM";
		public static const DAE_FORMAT_HINT_SINT_VALUE:String = "SINT";
		public static const DAE_FORMAT_HINT_UINT_VALUE:String = "UINT";
		public static const DAE_FORMAT_HINT_FLOAT_VALUE:String = "FLOAT";
		public static const DAE_FORMAT_HINT_LOW_VALUE:String = "LOW";
		public static const DAE_FORMAT_HINT_MID_VALUE:String = "MID";
		public static const DAE_FORMAT_HINT_HIGH_VALUE:String = "HIGH";
		public static const DAE_FORMAT_HINT_SRGB_GAMMA_VALUE:String = "SRGB_GAMMA";
		public static const DAE_FORMAT_HINT_NORMALIZED3_VALUE:String = "NORMALIZED3";
		public static const DAE_FORMAT_HINT_NORMALIZED4_VALUE:String = "NORMALIZED4";
		public static const DAE_FORMAT_HINT_COMPRESSABLE_VALUE:String = "COMPRESSABLE";
		
		// Emitter premium extension
		public static const DAE_EMITTER_ELEMENT:String = "emitter";
		public static const DAE_LIBRARY_EMITTER_ELEMENT:String = "library_emitters";
		public static const DAE_INSTANCE_EMITTER_ELEMENT:String = "instance_emitter";
		
		// COLLADA 1.3 elements
		public static const 	DAE_ACCESSOR_ELEMENT:String = "accessor";
		public static const DAE_ANIMATION_ELEMENT:String = "animation";
		public static const DAE_ASSET_ELEMENT:String = "asset";
		public static const DAE_CAMERA_ELEMENT:String = "camera";
		public static const DAE_CHANNEL_ELEMENT:String = "channel";
		public static const DAE_CHANNELS_ELEMENT:String = "channels";
		public static const DAE_COLLADA_ELEMENT:String = "COLLADA";
		public static const DAE_CONTROLLER_ELEMENT:String = "controller";
		public static const DAE_DEPTH_ELEMENT:String = "depth";
		public static const DAE_EXTRA_ELEMENT:String = "extra";
		public static const DAE_RANGE_ELEMENT:String = "range";
		public static const DAE_BOOL_ARRAY_ELEMENT:String = "bool_array";
		public static const DAE_FLOAT_ARRAY_ELEMENT:String = "float_array";
		public static const DAE_GEOMETRY_ELEMENT:String = "geometry";
		public static const DAE_HOLE_ELEMENT:String = "h";
		public static const DAE_IDREF_ARRAY_ELEMENT:String = "IDREF_array";
		public static const DAE_IMAGE_ELEMENT:String = "image";
		public static const DAE_INPUT_ELEMENT:String = "input";
		public static const DAE_INT_ARRAY_ELEMENT:String = "int_array";
		public static const DAE_JOINTS_ELEMENT:String = "joints";
		public static const DAE_LIGHT_ELEMENT:String = "light";
		public static const DAE_LINES_ELEMENT:String = "lines";
		public static const DAE_LINESTRIPS_ELEMENT:String = "linestrips";
		public static const DAE_LOOKAT_ELEMENT:String = "lookat";
		public static const DAE_MATERIAL_ELEMENT:String = "material";
		public static const DAE_MATRIX_ELEMENT:String = "matrix";
		public static const DAE_MESH_ELEMENT:String = "mesh";
		public static const DAE_NAME_ARRAY_ELEMENT:String = "Name_array";
		public static const DAE_NODE_ELEMENT:String = "node";
		public static const DAE_OPTICS_ELEMENT:String = "optics";
		public static const DAE_PARAMETER:String = "param";
		public static const DAE_PASS_ELEMENT:String = "pass";
		public static const DAE_POLYGON_ELEMENT:String = "p";
		public static const DAE_POLYGONHOLED_ELEMENT:String = "ph";
		public static const DAE_POLYGONS_ELEMENT:String = "polygons";
		public static const DAE_POLYLIST_ELEMENT:String = "polylist";
		public static const DAE_REST_LENGTH_ELEMENT:String = "rest_length";			// [Deprecated 1.4] - Replaced by "target_value"
		public static const DAE_ROTATE_ELEMENT:String = "rotate";
		public static const DAE_SCALE_ELEMENT:String = "scale";
		public static const DAE_SCENE_ELEMENT:String = "scene";
		public static const DAE_SHADER:String = "shader";
		public static const DAE_SOURCE_ELEMENT:String = "source";
		public static const DAE_SPLINE_ELEMENT:String = "spline";
		public static const DAE_SKEW_ELEMENT:String = "skew";
		public static const DAE_TECHNIQUE_ELEMENT:String = "technique";
		public static const DAE_TEXTURE_ELEMENT:String = "texture";
		public static const DAE_TEXTURE_SURFACE_ELEMENT:String = "texture_surface";
		public static const DAE_TRANSLATE_ELEMENT:String = "translate";
		public static const DAE_TRIANGLES_ELEMENT:String = "triangles";
		public static const DAE_TRIFANS_ELEMENT:String = "trifans";
		public static const DAE_TRIM_GROUP:String = "trim_group";
		public static const DAE_TRISTRIPS_ELEMENT:String = "tristrips";
		public static const DAE_VERTEX_ELEMENT:String = "v";
		public static const DAE_VERTICES_ELEMENT:String = "vertices";
		public static const DAE_WIDTH_ELEMENT:String = "width";
		
		public static const DAE_BINDMATRIX_SKIN_INPUT:String = "INV_BIND_MATRIX";
		public static const DAE_JOINT_SKIN_INPUT:String = "JOINT";
		public static const DAE_WEIGHT_SKIN_INPUT:String = "WEIGHT";
		
		public static const DAE_INPUT_ANIMATION_INPUT:String = "INPUT";
		public static const DAE_OUTPUT_ANIMATION_INPUT:String = "OUTPUT";
		public static const DAE_INTANGENT_ANIMATION_INPUT:String = "IN_TANGENT";
		public static const DAE_OUTTANGENT_ANIMATION_INPUT:String = "OUT_TANGENT";
		public static const DAE_INTERPOLATION_ANIMATION_INPUT:String = "INTERPOLATION";
		public static const DAEFC_TCB_ANIMATION_INPUT:String = "TCB";
		public static const DAEFC_EASE_INOUT_ANIMATION_INPUT:String = "EASE_IN_OUT";
		
		public static const DAE_X_UP:String = "X_UP";
		public static const DAE_Y_UP:String = "Y_UP";
		public static const DAE_Z_UP:String = "Z_UP";
		
		// COLLADA 1.4 Shared elements
		public static const DAESHD_DOUBLESIDED_PARAMETER:String = "double_sided";
		
		// COLLADA 1.4 Max-specific profile
		public static const DAEMAX_MAX_PROFILE:String = "MAX3D";
		
		public static const DAEMAX_TARGET_CAMERA_PARAMETER:String = "target";
		public static const DAEMAX_ASPECTRATIO_LIGHT_PARAMETER:String = "aspect_ratio";
		public static const DAEMAX_TARGET_LIGHT_PARAMETER:String = "target";
		public static const DAEMAX_DEFAULT_TARGET_DIST_LIGHT_PARAMETER:String = "target_default_dist";
		public static const DAEMAX_OUTERCONE_LIGHT_PARAMETER:String = "outer_cone";
		public static const DAEMAX_OVERSHOOT_LIGHT_PARAMETER:String = "overshoot";
		public static const DAEMAX_SPECLEVEL_MATERIAL_PARAMETER:String = "spec_level";
		public static const DAEMAX_DISPLACEMENT_MATERIAL_PARAMETER:String = "displacement";
		public static const DAEMAX_EMISSIONLEVEL_MATERIAL_PARAMETER:String = "emission_level";
		public static const DAEMAX_FACETED_MATERIAL_PARAMETER:String = "faceted";
		public static const DAEMAX_FILTERCOLOR_MATERIAL_PARAMETER:String = "filter_color";
		public static const DAEMAX_INDEXOFREFRACTION_MATERIAL_PARAMETER:String = "index_of_refraction";
		public static const DAEMAX_USERPROPERTIES_NODE_PARAMETER:String = "user_properties";
		public static const DAEMAX_WIREFRAME_MATERIAL_PARAMETER:String = "wireframe";
		public static const DAEMAX_FACEMAP_MATERIAL_PARAMETER:String = "face_map";
		public static const DAEMAX_AMOUNT_TEXTURE_PARAMETER:String = "amount";
		public static const DAEMAX_CAMERA_TARGETDISTANCE_PARAMETER:String = "target_distance";
		public static const DAEMAX_FRAMERATE_PARAMETER:String = "frame_rate";
		
		// Extra parameters for Max lights
		public static const DAEMAX_DECAY_TYPE:String = "decay_type";
		public static const DAEMAX_DECAY_START_PARAMETER:String = "decay_start";
		public static const DAEMAX_USE_NEAR_ATTEN_PARAMETER:String = "use_near_attenuation";
		public static const DAEMAX_NEAR_ATTEN_START_PARAMETER:String = "near_attenuation_start";
		public static const DAEMAX_NEAR_ATTEN_END_PARAMETER:String = "near_attenuation_end";
		public static const DAEMAX_USE_FAR_ATTEN_PARAMETER:String = "use_far_attenuation";
		public static const DAEMAX_FAR_ATTEN_START_PARAMETER:String = "far_attenuation_start";
		public static const DAEMAX_FAR_ATTEN_END_PARAMETER:String = "far_attenuation_end";
		
		// Extra parameters for Max shadows
		public static const DAEMAX_SHADOW_ATTRIBS:String =					"shadow_attributes";
		public static const DAEMAX_SHADOW_TYPE:String = "type";
		public static const DAEMAX_SHADOW_TYPE_MAP:String = "type_map";
		public static const DAEMAX_SHADOW_TYPE_RAYTRACE:String = "type_raytrace";
		public static const DAEMAX_SHADOW_AFFECTS:String =					"affect_list";
		public static const DAEMAX_SHADOW_LIST_NODE:String =					"list_nodes";
		public static const DAEMAX_SHADOW_LIST_EXCLUDES:String =					"list_is_exclusive";
		public static const DAEMAX_SHADOW_LIST_ILLUMINATES:String =				"is_illuminated";
		public static const DAEMAX_SHADOW_LIST_CASTS:String =					"casts_shadows";
		
		public static const DAEMAX_LIGHT_AFFECTS_SHADOW:String =			"light_affects_shadow";
		public static const DAEMAX_PROJ_IMAGE:String =							"proj_image";
		
		public static const DAEMAX_LIGHT_MAP:String =							"light_map";
		public static const DAEMAX_SHADOW_MAP:String =							"shadow_map";
		public static const DAEMAX_SHADOW_PROJ_COLOR:String =					"shadow_color";
		public static const DAEMAX_SHADOW_PROJ_COLOR_MULT:String =				"shadow_color_mult";
		
		
		// Extra parameters for Max SkyLight
		public static const DAEMAX_SKY_LIGHT:String =							"skylight";
		public static const DAEMAX_SKY_RAYS_PER_SAMPLE_PARAMETER:String = "rays_per_sample";
		public static const DAEMAX_SKY_RAY_BIAS_PARAMETER:String = "ray_bias";
		public static const DAEMAX_SKY_CAST_SHADOWS_PARAMETER:String = "cast_shadows";
		public static const DAEMAX_SKY_COLOR_MAP:String =						"color_map";
		public static const DAEMAX_SKY_COLOR_MAP_ON_PARAMETER:String = "color_map_on";
		public static const DAEMAX_SKY_COLOR_MAP_AMOUNT_PARAMETER:String = "color_map_amount";
		public static const DAEMAX_SKY_SKYMODE:String =						"sky_mode";
		public static const DAEMAX_SKY_INTENSITY_ON:String =					"intensity_on";
		
		// Extra parameters for Max Depth of Field multi-pass camera effect
		public static const DAEMAX_CAMERA_MOTIONBLUR_ELEMENT:String = "motion_blur";
		public static const DAEMAX_CAMERA_MB_DISPLAYPASSES_PARAMETER:String = "display_passes";
		public static const DAEMAX_CAMERA_MB_TOTALPASSES_PARAMETER:String = "total_passes";
		public static const DAEMAX_CAMERA_MB_DURATION_PARAMETER:String = "duration";
		public static const DAEMAX_CAMERA_MB_BIAS_PARAMETER:String = "bias";
		public static const DAEMAX_CAMERA_MB_NORMWEIGHTS_PARAMETER:String = "normalized_weights";
		public static const DAEMAX_CAMERA_MB_DITHERSTRENGTH_PARAMETER:String = "dither_strength";
		public static const DAEMAX_CAMERA_MB_TILESIZE_PARAMETER:String = "tile_size";
		public static const DAEMAX_CAMERA_MB_DISABLEFILTER_PARAMETER:String = "disable_filtering";
		public static const DAEMAX_CAMERA_MB_DISABLEANTIALIAS_PARAMETER:String = "disable_antialiasing";
		
		
		// MAYA Profile Syntax Definitions
		
		// COLLADA 1.4 Maya-specific definitions
		public static const DAEMAYA_MAYA_PROFILE:String =							"MAYA";
		
		public static const DAEMAYA_VAPERTURE_PARAMETER:String = "vertical_aperture";
		public static const DAEMAYA_HAPERTURE_PARAMETER:String = "horizontal_aperture";
		public static const DAEMAYA_LENSSQUEEZE_PARAMETER:String = "lens_squeeze";
		
		public static const DAEMAYA_PENUMBRA_LIGHT_PARAMETER:String = "penumbra_angle";
		public static const DAEMAYA_DROPOFF_LIGHT_PARAMETER:String = "dropoff";
		public static const DAEMAYA_AMBIENTSHADE_LIGHT_PARAMETER:String = "ambient_shade";
		
		public static const DAEMAYA_NOTE_PARAMETER:String = "note";
		public static const DAEMAYA_ENDTIME_PARAMETER:String = "end_time";
		public static const DAEMAYA_STARTTIME_PARAMETER:String = "start_time";
		
		public static const DAEMAYA_DRIVER_INPUT:String = "DRIVER";
		public static const DAEMAYA_WEIGHT_INPUT:String = "WEIGHT";
		
		// COLLADA 1.3 Maya-specific definitions
		public static const DAEMAYA_BLINDNAME_PARAMETER:String = "BLINDNAME";
		public static const DAEMAYA_BLINDTYPE:String = "BLINDTYPEID";
		public static const DAEMAYA_DOUBLE_SIDED_PARAMETER:String = "DOUBLE_SIDED";
		public static const DAEMAYA_LAYER_PARAMETER:String = "layer";
		public static const DAEMAYA_LONGNAME_PARAMETER:String = "long_name";
		public static const DAEMAYA_PREINFINITY_PARAMETER:String = "pre_infinity";
		public static const DAEMAYA_POSTINFINITY_PARAMETER:String = "post_infinity";
		public static const DAEMAYA_SHORTNAME_PARAMETER:String = "short_name";
		
		public static const DAEMAYA_TEXTURE_WRAPU_PARAMETER:String = "wrapU";
		public static const DAEMAYA_TEXTURE_WRAPV_PARAMETER:String = "wrapV";
		public static const DAEMAYA_TEXTURE_MIRRORU_PARAMETER:String = "mirrorU";
		public static const DAEMAYA_TEXTURE_MIRRORV_PARAMETER:String = "mirrorV";
		public static const DAEMAYA_TEXTURE_COVERAGEU_PARAMETER:String = "coverageU";
		public static const DAEMAYA_TEXTURE_COVERAGEV_PARAMETER:String = "coverageV";
		public static const DAEMAYA_TEXTURE_TRANSFRAMEU_PARAMETER:String = "translateFrameU";
		public static const DAEMAYA_TEXTURE_TRANSFRAMEV_PARAMETER:String = "translateFrameV";
		public static const DAEMAYA_TEXTURE_ROTFRAME_PARAMETER:String = "rotateFrame";
		public static const DAEMAYA_TEXTURE_STAGGER_PARAMETER:String = "stagger";
		public static const DAEMAYA_TEXTURE_REPEATU_PARAMETER:String = "repeatU";
		public static const DAEMAYA_TEXTURE_REPEATV_PARAMETER:String = "repeatV";
		public static const DAEMAYA_TEXTURE_OFFSETU_PARAMETER:String = "offsetU";
		public static const DAEMAYA_TEXTURE_OFFSETV_PARAMETER:String = "offsetV";
		public static const DAEMAYA_TEXTURE_ROTATEUV_PARAMETER:String = "rotateUV";
		public static const DAEMAYA_TEXTURE_NOISEU_PARAMETER:String = "noiseU";
		public static const DAEMAYA_TEXTURE_NOISEV_PARAMETER:String = "noiseV";
		public static const DAEMAYA_TEXTURE_FAST_PARAMETER:String = "fast";
		public static const DAEMAYA_TEXTURE_BLENDMODE_PARAMETER:String = "blend_mode";
		
		public static const DAEMAYA_PROJECTION_ELEMENT:String = "projection";
		public static const DAEMAYA_PROJECTION_TYPE:String = "type";
		public static const DAEMAYA_PROJECTION_MATRIX_PARAMETER:String = "matrix";
	}	
}
