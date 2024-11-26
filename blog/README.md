# Automated Speech Translation: Real-time Dubbing Powered by GPT-4o

![blog cover](images/cover.jpg)

## What This Blog is About

Real-time communication across languages is crucial in today’s interconnected world. Traditional translation and dubbing methods often fall short—they’re too slow, prone to errors, and struggle to scale effectively. However, advancements in AI have revolutionized audio translation, making it faster, more accurate, and seamlessly real-time.

This blog provides a step-by-step guide to building an automated real-time dubbing system. Using GPT-4o Realtime and GPT-4o Audio for context-aware audio translations, Node.js for data handling, and GridDB for scalable storage, you’ll learn how to process speech, translate it, and deliver dubbed audio instantly. If you’re ready to break language barriers with cutting-edge tech, let’s get started.

## Setting Up the Environment

### Prerequisites

You should have an access to the gpt-4o-realtime and gpt-4o-audio models. Optionally, you shuold give a permission for the app to use the microphone in the browser.

### How to Run the App

This app is tested on ARM Machines such as Apple MacBook M1 or M2 and to run the project you need [Docker](https://www.docker.com/products/docker-desktop/) installed.

#### 1.`.env` Setup

Create an empty directory, for example, `speech-dubbing`, and change to that directory:

```shell
mkdir speech-dubbing
cd speech-dubbing
```

Create a `.env` file with these keys:

```ini
OPENAI_API_KEY=
GRIDDB_CLUSTER_NAME=myCluster
GRIDDB_USERNAME=admin
GRIDDB_PASSWORD=admin
IP_NOTIFICATION_MEMBER=griddb-server:10001
```

To get the `OPENAI_API_KEY` please read this [section](#openai-api-key).


#### 2. Run with Docker Compose

To run the app create a `docker-compose.yml` file with this configuration settings:

```yaml
networks:
  griddb-net:
    driver: bridge

services:
  griddb-server:
    image: griddbnet/griddb:arm-5.5.0
    container_name: griddb-server
    environment:
      - GRIDDB_CLUSTER_NAME=${GRIDDB_CLUSTER_NAME}
      - GRIDDB_PASSWORD=${GRIDDB_PASSWORD}
      - GRIDDB_USERNAME=${GRIDDB_USERNAME}
      - NOTIFICATION_MEMBER=1
      - IP_NOTIFICATION_MEMBER=${IP_NOTIFICATION_MEMBER}
    networks:
      - griddb-net
    ports:
      - "10001:10001"

  clothes-rag:
    image: junwatu/speech-dubbing:latest
    container_name: speech-dubbing-griddb
    env_file: .env 
    networks:
      - griddb-net
    ports:
      - "3000:3000"
```


### 3. Run

When steps 1 and 2 are finished, run the app with this command:

```shell
docker-compose up -d
```

If everything running, you will get a similar response to this:

```shell
[+] Running 3/3
 ✔ Network speech-dubbing-griddb_griddb-net  Created                     0.0s 
 ✔ Container griddb-server               Started                     0.2s 
 ✔ Container speech-dubbing-griddb          Started                     0.2s 
```

### 4. Test the App

Open the browser and go to `http://localhost:3000`.


[DRAFT ALLOW MIC PERMISSION]


### Environment Setup

#### **OpenAI API Key**

You can create a new OpenAI project or use the existing one and then create and get the OpenAI API key [here](https://platform.openai.com/api-keys). Later, you need to save this key in the `.env` file.

By default, OpenAI will restrict the models from public access even if you have a valid key. You also need to enable these models in the OpenAI project settings:

![gpt-4o-audio-and-realtime](images/gpt-4o-realtime-audio-models.png)

## Capturing Speech Input

The speech input is from a microphone that accesible using the app via the browser.

## Transcribe Speech to Text

## Speech Dubbing

## Transcribe Benchmarking

## Quality Improvement

## Testing and Improvement
