mkdir binGeo
mkdir binGeoi
mkdir binGeoc
mkdir binGeopic
mkdir binGeosic
mkdir popGeo
mkdir popGeoi
mkdir popGeoip
mkdir popGeoipb

aopt -i teapot.x3d -G binGeo/: -x binGeo.x3d
aopt -i teapot.x3d -G binGeoi/:i -x binGeoi.x3d
aopt -i teapot.x3d -G binGeoc/:c -x binGeoc.x3d
aopt -i teapot.x3d -G binGeopic/:pic -x binGeopic.x3d
aopt -i teapot.x3d -G binGeosic/:sic -x binGeosic.x3d
aopt -i teapot.x3d -K popGeo/: -x popGeo.x3d
aopt -i teapot.x3d -K popGeoi/:i -x popGeoi.x3d
aopt -i teapot.x3d -K popGeoip/:ip -x popGeoip.x3d
aopt -i teapot.x3d -K popGeoipb/:ipb -x popGeoipb.x3d
aopt -i teapot.x3d -Y "" -x extGeo.x3d
