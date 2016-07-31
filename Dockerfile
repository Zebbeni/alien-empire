FROM node:4.4
EXPOSE 8080
COPY alien-empire .
CMD node app.js
