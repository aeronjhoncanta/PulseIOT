FROM eclipse-mosquitto:2
COPY mosquitto.conf /mosquitto/config/mosquitto.conf
COPY docker-entrypoint.sh /usr/local/bin/pulse-mosquitto-entrypoint.sh
USER root
RUN chmod +x /usr/local/bin/pulse-mosquitto-entrypoint.sh
ENTRYPOINT ["pulse-mosquitto-entrypoint.sh"]
CMD ["mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]
