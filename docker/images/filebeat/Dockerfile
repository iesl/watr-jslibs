FROM docker.elastic.co/beats/filebeat:7.8.0
# COPY docker/config/filebeat.yml /usr/share/filebeat/filebeat.yml
USER root
# RUN chown root:filebeat /usr/share/filebeat/filebeat.yml

# copy shell init files for convenience when attaching to containers
COPY docker/shared/root.profile /root/.profile
COPY docker/shared/root.profile /root/.bashrc

USER filebeat