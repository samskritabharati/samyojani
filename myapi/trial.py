from resources.types import *
from resources.users import *

if __name__ == "__main__":
    sbinit()
    print role_types().get()
    print project_types().get()
    print activity_types().get()
    print region_types().get()
    print users().get()
