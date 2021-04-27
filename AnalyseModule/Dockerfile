FROM trestletech/plumber
RUN R -e 'install.packages(c("sirt","jsonlite"))'
RUN mkdir /data
COPY estimate.r /data
WORKDIR /data
EXPOSE 1030
ENTRYPOINT ["R", "-e", \
    "r = plumber::plumb('/data/estimate.r'); r$run(port = 1030, host = '0.0.0.0')"]
