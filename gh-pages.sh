#!/usr/bin/env bash
org="joneit"

# set variable repo to current directory name (without path)
folder=${PWD##*/}
repo='datasaur-indexed'

# make sure the docs are built
gulp doc >/dev/null

# remove temp directory in case it already exists, remake it, switch to it
rm -rf ../temp >/dev/null
mkdir ../temp
pushd ../temp >/dev/null

# clone it so it will be a branch of the repo
git clone -q --single-branch http://github.com/$org/$repo.git
cd folder >/dev/null

# create and switch to a new gh-pages branch
git checkout -q --orphan gh-pages

# remove all content from this new branch
git rm -rf -q .

# copy the doc directory from the workspace
cp -R ../../$folder/doc/* . >/dev/null

# copy $folder/build to the cdn directory
# cp ../../$folder/build/* . >/dev/null

# send it up
git add . >/dev/null
git commit -q -m '(See gh-pages.sh on master branch.)'
git push -ufq origin gh-pages >/dev/null

# back to workspace
popd >/dev/null

# remove temp directory
rm -rf ../temp >/dev/null

echo 'http://$org.github.io/$repo/$repo.js'
echo 'http://$org.github.io/$repo/$repo.min.js'
echo 'CAVEAT: New files may not be immediately available.'
