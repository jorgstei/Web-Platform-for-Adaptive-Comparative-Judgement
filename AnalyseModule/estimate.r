library(sirt)
library(jsonlite)

# Solution for  CORS: https://github.com/rstudio/plumber/issues/66 shizidushu commented on Sep 5, 2018

#' @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$setHeader("Access-Control-Allow-Methods","*")
    res$setHeader("Access-Control-Allow-Headers", req$HTTP_ACCESS_CONTROL_REQUEST_HEADERS)
    res$status <- 200 
    return(list())
  } else {
    plumber::forward()
  }
}

#This module is written by Tore Alexander Forbregd

#* Estimate BTM 
#* @serializer unboxedJSON
#* @post /estimate
function (req){
  dat0<-fromJSON(req$postBody)
  model<-btm(dat0[,2:4],judge=dat0[,1],maxiter =100,fix.eta = 0,eps=0)
  data <- list(result=model$effects, stats=model$summary.effects, rel=model$mle.rel, sepG=model$sepG,judges=model$fit_judges)
  data
}
