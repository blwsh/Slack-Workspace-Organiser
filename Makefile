clean:
	rm -rf node_modules dist/*.bundle.js
	docker-compose down

install:
	docker-compose build
	docker-compose run --rm --entrypoint "npm install" app

start:
	docker-compose run app

session:
	docker-compose run --rm --entrypoint "sh" app
