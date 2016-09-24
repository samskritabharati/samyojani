#!/usr/bin/python

import sys
import io
import re
import json
import fileinput
from myapi.db import *
from pprint import pprint


sbinit()
sbmgmt = sbget()

# First import address/pincode database
locations = sbmgmt.locations()
locations.reset()
locations.importIndia("all_india_pin_code.csv")
locations.importUS("us_zipcode.csv")
