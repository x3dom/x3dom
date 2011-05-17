import os
import sys
import jsmin
import re
from optparse import OptionParser
from StringIO import StringIO
from jspacker import JavaScriptPacker
from subprocess import Popen, PIPE

VERSION_TEMPLATE = """
x3dom.versionInfo = {
    version: '%s',
    svnrevision: '%s'
};
"""

usage = \
"""%prog [options] <files>

If no options are given..."""

if __name__ == '__main__':        
    parser = OptionParser(usage)
    parser.set_defaults(algo="jsmin")
    parser.add_option("-a", "--algo", 
                      type="string",
                      dest="algo",
                      help='The algorithm to use. "jsmin" or "jspacker".')
    parser.add_option("-o", "--outfile", 
                      type="string",
                      dest="outfile",
                      help='The name of the output file.')
    (options, args) = parser.parse_args()  
    
    if len(args) == 0:
        print "No input files specified. Exiting"
        sys.exit(0)
    
    if not options.outfile:
        print "Please specify an output file using the -o options. Exiting."
        sys.exit(0)
    
    # Create the version.js and fill in the svn revision    
    # Read the version from the VERSION file
    in_src = False;
    if os.path.isfile("VERSION"):
        version_file = open("VERSION", "r")
    else:
        version_file = open("src/VERSION", "r")
        in_src = True;
        
    version = version_file.read()
    # Make sure to only use the version string without '\n' etc. 
    version = version.split()[0]
    print "Version  '", version, "'"
    version_file.close()
    # Add the version.js to the list of input files
    args.append("version.js")
    # Extract the svn revision 
    try:
        svn_info = Popen(["svn", "info"], stdout=PIPE).communicate()[0]
        re_match = re.search("Revision: (\d*)", svn_info)
        svn_revision = re_match.group(1)
    except:
        svn_revision = 0
    print "Revision '", svn_revision, "'"

    # Write the version and revision to file
    version_file_name = 'version.js'
    if in_src:
        version_file_name = 'src/version.js'
    version_file = open(version_file_name, "w")
    version_file.write(VERSION_TEMPLATE % (version, svn_revision))
    version_file.close()            
    
    concatenated_file = ""
    in_len = 0
    out_len = 0
    
    for filename in args:
        try:
            f = open(filename, 'r')
            concatenated_file += f.read()
            f.close()
        except:
            print "Could not open input file '%s'. Skipping" % filename    
        concatenated_file += "\n"
                  
    print "Using", options.algo                
                  
    if options.algo == "jsmin":
        # Minifiy the concatenated files
        out_stream = StringIO()  
        jsm = jsmin.JavascriptMinify()
        jsm.minify(StringIO(concatenated_file), out_stream)   
                        
        out_len = len(out_stream.getvalue())
        
        # Write the minified output file
        outfile = open(options.outfile, 'w')
        outfile.write("/** X3DOM Runtime, http://www.x3dom.org/ %s - %s */" 
      					% (version, svn_revision) )
        outfile.write(out_stream.getvalue())
        outfile.close()        
    elif options.algo == "jspacker":
        p = JavaScriptPacker()
        
        result = p.pack(concatenated_file, compaction=True, encoding=62, 
                        fastDecode=False)
        out_len = len(result)
        outfile = open(options.outfile, 'w')
        outfile.write(result)
        outfile.close()
        
    # Output some stats
    in_len = len(concatenated_file)    
    ratio = float(out_len) / float(in_len);
    print "packed: %s to %s, ratio is %s" % (in_len, out_len, ratio)
    
