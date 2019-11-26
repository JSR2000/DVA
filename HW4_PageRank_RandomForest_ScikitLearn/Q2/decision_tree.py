from util import entropy, information_gain, partition_classes
import numpy as np 
import ast
from numbers import Number

class DecisionTree(object):
    def __init__(self):
        # Initializing the tree as an empty dictionary or list, as preferred
        self.tree = []
        #self.tree = {}
        self.leafsize = 50
        self.depth = 8
        self.tempTree = [] 
        #pass

  
    def construct_DT(self,X,y):
        self.depth += self.depth
        if len(y) < self.leafsize or self.depth > 25 or len(set(y)) ==1:
            return [-1, int(round(np.mean(y))), -1, -1]
        min = - 1.0        
        for index in range(len(X[0])):
            if isinstance(X[0][index], Number):
                val = np.mean([ x[index] for x in X ])
                l_x, r_x, l_y, r_y = partition_classes(X,y,index,val)
                t_gain = information_gain(y,[l_y,r_y])
                if t_gain > min:
                    min = t_gain
                    split_val = val
                    split_attr =  index
            else : 
                lv = set([x[index] for x in X])
                for val in lv:
                    lx,rx, ly, ry = partition_classes(X,y,index,val)
                    t_gain = information_gain(y,[l_y,r_y])
                    if t_gain > min:
                        min = t_gain
                        split_val = val
                        split_attr =  index
        
        x_l, x_r, y_l, y_r = partition_classes(X, y, split_attr, split_val)
        tl = self.construct_DT(x_l, y_l)
        rl = self.construct_DT(x_r, y_r)
        return [split_attr, split_val, tl, rl]

    def learn(self, X, y):
        # TODO: Train the decision tree (self.tree) using the the sample X and labels y
        # You will have to make use of the functions in utils.py to train the tree
        
        # One possible way of implementing the tree:
        #    Each node in self.tree could be in the form of a dictionary:
        #       https://docs.python.org/2/library/stdtypes.html#mapping-types-dict
        #    For example, a non-leaf node with two children can have a 'left' key and  a 
        #    'right' key. You can add more keys which might help in classification
        #    (eg. split attribute and split value)
        # pass
        self.tree = self.construct_DT(X,y)
        
    def classify_recur(self, rec):
        if self.tempTree[0]== -1:
            return self.tempTree[1]
        if isinstance(rec[self.tempTree[0]], Number):
            if rec[self.tempTree[0]] <= self.tempTree[1]:
                self.tempTree = self.tempTree[2]
                return self.classify_recur(rec)
            else :     
                self.tempTree = self.tempTree[3]
                return self.classify_recur(rec)
        else : 
            if rec[self.tempTree[0]] ==  self.tempTree[1]:
                self.tempTree = self.tempTree[2]
                return self.classify_recur(rec)
            else :     
                self.tempTree = self.tempTree[3]
                return self.classify_recur(rec)


    def classify(self, record):
        # TODO: classify the record using self.tree and return the predicted label
        # pass
        self.tempTree = self.tree
        return self.classify_recur(record)
