from flask import Flask, request, redirect, url_for, make_response, abort
from flask import render_template
from werkzeug import secure_filename
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
    return Mydocs

def main(args):
    setworkdir(workdir())
    initworkdir(False)
    setwlocaldir(DATADIR_BOOKS)
    initdb()

    anno_id = args[0]
    getdb().annotations.propagate(anno_id)

    # Get the annotations from anno_id
    anno_obj = getdb().annotations.get(anno_id)
    if not anno_obj:
        return False

    # Get the containing book
    book = getdb().books.get(anno_obj['bpath'])
    if not book:
        return False

    page = book['pages'][anno_obj['pgidx']]
    imgpath = join(repodir(), join(anno_obj['bpath'], page['fname']))
    img = DocImage(imgpath)

    #print json.dumps(matches)
    rects = anno_obj['anno']
    seeds = [r for r in rects if r['state'] != 'system_inferred']
    img.annotate(rects)
    img.annotate(seeds, (0,255,0))
    cv2.namedWindow('Annotated image', cv2.WINDOW_NORMAL)
    cv2.imshow('Annotated image', img.img_rgb)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    sys.exit(0)

if __name__ == "__main__":
    main(sys.argv[1:])
