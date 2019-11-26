import http.client
import json
import time
import timeit
import sys
import collections
from pygexf.gexf import *
import os
os.chdir("C:/Users/r2d2/Documents/6242/HW1/Q1")

#
# implement your data retrieval code here
#
#auth_key = input("Enter your key: ")
global lego_sets_list
#auth_key = input("Enter your key: ")
auth_key = 'key a0f13b4ce4a1b87457cd3a8f99891e1f'

url = "rebrickable.com"

header = {
            'Accept': 'application/json',
            'Authorization': auth_key,
         }

set_url = "/api/v3/lego/sets/?page_size=300&min_parts=1155&ordering=num_part&ordering=-num_parts"

# http Connection
connection = http.client.HTTPSConnection(url,port=None)
connection.request("GET",set_url, headers=header)
response = connection.getresponse()
#print("Status: {} and reason: {}".format(response.status,response.reason))
set_data = response.read()
set_data = set_data.decode('utf8')

jsdata = json.loads(set_data)
set_keys = ["set_num","name","num_parts"]
sets = [dict((k, d[k]) for k in set_keys) for d in jsdata["results"]]

print(jsdata['count'])

begin_time = time.time()

# function to retrieve part-numbers for each set.
def get_parts(set_nbr,header):
    global ctr,ctr1
    ctr,ctr1=0,0
    url = "/api/v3/lego/sets/" + set_nbr + "/parts/?page=1&page_size=1000"
    pdl = []
    # While loop is to handle multiple pages of data for each set 
    while not(url is None):
        start_time = time.time()
        connection.request("GET",url, headers=header)
        response = connection.getresponse()
        part_data = response.read()
        # convert from 'bytes' to 'string'
        part_data = part_data.decode('utf8')
        jpdata = json.loads(part_data)["results"]
        # set the url to next page if exist, else null
        url = json.loads(part_data)["next"]  
        # Get part#, name, color & quantity from each page's data
        for j in jpdata:
            pd=({"set_num" : set_nbr, "part_num" : j["part"]["part_num"], "name" : j["part"]["name"]
                      ,"color" : j["color"]["rgb"], "quantity" : j["quantity"]})
            pdl.append(pd)
            ctr = ctr+1
        time_elapsed = time.time() - start_time
        if time_elapsed < 1:
            time.sleep(1-time_elapsed)
    pdl.sort(key=lambda d: d['quantity'], reverse=True)
    ctr1 = ctr1 + min(len(pdl),20)
   
    return pdl[:min(len(pdl),20)]    
        
final = []
# iterate thru each set to get the part data
for i in range(len(sets)):
    pdl1 = []
    start_time = time.time()
    set_number = sets[i]["set_num"]
    pdl1 = get_parts(set_number,header)
    final.append(pdl1)
    time_elapsed = time.time() - start_time
    if time_elapsed < 1:
        time.sleep(1-time_elapsed)
    
end_time = time.time()
print('Processing time: ', end_time - begin_time, 'seconds')
print(ctr)
print(ctr1)
lego_sets_list = final
connection.close()

# complete auto grader functions for Q1.1.b,d
def min_parts():
    """
    Returns an integer value
    """
    # you must replace this with your own value
    return 1155

def lego_sets():
    """
    return a list of lego sets.
    this may be a list of any type of values
    but each value should represent one set

    e.g.,
    biggest_lego_sets = lego_sets()
    print(len(biggest_lego_sets))
    > 280
    e.g., len(my_sets)
    """
    # you must replace this line and return your own list
    return lego_sets_list

def gexf_graph():
    """
    return the completed Gexf graph object
    """
    # you must replace these lines and supply your own graph
    my_gexf = Gexf("author", "title")
    gexf.addGraph("undirected", "static", "I'm an empty graph")
    return gexf.graphs[0]

# complete auto-grader functions for Q1.2.d

def avg_node_degree():
    """
    hardcode and return the average node degree
    (run the function called “Average Degree”) within Gephi
    """
    # you must replace this value with the avg node degree
    return 5.372

def graph_diameter():
    """
    hardcode and return the diameter of the graph
    (run the function called “Network Diameter”) within Gephi
    """
    # you must replace this value with the graph diameter
    return 8

def avg_path_length():
    """
    hardcode and return the average path length
    (run the function called “Avg. Path Length”) within Gephi
    :return:
    """
    # you must replace this value with the avg path length
    return 4.421