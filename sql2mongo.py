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

class Locations:
    code2addr = {}
    countries = {}
    table = { 'name' : "Location" }
    addrfields = ['Country', 'Postal_code', 'State', 'District', 'City', 
        'Locality']
    contents = []
    mydb = None
    mycollection = None

    def __init__(self, mydb):
        self.mydb = mydb
        mydb.add('locations')
        self.mycollection = mydb.get('locations')

    def importIndia(self, fname):
        with open(fname) as f:
            gothdr = False
            cols = []
            #Assumes the All-India Pincodes CSV file provided by 
            #https://data.gov.in/resources/all-india-pincode-directory/download
            for line in f.readlines():
                line = line.rstrip('\n')
                if not gothdr:
                    gothdr = True
                    f = line.lstrip('#').split(',')
                    i = dict(zip(f, range(len(f))))
                    self.table['fields'] = self.addrfields
                    cols = [i[f] for f in ['pincode', 'statename',
                        'Districtname', 'Taluk', 'officename']]
                    self.table['values'] = []
                    continue
                values = line.split(',')
                values[0] = re.sub(r' [A-Z]\.O', '', values[0])
                self.table['values'].append(['India'] + \
                    [values[i] if values[i].isdigit() else values[i].title() \
                        for i in cols])
            self.contents.extend(table2json(self.table))
        self.createIndex()

    def createIndex(self):
        self.countries = {}
        for r in self.contents:
            # Update the pincode index
            if r['Country'] not in self.code2addr:
                self.code2addr[r['Country']] = {}
            self.code2addr[r['Country']][r['Postal_code']] = r

            l = self.countries
            for f in ['Country', 'State', 'District', 'City']:
                v = r[f]
                if v not in l:
                    l[v] = {}
                l = l[v]
            l[r['Locality']] = r['Postal_code']
        with open("locality.json", "w") as f:
            f.write(json.dumps(self.countries, indent=4))

    def save(self):
        self.mycollection.fromJSON(self.contents)

    def load(self):
        self.mycollection.slurp()
        self.contents = self.mycollection.all()
        self.createIndex()

    def address(pincode, country='India'):
        if pincode in code2addr:
            return self.code2addr[country][pincode]
        return None

    def match(addr):
        #fields = locations.addrfields + ['Address_line1', 'Address_line2']
        #addrstr = ", ".join(address[f] for f in fields]
        l = self.countries
        match_fields = []
        for f in ['Country', 'State', 'District', 'City', 'Locality']:
            v = addr[f]
            if v in l:
                l = l[v]
                match_fields.append(f)
            else:
                break
        return { 'match_fields' : match_fields, 'value' : l }

class TableDict:
    def __init__(self, table, idname=None, primarykey=None):
        self.table = table
        self.tcontents = table2json(table)
        for r in self.tcontents:
            if 'URL' in r and r['URL'] == 'http://':
                r['URL'] = ''

            self.adjustaddress(r)
            if primarykey:
                r['_id'] = r[primarykey]
        self.idname = idname
        self.idx = {}
        self.index()

    def adjustaddress(self, r):
        pincode = None
        if 'Geo_id' in r:
            pincode = r['Postal_code'] = r['Geo_id']
            r.pop('Geo_id')
        if pincode != None and pincode > 0:
            addr = locations.address(pincode)
            if addr != None:
                # Correct address fields based on pincode
                for f in locations.addrfields:
                    r[f] = addr[f]
        if 'Country' in r and r['Country'] == '':
            r['Country'] = 'India'
        if 'State' in r and r['State'] != '':
            r['State'] = r['State'].title()
        if 'City' in r and r['City'] != '':
            r['City'] = r['City'].title()
        if 'Country' in r and 'Postal_code' not in r:
            res = locations.match(r)
            if not res.match_fields:
                print "Unknown address: " + \
                    ", ".join([r[f] for f in locations.addrfields])
            elif res.match_fields[-1] == 'Locality':
                r['Postal_code'] = res.val

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
        dbcollection = mydb.get(cname)
        #mydb.get(cname).fromJSON(dbcontents)
        for r in self.tcontents:
            #print json.dumps(r)
            if t.idname:
                r.pop(t.idname)
            r_id = dbcollection.insert(r)
            if t.idname:
                r[t.idname] = r_id

class SBRegions:
    cname = 'regions'
    mycollection = None
    root = None

    def __init__(self, mydb):
        self.mydb = mydb
        self.mycollection = mydb.get(self.cname)
        self.root = self.load()
            
    def region_path(self, r):
        path = [r['Name']]
        p_id = r['Parent_praanta_id']
        while p_id != None and p_id >= 0:
            p = self.mycollection.get(p_id)
            path.append(p['Name'])
            p_id = p['Parent_praanta_id']
        path.reverse()
        return "/".join(path)

    def load(self):
        self.root = None
        self.mycollection.slurp()
        
        for id, r in self.mycollection.all().items():
            parent_id = r['Parent_praanta_id']
            if parent_id is None:
                self.root = r
                #r['Parent_praanta_id'] = None
                continue
            if parent_id not in self.mycollection.local:
                print "Skipping orphan region: ", json.dumps(r)
                continue

            myparent = self.mycollection.local[parent_id]
            if 'subregions' not in myparent:
                myparent['subregions'] = {}
            myparent['subregions'][r['Name']] = r
            #rtype = r['Praanta_type_id']
            #r.pop('Praanta_type_id')
            #r['type'] = praantatypes.get(rtype)['Name']

        for id, r in self.mycollection.all().items():
            r['path'] = self.region_path(r)
            self.mycollection.update(id, {'path' : r['path']})

        return self.root

    def get(path):
        path.lstrip('/')
        components = path.split('/')[1:]
        r = root['subregions']
        for c in components:
            if c in r:
                r[c]
                
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

# Upload regions info into SBmgmt database
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
            sbmgmt.get(cname).update(r['_id'], mods)

praantas = SBRegions(sbmgmt)
pprint(praantas.root)
