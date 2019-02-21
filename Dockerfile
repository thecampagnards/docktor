FROM node:11-alpine as builderFront

WORKDIR /npm/src/docktor
COPY client .

RUN npm install \
    && CI=true npm run test \
    && npm run build

FROM golang:1.11 as builderBack

WORKDIR /go/src/docktor/server
COPY server .

RUN go get -u github.com/golang/dep/cmd/dep \
    && dep ensure \
    && go test \
    && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o app . \
    && chmod +x app

FROM scratch

LABEL maintainer="TheCampagnards <konstantin.sidorenko@orange.fr>"

WORKDIR /docktor

COPY --from=builderFront /npm/src/docktor/build client
COPY --from=builderBack /go/src/docktor/server/app .
COPY --from=builderBack /go/src/docktor/server/assets assets

CMD ["./app"]

EXPOSE 8080