/* 
 * PROJECT: FLARManager
 * http://transmote.com/flar
 * Copyright 2009, Eric Socolofsky
 * --------------------------------------------------------------------------------
 * This work complements FLARToolkit, developed by Saqoosha as part of the Libspark project.
 *	http://www.libspark.org/wiki/saqoosha/FLARToolKit
 * FLARToolkit is Copyright (C)2008 Saqoosha,
 * and is ported from NYARToolkit, which is ported from ARToolkit.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this framework; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * For further information please contact:
 *	<eric(at)transmote.com>
 *	http://transmote.com/flar
 * 
 */

package com.transmote.flar.utils.smoother {
	import __AS3__.vec.Vector;
	
	import org.libspark.flartoolkit.core.types.matrix.FLARDoubleMatrix34;
	
	public interface IFLARMatrixSmoother {
		/**
		 * init from a name-value paired object that contains parameters parsed from XML.
		 */
		function initFromXML (paramsObj:Object) :void;
		
		/**
		 * returns a FLARDoubleMatrix34 that is the average of the last @numFrames FLARDoubleMatrix34 instances.
		 * @param	matrixHistory	Vector of previous matrices to average.
		 */
		function smoothMatrices (storedMatrices:Vector.<FLARDoubleMatrix34>) :FLARDoubleMatrix34;
		
		/**
		 * free this instance for garbage collection.
		 */
		function dispose () :void;
	}
}