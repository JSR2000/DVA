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

global lego_sets_list
auth_key = sys.argv[1]

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

#print("1st Part - Lego Sets Count: ", jsdata['count'])

##############
## 2nd Part starts here
##############

begin_time = time.time()

# function to retrieve part-numbers for each set.
def get_parts(set_nbr,header):
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
            pd=({"set_num" : set_nbr, "part_num" : j["part"]["part_num"], "part_name" : j["part"]["name"]
                      ,"color" : j["color"]["rgb"], "quantity" : j["quantity"]
                      , "unique_id" : j["part"]["part_num"] + "_" + j["color"]["rgb"]})
            pdl.append(pd)
        time_elapsed = time.time() - start_time
        if time_elapsed < 1:
            time.sleep(1-time_elapsed)
    pdl.sort(key=lambda d: d['quantity'], reverse=True)
   
    return pdl[:min(len(pdl),20)]    
        
parts = []
# iterate thru each set to get the part data
for i in range(len(sets)):
    pdl1 = []
    start_time = time.time()
    set_number = sets[i]["set_num"]
    pdl1 = get_parts(set_number,header)
    parts.append(pdl1)
    time_elapsed = time.time() - start_time
    if time_elapsed < 1:
        time.sleep(1-time_elapsed)
    
end_time = time.time()
lego_sets_list = parts
connection.close()

#print("Part 2 starts here to get PARTS")
print('Processing time: ', end_time - begin_time, 'seconds')
#print('Number of Parts', len(parts))


##############
### 3rd Part starts here (Gephi Graph Generation)
##############

sys.path.append('../gexf')
from pygexf.gexf import *

gexf = Gexf("Jitendra Rathour", "Rebrickable File")
graph=gexf.addGraph("undirected","static","Rebrickable Graph")
type_attr = graph.addNodeAttribute("Type", type="string")

prev_id = ""
c1=0
c2=0
l=[]
n = 0
for i in range(len(sets)):
    c1 = c1+1
    set_number = sets[i]["set_num"]
    if graph.nodeExists(id=set_number) == 0:
        s = graph.addNode(sets[i]["set_num"],label=sets[i]["name"],r="0",g="0",b="0")
        s.addAttribute(type_attr,'Set')
        
    for j in range(len(parts[i])):
        part_id = parts[i][j]["unique_id"]
        if graph.nodeExists(id=part_id) == 0:
            R,G,B = tuple(int(parts[i][j]["color"][k:k+2], 16) for k in (0, 2, 4))
            p = graph.addNode(part_id, label = parts[i][j]["part_name"],r=str(R),g=str(G),b=str(B))
            p.addAttribute(type_attr,'Part')
            #print(part_id)
            l.append(part_id)
        graph.addEdge(str(n)+set_number+part_id, set_number, part_id,parts[i][j]["quantity"])
            
        c2=c2+1
out = open("bricks_graph.gexf","wb")
d = sorted(set(l))

gexf.write(out)


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
    my_gexf = Gexf("Jitendra Rathour", "title")
    gexf.addGraph("undirected", "static", "Rebrickable Graph")
    return gexf.graphs[0]

# complete auto-grader functions for Q1.2.d

def avg_node_degree():
    """
    hardcode and return the average node degree
    (run the function called “Average Degree”) within Gephi
    """
    # you must replace this value with the avg node degree
    return 5.373

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
    return 4.424


##############
### Test Area Below 
##############

#my_set = lego_sets()
#print("Retrun value from lego_sets function: ", len(my_set))
#min_parts_val = min_parts()
#print("Retrun value from min_parts function: ", min_parts_val)
#avg_degree = avg_node_degree()
#print("Retrun value from avg_node_degree function: ", avg_degree)
#diameter = graph_diameter()
#print("Retrun value from graph_diameter function: ", diameter)
#avg_length = avg_path_length()
#print("Retrun value from avg_path_length function: ", avg_length)
#my_graph = gexf_graph()
#print("Return value from gexf_graph function",type(my_graph))