#!/usr/bin/env python
# -*- coding: utf-8 -*-
""" 
@author:silenthz 
@file: highway_information.py 
@time: 2018/02/05 
"""

import urllib2

import requests
from bs4 import BeautifulSoup
import xlwt
import re
from string import upper
import time


# 百度API位置坐标转换
def geocode(address):
    url = 'http://api.map.baidu.com/geocoder/v2/?address=' + address + '&output=json&ak=8O5agsw4596zKy3xCkrkDB9BIrGioGdy'
    res = requests.get(url)
    answer = res.json()
    return str(answer['result']['location']['lng']) + ',' + str(answer['result']['location']['lat'])


# 设置代理
proxy_url = '121.31.101.223:8123'
enable_proxy = False
proxy_handler = urllib2.ProxyHandler({"http": proxy_url})
null_proxy_handler = urllib2.ProxyHandler({})
if enable_proxy:
    opener = urllib2.build_opener(proxy_handler)
else:
    opener = urllib2.build_opener(null_proxy_handler)
urllib2.install_opener(opener)

# 抓取页面信息
highway_list_url = 'http://www.icauto.com.cn/gonglu/gaosu_s_12/'
user_agent = "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6"
headers = {"User-Agent": user_agent}
highway_list_req = urllib2.Request(highway_list_url, headers=headers)
try:
    response = urllib2.urlopen(highway_list_req)
except urllib2.HTTPError as e:
    print (e.code, ':', e.reason)
except urllib2.URLError as e:
    print (e.code, ':', e.reason)
highway_list_html = response.read()
highway_list_soup = BeautifulSoup(highway_list_html, 'html.parser')
tr_length = 1

# 创建 xls 文件对象
wb = xlwt.Workbook()
# 新增一个表单
sh = wb.add_sheet(u'高速公路基本信息')
headings = [u'高速公路名称', u'编号', u'起点', u'终点']
# 写入表头
for x in range(0, len(headings)):
    sh.write(0, x, headings[x])

for z in range(1, 3):
    highway_ul = highway_list_soup.find_all(class_='all-gslk')[z]  # 获取国家级高速公路列表
    highway_li = highway_ul.find_all('li')

    for i in range(0, len(highway_li)):
        target_li_str = highway_li[i].string
        highway_name_re = re.match(ur'(\W*)(\()(\w*)(\))', target_li_str)  # 获取高速名，编号
        highway_name = highway_name_re.group(1)
        highway_number = upper(highway_name_re.group(3))
        time.sleep(0.5)
        highway_information_url = highway_li[i].a.attrs['href']  # 获取每个高速公路详细信息url
        highway_information_req = urllib2.Request(highway_information_url, headers=headers)
        highway_information_html = urllib2.urlopen(highway_information_req).read()
        highway_information_soup = BeautifulSoup(highway_information_html, "html.parser")
        highway_tb = highway_information_soup.find(class_='tblroad')  # 获取高速公路信息表
        highway_start = '/'
        highway_end = '/'
        if highway_tb != None:
            highway_tr = highway_tb.tbody.find_all('tr')
            for j in range(0, len(highway_tr)):
                if highway_tr[j].th != None:
                    th_contents = highway_tr[j].th.string.strip()
                    if th_contents == u'起点':
                        highway_start = highway_tr[j].td.string.strip()
                    if th_contents == u'终点':
                        highway_end = highway_tr[j].td.string.strip()
        sh.write(i + tr_length, 0, highway_name)
        sh.write(i + tr_length, 1, highway_number)
        sh.write(i + tr_length, 2, highway_start)
        sh.write(i + tr_length, 3, highway_end)
    tr_length += len(highway_li)

highway_entrances_url = 'http://www.icauto.com.cn/churukou/gaosu_s_12/'
highway_list_req = urllib2.Request(highway_entrances_url, headers=headers)
try:
    response = urllib2.urlopen(highway_list_req)
except urllib2.HTTPError as e:
    print (e.code, ':', e.reason)
except urllib2.URLError as e:
    print (e.code, ':', e.reason)

sh_1 = wb.add_sheet(u'高速公路出入口')
headings_1 = [u'高速出入口', u'所属高速', u'坐标']
for i in range(0, len(headings_1)):
    sh_1.write(0, i, headings_1[i])

highway_entrances_html = response.read()
highway_entrances_soup = BeautifulSoup(highway_entrances_html, 'html.parser')
highway_entrances_list = highway_entrances_soup.select('.line-area li')
for i in range(0, len(highway_entrances_list)):
    entrance = highway_entrances_list[i]
    entrance_name = entrance.dt.string  # 获取出入口名
    highway_name = re.match(ur'(\W*)(\：)(\W*)', entrance.dd.string).group(3)  # 获取所属高速
    tollgate_name = re.match(ur'(\W*)(\：)(\W*)', entrance.find_all('dd')[1].string).group(3)  # 获取收费站名
    entrance_coordinates = geocode(u'广东' + tollgate_name)  # 获取出入口坐标
    sh_1.write(i + 1, 0, entrance_name)
    sh_1.write(i + 1, 1, highway_name)
    sh_1.write(i + 1, 2, entrance_coordinates)
# 保存文件
wb.save('results.xls')
