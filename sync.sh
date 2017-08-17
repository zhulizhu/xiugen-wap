#!/bin/bash -ilex

rsync -avz --exclude-from="exclude.list" ./ root@www.yike1908.com:"/home/wwwroot/apache/domain/yb.yike1908.com"
ssh root@www.yike1908.com "chown www:www -R /home/wwwroot/apache/domain/yb.yike1908.com;forever restartall"