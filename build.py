from tools import x3dom_packer

execfile("../tools/packages.py")

packer = x3dom_packer.packer()
packer.build(full_profile, "dist/x3dom.js", "jsmin")