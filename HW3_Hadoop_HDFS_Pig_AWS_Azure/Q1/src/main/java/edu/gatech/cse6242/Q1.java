package edu.gatech.cse6242;

import java.io.IOException;
import java.util.StringTokenizer;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class Q1 {
 
  public static class TargetMapper extends Mapper<Object, Text, Text, Writable> {
       
      private Text source = new Text();	
      private Text target = new Text();
      private Text Value = new Text();
	
      public void map(Object key, Text value, Context context
                ) throws IOException, InterruptedException {
            StringTokenizer st = new StringTokenizer(value.toString(), "\r");
            while (st.hasMoreTokens()) {
                String[] edge = st.nextToken().split("\t");
		source.set(edge[0]);
                target.set(edge[1]);
		String s = edge[1] + "," + edge[2];
		Value.set(s);
		context.write(source, Value);
            }
         }
       
    }
 
  public static class EmailsReducer extends Reducer<Text,Text,Text,Text> 
	{
       
 	  private IntWritable totalCount = new IntWritable();
	  	
	  String[] field;
	  String v;
	  String temp; 
	  //String temp_tgt;
	  public void reduce(Text key, Iterable<Text> Values, Context context
		   ) throws IOException, InterruptedException {
           
          int max = 0;
	  Text textValue = new Text();
        
               for (Text Value : Values)  
		{

		String line = Value.toString();
        	field = line.split(",");
        	int count = Integer.parseInt(field[1]);

                if(count > max || max ==9999999) 
			{
                	max = count;
			temp = field[0];
			totalCount.set(max);
			v = temp + "," + String.valueOf(totalCount);	
	                }
		else if(count == max && Integer.parseInt(field[0]) < Integer.parseInt(temp))
			{
			temp = field[0];
			v = temp + "," + String.valueOf(totalCount);	
			}

		}
	        textValue.set(v);
	        context.write(key, textValue);
            }
         }
 

public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    Job job = Job.getInstance(conf, "Q1");

    /* TODO: Needs to be implemented */
    job.setJarByClass(Q1.class);
    job.setMapperClass(TargetMapper.class);
    job.setCombinerClass(EmailsReducer.class);
    job.setReducerClass(EmailsReducer.class);

    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(Text.class);


    /* TODO: Needs to be implemented */

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));
    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}
