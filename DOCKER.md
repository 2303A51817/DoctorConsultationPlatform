# Run with Docker

From the project root, build and start the frontend, API, and MongoDB:

```sh
docker compose up --build
```

Open the app at http://localhost:8080. The backend health endpoint is at http://localhost:5001/api/health by default. If that port is in use, set `API_PORT` to another free port before starting Compose. MongoDB data is stored in the `mongo-data` Docker volume and survives container restarts.

Stop the containers with `docker compose down`. To also delete the saved database, run `docker compose down --volumes`.

The frontend image is built with the API URL matching the published backend port, which the user's browser can reach. For a deployment on another host, set the frontend build argument to the public API URL and rebuild the image.
