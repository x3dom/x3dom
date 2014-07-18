import os
import sys
import re
from xml.dom import minidom

#------------------------------------------------------------------------------------------------------
		
class FieldComparison:
	def __init__(self):
		self.name = ""
		self.avalon = 0
		self.x3dom = 0
		
#------------------------------------------------------------------------------------------------------	
	
class NodeComparison:
    def __init__(self):
		self.name = ""
		self.fieldNames = []
		self.fields = []
		self.parents = []


#------------------------------------------------------------------------------------------------------

def getFieldComparison(name, nodeComparison):
	if name in nodeComparison.fieldNames:
		return nodeComparison.fields[nodeComparison.fieldNames.index(name)]
	else:
		nodeComparison.fieldNames.append(name)
		fieldComparison = FieldComparison()
		fieldComparison.name = name
		nodeComparison.fields.append(fieldComparison)
		return fieldComparison

#------------------------------------------------------------------------------------------------------
		
def getNodeComparison(name):
	if name in nodeNames:
		return nodes[nodeNames.index(name)]
	else:
		nodeNames.append(name);
		nodeComparison = NodeComparison()
		nodeComparison.name = name
		nodes.append(nodeComparison)		
		return nodeComparison
		
#------------------------------------------------------------------------------------------------------		
		
def updateNodeComparison(xml, context):
	for node in xml.getElementsByTagName("node"):
		name = node.attributes["name"].value
		nodeComparison = getNodeComparison(name)
		
		parent = node.attributes["parent"].value
		
		if parent != "" and parent != "null":
			nodeComparison.parents.append(parent)
		
		#iterate fields
		for field in xml.getElementsByTagName("field"):
			fieldname = field.attributes["name"].value
			fieldComparison = getFieldComparison(fieldname, nodeComparison)
			if context == "x3dom":
				fieldComparison.x3dom = 1 
			else:
				fieldComparison.avalon = 1
	

#------------------------------------------------------------------------------------------------------

def collectParentFieldsRecursive( nodeComparison, parentComparison ):
	print "collecting parent "+parentComparison.name+" for "+nodeComparison.name
	
	for parentFieldName in parentComparison.fieldNames:
			parentField = parentComparison.fields[parentComparison.fieldNames.index(parentFieldName)]
			fieldComparison = getFieldComparison(parentFieldName, nodeComparison)
			
			if parentField.x3dom != 0:
				fieldComparison.x3dom = 2
			
			if parentField.avalon != 0:
				fieldComparison.avalon = 2
	
	for parentName in parentComparison.parents:
		parentComparison = getNodeComparison(parentName)
		collectParentFieldsRecursive(nodeComparison, parentComparison)
		
			
			
			
#------------------------------------------------------------------------------------------------------
			
def collectParentField(nodeComparison):
	
	for parentName in nodeComparison.parents:
		parentComparison = getNodeComparison(parentName)
		collectParentFieldsRecursive(nodeComparison, parentComparison)
	
#------------------------------------------------------------------------------------------------------    

def readXmlFromFile(path):
	#print "opening file " + path + " \n"
	xmldoc = minidom.parse(path)
	return xmldoc

#------------------------------------------------------------------------------------------------------
	
def getCssClassString(int):
	if int == 0:
		return "no-member"
	else:
		if int == 1:
			return "member"
		else:
			return "inherited"
	
#------------------------------------------------------------------------------------------------------

def createComparisonPage():
	result = []
	
	result.append("<html><head><h1>Node Coverage Comparison</h1><style>.member{background-color:green;}.no-member{background-color:red;}.inherited{background-color:yellow;}</style></head><body>");
	
	for node in nodes:
		result.append("<table><caption>"+node.name+"</caption>")
		result.append("<thead><tr><th>Name</th><th>Avalon</th><th>x3dom</th></tr></thead><tbody>")
		
		for field in node.fields:
				
			result.append("<tr><td>"+field.name+"</td><td class='"+ getCssClassString(field.avalon) +  "' ></td><td class='" + getCssClassString(field.x3dom) + "'></td></tr>");
		
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
		

# read XNFD folder
print "Reading folder \"" + sys.argv[2] + "\" ...\n",
		
		
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
	
for node in nodes:
	collectParentField(node)
	

html = createComparisonPage()
    
print "Writing result page"
f = open("comparison.html", 'w')
f.write(html)    
f.close() 
	
print "Success."
