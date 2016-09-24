import os, sys

from ..config import *
from .mydb import *
from .sbmgmt import *

sbmgmt = None
def sbinit(reset=False):
    global sbmgmt
    sbmgmt = SBMgmtDB()
    if reset:
        sbmgmt.reset()
    sbmgmt.sbregions()
    sbmgmt.locations()

def sbget():
    global sbmgmt
    return sbmgmt

if __name__ == "__main__":
    setworkdir(workdir())
    initworkdir(False)
    setwlocaldir(DATADIR_SBMGMT)
    sbinit()

    sys.exit(0)
