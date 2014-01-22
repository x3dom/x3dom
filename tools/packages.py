
def prefix_path(lst, path):
    return [path + '/' + entry for entry in lst]

f = open('tools/packages.json', 'r')
import json
json_object = json.load(f)


BASICS = []
for entry in json_object['grouplist'][0]['data']:
    BASICS.append(entry['path']);

SHADER = []
for entry in json_object['grouplist'][1]['data']:
    SHADER.append(entry['path']);

GFX = []
for entry in json_object['grouplist'][2]['data']:
    GFX.append(entry['path']);

NODES = []
for entry in json_object['grouplist'][3]['data']:
    NODES.append(entry['path']);

COMPONENTS = []
for entry in json_object['grouplist'][4]['data']:
    COMPONENTS.append(entry['path']);



CORE_PROFILE = BASICS + SHADER + GFX + NODES
MORE_PROFILE = COMPONENTS

FULL_PROFILE = CORE_PROFILE + MORE_PROFILE
