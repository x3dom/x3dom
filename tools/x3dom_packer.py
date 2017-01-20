#!/usr/bin/python
# coding=utf-8

from __future__ import print_function

import sys
if (sys.version_info > (3, 0)):
    from io import StringIO
else:
    try:
        from io import BytesIO as StringIO
    except ImportError:
        import StringIO
from optparse import OptionParser
import os
from os.path import isfile, join
import re
from subprocess import Popen, PIPE

import jsmin
from .jspacker import JavaScriptPacker

VERSION_TEMPLATE = """
x3dom.versionInfo = {
    version:  '%s',
    revision: '%s',
    date:     '%s'
};
"""

usage = \
"""
  %prog [options] <files> """
  

tools_path = os.path.abspath(__file__)
tools_path = os.path.dirname(tools_path)
# os.chdir(os.path.abspath(tools_path + "/../src"))

class packer(object):

  VERSION_STRING = "/** X3DOM Runtime, http://www.x3dom.org */"

  # Create the version.js and fill in the git revision
  def generate_version_file(self, version_in):
    
    version_out = "version.js"
    
    print("Generating version.js")
    
    # Read the base-version from the VERSION file
    if os.path.isfile(version_in):
      version_file = open(version_in, "r")
      
      # Make sure to only use the version string without '\n' etc. 
      version = version_file.read()
      version = version.split()[0]
      version_file.close()
      
    else:
      print("FATAL: Cannot find VERSION file: " + version_in)
      sys.exit(0)
    
    # Extract the git revision 
    try:
      git_revision = Popen(["git", "log", "-1", "--pretty=format:%H"], stdout=PIPE).communicate()[0]
      git_date = Popen(["git", "log", "-1", "--pretty=format:%ad"], stdout=PIPE).communicate()[0]
    except:
      git_revision = 0
      git_date = 0
      print("  WARNING:  Cannot find git executable")
      
    print("  Input    ", os.path.abspath(version_in))
    print("  Output   ", os.path.abspath(version_out))
    print("  Version  ", version)
    print("  Revision ", git_revision)
    print("  Date     ", git_date)
    print("")
    
    # Write the version and revision to file
    version_js_file = open(version_out, "w")
    version_js_file.write(VERSION_TEMPLATE % (version, git_revision, git_date))
    version_js_file.close()
    
    self.VERSION_STRING = "/** X3DOM Runtime, http://www.x3dom.org/ %s - %s - %s */" % (version, git_revision, git_date)
    return version_out
  
  
  # File merging helper
  def _mergeFile(self, concatenated_file, filename):
      """
      Append content of the given file to the given buffer
      
      @param concatenated_file: Buffer containing the already concatenated files
      @type concatenated_file: String
      
      @param filename: Path to file that shall be appended
      @type filename: String
      
      @return: A String with contents of the given file appended
      @rtype: String
      """
      # print "File:", filename
      try:
        print("  " + os.path.abspath(filename))
        f = open(filename, 'r')
        concatenated_file += f.read()
        f.close()
      except:
        print("Could not open input file '%s'. Skipping" % filename)
      concatenated_file += "\n"
      return concatenated_file
  
  
  def _prefixFilePath(self, filename, src_prefix_path):
      """
      Prefix filename with path if path is not empty
      
      @param filename: Name of the file
      @type filename: String
      
      @param src_prefix_path: Path to use
      @type src_prefix_path: String
      
      @return: filename with prefix if path is not empty
      @rtype: String 
      """
      if src_prefix_path != "":
          filename = src_prefix_path + "/" + filename
      return filename
  
  
  
  # Packaging
  def build(self, input_files, output_file, packaging_module, include_version=True, src_prefix_path=""):
    """
    Build distributable version of x3dom
    
    @param src_prefix_path: Optional path that is used as prefix for all source files
    @type src_prefix_path: String
    """
    
    print("output file:", output_file)
    print("input_files:", input_files)
    
    version_out = ""
    
    if include_version == True:
        # find the VERSION file
        if os.path.isfile("VERSION"):
            version_file_name = "VERSION"
        elif os.path.isfile("src/VERSION"):
            version_file_name = "src/VERSION"
        else:
            print("FATAL: Cannot find any VERSION file")
            sys.exit(0)
    
        # parse file & generate version.js
        version_out = self.generate_version_file(version_file_name)

        # Add the version.js to the list of input files
        input_files.append((version_out, [version_out]))

    concatenated_file = ""
    in_len = 0
    out_len = 0
    
    # Merging files
    print("Packing Files")
    for (_, files) in input_files:
        for f in files:
            if f == version_out:
                concatenated_file = self._mergeFile(concatenated_file, f)
            else:
                concatenated_file = self._mergeFile(concatenated_file, self._prefixFilePath(f, src_prefix_path))
            """       
              #Single file?
              if filename[-3:] == ".js":
                  #Merge directly
                  concatenated_file = self._mergeFile(concatenated_file, filename)
              #Otherwise (folder)
              else:
                  #Open all files in folder and merge individually
                  print "Folder: ", filename
                  node_files = [f for f in os.listdir(filename) if isfile(join(filename,f)) and f[-3:]==".js"]
                  print ";".join(node_files)
                  for node_file in node_files:
                      concatenated_file = self._mergeFile(concatenated_file, join(filename,node_file))
            """
    
    print("")
    
    outpath = os.path.dirname(os.path.abspath(output_file))
    
    if not os.access(outpath, os.F_OK):
      print("Create Dir ", outpath)
      os.mkdir(outpath)
    
    # Packaging
    print("Packaging")
    print(self.VERSION_STRING)
    print("  Algo    " + packaging_module)
    print("  Output  " + os.path.abspath(output_file))
    
    # JSMIN
    if packaging_module == "jsmin":
      # Minifiy the concatenated files
      out_stream = StringIO()
      jsm = jsmin.JavascriptMinify()
      jsm.minify(StringIO(concatenated_file), out_stream)

      out_len = len(out_stream.getvalue())
      
      # Write the minified output file
      outfile = open(output_file, 'w')
      outfile.write(self.VERSION_STRING)
      outfile.write(out_stream.getvalue())
      outfile.close()
    
    # JSPACKER
    elif packaging_module == "jspacker":
      p = JavaScriptPacker()
      
      result = p.pack(concatenated_file, compaction=True, encoding=62, fastDecode=False)
      out_len = len(result)
      outfile = open(output_file, 'w')
      outfile.write(self.VERSION_STRING)
      outfile.write(result)
      outfile.close()
    
    # ClosureCompiler
    elif packaging_module == "closure":
    
      # collect files
      files = []
      for (_, filesForComponent) in input_files:
          for f in filesForComponent:
              if f == version_out:
                  files += ["--js=" + f]
              else:
                  files += ["--js=" + self._prefixFilePath(f, src_prefix_path)]
              #concatenated_file = self._mergeFile(concatenated_file, _prefixFilePath(f, src_prefix_path))

        
        
      Popen(["java", "-jar", "tools/compiler.jar", "--js_output_file=" + output_file, "--summary_detail_level=3", "--warning_level=VERBOSE"] + files)
      # Popen(["java", "-jar", "tools/compiler.jar", "--js_output_file=" + output_file] + files)
    
    # NONE
    elif packaging_module == 'none':
      outfile = open(output_file, 'w')
      outfile.write(self.VERSION_STRING)
      outfile.write(concatenated_file)
      outfile.close()

    # Output some stats
    in_len = len(concatenated_file)    
    ratio = float(out_len) / float(in_len);
    print("  Packed  %s -> %s" % (in_len, out_len))
    print("  Ratio   %s" % ratio)

if __name__ == '__main__':
    parser = OptionParser(usage)

    parser.add_option("-a", "--algo", type="string", dest="algo", help='The algorithm to use. [jsmin, jspacker, closure, none]', default="jsmin")
    parser.add_option("-o", "--outfile", type="string", dest="outfile", help='The name of the output file.')

    (options, input_files) = parser.parse_args()

    if len(input_files) == 0:
      print(parser.print_help())
      print("- No input files specified. Exiting -")
      sys.exit(0)

    if not options.outfile:
      print(parser.print_help())
      print("- Please specify an output file using the -o options. Exiting. -")
      sys.exit(0)

    x3dom_packer = packer()
    x3dom_packer.build(input_files, options.outfile, options.algo)
