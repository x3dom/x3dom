cd binGeo-raw
for file in *;
do
  gzip --best -c "$file" > "../binGeo/$file".gz;
done
cd ..
