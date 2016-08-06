#!/usr/bin/python

import sys
import io
import re
import json
import fileinput
from myapi.db.sbmgmt import *
from myapi.db.locations import *
from myapi.db.sbregions import *
from pprint import pprint

#text_file = open("sb_metadata-sql.txt", "r")
#lines = text_file.readlines()
#print lines
#print len(lines)
#text_file.close()

class TableDict:
    def __init__(self, table, idname=None, primarykey=None):
        self.table = table
        self.tcontents = table2json(table)
        for r in self.tcontents:
            if 'URL' in r and r['URL'] == 'http://':
                r['URL'] = ''
            if table['name'] == 'praanta':
                r.pop('Geo_id')

            self.adjustaddress(r)
            if primarykey:
                r['_id'] = r[primarykey]
        self.idname = idname
        self.idx = {}
        self.index()

    def adjustaddress(self, r):
        if 'Country' in r and r['Country'] == '':
            r['Country'] = 'India'

        pincode = None
        if 'Geo_id' in r:
            pincode = r['Postal_code'] = r['Geo_id']
            r.pop('Geo_id')
        if pincode != None and pincode > 0:
            #print "Pin code == " + str(pincode) + ", country = " + r['Country']
            #print r
            addr = locations.address(pincode, r['Country'])
            if addr != None:
                #print "Address == " + str(addr)
                # Correct address fields based on pincode
                for f in locations.addrfields:
                    r[f] = addr[f]
                return

        if 'State' in r and r['State'] != '':
            r['State'] = r['State'].title()
        if 'City' in r and r['City'] != '':
            r['City'] = r['City'].title()
        if 'Country' in r and \
                (('Postal_code' not in r) or (r['Postal_code'] == 0)):
            res = locations.match(r)
            if not res['match_fields']:
                print "Unknown address: " + str(r)
            elif res['match_fields'][-1] == 'Locality':
                r['Postal_code'] = res.val
            else:
                #print r
                print res['match_fields']

    def index(self):
        if self.idname is None:
            return
        for e in self.tcontents:
            self.idx[e[self.idname]] = e
        #print self.table['name'] + ": " + \
        #    ", ".join(map(str, sorted(self.idx.keys())))

    def get(self, id):
        return self.idx[id]

    def dbupload(self, mydb, cname, cache=False):
        mydb.add(cname, cache)
        dbcollection = mydb.c[cname]
        for r in self.tcontents:
            #print json.dumps(r)
            if t.idname:
                r.pop(t.idname)
            r_id = dbcollection.insert(r)
            if t.idname:
                r[t.idname] = r_id
                
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

# First import address/pincode database
locations = Locations(sbmgmt)
locations.importIndia("all_india_pin_code.csv")
locations.save()

localtables = {
        "regions" : TableDict(mytables['praanta'], 'Praanta_id'),
        "users" : TableDict(mytables['person'], 'Person_id'),
        "assignments" : TableDict(mytables['activity_assignee']),
        "projects" : TableDict(mytables['project'], 'Project_id'),
        "activities" : TableDict(mytables['activity'], 'Activity_id'),
        "project_types" : 
            TableDict(mytables['project_types'], "Project_type_id", 'Name'),
        "region_types" : 
            TableDict(mytables['praantatypes'], "Praanta_type_id", 'Name'),
        "role_types" : 
            TableDict(mytables['personrole'], "Role_id", 'Name'),
        "activity_types" : 
            TableDict(mytables['activity_types'], "Activity_type_id", 'Name'),
        "visitors" : TableDict(mytables['visitor'], 'Visitor_id')
    };

# Upload all tables into MongoDB
for cname, t in localtables.items():
    print "Populating " + cname 
    if t.idname:
        print "    primary key: " + t.idname
    localtables[cname].dbupload(sbmgmt, cname)

id_mappings = {
    "Coordinator_id" : "users",
    "Parent_praanta_id" : "regions",
    "Praanta_id" : "regions",
    "Person_id" : "users",
    "Project_id" : "projects",
    "Activity_id" : "activities",
    "Project_type_id" : "project_types",
    "Praanta_type_id" : "region_types",
    "Role_id" : "role_types",
    "Activity_type_id" : "activity_types",
}

# Modify embedded id fields to database-generated ids
for cname, t in localtables.items():
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
                    #print "Missing " + cname + "[" + k + "]: " + str(r[k]) + \
                    #   " -> " + str(mods[k])
        if mods:
            if not sbmgmt[cname].update(r['_id'], mods):
                print "Failed patching fields: " + json.dumps(mods) + ", cname = " + cname

praantas = SBRegions(sbmgmt)
#pprint(praantas.root)
