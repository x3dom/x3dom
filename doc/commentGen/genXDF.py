import sys
import xml.etree.ElementTree as ET


# writes an x3dom definition xml file (.xdf) from a node annotation
def writeXDF(na):
    print "writing XDF for " + na.nodeName

