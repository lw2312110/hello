#!/usr/bin/env python
# -*- coding: UTF-8 -*-
# 一个简单的条件循环语句实现汉诺塔问题
import json
import random

di={}
di["a"]="aqq"
di["b"]="brrr"
print di
print di["a"]
print di['a']
print type(di)
a=json.dumps(di)
print a
print type(a)


numbers=[12,37,5,42,8,3]
number=numbers.pop()
print number


print range(5)
print range(1,1)
print range(1,2)
for i in range(1,11):
    for k in range(1,i):
        print k,
    print "\n"
"""
denum = input("输入十进制数:")
print denum,"(10)",
binnum = []
# 二进制数
while denum > 0:
    binnum.append(str(denum % 2)) # 栈压入
    denum //= 2
print '= ',
while len(binnum)>0:
    import sys
    sys.stdout.write(binnum.pop()) # 无空格输出print ' (2)'
"""
#append是队尾加入，pop是队尾出来