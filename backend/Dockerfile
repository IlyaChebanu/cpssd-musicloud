FROM python:3.6-slim

COPY . /backend

WORKDIR /backend

RUN pip3 install -r requirements.txt

EXPOSE 5000

ENTRYPOINT [ "python" ]

CMD [ "run.py" ]
