#! /usr/bin/env python 
import subprocess
import os,sys
from os import walk, path
from os.path import join, splitext
from samvit.config import *
import getopt
import time

(cmddir, cmdname) = os.path.split(sys.argv[0])
setmypath(os.path.abspath(cmddir))

def usage():
    print   "Usage:\n" +\
        "    " + cmdname + " start " +"[-p <port#>] [<samvit params> ...] \n" +\
        "    " + cmdname + " stop " + "[<port#> ...]\n" +\
        "    " + cmdname + " status\n" 
    exit(1)

def start_samvit(cmd,myport):
    createdir(vardir)
    if is_running(myport):
        return 0

    # Then start Samvit server
    try:
        logfile = join(vardir,str(myport)+"-log.txt")
        fd = open(logfile,"w")    
        ret = subprocess.Popen(cmd, stdout=fd, stderr=fd,shell=False)
        procid = str(ret.pid)
        pidfile_path = join(vardir, str(myport) + ".pid")
        with open(pidfile_path, "w") as f:
            f.write(procid)

        print "Samvit started (pid " + procid + ") on port " + \
            str(myport) + "."

        time.sleep(5)
        print logfile
        out = mycheck_output("tail -n 10 "+logfile)
        print out
        if not re.search('Running on', out):
            print "Error starting samvit."
            return 1

        print "It is available at the following URLs:"
        for line in subprocess.check_output("/sbin/ifconfig").split("\n"):
            m = re.match('\s*inet addr:(.*?) .*', line)
            if m:
                print "    http://" + m.group(1) + ":" + str(myport) + "/"
    except Exception as e:
        print "Error starting samvit in ",vardir,".", e
        return 1
    return 0

def is_running(port, dokill=False):
    pidfile = join(vardir,str(port)+".pid")
    signum = 2
    while os.path.exists(pidfile):
        pid = None
        with open(pidfile,"r") as f:
            pid = int(f.read())
        processPath = "/proc/"+str(pid)
        if os.path.exists(processPath):
            print "Samvit is running (pid " + str(pid) +") on port " + str(port) + "."
            if dokill:
                try:
                    print "Stopping Samvit on port: " + str(port)+ \
                        " (pid "+str(pid) +") with signal #"+str(signum)+"."
                    os.kill(pid, signum)
                    mycheck_output("killall run-samvit.py")
                    time.sleep(5)
                    signum = 9
                    continue
                except Exception as e:
                    print "Error stopping pid " + str(pid) +": ", e
                    return True
            
            return True
        else:
            try:
                os.remove(pidfile)
            except Exception as e:
                pass
        break
    return False

def stop_samvit(port):
    return not is_running(port, True)
            
def stop_all():
    list = os.listdir(vardir)
    pidpattern =re.compile('[0-9]*.pid')
    for f in list:
        if pidpattern.match(f)!=None:
            stop_samvit(f.split('.')[0])

    try:
        splunkcmd = ["/opt/splunk/bin/splunk", "stop"]
        ret = subprocess.check_call(splunkcmd)
    except Exception as e:
        return 0
    return 0
    
def status_samvit():
    list =     os.listdir(vardir)
    pidpattern = re.compile('[0-9]*.pid')
    
    status = False
    for f in list:
        if pidpattern.match(f)!=None:
            port = f.split('.')[0]
            status = is_running(port) or status
    if not status:
        print "Samvit is not running."

myport  = PORTNUM
vardir = VARDIR
if not sys.argv or (len(sys.argv) < 2):
    usage()
cmd = sys.argv[1]

if cmd == 'start':
    command  = [cmdpath("run-samvit.py")]
    for i, arg in enumerate(sys.argv):
        if arg == "-p":
            if (i < (len(sys.argv)-1)) and sys.argv[i+1].isdigit():
                myport = int(sys.argv[i+1])
                break
            else:
                print "Error: Supply port# with -p option."
                usage()

    command.extend(sys.argv[2:])
    start_samvit(command, myport)
    
elif cmd=="stop":
    portlist=[]
    leng = len(sys.argv)
    if(len(sys.argv)>=2):
        for i in range(2,leng):
            if(sys.argv[i].isdigit()):
                portlist.append(sys.argv[i])
            else:
                usage()
    if not portlist:
        stop_all()
    else:
        #print "inside single port"
        for p in portlist:
            stop_samvit(p)

      
elif cmd=="status":
    status_samvit()
else:
    usage()
