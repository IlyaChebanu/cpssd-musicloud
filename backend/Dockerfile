FROM python:3.6-slim

COPY . /backend

WORKDIR /backend

RUN pip3 install -r requirements.txt

ENTRYPOINT [ "python" ]

CMD [ "run.py" ]
