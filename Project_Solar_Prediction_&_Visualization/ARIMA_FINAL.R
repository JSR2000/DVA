# clear data
rm(list = ls());
# Work Directory
setwd("C:/Users/r2d2/Documents/Arima_Input")
library(tseries)
library(forecast)
library(xts)
library(dplyr)
library(lubridate)
library(leafletR)
#library(sp)
#library(rgdal)
timestamp()
# Read Args
if (length(args) < 2) {
  #stop("Please supply input file and forecast size as arguments", call.=FALSE)
  infile = '0.csv'
  forecast_size = 365
} else {
  # default output file
  infile = arg[1]
  foreast_size = arg[2]
}
# Read and save index data for coordinates
index = read.csv("index.csv", header = TRUE)
file_idx = as.numeric(substr(infile,1,1))
coords = index %>% select(Location.Index,X,Y) %>% filter(Location.Index == file_idx) %>% select(X,Y)

# Read Input
data = read.csv(infile, header = TRUE, stringsAsFactors = FALSE)
data$Value = data$Value*3600

# series start date-time
ts_start = paste0(substring(data$Time[1],1,10)," 00:00")
start_year = as.numeric(substring(data$Time[1],1,4))
start_month = as.numeric(substring(data$Time[1],6,7))
train_end_date = substring(data$Time[nrow(data)],1,10)

# Convert the date to Xct date format
data$Time = seq(from=as.POSIXct(ts_start, format="%Y-%m-%d %H:%M"),
                length.out = nrow(data), by="hour")

# Get Time, GHI
# data_temp = data %>% select(Time,GHI)
data_xts = data %>% select(Time,Value) %>% xts(order.by=data$Time)

## Daily
# Aggregate data from hourly to daily
daily_data=period.apply(as.numeric(data_xts$Value), endpoints(data_xts, "days"), FUN=sum)
#tsdata = ts(daily_data, frequency = 365, start=c(data$year[1],data$month[1]))
tsdata = ts(daily_data, frequency = 365, start=c(start_year,start_month))

#x=decompose(tsdata, "multiplicative")
#plot(x)

# Plot daily data
plot(tsdata)
#Sarima_Model = auto.arima(tsdata,ic="aic",trace = TRUE)
#Sarima_Model = arima(tsdata, order=c(1,0,0), seasonal = list(order=c(0,1,0),lambda=0,period=365))
#saveRDS(Sarima_Model,"./Arima_100010.rds")

if(!file.exists("./Arima_100010t.rds")) {
  arima_model = arima(tsdata, order=c(1,0,0), seasonal = list(order=c(0,1,0),
                                    lambda=0,period=365))
  saveRDS(arima_model,"./Arima_100010t.rds")
  summary(arima_model)
  } else  {
  arima_model = readRDS("./Arima_100010t.rds")
  }

plot(tsdata)
lines(fitted(arima_model),col="red")
timestamp()

# Forecast:
pred1 = forecast(arima_model,level = c(95), h=forecast_size)
plot(pred1)
pred1$mean

##############
### Converting to geoJson
##############

ghi = pred1$mean[1:forecast_size]
head(ghi)
lat = rep(coords$X, length(ghi))
lon = rep(coords$Y, length(ghi))
time_stamp = array()
# Add the timestamp(date) for predicted values
for (i in (1:(length(ghi)))){
      l=as.character(date(train_end_date)+i)
      time_stamp[i] = l
  }

pred_vals = data.frame(lat,lon,ghi,time_stamp)
toGeoJSON(data=pred_vals, name="solar", lat.lon=c(1,2))

time_elapsed = timestamp() - start_time