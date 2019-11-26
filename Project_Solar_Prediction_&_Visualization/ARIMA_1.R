# clear data
rm(list = ls());
getwd()
# Work Directory
#setwd("C:/Users/Documents/Arima_Input")
#library(tseries)
#library(forecast)
#library(xts)
#library(dplyr)
#library(lubridate)
#library(leafletR)

# Install and load libraries if not already installed
packages = c('tseries','forecast','xts','dplyr','lubridate','leafletR')
# start loop to determine if each package is installed
for(package in packages){
  # if already installed --> load
  if(package %in% rownames(installed.packages()))
    do.call('library', list(package))
  # if not installed --> install --> load
  else {
    install.packages(package)
    do.call("library", list(package))
  }
} 
args = commandArgs(trailingOnly=TRUE)
# Read Args - 
if (length(args) < 1) {
  #stop("Please supply input file and forecast size as arguments", call.=FALSE)
  num_of_coords = 1
} else {
  # default output file
  num_of_coords = args[1]
}

timestamp()

# Read and save index data for coordinates
index = read.csv("index.csv", header = TRUE)
nrow(index)

# Create Models and get fitted values for all files listed in index file

# Daily prediction folder
if (dir.exists("Arima_Prediction_Data")){
  timestamp()  
}else {
  dir.create("Arima_Prediction_Data")
}
# Model's Directory
if (dir.exists("Arima_Models")){
  timestamp()
}else {
  dir.create("Arima_Models")
}
# Aggregated Monthly Prediction Data folder
if (dir.exists("Arima_Monthly_Prediction")){
  timestamp()  
}else {
  dir.create("Arima_Monthly_Prediction")
}
# Aggregated Yearly Prediction Data folder
if (dir.exists("Arima_Yearly_Prediction")){
  timestamp()  
}else {
  dir.create("Arima_Yearly_Prediction")
}

#for (f in 1:nrow(index)){
for (f in 1:num_of_coords){
  # Read Input
  file_num = as.character(index$Location.Index[f])
  infile = paste0("CSV/",file_num,".csv")
  print(infile)
  data = NULL 
  data = read.csv(infile, header = TRUE, stringsAsFactors = FALSE)
  #data$Value = data$Value*3600
  
  # series start date-time
  ts_start = paste0(substring(data$Time[1],1,10)," 00:00")
  start_year = as.numeric(substring(data$Time[1],1,4))
  start_month = as.numeric(substring(data$Time[1],6,7))
  train_start_date = date(substring(data$Time[1],1,10))
  #train_end_date = substring(data$Time[nrow(data)],1,10)
  train_leap_yr = leap_year(start_year)
  if (train_leap_yr){
    train_end_date = as.character(train_start_date + 365)
  } else { train_end_date = as.character(train_start_date + 364) }
  
  # Convert the date to Xct date format
  data$Time = seq(from=as.POSIXct(ts_start, format="%Y-%m-%d %H:%M"),
                  length.out = nrow(data), by="hour")
  
  # Get Time, GHI
  data_xts = data %>% select(Time,Value) %>% xts(order.by=data$Time)
  
  # Aggregate data from hourly to daily
  daily_data=period.apply(as.numeric(data_xts$Value), endpoints(data_xts, "days"), FUN=sum)
  tsdata = ts(daily_data, frequency = 365, start=c(start_year,start_month))
  
  
  #file_idx = as.numeric(substr(infile,1,1))
  file_idx = as.numeric(file_num)
  
  coords = index %>% select(Location.Index,X,Y) %>% filter(Location.Index == file_idx) %>% select(X,Y)

  # Fit arima model if not already exists for the location:
  model_name = paste0("Arima_Models/Arima_", file_num, ".rds")
  if(!file.exists(model_name)) {
    arima_model = arima(tsdata, order=c(1,0,0), seasonal = list(order=c(0,1,0),
                                                                lambda=0,period=365))
    saveRDS(arima_model,model_name)
  } else  {
    arima_model = readRDS(model_name)
  }
######################
  
  plot(tsdata)
  lines(fitted(arima_model),col="red")
  
######################
  
  ##############
  ### Converting to geoJson
  ##############
  #ghi = tail(fitted.values(arima_model),365)[1:365]
  pred_length = length(daily_data)
  ghi = fitted.values(arima_model)[c(366:pred_length),1]
  energy = ghi*3600
  lat = rep(coords$X, length(ghi))
  lon = rep(coords$Y, length(ghi))
  time_stamp = array()
  #train_end_date = "2007-12-31"
  # Add the timestamp(date) for predicted values
  for (i in (1:(length(ghi)))){
    l=as.character(date(train_end_date)+i)
    time_stamp[i] = l
  }
  
  pred_file = paste0("Arima_Prediction_Data/",file_num)
  pred_data = data.frame(lat,lon,energy,time_stamp)
  
  if(!file.exists(paste0("Arima_Prediction_Data//",file_num,".geojson"))) {
    
    toGeoJSON(data=pred_data, name=pred_file, lat.lon=c(1,2))
    
  } else  {
    print("file already exists, skip file...")
    next
  }
  
}
