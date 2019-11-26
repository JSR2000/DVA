import http.client
import json
import time
import timeit
import sys
import collections
from pygexf.gexf import *


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

# complete auto grader functions for Q1.1.b,d
def min_parts():
    """
    Returns an integer value
    """
    # you must replace this with your own value
    return -1

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
    return []

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
    return -1

def graph_diameter():
    """
    hardcode and return the diameter of the graph
    (run the function called “Network Diameter”) within Gephi
    """
    # you must replace this value with the graph diameter
    return -1

def avg_path_length():
    """
    hardcode and return the average path length
    (run the function called “Avg. Path Length”) within Gephi
    :return:
    """
    # you must replace this value with the avg path length
    return -1

