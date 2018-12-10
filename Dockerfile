FROM node:8.14.0-alpine as builderFront

WORKDIR /npm/src/docktor
COPY client .

RUN npm install \
    && npm run build:client

RUN CI=true yarn test:client

FROM golang:1.11.0 as builderBack

WORKDIR /go/src/docktor/server
COPY server .

RUN go get -u github.com/golang/dep/cmd/dep \
    && dep ensure \
    && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o app .

RUN go test ./server/...

FROM scratch

WORKDIR /docktor

COPY --from=builderBack /go/src/docktor/server/app .
COPY --from=builderBack /npm/src/docktor/build .
CMD ["./app"]

EXPOSE 8080