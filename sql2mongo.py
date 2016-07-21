#!/usr/bin/python

import sys
import io
import re
import json
import fileinput
from db.sbmgmt import *
from pprint import pprint

#text_file = open("sb_metadata-sql.txt", "r")
#lines = text_file.readlines()
#print lines
#print len(lines)
#text_file.close()

def table2json(t):
    return [dict(zip(t['fields'], valrow)) for valrow in t['values']]

class TableDict:
    def __init__(self, table, idname=None):
        self.table = table
        self.tcontents = table2json(table)
        for r in self.tcontents:
            if 'URL' in r and r['URL'] == 'http://':
                r['URL'] = ''
        self.idname = idname
        self.idx = {}
        self.index()

    def index(self):
        if self.idname is None:
            return
        for e in self.tcontents:
            self.idx[e[self.idname]] = e
        #print self.table['name'] + ": " + \
        #    ", ".join(map(str, sorted(self.idx.keys())))

    def get(self, id):
        return self.idx[id]

    def transform(self, entry):
        newe = { '_id' : entry['Name'] }
        for k in entry:
            if k in [self.idname, 'Name']:
                continue
            newe[k] = entry[k]
        return newe

    def dbupload(self, mydb, cname, cache=False):
        dbcontents = map(self.transform, self.tcontents)
        mydb.add(cname, cache)
        mydb.get(cname).fromJSON(dbcontents)

curtable = None
mytables = { }
for line in fileinput.input():
    m = re.search('^INSERT INTO `(.*?)` \((.*?)\) VALUES', line)
    if m:
        tblname = m.group(1)
        fields = m.group(2).split(', ')
        fields = [f.strip('`') for f in fields]
        if tblname in mytables:
            curtable = mytables[tblname]
        else:
            curtable = { 'name' : tblname, \
                        'fields' : fields, \
                        'values' : [] }
            mytables[tblname] = curtable
        #print "curtable is " + curtable['name']
        #print "curfields: " + '; '.join(curtable['fields'])

    m = re.match('^\((.*?)\)[,;]\s*$', line)
    if m:
        values = re.split(''', (?=(?:[^'"]|'[^']*'|"[^"]*")*$)''', m.group(1))
        values = map(lambda x: x.strip('\'') if '\'' in x else int(x), values)
                    
        curtable['values'].append(values)

tblnames = [tname for tname in mytables]
print json.dumps(tblnames)
#print(json.dumps(mytables, indent=2, sort_keys=True))

sbmgmt = SBMgmtDB()
sbmgmt.reset()

projtypes = TableDict(mytables['project_types'], "Project_type_id")
praantatypes = TableDict(mytables['praantatypes'], "Praanta_type_id")
roletypes = TableDict(mytables['personrole'], "Role_id")
activitytypes = TableDict(mytables['activity_types'], "Activity_type_id")

projtypes.dbupload(sbmgmt, 'project_types')
praantatypes.dbupload(sbmgmt, 'region_types')
roletypes.dbupload(sbmgmt, 'role_types')
activitytypes.dbupload(sbmgmt, 'activity_types')

localtables = {
        "regions" : TableDict(mytables['praanta'], 'Praanta_id'),
        "users" : TableDict(mytables['person'], 'Person_id'),
        "assignments" : TableDict(mytables['activity_assignee']),
        "projects" : TableDict(mytables['project'], 'Project_id'),
        "activities" : TableDict(mytables['activity'], 'Activity_id')
    };

visitors = TableDict(mytables['visitor'], 'Visitor_id')

# Upload regions info into SBmgmt database
collections = localtables.items()
collections.append(('users', visitors))
for cname, t in collections:
    print "Populating " + cname 
    if t.idname:
        print "    primary key: " + t.idname
    sbmgmt.add(cname)
    dbcollection = sbmgmt.get(cname)
    for r in t.tcontents:
        #print json.dumps(r)
        if t.idname:
            r.pop(t.idname)
        r_id = dbcollection.insert(r)
        if t.idname:
            r[t.idname] = r_id

id_mappings = {
    "Coordinator_id" : "users",
    "Parent_praanta_id" : "regions",
    "Praanta_id" : "regions",
    "Person_id" : "users",
    "Project_id" : "projects",
    "Activity_id" : "activities",
}

# Modify embedded id fields to database-generated ids
for cname, t in collections:
    # For each record in collection 'cname'
    for r in t.tcontents:
        # Fix the id values according to id_mappings
        mods = {}
        for k in id_mappings:
            if k != t.idname and k in r:
                ref_t = localtables[id_mappings[k]]
                if r[k] in ref_t.idx:
                    mods[k] = ref_t.get(r[k])[ref_t.idname]
                    #print cname + "[" + k + "]: " + str(r[k]) + \
                    #    " -> " + str(mods[k])
                else:
                    mods[k] = None
                    #print cname + "[" + k + "]: " + str(r[k]) + \
                    #    " -> " + str(mods[k])
        if mods:
            sbmgmt.get(cname).update(r['_id'], mods)

userinfo = sbmgmt.get('users').toJSON()
pprint(userinfo)

sys.exit(0)

#root = None
#regions = localtables['regions']
#for r in regions.tcontents:
#    parent = r['Parent_praanta_id']
#    if parent < 0:
#        root = r
#        #r['Parent_praanta_id'] = None
#        continue
#    if parent not in regions.idx:
#        print "Skipping orphan region: ", json.dumps(r)
#        continue
#
#    myparent = regions.get(parent)
#    #rtype = r['Praanta_type_id']
#    #r.pop('Praanta_type_id')
#    #r['type'] = praantatypes.get(rtype)['Name']
#
#def region_path(r):
#    path = [r['Name']]
#    p_id = r['Parent_praanta_id']
#    while p_id is not None:
#        p = regions.get(p_id)
#        path.append(p['Name'])
#        p_id = p['Parent_praanta_id']
#    path.reverse()
#    return "/".join(path)
