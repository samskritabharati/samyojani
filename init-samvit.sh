#!/bin/sh
### BEGIN INIT INFO
# Provides: samvit
# Required-Start: $network
# Required-Stop: $network
# Default-Start: 2 3 5
# Default-Stop: 0 6
# Description: Manages the services needed to run E-series Workload Analytics Wizard
### END INIT INFO

main()
{
   # See how we were called.
   case "$1" in
      start)
         exitcode='0'
         if [ -x "/opt/indictools/bin/samvit.py" ]; then
             /opt/indictools/bin/samvit.py start -r
         fi
         ;;

      stop)
         exitcode='0'

         if [ -x "/opt/indictools/bin/samvit.py" ]; then
            /opt/indictools/bin/samvit.py stop
         fi
         ;;
      status)
         exitcode='0'
         if [ -x "/opt/indictools/bin/samvit.py" ]; then
            /opt/indictools/bin/samvit.py status
         fi
         ;;

      restart | force-reload)
         "$0" stop && "$0" start
         ;;
      source)
         # Used to source the script so that functions can be
         # selectively overriden.
         return 0
         ;;
      *)
         echo "Usage: `basename "$0"` {start|stop|status|restart|force-reload}"
         exit 1
   esac

   exit 0
}

main "$@"
