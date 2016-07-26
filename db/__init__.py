from config import *
from mydb import *
from sbmgmt import *

sbmgmt = None
def initdb(reset=False):
    global sbmgmt
    sbmgmt = SBMgmtDB()
    if reset:
        sbmgmt.reset()

def getdb():
    return sbmgmt

def main(args):

if __name__ == "__main__":
    setworkdir(workdir())
    initworkdir(False)
    setwlocaldir(DATADIR_SBMGMT)
    initdb()

    sys.exit(0)
