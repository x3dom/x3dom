import sys
import re


## utility definitions
class NodeAnnotation:
    def __init__(self):
        self.nodeName      = ""
        self.componentName = ""
        self.parentName    = ""
        self.result        = []

        
def extractNameAndComponent(str, na):        
    splitStr = re.split('"', str)
    na.nodeName      = splitStr[1]
    na.componentName = splitStr[3]    
    na.parentName    = splitStr[4][splitStr[4].find('(')+1:splitStr[4].find(',',1)]
        
        
def annotateNodeType(na):
    indentation = "    "

    str = "\n"
    str += indentation + "/**\n"
    str += indentation + " * Constructor for " + na.nodeName + "\n"
    str += indentation + " * @constructs x3dom.nodeTypes." + na.nodeName + "\n";
    str += indentation + " * @x3d x.x\n"
    str += indentation + " * @component " + na.componentName + "\n"
    str += indentation + " * @status experimental\n"    
    str += indentation + (" * @extends " + na.parentName + "\n") if na.parentName != "null" else ""
    str += indentation + " * @param {Object} [ctx=null] - context object, containing initial settings like namespace\n"
    str += indentation + " */\n" + indentation
    na.result += str
    
        
def annotateNode(str):
    na = NodeAnnotation()
    
    na.result.append("x3dom.registerNodeType")
    
    constructorPos = str.find("function")    
    nameAndComponentStr = str[:constructorPos]
    
    na.result.append(nameAndComponentStr)
    
    extractNameAndComponent(nameAndComponentStr, na)
    
    annotateNodeType(na)
    
    
    openingBrackets = len(re.split("{",str[constructorPos:]))
    closingBrackets = len(re.split("}",str[constructorPos:]))
    
    print "op"
    print openingBrackets
        
    print "cl"
    print closingBrackets
    
    
    return "".join(na.result)
    

## main script
if len(sys.argv) <= 2:
    print "Usage: python " + sys.argv[0] + " [ORIGINAL_FILE] [ANNOTATED_FILE]"
    quit()
    
# read JS file
print "Reading JS file \"" + sys.argv[1] + "\" ...",

try:
    f = open(sys.argv[1], 'r')
    jsStr = f.read()    
    f.close()
    
    result = "";
    
    nodeTypesArray = re.split('x3dom\.registerNodeType', jsStr)
    
    for n in nodeTypesArray:
        result += (annotateNode(n) if n[0] == '(' else n)

    f = open(sys.argv[2], 'w')
    f.write(result)    
    f.close()
    
        
except:
    print "Error while reading JS file."
    raise

print "Success."
