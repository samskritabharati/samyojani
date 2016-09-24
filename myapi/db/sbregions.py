import json
import re
from mydb import *
from pprint import pprint

class SBRegions(MyCollection):
    root = None
    addr_fields = ['Country', 'State', 'District', 'City', 'Locality']
    idx = {}

    def __init__(self, mydb):
        MyCollection.__init__(self, 'regions', mydb, True)
        mydb.c[self.name] = self
        self.load()

    def __getitem__(self, praanta_id):
        return self.get(praanta_id)

    def insert(self, item):
        newid = MyCollection.insert(self, item)
        if newid:
            parent = item['Parent_region_id']
            parent['subregions'][item['Name']] = newid
        return newid

    def delete(self, item_id):
        r = self.get(item_id)
        if not r:
            return False
        parent = r['Parent_region_id']
        if parent:
            parent['subregions'].pop(r['Name'])
        return MyCollection.delete(self, item)

    def update(self, item_id, fields):
        r = self.get(item_id)
        parent = None
        if r:
            if 'Name' in fields and fields['Name'] != r['Name']:
                oldname = fields['Name']
                parent = r['Parent_region_id']
                if parent:
                    parent['subregions'].pop(oldname)
        success = MyCollection.update(self, item_id, fields)
        if success and parent:
            parent['subregions'][fields['Name']] = item_id
        return success

    def region_path(self, r):
        path = [r['Name']]
        p_id = r['Parent_region_id']
        while p_id != None and p_id >= 0:
            p = self.get(p_id)
            path.append(p['Name'])
            p_id = p['Parent_region_id']
        path.reverse()
        return "/".join(path)

    def from_address(self, address, af_ind=0, root = None):
        return self.from_path('World/India')['_id']
        f = addr_fields[af_ind] if af_ind < len(addr_fields) else None
        if not f:
            return None
        val = address[f].title() if f in address else None
        
        r = root
        if not r:
            r = self.root
        if f not in r:
            return r
        options = r[f]
        if len(options) == 0:
            return r
        if val not in options:
            return None
            
        for subr in r['subregions']:
            r = self.from_address(address, af_ind+1, subr)
            if r:
                pass
            

        for id, r in self.mycollection.all().items():
            path = r['path']
            for f in ['Locality', 'City', 'District', 'State', 'Country']:
                if f in address and address[f] != '':
                    fval = address[f].title()
                    match = re.search('^{}$'.format(address[f]), r['Name'], flags=re.IGNORECASE)
                    if match:
                        print 'Found matching region: ' + path
                        return id
        return None 

    def from_path(self, path):
        print "Decoding " + path
        return self.idx[path]
#        rnames = path.split('/')
#        p = self.root
#        print json.dumps(p)
#        for n in rnames[1:]:
#            print "Looking for {} in {}".format(n, p['Name'])
#            pprint(p['subregions'].keys())
#            if 'subregions' in p and n in p['subregions']:
#                p = p['subregions'][n]
#            else:
#                print path + " -> None"
#                return None
#        print path + " -> " + json.dumps(p)
#        return p

    def load(self):
        print "Loading SB regions data ..."
        self.root = None
        self.slurp()
        
        for id, r in self.all().items():
            parent_id = r['Parent_region_id']
            if parent_id is None:
                self.root = r
                #r['Parent_region_id'] = None
                continue
            if parent_id not in self.local:
                print "Skipping orphan region: ", json.dumps(r)
                continue

            myparent = self.local[parent_id]
            if 'subregions' not in myparent:
                myparent['subregions'] = {}
            myparent['subregions'][r['Name']] = id
            #rtype = r['Praanta_type_id']
            #r.pop('Praanta_type_id')
            #r['type'] = praantatypes.get(rtype)['Name']

        for id, r in self.all().items():
            r['path'] = self.region_path(r)
            self.update(id, {'path' : r['path']})
            self.idx[r['path']] = r

        return self.root

#    def get(path):
#        path.lstrip('/')
#        components = path.split('/')[1:]
#        r = root['subregions']
#        for c in components:
#            if c in r:
#                r[c]
