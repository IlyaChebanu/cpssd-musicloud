# MusiCloud [![Build Status](https://travis-ci.com/CPSSD/MusiCloud.svg?token=VTsNQCkWWmZRNF9jfpa7&branch=master)](https://travis-ci.com/CPSSD/MusiCloud)
This repo contains the code for the MusiCloud online music mixing service.

## Prerequisites 
### Backend:
- [Python 3](https://www.python.org/downloads/)
- [Docker](https://www.docker.com/get-started)

Once you have installed Python3, open a terminal, go to this
projects `backend` directory and run the following command:
```
pip3 install -r requirements.txt
```

## Running The Backend
In order to run a backend instance, first you must populate the
config.py file with all the usernames and passwords it requires.
Details on what each section requires are outlined in comments in the config.py
file itself.

Then, to run a backend instance on your local machine, open a
terminal, go to this projects `backend` directory and run
the following command:
```
python3 run.py
```

## Presentations

Sprint start | Sprint end
---|---
[Sprint 1 Start](https://docs.google.com/presentation/d/1nHhMDjFC2nuO9RaTrjN3yLTlmu7kZL6ef_p-Xfh5ETs/edit?usp=sharing)|[Sprint 1 End](https://docs.google.com/presentation/d/1-S9CH44S0XYHTo-oLQlmGt99yo7yInbsjSCJSH5wbcs/edit?usp=sharing)|
[Sprint 2 Start](https://docs.google.com/presentation/d/1BjvWF_6WQabbuikUCCV2Urdyj9taUJPS3SOp89YqEZ4/edit?usp=sharing)|[Sprint 2 End](https://docs.google.com/presentation/d/1CpGCclZtmFaxMC6vDA0nHrIWmSOsZlfENur1_Eu1cDw/edit?usp=sharing)|
[Sprint 3 Start](https://docs.google.com/presentation/d/1H7DcZ2nPfzFtq4VcEbZqAKYOJLm4VQXr0tSrvKBI9Uw/edit?usp=sharing)|[Sprint 3 End](https://docs.google.com/presentation/d/1XLizrVPG9mZKRQ06YrzZmSaPWodltdRUmtoSdBT-Dbk/edit?usp=sharing)
[Sprint 4 Start] (https://docs.google.com/presentation/d/1Ey2A0vwjZ4y__ndMxSlbtSyS5Bvw4bjw4et05lhpO74/edit?usp=sharing)

# Files From Other Sources (Citation)
- The names.txt file, which provided us with first names to create realistic dummy users,
was take from @dominictarr's repo [random-name](https://github.com/dominictarr/random-name).
This file is entirely his work and is simply used by us to populate our DB with realistic data.
