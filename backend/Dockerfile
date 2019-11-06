FROM python:3.6-slim

# copy backend directory
COPY . /backend

# set working directory
WORKDIR /backend

# install dependencies
RUN pip3 install -r requirements.txt


ENTRYPOINT [ "python" ]
CMD [ "run.py" ]
# expose 5000 port
EXPOSE 5000
