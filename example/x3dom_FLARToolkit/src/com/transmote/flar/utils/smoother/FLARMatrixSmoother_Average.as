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
	
	public class FLARMatrixSmoother_Average implements IFLARMatrixSmoother {
		public function FLARMatrixSmoother_Average() {}
		
		/**
		 * init from a name-value paired object that contains parameters parsed from XML.
		 */
		public function initFromXML (paramsObj:Object) :void {
			// not implemented in this class.
		}
		
		/**
		 * returns a FLARDoubleMatrix34 that is the average of a Vector of FLARDoubleMatrix34 instances.
		 * @param	storedMatrices	Vector of storedMatrices to average.  (storedMatrices is not modified.)
		 */
		public function smoothMatrices (storedMatrices:Vector.<FLARDoubleMatrix34>) :FLARDoubleMatrix34 {
			var smoothedMatrix:FLARDoubleMatrix34 = new FLARDoubleMatrix34();
			smoothedMatrix.setValue(new Array(0,0,0,0,0,0,0,0,0,0,0,0));
			var storedMatrix:FLARDoubleMatrix34;
			var numStoredMatrices:int = 0;	// number of non-null matrices in storedMatrices
			var i:int = storedMatrices.length;
			while (i--) {
				storedMatrix = storedMatrices[i];
				if (!storedMatrix) { continue; }
				
				smoothedMatrix.m00 += storedMatrix.m00;
				smoothedMatrix.m01 += storedMatrix.m01;
				smoothedMatrix.m02 += storedMatrix.m02;
				smoothedMatrix.m03 += storedMatrix.m03;
				smoothedMatrix.m10 += storedMatrix.m10;
				smoothedMatrix.m11 += storedMatrix.m11;
				smoothedMatrix.m12 += storedMatrix.m12;
				smoothedMatrix.m13 += storedMatrix.m13;
				smoothedMatrix.m20 += storedMatrix.m20;
				smoothedMatrix.m21 += storedMatrix.m21;
				smoothedMatrix.m22 += storedMatrix.m22;
				smoothedMatrix.m23 += storedMatrix.m23;
				
				numStoredMatrices++;
			}
			
			if (!numStoredMatrices) {
				return new FLARDoubleMatrix34();
			}
			
			smoothedMatrix.m00 /= numStoredMatrices;
			smoothedMatrix.m01 /= numStoredMatrices;
			smoothedMatrix.m02 /= numStoredMatrices;
			smoothedMatrix.m03 /= numStoredMatrices;
			smoothedMatrix.m10 /= numStoredMatrices;
			smoothedMatrix.m11 /= numStoredMatrices;
			smoothedMatrix.m12 /= numStoredMatrices;
			smoothedMatrix.m13 /= numStoredMatrices;
			smoothedMatrix.m20 /= numStoredMatrices;
			smoothedMatrix.m21 /= numStoredMatrices;
			smoothedMatrix.m22 /= numStoredMatrices;
			smoothedMatrix.m23 /= numStoredMatrices;
			
			return smoothedMatrix;
		}
		
		public function dispose () :void {
			//
		}
	}
}