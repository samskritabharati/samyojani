#!/usr/bin/python

import sys
import io
import re
import json
import fileinput
from myapi.db import *
from pprint import pprint

class TableDict:
    def __init__(self, table, idname=None, primarykey=None):
        self.table = table
        self.tcontents = table2json(table)
        for r in self.tcontents:
            if 'URL' in r and r['URL'] == 'http://':
                r['URL'] = ''
            if table['name'] == 'praanta':
                r.pop('Geo_id')
            elif table['name'] == 'visitor':
                r.pop('Interest')  # discard Interest and Message columns
                r.pop('Message')
                r['Role'] = 0   # Set visitor's role to 'Student'

            #if 'Email' in r and table['name'] not in ['visitor', 'person']:
            #    r.pop('Email')

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
                #print res['match_fields']
                pass

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
        ndiscards = 0
        for r in self.tcontents:
            #print json.dumps(r)
            # Discard users with no email
            if cname == 'users' and 'Email' in r and r['Email'] == '':
                ndiscards = ndiscards + 1
            #    continue
            if self.idname:
                if self.idname not in r:
                    print t.idname
                    pprint(r)
                r.pop(self.idname)
            r_id = dbcollection.insert(r)
            if self.idname:
                r[self.idname] = r_id

        if ndiscards > 0:
            print "Found {} users with no email addresses".format(ndiscards)
                
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


sbinit(True)
sbmgmt = sbget()

# First import address/pincode database
locations = Locations(sbmgmt)
locations.importIndia("all_india_pin_code.csv")
locations.save()

localtables = {
        "regions" : TableDict(mytables['praanta'], 'Praanta_id'),
        "users" : TableDict(mytables['person'], 'Person_id'),
        "roles" : TableDict(mytables['activity_assignee']),
        "projects" : TableDict(mytables['project'], 'Project_id'),
        "activities" : TableDict(mytables['activity'], 'Activity_id'),
        "project_types" : 
            TableDict(mytables['project_types'], "Project_type", 'Name'),
        "region_types" : 
            TableDict(mytables['praantatypes'], "Praanta_type", 'Name'),
        "role_types" : 
            TableDict(mytables['personrole'], "Role", 'Name'),
        "activity_types" : 
            TableDict(mytables['activity_types'], "Activity_type", 'Name'),
    };

# Upload all tables into MongoDB
for cname, t in localtables.items():
    print "Populating " + cname 
    if t.idname:
        print "    primary key: " + t.idname
    t.dbupload(sbmgmt, cname)

visitortable = TableDict(mytables['visitor'], 'Visitor_id')
print "Populating visitors into users table ..."
print "    primary key: " + visitortable.idname
visitortable.dbupload(sbmgmt, 'users')

id_mappings = {
    "Coordinator_id" : "users",
    "Parent_praanta_id" : "regions",
    "Praanta_id" : "regions",
    "Person_id" : "users",
    "Project_id" : "projects",
    "Activity_id" : "activities",
    "Project_type" : "project_types",
    "Praanta_type" : "region_types",
    "Role" : "role_types",
    "Activity_type" : "activity_types",
}

# Modify embedded id fields to database-generated ids
for cname, t in localtables.items() + [('users', visitortable)]:
    # For each record in collection 'cname'
    print 'Fixing foreign keys in {}'.format(cname)
    for r in t.tcontents:
        # Fix the id values according to id_mappings
        mods = {}
        for k in id_mappings:
            if k != t.idname and k in r:
                #print "Foreign table is " + id_mappings[k]
                ref_t = localtables[id_mappings[k]]
                if r[k] in ref_t.idx:
                    ref_r = ref_t.get(r[k])
                    mods[k] = ref_r[ref_t.idname]
                    #print cname + "[" + k + "]: " + str(r[k]) + \
                    #    " -> " + mods[k]
                else:
                    mods[k] = None
                    print "Missing " + cname + "[" + k + "]: " + str(r[k]) + \
                       " -> " + str(mods[k])
        if mods:
            if not sbmgmt[cname].update(r['_id'], mods):
                print "Failed patching fields: " + json.dumps(mods) + ", cname = " + cname

praantas = sbmgmt.sbregions()
#pprint(praantas.root)
