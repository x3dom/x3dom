/*
 * This class is used to access bytes of a file transmitted
 * via aAjax request.
 *
 * <aha/>
 */


StreamReader = function(strData, iDataOffset, iDataLength) {

    var data = strData;
    var dataOffset = iDataOffset || 0;
    var dataLength = 0;
    
    this.rawData = function() {
        return data;
    }
    
    if (typeof strData == 'string') {

        dataLenght = iDataLength || data.length;

        this.byteAt = function(iOffset) {
            return data.charCodeAt(iOffset + dataOffset) & 0xFF;
        }
    
        this.bytesAt = function(iOffset, iLength) {
            
        }


    } else if (typeof strData == 'unknown') {
        
    }
    
    
    this.length = function() {
        return dataLength;
    }
    
    
    
}
