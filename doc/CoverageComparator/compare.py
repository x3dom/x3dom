import os
import sys
import re
from xml.dom import minidom

class ContainedIn:
	def __init__(self):
		self.avalon = False
		self.x3dom = False

class FieldComparison:
	def __init__(self):
		self.name = ""
		self.contained = ContainedIn()
	
	
class NodeComparison:
    def __init__(self):
		self.name = ""
		#self.contained = ContainedIn()
		self.fieldNames = []
		self.fields = []

def updateNodeComparison(xml, context):
	for node in xml.getElementsByTagName("node"):
		name = node.attributes["name"].value
		if name in nodeNames:
			nodeComparison = nodes[nodeNames.index(name)]
		else:
			nodeNames.append(name);
			nodeComparison = NodeComparison()
			nodeComparison.name = name
			nodes.append(nodeComparison)		
		
		#if context == "x3dom":
		#	nodeComparison.contained.x3dom = True
		#else:
		#	nodeComparison.contained.avalon = True
		
		
		#iterate fields
		for field in xml.getElementsByTagName("field"):
			fieldname = field.attributes["name"].value
			
			if fieldname in nodeComparison.fieldNames:
				fieldComparison = nodeComparison.fields[nodeComparison.fieldNames.index(fieldname)]
			else:
				nodeComparison.fieldNames.append(fieldname)
				fieldComparison = FieldComparison()
				fieldComparison.name = fieldname
				nodeComparison.fields.append(fieldComparison)
			
			if context == "x3dom":
				fieldComparison.contained.x3dom = True
			else:
				fieldComparison.contained.avalon = True
			
	
	
    

def readXmlFromFile(path):
	#print "opening file " + path + " \n"
	xmldoc = minidom.parse(path)
	return xmldoc
	

def createComparisonPage():
	result = []
	
	result.append("<html><head><h1>Node Coverage Comparison</h1><style>.true{background-color:green;}.false{background-color:red;}</style></head><body>");
	
	for node in nodes:
		result.append("<table><caption>"+node.name+"</caption>")
		result.append("<thead><tr><th>Name</th><th>Avalon</th><th>x3dom</th></tr></thead><tbody>")
		
		for field in node.fields:
			result.append("<tr><td>"+field.name+"</td><td " + ("class='true'" if field.contained.avalon else "class='false'")  + " ></td><td " + ("class='true'" if field.contained.x3dom else "class='false'")+ "></td></tr>");
		
		result.append("</tbody></table><br>")
	
	result.append("</table></body>");
	return "".join(result)
	
		
## main script
if len(sys.argv) <= 2:
    print "Usage: python " + sys.argv[0] + " <NDF_FOLDER> <XNDF_FOLDER>"
    quit()

ndfs = []
xndfs = []

    
# read NFD folder
print "Reading folder \"" + sys.argv[1] + "\" ...\n",

for dirname, dirnames, filenames in os.walk(sys.argv[1]):

    # print path to all filenames.
    for filename in filenames:
		path = os.path.join(dirname, filename)
		ndfs.append(readXmlFromFile(path))
		

		
		
for dirname, dirnames, filenames in os.walk(sys.argv[2]):
    # print path to all filenames.
    for filename in filenames:
		path = os.path.join(dirname, filename)
		xndfs.append(readXmlFromFile(path))

nodeNames = []
nodes = []

for xml in ndfs:
	updateNodeComparison(xml,"avalon")

for xml in xndfs:
	updateNodeComparison(xml,"x3dom")

html = createComparisonPage()
    
print "Writing result page"
f = open("comparison.html", 'w')
f.write(html)    
f.close() 
	
print "Success."
