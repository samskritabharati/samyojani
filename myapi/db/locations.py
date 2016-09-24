from ..config import *
import re
from pprint import pprint

class Locations:
    table = { 'name' : "Location" }
    addrfields = ['Country', 'Postal_code', 'State', 'District', 'City', 
        'Locality']
    mydb = None
    mycollection = None

    def __init__(self, mydb):
        self.mydb = mydb
        mydb.add('locations')
        self.mycollection = mydb['locations']

    def reset(self):
        self.mycollection.reset()

    def importIndia(self, fname):
        print "Creating India address database ..."
        with open(fname) as f:
            gothdr = False
            cols = []
            #Assumes the All-India Pincodes CSV file provided by 
            #https://data.gov.in/resources/all-india-pincode-directory/download
            idx = {}
            for line in f.readlines():
                line = line.rstrip('\n')
                if not gothdr:
                    gothdr = True
                    f = line.lstrip('#').split(',')
                    idx = dict(zip(f, range(len(f))))
                    self.table['fields'] = self.addrfields

                    cols = [idx[f] for f in ['pincode', 'statename',
                        'Districtname', 'Taluk', 'officename']]
                    self.table['values'] = []
                    continue
                m = re.match('^(.*?),(\d\d\d\d\d\d),(.*)$', line)
                if m:
                    f1, pin, rest = [m.group(1), m.group(2), m.group(3)]
                    f1 = f1.replace(',', '')
                    line = ",".join([f1, pin, rest])
                values = line.split(',')
                values[0] = re.sub(r' [A-Z]\.O', '', values[0])
                if not values[idx['pincode']].isdigit():
                    print ", ".join(values)
                if values[idx['statename']] in ['NULL', 'NA']:
                    values[idx['statename']] = values[idx['circlename']]
                if values[idx['Districtname']] in ['NULL', 'NA']:
                    values[idx['Districtname']] = values[idx['regionname']]
                if values[idx['Taluk']] in ['NULL', 'NA']:
                    values[idx['Taluk']] = values[idx['divisionname']]
                self.table['values'].append(['India'] + \
                    [values[i] if values[i].isdigit() else values[i].title() \
                        for i in cols])
            self.mycollection.fromJSON(table2json(self.table))

    def importUS(self, fname):
        print "Creating US address database ..."
        with open(fname) as f:
            gothdr = False
            cols = []
            #Assumes the US Zipcodes CSV file provided by 
            #http://www.unitedstateszipcodes.org/zip-code-database/
            idx = {}
            for line in f.readlines():
                line = line.rstrip('\n')
                if not gothdr:
                    gothdr = True
                    f = line.lstrip('#').split(',')
                    idx = dict(zip(f, range(len(f))))
                    self.table['fields'] = self.addrfields

                    cols = [idx[f] for f in ['zip', 'state', 'county', 'primary_city']]
                    self.table['values'] = []
                    continue
                values = re.split(''',(?=(?:[^'"]|'[^']*'|"[^"]*")*)''', line)
                values = map(lambda x: x.strip('\'') if '\'' in x else x, values)
                values = map(lambda x: x.strip('\"') if '\"' in x else x, values)
                if not values[idx['decommissioned']].isdigit():
                    print "\n".join(values)
                    exit(0)
                if int(values[idx['decommissioned']]) != 0:
                    continue
                if len(values[idx['state']]) > 2:
                    print values[idx['state']]
                    print ": ".join(values)
                if not values[idx['zip']].isdigit():
                    print ", ".join(values)
                self.table['values'].append(['United States'] + \
                    [values[i] if ((i == 1) or values[i].isdigit()) else values[i].title() \
                        for i in cols] + [''])
            self.mycollection.fromJSON(table2json(self.table))

    def match(self, addr):
        #fields = locations.addrfields + ['Address_line1', 'Address_line2']
        #addrstr = ", ".join(address[f] for f in fields]
        l = []
        match_fields = []
        for f in ['Country', 'State', 'District', 'City', 'Locality']:
            if f not in addr:
                continue
            v = addr[f]
            if v in l:
                l = l[v]
                match_fields.append(f)
            else:
                break
        return { 'match_fields' : match_fields, 'value' : l }
