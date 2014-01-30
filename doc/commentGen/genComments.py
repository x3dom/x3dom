import sys
import re


class PropertyAnnotation:
    def __init__(self):
        self.name = ""
        
    
class FieldAnnotation:
    def __init__(self):
        self.name         = ""
        self.type         = ""
        self.defaultvalue = ""


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
        
      
def findFunctionBodyLength(str):
    numOpenBraces = 1
    i = 1
    
    while (i != len(str)):
        if (str[i] == '{'):
            numOpenBraces += 1
        else:
            if (str[i] == '}'):
                numOpenBraces -= 1                            
         
        if (numOpenBraces == 0):
            break
            
        i += 1 
        
    return i
    
  
def extractField(str):
    fa = FieldAnnotation()
    
    bracketIdx = str.find('(')
    fa.type = str[:bracketIdx]
    
    addFieldParams = str[bracketIdx+1:]
    
    if fa.type != "MFNode" and fa.type != "SFNode":
        #ignore first 'ctx' param
        addFieldParams = addFieldParams[addFieldParams.find(',')+2:]
    else:
        addFieldParams = addFieldParams[1:]
  
    
    fieldNameEnd = addFieldParams.find('\'')
    
    fa.name         = addFieldParams[:fieldNameEnd]
    fa.defaultvalue = addFieldParams[fieldNameEnd+2:addFieldParams.find(')')]
    
    return fa
    
  
def annotatePropertiesAndFields(fbodyStr, na):
    definitions = []
    
    definitions = re.split("\n", fbodyStr)
    
    for d in definitions:
        defStr = d.replace(" ", "")
        
        if defStr.startswith('this.'):
            #skip "this."
            defStr = defStr[defStr.find('.') + 1:];
            if defStr.startswith('addField_'):
                fieldStr = defStr[defStr.find('_')+1:]
                fa = extractField(fieldStr)
                annotateField(fa, na)
            else:
                propStr = defStr[:defStr.find('=')]
                pa = PropertyAnnotation()
                pa.name = propStr                
                annotateProperty(pa, na)
                
        na.result += d + "\n";
        
    na.result += "        "
        
        
def annotateProperty(pa, na):
    indentation = "            "

    str = "\n"
    str += indentation + "/**\n"
    str += indentation + " *\n"
    str += indentation + " * @var {} " + pa.name + "\n"
    str += indentation + " * @memberof x3dom.nodeTypes." + na.nodeName + "\n"
    str += indentation + " * @instance\n"
    str += indentation + " * @protected\n"
    str += indentation + " */\n"
    #unused for now
    #na.result += str    

    
def annotateField(fa, na):
    indentation = "            "

    str = "\n"
    str += indentation + "/**\n"
    str += indentation + " *\n"
    str += indentation + " * @var {" + fa.type + "} " + fa.name + "\n"
    str += indentation + " * @memberof x3dom.nodeTypes." + na.nodeName + "\n"    
    str += indentation + " * @field x3dom\n"
    str += indentation + " * @instance\n"
    str += indentation + " */\n"    
    na.result += str    
    
    
def annotateNodeType(na):
    indentation = "        "

    str = "\n"
    str += indentation + "/**\n"
    str += indentation + " * Constructor for " + na.nodeName + "\n"
    str += indentation + " * @constructs x3dom.nodeTypes." + na.nodeName + "\n";
    str += indentation + " * @x3d x.x\n"
    str += indentation + " * @component " + na.componentName + "\n"
    str += indentation + " * @status experimental\n"    
    str += indentation + " * @extends " + na.parentName + "\n" if na.parentName != "null" else ""
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
    
    fbodyPos = str.find('{')
    na.result.append(str[constructorPos:fbodyPos]);
    
    fbodyLength = findFunctionBodyLength(str[fbodyPos:])  
    
    annotatePropertiesAndFields(str[fbodyPos:fbodyPos+fbodyLength], na)
    
    na.result.append(str[fbodyPos+fbodyLength:])
    
    return "".join(na.result)
    
    
## main script
if len(sys.argv) <= 2:
    print "Usage: python " + sys.argv[0] + " <ORIGINAL_FILE> <ANNOTATED_FILE> [--x]"
    print "       --x: generate .xdf files"
    quit()
    
# read JS file
print "Reading JS file \"" + sys.argv[1] + "\" ...",

try:
    f = open(sys.argv[1], 'r')
    jsStr = f.read()    
    f.close()
                
except:
    print "Error while reading JS file."
    raise
    
result = "";
    
nodeTypesArray = re.split('x3dom\.registerNodeType', jsStr)

for n in nodeTypesArray:
    result += (annotateNode(n) if n[0] == '(' else n)        

f = open(sys.argv[2], 'w')
f.write(result)    
f.close() 

print "Success."
