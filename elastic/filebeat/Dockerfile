FROM docker.elastic.co/beats/filebeat:7.9.1

COPY filebeat.yml /usr/share/filebeat/filebeat.yml
USER root

RUN mkdir /var/logs
RUN mkdir /var/logs/beats

RUN chown -R root /usr/share/filebeat
