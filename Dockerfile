# pull official base image
FROM python:3.11-slim-bookworm


# create directory for the app user
RUN mkdir -p /home/app

# create the app user
RUN adduser --group --system app

# create the appropriate directories
ENV HOME=/home/app
ENV APP_HOME=/home/app
#RUN mkdir $APP_HOME
RUN mkdir $APP_HOME/staticfiles
WORKDIR $APP_HOME

# install dependencies
RUN apt-get update && apt-get -qq install netcat-traditional
COPY requirements.txt .
COPY requirements.prod.txt .
RUN pip install -r requirements.txt && pip install -r requirements.prod.txt

# copy entrypoint.prod.sh
COPY ./entrypoint.prod.sh .
RUN sed -i 's/\r$//g'  $APP_HOME/entrypoint.prod.sh
RUN chmod +x $APP_HOME/entrypoint.prod.sh

# copy project
COPY . $APP_HOME

# chown all the files to the app user
RUN chown -R app:app $APP_HOME

# change to the app user
USER app

# run entrypoint.prod.sh
ENTRYPOINT ["/home/app/entrypoint.prod.sh"]