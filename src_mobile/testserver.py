# -*- coding: utf-8 -*-

import wsgiserver
import os
import mimetypes

TESTSCENE_DIR = os.getcwd()

def testScenes(environ, start_response):
    
    # Strip the leading slash from the URI
    path = environ["REQUEST_URI"][1:]
    if path == "":
        path = "index.html"
    fullpath = os.path.join(TESTSCENE_DIR, path)
    print "Requesting:", fullpath

    # Try to open the requested file 
    try:
        f = open(fullpath, 'r')        
        payload = f.read()
        f.close()
    except:      
        indexpath = os.path.join(TESTSCENE_DIR, "index.html")
        f = open(indexpath, 'r')        
        payload = f.read()
        f.close()

    status = '200 OK'
    mimetype = mimetypes.guess_type(fullpath)
    print "guessed mimetype:", mimetype[0]
    if (not mimetype[0]):
        mimetype = ["application/xhtml+xml"]
        print "set mimetype:", mimetype[0]
    response_headers = [('Content-type', mimetype[0])]
    start_response(status, response_headers)
    return payload

print "Starting x3dom development testserver"

# Init the mimetypes module
mimetypes.init()

server = wsgiserver.CherryPyWSGIServer(
            ('0.0.0.0', 8070), testScenes,
            server_name='www.x3dom.org')

if __name__ == '__main__':
    try:
        server.start()
    except KeyboardInterrupt:
        server.stop()