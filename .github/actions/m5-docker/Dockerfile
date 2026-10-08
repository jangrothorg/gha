# Docker actions must run as the default Docker user (root) — don't add a USER
# instruction, and don't add WORKDIR either, GitHub overrides it at runtime anyway.
FROM alpine:3.20

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
