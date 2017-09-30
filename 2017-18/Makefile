all: DOCUMENTS OFFICIAL PLAYER VIEWER EDITOR

DOCUMENTS:
	cd documents; make

OFFICIAL:
	cd official; make

PLAYER:
	cd player; make

VIEWER:

EDITOR:

tags:
	etags */*.hpp */*.cpp

tar: clean
	tar zcvf ../samurai-software-`date -Iminutes` *

clean:
	rm -rf *~ */*~ \#*\#
	cd documents; make clean
	cd official; make clean
	cd player; make clean


